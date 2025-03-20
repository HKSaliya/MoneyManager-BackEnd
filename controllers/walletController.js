const Wallet = require("../models/wallet"); // Import the new Wallet model
const User = require("../models/user"); // Import User model

// Add a new wallet
exports.addWallet = async (req, res) => {
    try {
        const { name, balance } = req.body;  // Get wallet details from request body
        const userId = req.user.userId; // Get user ID from authenticated request

        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: "Wallet name is required." });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if a wallet with the same name already exists for the user
        const existingWallet = await Wallet.findOne({ user: userId, name });
        if (existingWallet) {
            return res.status(400).json({ message: "Wallet with this name already exists." });
        }

        // Create a new wallet document
        const wallet = new Wallet({
            user: userId,
            name,
            balance: balance || 0,
        });

        await wallet.save();

        res.status(201).json({ message: "Wallet added successfully.", wallet });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user's wallets
exports.getWallets = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from request
        // Fetch all wallets belonging to the user
        const wallets = await Wallet.find({ user: userId });

        res.status(200).json({ wallets });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update wallet balance
// exports.updateWalletBalance = async (req, res) => {
//     try {
//         console.log("UPdate wallet data", req.body);
//         const { walletId, amount } = req.body; // Extract wallet ID and amount from request
//         const userId = req.user.userId; // Get user ID from request
//         // Validate required fields
//         if (!walletId || amount === undefined) {
//             return res.status(400).json({ message: "Wallet ID and amount are required." });
//         }

//         // Find the wallet that belongs to the user
//         const wallet = await Wallet.findOne({ _id: walletId, user: userId });
//         if (!wallet) {
//             return res.status(404).json({ message: "Wallet not found." });
//         }

//         // Update the wallet balance
//         wallet.balance += amount;
//         await wallet.save();

//         res.status(200).json({ message: "Wallet balance updated successfully.", wallet });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

exports.deleteWallet = async (req, res) => {
    try {
        const { walletId } = req.params; // Get wallet ID from request params
        const userId = req.user.userId; // Get user ID from authenticated request

        // Find the wallet that belongs to the user
        const wallet = await Wallet.findOne({ _id: walletId, user: userId });
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found or not authorized to delete." });
        }

        // Delete the wallet
        await Wallet.findByIdAndDelete(walletId);

        res.status(200).json({ message: "Wallet deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
