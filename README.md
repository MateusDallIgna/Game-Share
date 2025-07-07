# 🎮 Game Share - Distributed Game Sharing System

A modern, distributed game sharing platform built with React, Node.js, and MongoDB. Users can upload, download, and share games with a complete authentication system and user profiles.

## 🌟 Features

### Frontend (React)
- **Modern UI/UX**: Clean, responsive design with smooth animations
- **User Authentication**: Login/Register with JWT tokens
- **Game Management**: Upload games with images and metadata
- **Real-time Updates**: Live download counts and ratings
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Comprehensive error states and loading indicators

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for games and users
- **JWT Authentication**: Secure token-based authentication
- **File Upload**: Secure file handling for games and images
- **Database Integration**: MongoDB with Mongoose ODM
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper error responses and logging

### Database (MongoDB)
- **User Management**: User profiles, authentication, and roles
- **Game Storage**: Game metadata, file URLs, and statistics
- **Rating System**: User reviews and ratings
- **Download Tracking**: Download history and statistics
- **Search & Filter**: Advanced search capabilities

## 🏗️ Architecture

This is a **distributed system** with three main components:

1. **Frontend** (Port 3000) - React application
2. **Backend API** (Port 4000) - Node.js/Express server
3. **Database** (Port 27017) - MongoDB instance

Each component can run on different machines for true distribution.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher (comes with Node.js)
- **MongoDB**: v4.4 or higher
- **Git**: For version control
- **Docker**: v20.10 or higher (for deployment)
- **Docker Compose**: v2.0 or higher (for deployment)

### Operating Systems
- **Linux**: Ubuntu 20.04+, CentOS 8+, or similar
- **macOS**: 10.15+ (Catalina or later)
- **Windows**: 10 or 11 (with WSL2 recommended)

### Network Requirements
- **Port 3000**: Frontend development server
- **Port 4000**: Backend API server
- **Port 27017**: MongoDB database
- **Port 80**: Production frontend (optional)
- **Port 443**: HTTPS (production)

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🚀 Local Development

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Trabalho_Final
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` file:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/game-share
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# In another terminal, setup the database
npm run setup
```

### 4. Start Backend
```bash
npm run dev
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

### 6. Start Frontend
```bash
npm start
```

### 7. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Health Check: http://localhost:4000/api/health

### Development Scripts

#### Backend
```bash
cd backend
npm run dev          # Start with nodemon
npm run setup        # Setup database
npm start            # Start production server
```

#### Frontend
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### Environment Variables

#### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/game-share
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=1073741824
MAX_IMAGE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend
The frontend automatically connects to `http://localhost:4000` for the API.

## 🚀 Deployment

### Oracle Cloud Deployment

#### Prerequisites
- Oracle Cloud Infrastructure account
- Oracle Linux or Ubuntu server instance
- Docker and Docker Compose installed
- Node.js v16+ installed

#### Quick Deployment
```bash
# Upload project to Oracle server
scp -r . user@your-oracle-server:/home/user/

# Run deployment script
chmod +x deploy-oracle.sh
./deploy-oracle.sh
```

#### Manual Deployment
1. **Upload Components**
   ```bash
   # Upload each component to separate servers
   scp -r frontend/ user@frontend-server:/opt/game-share/
   scp -r backend/ user@backend-server:/opt/game-share/
   scp -r database-scripts/ user@db-server:/opt/game-share/
   ```

2. **Database Server Setup**
   ```bash
   cd /opt/game-share
   npm install
   npm run init
   ```

3. **Backend Server Setup**
   ```bash
   cd /opt/game-share
   npm install
   cp env.example .env
   # Edit .env with production values
   docker-compose up -d
   ```

4. **Frontend Server Setup**
   ```bash
   cd /opt/game-share
   npm install
   npm run build
   docker build -t game-share-frontend .
   docker run -d -p 80:80 game-share-frontend
   ```

### Railway Deployment

