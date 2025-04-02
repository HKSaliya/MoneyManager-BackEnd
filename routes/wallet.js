const express = require("express");
const { addWallet, getWallets, updateWalletBalance, deleteWallet, getLastWeekBalances } = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-wallet", authMiddleware, addWallet);
router.get("/getWallets", authMiddleware, getWallets);
router.delete("/deleteWallet/:walletId", authMiddleware, deleteWallet);
router.get("/getLastWeekBalances/:walletId", authMiddleware, getLastWeekBalances);
// router.patch("/update-wallet", authMiddleware, updateWalletBalance);

module.exports = router;
