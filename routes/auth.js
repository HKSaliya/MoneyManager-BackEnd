const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./../models/user")
const router = express.Router();
const { generateOTP, sendOTPEmail } = require("./../utils/mailer");
const { authMiddleware } = require("../middleware/authMiddleware");


router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        console.log(email);
        if (!user) return res.status(400).json({ error: "User not found" });

        // Generate OTP and expiry (10 minutes)
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        // Send OTP via email
        await sendOTPEmail(email, otp);
        res.json({ message: `OTP sent to email ${otp}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        // Check OTP validity
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ error: "Invalid/expired OTP" });
        }

        // Update password and clear OTP
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const upload = require("../utils/multer");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

// GET: Fetch user details (for pre-filling the form)
router.get("/update", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password -otp -otpExpires -resetToken -resetTokenExpires")
            .populate("categories"); // Exclude sensitive fields

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth?.toISOString().split('T')[0], // Format for HTML date input
            email: user.email,
            country: user.country,
            language: user.language,
            avatar: user.avatar, // Send Cloudinary URL
            categories: user.categories
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/update", authMiddleware, upload.single("avatar"), async (req, res) => {
    try {
        const { firstName, lastName, gender, dateOfBirth, email, country, language } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Handle avatar upload (if file exists)
        if (req.file) {
            // Delete old avatar from Cloudinary
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }

            // Upload new avatar
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "avatars",
            });

            // Update user's avatar data as an object
            user.avatar = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            // Delete the temporary file
            fs.unlinkSync(req.file.path);
        }

        // Update other fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.gender = gender || user.gender;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.email = email || user.email;
        user.country = country || user.country;
        user.language = language || user.language;

        await user.save();
        res.json({ message: "Profile updated", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;