const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isEmail = require("validator/lib/isEmail");

// Login user
// post request with email and password
// public access

const loginUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    res.status(400);
    throw new Error("Please provide details");
  }

  const { email, password } = req.body;

  // Checking if user filled all the details
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide all details");
  }

  if (!isEmail(email)) {
    res.status(400);
    throw new Error("Please provide valid email");
  }

  // Checking for user
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("user not found");
  }

  // Checking for password

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

// Register user
// post request with name, email and password
// public access

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (!isEmail(email)) {
    res.status(400);
    throw new Error("Please provide valid email");
  }

  // checking for user existance
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error("User already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

// update user
// post request with password and new password
// private access
const updateUser = asyncHandler(async (req, res) => {
  // id we are getting from auth middleware

  const { id, password, newPassword } = req.body;
  if (!id) {
    res.status(400);
    throw new Error("Please provide id");
  }

  if (!password || !newPassword) {
    res.status(400);
    throw new Error("Please provide password and new password");
  }

  // checking for user existance

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // confirming the user password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }

  // updating the user password

  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await User.findByIdAndUpdate(
    { _id: id },
    {
      password: newHashedPassword,
    }
  );

  if (!updatedUser) {
    res.status(500);
    throw new Error("Internal Server Error");
  }

  res.status(200).json({ msg: "Password updated" });
});


// delete request
// post request and password
// private access

const deleteUser = asyncHandler(async (req, res) => {
  const { id, password } = req.body;
  if (!id) {
    res.status(400);
    throw new Error("Please provide id");
  }
  if (!password) {
    res.status(400);
    throw new Error("Please provide password");
  }

  // checking for user existance
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // confirming the user password
  if (user && (await bcrypt.compare(password, user.password))) {
    await User.findByIdAndDelete(id);
    res.status(200).json({ msg: "User deleted" });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

// user profile
// get request
// private access
const userProfile = asyncHandler(async (req, res) => {
  const { name, email, role } = await User.findById(req.body.id);
  res.status(200).json({
    name: name,
    email: email,
    role: role
  });
});

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  loginUser,
  registerUser,
  updateUser,
  deleteUser,
  userProfile,
};
