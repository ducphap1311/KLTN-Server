const {
    BadRequestError,
    NotFoundError,
    UnauthenticatedError,
} = require("../errors");
const User = require("../model/User");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new BadRequestError("Please provide necessary informations");
    }
    const user = await User.create(req.body);
    const token = user.createJWT();
    res.status(200).json({
        msg: "user created",
        token,
        username: user.username,
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide necessary informations");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new UnauthenticatedError("Invalid email");
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new UnauthenticatedError("Invalid password");
    }
    const token = user.createJWT();
    res.status(200).json({ msg: "user found", token, username: user.username });
};

const dashboard = async (req, res) => {
    res.status(200).json({ msg: "success" });
};

const getUsers = async (req, res) => {
    const users = await User.find({});
    res.status(200).json({ users });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError(`No user with email ${email}`);
    }
    const resetPasswordToken = await jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    user.resetPasswordToken = resetPasswordToken
    await user.save()
    res.status(200).json({ resetPasswordToken });
};

const resetPassword = async (req, res) => {
    const { email, token } = req.user;
    
    // const user = await User.findOne({email})
    // if(!user){
    //     throw new NotFoundError(`No user with email ${email}`);
    // }
    const user = await User.findOneAndUpdate({ email, resetPasswordToken: token }, req.body, {
        new: true,
        runValidators: true,
    });
    user.resetPasswordToken = undefined
    await user.save()
    res.status(200).json({user})
}

const checkUser = async (req, res) => {};

const sendEmail = async (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: req.body.email, // Change to your recipient
        from: { name: "BShoes", email: "hophap1311@gmail.com" }, // Change to your verified sender
        subject: "Reset password",
        html: `Reset your password <a href="http://localhost:3000/reset-password/${req.body.token}" target="_blank">here</a>`,
    };
    const info = await sgMail.send(msg);
    res.status(200).json({ info });
};
module.exports = {
    register,
    login,
    dashboard,
    getUsers,
    checkUser,
    sendEmail,
    forgotPassword,
    resetPassword,
};
