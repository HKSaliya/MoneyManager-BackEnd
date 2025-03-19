const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: ""  // Default empty to prevent issues with existing users
    },
    lastName: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        // enum: ["Male", "Female", "Other"],
        default: null
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    country: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        default: ""
    },
    avatar: {
        // type: String, // Will store URL of the uploaded image
        // default: ""
        public_id: String,
        url: String,
    },

    otp: String,
    otpExpires: Date,
    resetToken: String,
    resetTokenExpires: Date,
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
