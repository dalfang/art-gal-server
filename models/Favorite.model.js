const { Schema, model, default: mongoose } = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gallery: {
      type: Schema.Types.ObjectId,
      ref: "Gallery",
    },
  },
  {
    timestamps: true,
  }
);

const Favorite = model("Favorite", favoriteSchema);