#### Backend Deployment on Railway

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login

   # Initialize project
   cd backend
   railway init

   # Set environment variables
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set FRONTEND_URL=your-frontend-url

   # Deploy
   railway up
   ```

3. **Configure MongoDB**
   - Use MongoDB Atlas or Railway's MongoDB service
   - Update `MONGODB_URI` in Railway variables

4. **Set up Database**
   ```bash
   # Run database initialization
   railway run npm run setup
   ```

#### Frontend Deployment on Railway

1. **Deploy Frontend**
   ```bash
   cd frontend
   railway init

   # Set build command
   railway variables set NPM_RUN_BUILD="npm run build"

   # Set environment variables
   railway variables set REACT_APP_API_URL=your-backend-url

   # Deploy
   railway up
   ```

2. **Configure Domain**
   - Add custom domain in Railway dashboard
   - Configure SSL certificate

### Docker Deployment

#### Using Docker Compose
```bash
# Clone repository
git clone <repository-url>
cd Trabalho_Final

# Create environment file
cp backend/env.example backend/.env
# Edit .env with production values

# Start all services
cd backend
docker-compose up -d
```

#### Individual Containers
```bash
# Build images
docker build -t game-share-backend ./backend
docker build -t game-share-frontend ./frontend

# Run containers
docker run -d -p 4000:4000 --name backend game-share-backend
docker run -d -p 80:80 --name frontend game-share-frontend
```

### Environment Variables for Production

#### Backend
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/game-share
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=1073741824
MAX_IMAGE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 👤 Default Users

After running the setup script, you'll have these users:

### Admin User
- **Email**: admin@gameshare.com
- **Password**: admin123
- **Role**: Admin (can manage all users and games)

### Sample Users
- **Email**: john@example.com
- **Password**: password123

- **Email**: jane@example.com
- **Password**: password123

## 📁 Project Structure

```
Trabalho_Final/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (Auth)
│   │   ├── services/        # API services
│   │   └── ...
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── backend/                  # Node.js backend
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── uploads/             # File uploads
│   ├── scripts/             # Setup scripts
│   ├── Dockerfile           # Backend Docker configuration
│   ├── docker-compose.yml   # Docker Compose configuration
│   └── package.json
├── database-scripts/         # Database initialization
│   ├── init-db.js           # Database setup script
│   ├── package.json         # Database dependencies
│   └── README.md            # Database documentation
├── deploy-oracle.sh         # Oracle deployment script
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get single game
- `POST /api/games` - Upload game
- `GET /api/games/:id/download` - Download game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/games` - Get user's games
- `GET /api/users/:id/stats` - Get user statistics

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Cross-origin resource sharing control
- **File Validation**: File type and size validation
- **Helmet**: Security headers

## 📊 Database Schema

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

## 🎨 Frontend Features

### Pages
- **Home**: Browse and download games
- **Upload**: Upload new games (authenticated users only)
- **Login**: User authentication
- **Register**: User registration

### Components
- **Navigation**: User-aware navigation with authentication
- **Game Cards**: Display game information with download stats
- **Upload Form**: Multi-step game upload with validation
- **Auth Forms**: Login and registration forms

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run setup        # Setup database
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
```

### Environment Variables

#### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/game-share
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=1073741824
MAX_IMAGE_SIZE=10485760
```

#### Frontend
The frontend automatically connects to `http://localhost:4000` for the API.

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (Atlas recommended)
2. Configure environment variables
3. Set `NODE_ENV=production`
4. Run `npm start`

### Frontend Deployment
1. Update API URL in production
2. Run `npm run build`
3. Deploy the `build` folder

### Docker Deployment
```dockerfile
# Backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify MongoDB is running
3. Check environment variables
4. Ensure all dependencies are installed

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Game categories and tags
- [ ] User profiles and avatars
- [ ] Game reviews and comments
- [ ] Advanced search and filtering
- [ ] Social features (following, favorites)
- [ ] Mobile app
- [ ] Cloud storage integration
- [ ] CDN for file delivery
- [ ] Analytics dashboard

---

**Built with ❤️ for distributed systems education** 