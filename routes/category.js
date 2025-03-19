const express = require("express");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { authMiddleware } = require("../middleware/authMiddleware");
const Category = require("../models/category");

const router = express.Router();

router.post("/categories", authMiddleware, createCategory);

//Route to get category
router.get("/categories", authMiddleware, getCategories);

// Update Category
router.put("/:id", authMiddleware, updateCategory);

// Delete Category
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;