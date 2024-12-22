const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    if (req.headers.authorization.split(" ")[0] === "Bearer") {
      const token = req.headers.authorization.split(" ")[1];
      const theDecodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

      req.payload = theDecodedToken;

      next();
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json("token not provided or not valid");
  }
};

module.exports = {
  isAuthenticated,
};
