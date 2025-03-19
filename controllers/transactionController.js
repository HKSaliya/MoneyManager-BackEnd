const Transaction = require("../models/transaction");
const User = require("../models/user");
const Category = require("../models/category");
const mongoose = require("mongoose");
const Wallet = require("../models/wallet");

// Helper function to update wallet balance
const updateWalletBalance = async (walletId, amount, type, session) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(walletId)) {
            throw new Error("Invalid wallet ID format.");
        }

        // const multiplier = type === 'income' ? 1 : -1;
        console.log(`Updating wallet: ${walletId} | Type: ${type} | Amount: ${amount} |
            `);
        // Multiplier: ${multiplier}

        // Update wallet balance using session
        const updatedWallet = await Wallet.findByIdAndUpdate(
            walletId,
            {
                $inc: {
                    balance: amount
                    //  * multiplier 
                }
            },
            { new: true, session }  // <- Ensure session is included
        );

        console.log("✅ Wallet Balance Updated:", updatedWallet);

        if (!updatedWallet) {
            throw new Error("Wallet not found.");
        }

        return updatedWallet;
    } catch (error) {
        console.error("❌ Error updating wallet balance:", error.message);
        throw error;
    }
};

// Create Transaction
exports.createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { walletId, categoryId, amount, date, note, label, photo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(walletId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: "Invalid walletId or categoryId format" });
        }

        const userId = req.user.userId;

        // Fetch category to determine transaction type
        const category = await Category.findById(categoryId).session(session);
        if (!category) throw new Error("Category not found");
        console.log("✅ Category Found:", category);

        // Create transaction within the session
        const transaction = await Transaction.create([{
            user: userId,
            wallet: walletId,
            category: categoryId,
            amount,
            date: date || Date.now(),
            note,
            label,
            photo
        }], { session });

        console.log("✅ Transaction Created:", transaction);

        // Update wallet balance using the same session
        const updatedWallet = await updateWalletBalance(walletId, amount, category.type, session);
        console.log("✅ Wallet Updated:", updatedWallet);

        await session.commitTransaction();
        res.status(201).json(transaction[0]);
    } catch (error) {
        await session.abortTransaction();
        console.error("❌ Error:", error.message);
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

// Get Transactions with Filters
exports.getTransactions = async (req, res) => {
    try {
        const { walletId, startDate, endDate } = req.query;
        const filter = { user: req.user.userId };

        // Get today's start and end time if no date range is provided
        let todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        let todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Apply wallet filter if provided
        if (walletId) filter.wallet = walletId;

        // Apply date filter: Default to today if no date range is provided
        filter.date = {
            $gte: startDate ? new Date(startDate) : todayStart,
            $lte: endDate ? new Date(endDate) : todayEnd
        };

        // Fetch transactions with category details, sorted by date (descending)
        const transactions = await Transaction.find(filter)
            .populate('category')
            .sort('-date');

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Transaction
exports.updateTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { transactionId } = req.params;
        const { walletId, categoryId, amount, date, note, label, photo } = req.body;

        if (!mongoose.Types.ObjectId.isValid(transactionId) ||
            !mongoose.Types.ObjectId.isValid(walletId) ||
            !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Find existing transaction
        const existingTransaction = await Transaction.findById(transactionId).session(session);
        if (!existingTransaction) throw new Error("Transaction not found");

        // Fetch category
        const category = await Category.findById(categoryId).session(session);
        if (!category) throw new Error("Category not found");

        // Reverse previous transaction effect
        await updateWalletBalance(existingTransaction.wallet, existingTransaction.amount, existingTransaction.category.type === 'income' ? 'expense' : 'income');

        // Update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId,
            { wallet: walletId, category: categoryId, amount, date, note, label, photo },
            { new: true, session }
        );

        // Apply new transaction effect
        await updateWalletBalance(walletId, amount, category.type);

        await session.commitTransaction();
        res.status(200).json(updatedTransaction);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

// Delete Transaction
exports.deleteTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { transactionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            return res.status(400).json({ error: "Invalid transactionId format" });
        }

        // Find transaction
        const transaction = await Transaction.findById(transactionId).session(session);
        if (!transaction) throw new Error("Transaction not found");

        // Reverse transaction effect
        await updateWalletBalance(transaction.wallet, transaction.amount, transaction.category.type === 'income' ? 'expense' : 'income');

        // Delete transaction
        await Transaction.findByIdAndDelete(transactionId, { session });

        await session.commitTransaction();
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        session.endSession();
    }
};