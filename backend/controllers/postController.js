const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

/**
 * @desc    Create a new blog post
 * @route   POST /posts
 * @access  Public
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content, authorId } = req.body;

    // Validate presence of required fields
    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Title is required');
    }

    if (!content || !content.trim()) {
      res.status(400);
      throw new Error('Content is required');
    }

    if (!authorId) {
      res.status(400);
      throw new Error('authorId is required');
    }

    // Validate ObjectId format for authorId
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      res.status(400);
      throw new Error(`Invalid authorId format: ${authorId}`);
    }

    // Verify that the author exists in the database
    const authorExists = await User.findById(authorId);
    if (!authorExists) {
      res.status(404);
      throw new Error('Author user not found');
    }

    // Create post in MongoDB
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      authorId
    });

    // Populate author info for the response
    const populatedPost = await post.populate('authorId', 'name email');

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts (sorted newest first, with populated author)
 * @route   GET /posts
 * @access  Public
 */
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('authorId', 'name email');

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top 3 most recent posts
 * @route   GET /posts/recent/top
 * @access  Public
 */
const getTopRecentPosts = async (req, res, next) => {
  try {
    const topPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('authorId', 'name email');

    res.status(200).json(topPosts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post by ID
 * @route   DELETE /posts/:id
 * @access  Public
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid post ID format: ${id}`);
    }

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    res.status(200).json({
      message: 'Post deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getTopRecentPosts,
  deletePost
};

