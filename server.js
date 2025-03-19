const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.js");
const transactionRoutes = require("./routes/transactions.js");
const categoryRoutes = require('./routes/category.js')
const walletRoutes = require('./routes/wallet.js');
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
    .then(() => console.log("Connected to mongoDB"))
    .catch((err) => console.log(err));


//Routes
app.use("/app/auth", authRoutes);
app.use("/app/category", categoryRoutes);
app.use("/app/transfer", transactionRoutes);
app.use("/app/wallets", walletRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));