const express = require('express');

const channelManagerController = require('../controllers/channelManager');

const router = express.Router();

// GET /feed/posts
router.get('/posts', channelManagerController.getPosts);

// POST /feed/post
router.post('/post', channelManagerController.createPost);

module.exports = router;