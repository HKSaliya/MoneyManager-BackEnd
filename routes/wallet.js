const express = require("express");
const { addWallet, getWallets, updateWalletBalance, deleteWallet } = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-wallet", authMiddleware, addWallet);
router.get("/getWallets", authMiddleware, getWallets);
router.delete("/deleteWallet/:walletId", authMiddleware, deleteWallet);
// router.patch("/update-wallet", authMiddleware, updateWalletBalance);

module.exports = router;
