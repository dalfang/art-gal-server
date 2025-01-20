const router = require("express").Router();
const mongoose = require("mongoose");
const Favorite = require("../models/Favorite.model");

//Get all favorite
router.get("/all-favorites", async (req, res) => {
  try {
    const allFavorites = await Favorite.find();
    res.status().json(allFavorites);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch all favorites" });
  }
});

//Get user's favorite

router.get("/your-favorite/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userFavorite = await ProgressEvent.find({ user: userId }).populate(
      "user"
    );
    res.status(200).json(userFavorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch user's favorite" });
  }
});

module.exports = router;
