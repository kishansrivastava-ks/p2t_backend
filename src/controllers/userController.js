const User = require("../models/userModel");
const { AppError } = require("../middlewares/errorHandler");

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

// Create new user
const createUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    console.log(req.body);
    console.log(User);
    console.log(newUser);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
};

module.exports = {
  getAllUsers,
  createUser,
};
