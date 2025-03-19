const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    //Reference to user who created
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["expense", "income"],
        required: true,
    },
    color: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Category", categorySchema);