const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Create a post
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      content: req.body.content,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const post = await newPost.save();
    await post.populate('user', 'username profilePic');
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .populate('reactions.user', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get personalized feed (only followed users)
router.get('/feed/following', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const posts = await Post.find({ user: { $in: currentUser.following } })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .populate('reactions.user', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    post.content = req.body.content || post.content;
    await post.save();
    await post.populate('user', 'username profilePic');
    await post.populate('comments.user', 'username profilePic');
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    // Delete associated image file if exists
    if (post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      // Send notification
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id,
          text: 'liked your post'
        });
      }
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// React to a post (emoji)
router.put('/:id/react', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { type } = req.body;
    const existingReaction = post.reactions.find(r => r.user.toString() === req.user.id);

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if same type
        post.reactions = post.reactions.filter(r => r.user.toString() !== req.user.id);
      } else {
        existingReaction.type = type;
      }
    } else {
      post.reactions.push({ user: req.user.id, type });
    }

    await post.save();
    await post.populate('reactions.user', 'username');
    res.json(post.reactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookmark a post
router.put('/:id/bookmark', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.bookmarks.includes(req.params.id)) {
      user.bookmarks = user.bookmarks.filter(b => b.toString() !== req.params.id);
    } else {
      user.bookmarks.push(req.params.id);
    }
    await user.save();
    res.json(user.bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookmarked posts
router.get('/bookmarks/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const posts = await Post.find({ _id: { $in: user.bookmarks } })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = { user: req.user.id, text: req.body.text };
    post.comments.push(newComment);
    await post.save();

    // Send notification
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        text: 'commented on your post'
      });
    }

    await post.populate('comments.user', 'username profilePic');
    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
