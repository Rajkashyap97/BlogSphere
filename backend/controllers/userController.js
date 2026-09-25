const User = require('../models/User');

/**
 * @desc    Create a new user
 * @route   POST /users
 * @access  Public
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400);
      throw new Error('Please provide both name and email');
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(409);
      throw new Error('User with this email already exists');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase()
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /users
 * @access  Public
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers
};

