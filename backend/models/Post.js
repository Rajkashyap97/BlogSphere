const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please provide post content']
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an author ID']
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

