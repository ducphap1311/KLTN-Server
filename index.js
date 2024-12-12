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
const authenticateUser = require("./middlewares/auth");

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
