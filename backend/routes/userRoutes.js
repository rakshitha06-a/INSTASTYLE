const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Set up multer for profile pic uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Search users by username
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, 'i');
    const users = await User.find({ username: regex })
      .select('-password')
      .limit(20);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested users (users you don't follow)
router.get('/suggested/list', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const suggested = await User.find({
      _id: { $nin: [...currentUser.following, req.user.id] }
    })
      .select('-password')
      .limit(5);
    res.json(suggested);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.put('/profile-pic/upload', authMiddleware, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile and their posts
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    res.json({ user, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow / Unfollow a user
router.put('/:id/follow', authMiddleware, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow.followers.includes(req.user.id)) {
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.id);
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    } else {
      userToFollow.followers.push(req.user.id);
      currentUser.following.push(req.params.id);
      // Send notification
      await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow',
        text: 'started following you'
      });
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ message: 'Success', followers: userToFollow.followers, following: currentUser.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
