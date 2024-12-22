const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

//TO DO
//set up cloudinary for user img

const uploader = require("../config/cloudinary.config.js");
const Order = require("../models/Order.model.js");
const Drawing = require("../models/Drawing.model.js");

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", uploader.single("imageUrl"), async (req, res, next) => {
  let userImage = "";
  if (!req.file) {
    console.log("No image was selected");
  } else {
    userImage = req.file.path;
  }

  const { email, password, name } = req.body;

  // Check if email or password or name are provided as empty strings
  if (email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({
        email,
        password: hashedPassword,
        name,
        userImage: userImage,
      });
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, name, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, name, _id };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      const doesPasswordMatch = bcrypt.compareSync(
        req.body.password,
        foundUser.password
      );
      if (doesPasswordMatch) {
        const loggedInUser = {
          _id: foundUser._id,
          username: foundUser.username,
          userImage: foundUser.userImage,
        };
        const authToken = jwt.sign(loggedInUser, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res
          .status(200)
          .json({ message: "Login successful", authToken: authToken });
      } else {
        res.status(500).json({
          errorMessage: "Invalid password",
        });
      }
    } else {
      res.status(500).json({
        errorMessage: "Invalid email",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res) => {
  console.log("made it to the verify route", req.payload);
  if (req.payload) {
    res.status(200).json({ message: "Token valid", user: req.payload });
  } else {
    res.status(401).json({ message: "Invalid headers" });
  }
});

router.get("/profile/:userId", isAuthenticated, async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.payload._id);
    const currentOrder = await Order.find({ owner: req.payload._id });
    const currentDrawing = await Drawing.find({ owner: req.payload._id });

    res.status(200).json({
      currentUser,
      userImage: currentUser.userImage,
      currentOrder,
      currentDrawing,
      createdAt: currentUser.createdAt,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
