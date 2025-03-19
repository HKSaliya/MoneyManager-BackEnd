const Category = require("../models/category")
const User = require("../models/user")

const createCategory = async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;

        console.log("body:", req.body);
        console.log("user:", req.user);

        //create category
        const category = new Category({
            user: req.user.userId,
            name,
            icon,
            color,
            type,
        });

        await category.save();

        //Add category reference to user
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { categories: category._id } },
            { new: true },
        );

        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getCategories = async (req, res) => {
    try {
        const { type } = req.query; // Get the type from query parameters
        const userId = req.user.userId; // Get the logged-in user's ID

        // Define the filter object
        const filter = { user: userId };

        // Add type to the filter if provided
        if (type) {
            filter.type = type; // Filter by type (expense or income)
        }

        // Fetch categories based on the filter
        const categories = await Category.find(filter);

        // Return the filtered categories
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, type, color } = req.body;

        // Update the category
        const category = await Category.findByIdAndUpdate(
            id,
            { name, icon, type, color },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Delete the category
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Remove the category from the user's categories array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { categories: id } },
            { new: true }
        );

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };