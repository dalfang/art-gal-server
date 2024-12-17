const { Schema, model } = require("mongoose");

const drawingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Give a name to your work of art"],
    },
    file: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Drawing = model("Drawing", drawingSchema);

module.exports = Drawing;
