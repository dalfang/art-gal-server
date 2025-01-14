const { Schema, model, default: mongoose } = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    drawing: {
      type: Schema.Types.ObjectId,
      ref: "Drawing",
    },
  },
  {
    timestamps: true,
  }
);

const Favorite = model("Favorite", favoriteSchema);
