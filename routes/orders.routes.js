const router = require("express").Router();
const Order = require("../models/Order.model");
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");
const cloudinary = require("cloudinary").v2;
const { uploadDrawing } = require("../middleware/apiUtils");

// Price map for products
//TO DO ADD product
const PRICE_MAP = {
  mug: 5.5,
  rug: 7.5,
};

// Product configurations for image merging
const PRODUCT_META = {
  mug: {
    img: "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/mug_qymqid.png",
    meta: { height: 170, x: 240, y: 200 },
  },

  rug: {
    img: "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/mug_qymqid.png",
    meta: { height: 170, x: 240, y: 200 },
  },
};

// Helper function to update user or drawing data
const updateModelById = async (model, id, updateData) =>
  model.findByIdAndUpdate(id, updateData, {
    new: true,
    useFindAndModify: false,
  });

// Helper function for logging errors
const logError = (message, error, next) => {
  console.error(message, error);
  next(error);
};

// Create a new order
router.post("/", async (req, res, next) => {
  try {
    const { user, drawing, product, price, shippingAddress } = req.body;
    const orderToCreate = { user, drawing, product, price, shippingAddress };
    const createdOrder = await Order.create(orderToCreate);

    // Update user and drawing with the created order
    await updateModelById(User, user, { $push: { orders: createdOrder._id } });
    await updateModelById(Drawing, drawing, {
      $push: { orders: createdOrder._id },
    });

    console.log("Order created!", createdOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    logError("Error creating order: ", error, next);
  }
});

// Update an order with merged image
router.put("/", async (req, res, next) => {
  try {
    const { product, drawing: drawingId, user, order } = req.body;

    // Get product and drawing metadata
    const { img: productImg, meta: resizedDrawingMeta } = PRODUCT_META[product];
    const drawing = await Drawing.findById(drawingId);

    const resizedDrawing = cloudinary.url(drawing.file.split("/").pop(), {
      transformation: [
        { height: resizedDrawingMeta.height, width: resizedDrawingMeta.height },
        { fetch_format: "png" },
      ],
    });

    const mergedImageBase64 = await mergeImages(
      [
        { src: productImg, x: 0, y: 0 },
        {
          src: resizedDrawing,
          x: resizedDrawingMeta.x,
          y: resizedDrawingMeta.y,
        },
      ],
      { Canvas, Image }
    );

    const mergedImg = await uploadDrawing(mergedImageBase64);

    const updatedOrder = await updateModelById(Order, order, {
      user,
      drawing: drawingId,
      product,
      price: PRICE_MAP[product],
      mergedImg: mergedImg.secure_url,
    });

    console.log("Order updated!", updatedOrder);
    res.status(201).json(updatedOrder);
  } catch (error) {
    logError("Error updating order: ", error, next);
  }
});

// Update shipping address
router.put("/address", async (req, res, next) => {
  try {
    const { order, shippingAddress } = req.body;
    const updatedOrder = await updateModelById(Order, order, {
      shippingAddress,
      fulfilled: true,
    });

    console.log("Shipping address updated!", updatedOrder);
    res.status(201).json(updatedOrder);
  } catch (error) {
    logError("Error updating shipping address: ", error, next);
  }
});

// Get all fulfilled orders for a user
router.get("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("orders");
    const fulfilledOrders = user.orders.filter(
      (order) => order.fulfilled === true
    );

    res.status(200).json(fulfilledOrders);
  } catch (error) {
    logError("Error retrieving user's orders: ", error, next);
  }
});

// Delete unfulfilled orders for a user
router.delete("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("orders");
    const unfulfilledOrders = user.orders.filter(
      (order) => order.fulfilled === false
    );

    await Order.deleteMany({
      _id: { $in: unfulfilledOrders.map((order) => order._id) },
    });
    await updateModelById(User, req.params.id, {
      $pull: { orders: { $in: unfulfilledOrders } },
    });

    console.log(
      "Unfulfilled orders deleted: ",
      unfulfilledOrders.map((order) => order._id)
    );
    res.status(200).json(unfulfilledOrders.map((order) => order._id));
  } catch (error) {
    logError("Error deleting user's unfulfilled orders: ", error, next);
  }
});

module.exports = router;
