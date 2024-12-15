// index.js

const express = require("express");
require("express-async-errors");
const app = express();
const productRouter = require("./routes/Product");
const userRouter = require("./routes/User");
const orderRouter = require("./routes/Order");
const messageRouter = require("./routes/Message");
const notFound = require("./middlewares/not-found");
const errorHandlerFunction = require("./middlewares/error-handler");
const connectDB = require("./db/connect");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const blogRoutes = require("./routes/blogRoutes");
const Comment = require("./model/Comment");
const User = require("./model/User");
const authenticateUser = require("./middlewares/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.set("trust proxy", 1);

// Cấu hình Rate Limiting
// app.use(
//     rateLimiter({
//         windowMs: 15 * 60 * 1000, // 15 phút
//         max: 100, // Giới hạn mỗi IP tối đa 100 yêu cầu trong windowMs
//         message: "Too many requests from this IP, please try again after 15 minutes",
//     })
// );

// Middleware để phân tích JSON
app.use(express.json());

// Middleware bảo mật HTTP headers
app.use(helmet());

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://dhsneaker.vercel.app',
    'https://admin-dhsneaker.vercel.app'
];


// Cấu hình CORS
app.use(cors({
    origin: function (origin, callback) {
        // Kiểm tra nếu origin nằm trong danh sách cho phép
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Cho phép gửi cookie
}));

// Middleware để chống XSS
app.use(xss());

// Mount các router
app.use("/api/v1", userRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", messageRouter);
app.use("/api/v1/blogs", blogRoutes);
// Lấy tất cả bình luận của một sản phẩm
app.get('/api/v1/product/:productId', async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.productId })
      .populate('user', 'username') // Chỉ lấy username từ user
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/comments", async () => {
    await Comment.deleteMany({})
})

app.delete('/api/v1/comments/:id', authenticateUser, async (req, res) => {
  try {
    // Find the comment by ID
    const comment = await Comment.findById(req.params.id);
    console.log(comment);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the logged-in user is the owner or an admin
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a reply
app.post('/api/v1/comments/reply', authenticateUser, async (req, res) => {
  const { productId, content, parentId } = req.body;

  if (!content || !parentId) {
    return res.status(400).json({ message: 'Content and parentId are required' });
  }

  try {
    const reply = new Comment({
      productId,
      user: req.user.id,
      content,
      parentId,
    });

    const savedReply = await reply.save();
    const populatedReply = await savedReply.populate('user', 'username');
    res.status(201).json(populatedReply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thêm một bình luận mới
app.post('/api/v1/comments', authenticateUser, async (req, res) => {
  const { productId, content } = req.body;

  if (!productId || !content) {
    return res.status(400).json({ message: 'Vui lòng cung cấp productId và nội dung bình luận.' });
  }

  const comment = new Comment({
    productId,
    user: req.user.id, // Giả sử middleware xác thực gán user vào req
    content
  });

  try {
    const newComment = await comment.save();
    const populatedComment = await newComment.populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/v1/users/:userId/addresses", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Error fetching addresses", error: err });
  }
});


app.post("/api/v1/users/:userId/addresses", async (req, res) => {
  const { userId } = req.params;
  const { fullName, phone, address } = req.body;

  try {
    const user = await User.findById(userId);

    // Đảm bảo chỉ có một địa chỉ mặc định
    const newAddress = {
      fullName,
      phone,
      address,
      isDefault: true, // Đặt địa chỉ này làm mặc định
    };

    // Nếu đã có địa chỉ mặc định, cập nhật lại isDefault = false cho tất cả các địa chỉ khác
    if (user.addresses.length > 0) {
      user.addresses = user.addresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
    }

    // Thêm địa chỉ mới vào danh sách
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: "Address added successfully", address: newAddress });
  } catch (err) {
    res.status(500).json({ message: "Error adding address", error: err });
  }
});


app.put("/api/v1/users/:userId/addresses/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;
  const { fullName, phone, address } = req.body;

  try {
    const user = await User.findById(userId);

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.address = req.body.address || address.address;

    await user.save();

    res.status(200).json({ message: "Address updated successfully", address });
  } catch (err) {
    res.status(500).json({ message: "Error updating address", error: err });
  }
});

app.delete("/api/v1/users/:userId/addresses/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) return res.status(404).json({ message: "Address not found" });

    const isDefault = user.addresses[addressIndex].isDefault;

    // Xóa địa chỉ
    user.addresses.splice(addressIndex, 1);

    // Nếu xóa địa chỉ mặc định, cập nhật địa chỉ đầu tiên làm mặc định
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting address", error: err });
  }
});

app.put("/api/v1/users/:userId/addresses/:addressId/set-default", async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await User.findById(userId);

    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(200).json({ message: "Default address updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error setting default address", error: err });
  }
});


app.post("/api/v1/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  try {
    // Giải mã token để lấy thông tin user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    // const salt = await bcrypt.genSalt(10);
    // Mã hóa mật khẩu mới
    // const hashedPassword = await bcrypt.hash(newPassword, salt);
    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error.", error: err });
  }
});

// Middleware xử lý route không tồn tại
app.use(notFound);

// Middleware xử lý lỗi
app.use(errorHandlerFunction);

// Khởi động server
const port = process.env.PORT || 5000;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}`)
        );
    } catch (error) {
        console.log(error);
    }
};
start();
