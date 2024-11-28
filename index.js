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

app.set("trust proxy", 1);

// Cấu hình Rate Limiting
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 phút
        max: 100, // Giới hạn mỗi IP tối đa 100 yêu cầu trong windowMs
        message: "Too many requests from this IP, please try again after 15 minutes",
    })
);

// Middleware để phân tích JSON
app.use(express.json());

// Middleware bảo mật HTTP headers
app.use(helmet());

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:3000', // Thay bằng origin frontend của bạn
    credentials: true,
}));

// Middleware để chống XSS
app.use(xss());

// Mount các router
app.use("/api/v1", userRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", messageRouter);

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
