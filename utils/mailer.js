const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASSWORD, // App Password (see note below)
    },
});

// Generate OTP
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP email
exports.sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: '"Money Manager" design2dev.5@gmail.com',
        to: email,
        subject: "Password Reset OTP",
        html: `Your OTP is <b>${otp}</b>. It expires in 10 minutes.`,
    });
};