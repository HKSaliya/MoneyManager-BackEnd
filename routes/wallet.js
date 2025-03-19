const express = require("express");
const { addWallet, getWallets, updateWalletBalance } = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-wallet", authMiddleware, addWallet);
router.get("/getWallets", authMiddleware, getWallets);
// router.patch("/update-wallet", authMiddleware, updateWalletBalance);

module.exports = router;
