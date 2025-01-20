const router = require("express").Router();
const mongoose = require("mongoose");
const Gallery = require("../models/Gallery.model");

// Get all galleries
router.get("/all-galleries", async (req, res) => {
  try {
    const allGalleries = await Gallery.find();
    res.status(200).json(allGalleries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all galleries" });
  }
});

// Get one gallery
router.get("/one-gallery/:galleryId", async (req, res) => {
  try {
    const oneGallery = await Gallery.findById(req.params.galleryId);
    res.status(200).json(oneGallery);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch the gallery" });
  }
});

// Create a new gallery
router.post("/create-gallery", async (req, res) => {
  try {
    const createGallery = await Gallery.create(req.body);
    res.status(201).json(createGallery);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create the gallery" });
  }
});

module.exports = router;
