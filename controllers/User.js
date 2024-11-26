// controllers/User.js

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
        throw new BadRequestError("Please provide necessary information");
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        if (existingUser.isVerified) {
            throw new BadRequestError("Email already in use");
        } else {
            // Cập nhật dữ liệu người dùng và gửi lại email xác thực
            existingUser.username = username;
            existingUser.password = password; // Sẽ kích hoạt pre-save hook để mã hóa mật khẩu
            existingUser.emailVerificationToken = jwt.sign(
                { userId: existingUser._id },
                process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
                { expiresIn: '1d' } // Token hết hạn sau 1 ngày
            );
            await existingUser.save();

            // Gửi email xác thực
            const verificationURL = `http://localhost:5000/api/v1/verify-email?token=${existingUser.emailVerificationToken}`;

            const msg = {
                to: existingUser.email,
                from: { name: "BShoes", email: "hophap1311@gmail.com" }, // Đảm bảo địa chỉ này đã được xác minh trên SendGrid
                subject: "Xác thực Email của bạn",
                html: `
                    <h3>Xin chào ${existingUser.username},</h3>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào liên kết dưới đây để xác thực email của bạn:</p>
                    <a href="${verificationURL}">Xác thực Email</a>
                    <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
                `,
            };

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            await sgMail.send(msg);

            return res.status(200).json({
                msg: "Registration updated. Please check your email to verify your account.",
            });
        }
    } else {
        const user = await User.create(req.body);

        // Tạo token xác thực email
        const emailVerificationToken = jwt.sign(
            { userId: user._id },
            process.env.EMAIL_VERIFICATION_TOKEN_SECRET,
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày
        );

        user.emailVerificationToken = emailVerificationToken;
        await user.save();

        // Gửi email xác thực
        const verificationURL = `http://localhost:5000/api/v1/verify-email?token=${emailVerificationToken}`;

        const msg = {
            to: user.email,
            from: { name: "BShoes", email: "hophap1311@gmail.com" }, // Đảm bảo địa chỉ này đã được xác minh trên SendGrid
            subject: "Xác thực Email của bạn",
            html: `
                <h3>Xin chào ${user.username},</h3>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào liên kết dưới đây để xác thực email của bạn:</p>
                <a href="${verificationURL}">Xác thực Email</a>
                <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
            `,
        };

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send(msg);

        res.status(201).json({
            msg: "User registered successfully. Please check your email to verify your account.",
        });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        throw new BadRequestError("Invalid or missing token");
    }

    try {
        const payload = jwt.verify(token, process.env.EMAIL_VERIFICATION_TOKEN_SECRET);
        const user = await User.findById(payload.userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.isVerified) {
            return res.status(200).json({ msg: "Email already verified" });
        }
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();
        res.status(200).json({ msg: "Email verified successfully" });
    } catch (error) {
        throw new BadRequestError("Invalid or expired token");
    }
};

// Cập nhật controller đăng nhập để kiểm tra xác thực email
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Please provide necessary information");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new UnauthenticatedError("Invalid email");
    }
    if (!user.isVerified) {
        throw new UnauthenticatedError("Please verify your email before logging in");
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new UnauthenticatedError("Invalid password");
    }
    const token = user.createJWT();
    res.status(200).json({ msg: "User found", token, username: user.username, role: user.role });
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
    user.resetPasswordToken = resetPasswordToken;
    await user.save();
    res.status(200).json({ resetPasswordToken });
};

const resetPassword = async (req, res) => {
    const { email, token } = req.user;

    // const user = await User.findOne({email})
    // if(!user){
    //     throw new NotFoundError(`No user with email ${email}`);
    // }
    const user = await User.findOneAndUpdate(
        { email, resetPasswordToken: token },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );
    user.resetPasswordToken = undefined;
    await user.save();
    res.status(200).json({ user });
};

const checkUser = async (req, res) => {};

const sendEmail = async (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: req.body.email, // Thay bằng người nhận
        from: { name: "BShoes", email: "hophap1311@gmail.com" }, // Thay bằng sender đã xác minh
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
    verifyEmail, // Thêm controller xác thực email
};
