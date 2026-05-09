const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// Get all conversations (unique users you've messaged)
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).sort({ createdAt: -1 });

    // Get unique user IDs from conversations
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== req.user.id) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== req.user.id) userIds.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: [...userIds] } }).select('username profilePic');

    // Attach last message to each conversation
    const conversations = users.map(user => {
      const lastMsg = messages.find(
        m => (m.sender.toString() === user._id.toString() || m.receiver.toString() === user._id.toString())
      );
      const unreadCount = messages.filter(
        m => m.sender.toString() === user._id.toString() && m.receiver.toString() === req.user.id && !m.read
      ).length;
      return {
        user,
        lastMessage: lastMsg ? lastMsg.text : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        unreadCount
      };
    });

    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a specific user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }).populate('sender', 'username profilePic').populate('receiver', 'username profilePic');

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    const message = new Message({
      sender: req.user.id,
      receiver: req.params.userId,
      text: req.body.text
    });

    await message.save();
    await message.populate('sender', 'username profilePic');
    await message.populate('receiver', 'username profilePic');

    // Create notification
    await Notification.create({
      recipient: req.params.userId,
      sender: req.user.id,
      type: 'message',
      text: 'sent you a message'
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
