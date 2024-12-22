const router = require("express").Router();
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const Order = require("../models/Order.model");
const { uploadDrawing } = require("../middleware/apiUtils");
const uploader = require("../config/cloudinary.config.js");

// Helper function to update user's drawings
async function updateUserDrawings(userId, drawingId, action) {
  const updateOperation =
    action === "add"
      ? { $push: { drawings: drawingId } }
      : { $pull: { drawings: drawingId } };
  return User.findByIdAndUpdate(userId, updateOperation, {
    new: true,
    useFindAndModify: false,
  });
}

// Upload canvas drawing
router.post("/upload", async (req, res, next) => {
  const { drawingData, title, author } = req.body;

  if (!drawingData) {
    return next(new Error("No drawing uploaded!"));
  }

  try {
    const result = await uploadDrawing(drawingData);
    const newDrawing = { title, file: result.secure_url, author };

    const createdDrawing = await Drawing.create(newDrawing);
    await updateUserDrawings(author, createdDrawing._id, "add");

    console.log("Drawing uploaded:", createdDrawing);
    res.status(201).json(createdDrawing);
  } catch (error) {
    console.error("Error uploading canvas drawing:", error);
    next(error);
  }
});

// Upload file from user
router.post(
  "/upload-file",
  uploader.single("fileUrl"),
  async (req, res, next) => {
    const { title, author } = req.body;
    const fileImage = req.file?.path;

    if (!fileImage) {
      return next(new Error("No file selected for upload!"));
    }

    try {
      const newDrawing = { title, file: fileImage, author };
      const createdDrawing = await Drawing.create(newDrawing);
      await updateUserDrawings(author, createdDrawing._id, "add");

      console.log("File uploaded:", createdDrawing);
      res.status(201).json(createdDrawing);
    } catch (error) {
      console.error("Error uploading file:", error);
      next(error);
    }
  }
);

// Get all drawings of a given user
router.get("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("drawings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.drawings);
  } catch (error) {
    console.error("Error retrieving user's drawings:", error);
    next(error);
  }
});

// Delete drawing by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const drawing = await Drawing.findByIdAndDelete(req.params.id);
    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }

    await updateUserDrawings(drawing.author, drawing._id, "remove");

    if (drawing.orders?.length) {
      await Promise.all(
        drawing.orders.map((orderId) => Order.findByIdAndDelete(orderId))
      );
    }

    res.status(200).json({ message: "Drawing deleted successfully" });
  } catch (error) {
    console.error("Error deleting drawing:", error);
    next(error);
  }
});

// Get drawing by ID
router.get("/:id", async (req, res, next) => {
  try {
    const drawing = await Drawing.findById(req.params.id);
    if (!drawing) {
      return res.status(404).json({ message: "Drawing not found" });
    }
    res.status(200).json(drawing);
  } catch (error) {
    console.error("Error retrieving drawing:", error);
    next(error);
  }
});

module.exports = router;
