const express = require("express");
const { getTransactions, createTransaction } = require("../controllers/transactionController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to add a new transaction
router.post("/addTransaction", authMiddleware, createTransaction);

// Route to get all transactions
router.get("/getTransaction", authMiddleware, getTransactions);

module.exports = router;
