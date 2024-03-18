const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { CustomError } = require("../utils");
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const { id } = req.params;
  try {
    // get token from header
    token = req.headers.authorization.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // checking if provided token decoded id is actually equal to id provided
    // this will ensure that, only the user who created the token can access it

    if (id === decoded.id) {
      // Get user from token
      req.user = await User.findById(decoded.id).select("-password"); // getting all details except password
    }else{
      throw new CustomError("Not Authorized", 401);
    }
    next();
  } catch (error) {
    throw new CustomError("Not Authorized", 401);
  }

  if (!token) {
    throw new CustomError("Not Authorized, no token", 401);
  }
});


const adminAuthProtect = asyncHandler(async (req, res, next) => {
  let token;
  const { id } = req.params;
  try {
    // get token from header
    token = req.headers.authorization.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // checking if provided token decoded id is actually equal to id provided
    // this will ensure that, only the user who created the token can access it

    if (id === decoded.id) {
      // Get user from token
      req.user = await User.findById(decoded.id).select("-password"); // getting all details except password

      if(req.user.role !== "admin"){
        throw new CustomError("Not Authorized", 401);
      }
      
    }else{
      throw new CustomError("Not Authorized", 401);
    }
    next();
  } catch (error) {
    throw new CustomError("Not Authorized", 401);
  }

  if (!token) {
    throw new CustomError("Not Authorized, no token", 401);
  }
});

module.exports = {adminAuthProtect, protect};