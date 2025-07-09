const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../uploads/games')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for game files
const gameStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/games'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `game-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for game files
const gameFilter = (req, file, cb) => {
  const allowedTypes = /zip|rar|7z|exe|msi|dmg|pkg|deb|rpm|tar|gz/;
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const extname = allowedTypes.test(fileExtension);
  
  // Debug logging
  console.log('Game file validation:', {
    originalName: file.originalname,
    fieldname: file.fieldname,
    mimetype: file.mimetype,
    extension: fileExtension,
    isAllowed: extname
  });

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error(`Only game files (zip, rar, exe, etc.) are allowed! Got: ${fileExtension}`), false);
  }
};

// Configure multer for image uploads
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Configure multer for game uploads
const uploadGame = multer({
  storage: gameStorage,
  fileFilter: gameFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 1024 // 1GB
  }
});

// Configure multer for multiple files (image + game)
const uploadGameWithImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'image') {
        cb(null, path.join(__dirname, '../uploads/images'));
      } else if (file.fieldname === 'file') {
        cb(null, path.join(__dirname, '../uploads/games'));
      } else {
        cb(new Error('Invalid field name'), null);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      
      if (file.fieldname === 'image') {
        cb(null, `image-${uniqueSuffix}${ext}`);
      } else if (file.fieldname === 'file') {
        cb(null, `game-${uniqueSuffix}${ext}`);
      } else {
        cb(new Error('Invalid field name'), null);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'file') {
      return gameFilter(req, file, cb);
    } else {
      cb(new Error('Invalid field name'), false);
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 1024 // 1GB (use the larger limit for combined uploads)
  }
});

// Helper function to get file URL
const getFileUrl = (filename, type = 'games') => {
  const baseUrl = process.env.BASE_URL || `http://137.131.233.211:${process.env.PORT || 4000}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

module.exports = {
  uploadImage,
  uploadGame,
  uploadGameWithImage,
  getFileUrl,
  deleteFile
}; 