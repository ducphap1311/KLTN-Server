// model/User.js

const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide user name!!!"],
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 8,
    },
    resetPasswordToken: {
      type: String,
    },
    // Thêm các trường mới dưới đây
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    role: {
      // Thêm trường role để phân quyền
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
      required: [true, "Please provide isActive"],
    },
    // phone: {
    //     type: String,
    //     match: [/^(\+84|0)\d{9,10}$/, "Please provide a valid phone number"], // Regex cho số điện thoại
    // },
    // city: {
    //     type: String,
    //     maxlength: 100,
    // },
    // district: {
    //     type: String,
    //     maxlength: 100,
    // },
    // ward: {
    //     type: String,
    //     maxlength: 100,
    // },
    // addressDetail: {
    //     type: String,
    //     maxlength: 255,
    // },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.createJWT = function () {
  const token = jwt.sign(
    { id: this._id, username: this.username, role: this.role, email: this.email }, // Bao gồm role trong payload
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  return token;
};

userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
