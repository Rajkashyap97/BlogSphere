const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getTopRecentPosts,
  deletePost
} = require('../controllers/postController');

// IMPORTANT ROUTE ORDERING:
// Dedicated static routes must precede dynamic parameterized routes (/:id)
// so that "/recent/top" is not matched as an ObjectId parameter.

// Route: /posts/recent/top (Get top 3 recent posts)
router.get('/recent/top', getTopRecentPosts);

// Route: /posts (Get all posts, Create new post)
router.route('/')
  .get(getPosts)
  .post(createPost);

// Route: /posts/:id (Delete post by ID)
router.route('/:id')
  .delete(deletePost);

module.exports = router;

