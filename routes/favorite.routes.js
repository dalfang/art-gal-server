const router = require("express").Router();
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite.model");

// Get all favorites
router.get("/all-favorites", async (req, res) => {
  try {
    const allFavorites = await Favorite.find();
    res.status(200).json(allFavorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all favorites" });
  }
});

// Get a user's favorites
router.get("/user-favorite/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userFavorite = await Favorite.find({ user: userId }).populate("user");
    res.status(200).json(userFavorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user's favorites" });
  }
});

// Delete a user's favorite
router.delete("/delete-favorite/:favoriteId", async (req, res) => {
  const { favoriteId } = req.params;
  try {
    const deletedFavorite = await Favorite.findByIdAndDelete(favoriteId);
    if (!deletedFavorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }
    res.status(200).json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete favorite" });
  }
});

//Add favorite

// Add favorite
router.post("/add-favorite/", async (req, res) => {
  const { userId, galleryId } = req.body;
  try {
    const addFavorite = await Favorite.create({
      gallery: galleryId,
      owner: userId,
    });
    res.status(201).json(addFavorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add favorite" });
  }
});

module.exports = router;
