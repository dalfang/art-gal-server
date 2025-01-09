const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    drawing: {
      type: Schema.Types.ObjectId,
      ref: "Drawing",
    },
    price: {
      type: Number,
    },
    shippingAddress: {
      type: String,
    },
    product: {
      type: String,
      enum: ["20*30", "30*40", "40*60", "50*70"],
    },
    mergedImg: {
      type: String,
    },
    fulfilled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

module.exports = Order;
