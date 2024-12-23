const { Schema, model } = require("mongoose");

const gallerySchema = new Schema(
  {
    name: {
      type: String,
    },
    description: { type: String },
    images: [{ type: String }],
    location: [{ type: String }],
  },
  { timestamps: true }
);

const Gallery = model("Gallery", gallerySchema);

module.exports = Gallery;
