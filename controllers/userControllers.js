const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { CustomError } = require("../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login user
const loginUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new CustomError("Please provide details", 400);
  }

  const { email, password } = req.body;

  // Checking if user filled all the details
  if (!email || !password) {
    throw new CustomError("Please provide all details", 400);
  }

  // Checking for user
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("user not found", 404);
  }

  // Checking for password

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    throw new CustomError("Invalid Credentials", 401);
  }
});

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError("Please add all fields", 400);
  }

  // checking for user existance
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new CustomError("User already exists", 400);
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
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    throw new CustomError("Invalid Credentials", 400);
  }
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password, newPassword } = req.body;
  if (!id) {
    throw new CustomError("Please provide id", 400);
  }

  // checking for user existance

  const user = await User.findById(id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // confirming the user password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new CustomError("Invalid Credentials", 401);
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

  if (updatedUser) {
    res.status(200).json({ msg: "Password updated" });
  } else {
    throw new CustomError("Internal Server Error", 500);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!id) {
    throw new CustomError("Please provide id", 400);
  }
  if (!password) {
    throw new CustomError("Please provide password", 400);
  }

  // checking for user existance
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // confirming the user password
  if (user && (await bcrypt.compare(password, user.password))) {
    await User.findByIdAndDelete(id);
    res.status(200).json({ msg: "User deleted" });
  } else {
    throw new CustomError("Invalid Credentials", 401);
  }
});

// user profile
const userProfile = asyncHandler(async (req, res) => {
  const { _id, name, email } = await User.findById(req.params.id);
  res.status(200).json({
    id: _id,
    name: name,
    email: email,
  });
});


// get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json({
    users
  })
})


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
  getAllUsers
};
