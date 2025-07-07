const express = require('express');
const { body, validationResult } = require('express-validator');
const Game = require('../models/Game');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadGameWithImage, getFileUrl, deleteFile } = require('../middleware/upload');
const path = require('path');

const router = express.Router();

// @desc    Get all games
// @route   GET /api/games
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      sort = 'createdAt',
      order = 'desc' 
    } = req.query;

    const query = { isActive: true };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const games = await Game.find(query)
      .populate('uploader', 'name email')
      .select('-downloadHistory -reviews')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Game.countDocuments(query);

    res.json({
      success: true,
      data: games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get single game
// @route   GET /api/games/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('uploader', 'name email')
      .populate('reviews.user', 'name');

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (!game.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Upload game
// @route   POST /api/games
// @access  Private
router.post('/', [
  protect,
  uploadGameWithImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]),
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    // Check if files were uploaded
    if (!req.files || !req.files.image || !req.files.file) {
      return res.status(400).json({
        success: false,
        error: 'Both image and game file are required'
      });
    }

    const { title, description, category, tags } = req.body;
    const imageFile = req.files.image[0];
    const gameFile = req.files.file[0];

    // Create game
    const game = await Game.create({
      title,
      description: description || '',
      uploader: req.user._id,
      uploaderName: req.user.name,
      imageUrl: getFileUrl(imageFile.filename, 'images'),
      fileUrl: getFileUrl(gameFile.filename, 'games'),
      fileName: gameFile.originalname,
      fileSize: gameFile.size,
      fileType: path.extname(gameFile.originalname),
      category: category || 'Other',
      tags: tags || []
    });

    // Update user's upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalUploads: 1 },
      $push: { gamesUploaded: game._id }
    });

    // Populate uploader info
    await game.populate('uploader', 'name email');

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Upload game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during upload'
    });
  }
});

// @desc    Download game
// @route   GET /api/games/:id/download
// @access  Public
router.get('/:id/download', optionalAuth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game || !game.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Increment download count
    await game.incrementDownloads(req.user?._id, req.ip);

    // Update user's download count if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalDownloads: 1 }
      });
    }

    res.json({
      success: true,
      data: {
        downloadUrl: game.fileUrl,
        fileName: game.fileName
      }
    });
  } catch (error) {
    console.error('Download game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private
router.put('/:id', [
  protect,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Check if user owns the game or is admin
    if (game.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this game'
      });
    }

    const { title, description, category, tags } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (category) updateFields.category = category;
    if (tags) updateFields.tags = tags;

    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('uploader', 'name email');

    res.json({
      success: true,
      data: updatedGame
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Check if user owns the game or is admin
    if (game.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this game'
      });
    }

    // Delete files
    const imagePath = path.join(__dirname, '../uploads/images', path.basename(game.imageUrl));
    const gamePath = path.join(__dirname, '../uploads/games', path.basename(game.fileUrl));
    
    deleteFile(imagePath);
    deleteFile(gamePath);

    // Delete game
    await Game.findByIdAndDelete(req.params.id);

    // Update user's upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalUploads: -1 },
      $pull: { gamesUploaded: req.params.id }
    });

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Add review to game
// @route   POST /api/games/:id/reviews
// @access  Private
router.post('/:id/reviews', [
  protect,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Comment cannot exceed 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const game = await Game.findById(req.params.id);

    if (!game || !game.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    const { rating, comment } = req.body;

    // Add review
    await game.addReview(req.user._id, rating, comment);

    // Populate reviews
    await game.populate('reviews.user', 'name');

    res.json({
      success: true,
      data: game.reviews
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router; 