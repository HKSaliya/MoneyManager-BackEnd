const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    // console.log("Authorization Header:", authHeader); // Log the header

    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    // console.log("Extracted Token:", token); // Log the extracted token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token:", decoded); // Log the decoded token

        // Check token expiry
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token Verification Error:", err); // Log the error
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authMiddleware };