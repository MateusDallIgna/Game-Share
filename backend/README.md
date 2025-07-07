# Game Share Backend API

A distributed game sharing system backend built with Node.js, Express, and MongoDB.

## Features

- 🔐 **User Authentication**: JWT-based authentication with email/password
- 🎮 **Game Management**: Upload, download, and manage games
- 👤 **User Profiles**: User statistics and game history
- ⭐ **Rating System**: Game reviews and ratings
- 📁 **File Upload**: Secure file handling for games and images
- 🔍 **Search & Filter**: Advanced search and filtering capabilities
- 📊 **Statistics**: Download tracking and user analytics
- 🛡️ **Security**: Rate limiting, input validation, and CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/game-share
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Games

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/games` | Get all games | Public |
| GET | `/api/games/:id` | Get single game | Public |
| POST | `/api/games` | Upload game | Private |
| PUT | `/api/games/:id` | Update game | Private |
| DELETE | `/api/games/:id` | Delete game | Private |
| GET | `/api/games/:id/download` | Download game | Public |
| POST | `/api/games/:id/reviews` | Add review | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/:id` | Get user profile | Public |
| GET | `/api/users/:id/games` | Get user's games | Public |
| GET | `/api/users/:id/stats` | Get user statistics | Public |
| GET | `/api/users` | Get all users | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

## File Upload

The API supports file uploads for:
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Games**: ZIP, RAR, EXE, MSI, DMG, etc. (max 1GB)

Files are stored in:
- `uploads/images/` - Game thumbnails
- `uploads/games/` - Game files

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isVerified: Boolean,
  gamesUploaded: [Game IDs],
  totalUploads: Number,
  totalDownloads: Number
}
```

### Game Model
```javascript
{
  title: String,
  description: String,
  uploader: User ID,
  uploaderName: String,
  imageUrl: String,
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  downloads: Number,
  rating: { average: Number, count: Number },
  category: String,
  tags: [String],
  isActive: Boolean
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin resource sharing control
- **Helmet**: Security headers
- **File Validation**: File type and size validation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/game-share |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `MAX_FILE_SIZE` | Max game file size | 1GB |
| `MAX_IMAGE_SIZE` | Max image file size | 10MB |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 15 minutes |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Development

### Scripts
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm test         # Run tests (not implemented)
```

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── uploads/         # File uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Deployment

### Local Development
1. Install MongoDB locally
2. Set up environment variables
3. Run `npm run dev`

### Production Deployment
1. Set up MongoDB (Atlas recommended)
2. Configure environment variables
3. Set `NODE_ENV=production`
4. Run `npm start`

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Optional
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 