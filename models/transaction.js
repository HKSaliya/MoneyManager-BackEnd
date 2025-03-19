const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to wallet ID in User's wallets array
        ref: "Wallet",
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    note: String,
    label: String,
    photo: {
        public_id: String,
        url: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);