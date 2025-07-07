const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  uploaderName: {
    type: String,
    required: [true, 'Uploader name is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Game image is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'Game file is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required']
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  category: {
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Puzzle', 'Other'],
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  downloadHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
gameSchema.index({ title: 'text', description: 'text' });
gameSchema.index({ uploader: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ isActive: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ downloads: -1 });

// Virtual for formatted file size
gameSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for average rating
gameSchema.virtual('averageRating').get(function() {
  if (this.rating.count === 0) return 0;
  return Math.round((this.rating.average / this.rating.count) * 10) / 10;
});

// Method to increment download count
gameSchema.methods.incrementDownloads = function(userId = null, ipAddress = null) {
  this.downloads += 1;
  
  if (userId || ipAddress) {
    this.downloadHistory.push({
      user: userId,
      ipAddress: ipAddress,
      downloadedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to add review
gameSchema.methods.addReview = function(userId, rating, comment = '') {
  // Check if user already reviewed
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.createdAt = new Date();
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating: rating,
      comment: comment
    });
  }
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

// Static method to get popular games
gameSchema.statics.getPopularGames = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ downloads: -1 })
    .limit(limit)
    .populate('uploader', 'name email')
    .select('-downloadHistory -reviews');
};

// Static method to get recent games
gameSchema.statics.getRecentGames = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('uploader', 'name email')
    .select('-downloadHistory -reviews');
};

// Static method to search games
gameSchema.statics.searchGames = function(query, limit = 20) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  })
  .populate('uploader', 'name email')
  .select('-downloadHistory -reviews')
  .limit(limit);
};

module.exports = mongoose.model('Game', gameSchema); 