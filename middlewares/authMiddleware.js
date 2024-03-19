const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { getTokenFromHeaders } = require("../utils");

const protect = asyncHandler(async (req, res, next) => {
  const decoded = getTokenFromHeaders(req, res);

  req.user = await User.findById(decoded.id).select("-password");
  if(!req.user){
    res.status(404);
    throw new Error("User not found");
  }

  req.body.id = decoded.id;
  next();
});

const adminAuthProtect = asyncHandler(async (req, res, next) => {
  const decoded = getTokenFromHeaders(req, res);
  // Get user from token
  req.user = await User.findById(decoded.id).select("-password"); // getting all details except password

  if (!req.user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.user.role !== "admin") {
    res.status(401);
    throw new Error("Not Authorized");
  }

  req.body.id = decoded.id
  next();
});

module.exports = { adminAuthProtect, protect };
