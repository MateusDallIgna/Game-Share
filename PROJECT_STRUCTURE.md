# 📁 Project Structure Overview

This document explains the organization of the Game Share distributed system for easy deployment on Oracle Cloud.

## 🏗️ Overall Structure

```
Trabalho_Final/
├── 📁 frontend/              # 🎨 Frontend Application (Port 3000/80)
├── 📁 backend/               # 🔧 Backend API (Port 4000)
├── 📁 database-scripts/      # 🗄️ Database Setup (Port 27017)
├── 📄 deploy-oracle.sh       # 🚀 Oracle Deployment Script
├── 📄 ORACLE_DEPLOYMENT.md   # 📖 Oracle Deployment Guide
├── 📄 PROJECT_STRUCTURE.md   # 📋 This file
└── 📄 README.md              # 📚 Main Documentation
```

## 🎯 Deployment Components

### 1. Frontend (React Application)
**Purpose**: User interface for browsing and uploading games
**Location**: `frontend/`
**Port**: 3000 (development) / 80 (production)
**Deployment**: Can run on separate Oracle server

**Key Files**:
- `Dockerfile` - Container configuration
- `nginx.conf` - Web server configuration
- `package.json` - Dependencies and scripts
- `src/` - React source code

### 2. Backend (Node.js API)
**Purpose**: RESTful API for game management and authentication
**Location**: `backend/`
**Port**: 4000
**Deployment**: Can run on separate Oracle server

**Key Files**:
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup
- `server.js` - Main server file
- `models/` - Database models
- `routes/` - API endpoints
- `middleware/` - Custom middleware

### 3. Database (MongoDB)
**Purpose**: Data storage for users, games, and metadata
**Location**: `database-scripts/`
**Port**: 27017
**Deployment**: Can run on separate Oracle server

**Key Files**:
- `init-db.js` - Database initialization
- `package.json` - Database dependencies
- `README.md` - Database documentation

## 🚀 Deployment Options

### Option A: Single Server Deployment
All components run on one Oracle server:
```
Oracle Server
├── Frontend (Port 80)
├── Backend (Port 4000)
└── Database (Port 27017)
```

**Use Case**: Development, testing, small-scale deployment
**Script**: `./deploy-oracle.sh`

### Option B: Distributed Deployment
Each component on separate Oracle servers:
```
Frontend Server (Port 80)
├── React Application
└── Nginx Web Server

Backend Server (Port 4000)
├── Node.js API
└── File Storage

Database Server (Port 27017)
└── MongoDB Database
```

**Use Case**: Production, high availability, true distribution
**Guide**: `ORACLE_DEPLOYMENT.md`

## 📋 File Descriptions

### Deployment Files
- `deploy-oracle.sh` - Automated deployment script for single server
- `ORACLE_DEPLOYMENT.md` - Detailed Oracle Cloud deployment guide
- `README.md` - Complete project documentation

### Frontend Files
- `frontend/Dockerfile` - Container image for React app
- `frontend/nginx.conf` - Nginx configuration for production
- `frontend/.dockerignore` - Files to exclude from Docker build

### Backend Files
- `backend/Dockerfile` - Container image for Node.js API
- `backend/docker-compose.yml` - Multi-service orchestration
- `backend/.dockerignore` - Files to exclude from Docker build
- `backend/env.example` - Environment variables template

### Database Files
- `database-scripts/init-db.js` - Database setup and initialization
- `database-scripts/package.json` - Database dependencies
- `database-scripts/README.md` - Database-specific documentation

## 🔧 Configuration Files

### Environment Variables
Each component has its own configuration:

**Backend** (`.env`):
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/game-share
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (built-in):
- API URL: `http://localhost:4000` (development)
- API URL: `http://your-backend-server:4000` (production)

**Database** (MongoDB):
- Connection string in backend `.env`
- Authentication (optional)

## 🌐 Network Configuration

### Ports Used
- **80**: Frontend (HTTP)
- **443**: Frontend (HTTPS)
- **4000**: Backend API
- **27017**: MongoDB Database
- **22**: SSH Access

### Security Groups
Configure Oracle Cloud security lists to allow:
- HTTP/HTTPS traffic to frontend
- API traffic to backend
- Database traffic (private network)
- SSH access for management

## 📊 Monitoring and Management

### Health Checks
- Frontend: `http://server:80/health`
- Backend: `http://server:4000/api/health`
- Database: MongoDB connection test

### Logs
- Frontend: Docker logs or nginx logs
- Backend: Docker logs or systemd logs
- Database: MongoDB logs

### Monitoring Script
- `monitor.sh` - Created by deployment script
- Shows status of all services
- Displays service URLs

## 🔄 Deployment Workflow

### Single Server
1. Upload entire project to Oracle server
2. Run `./deploy-oracle.sh`
3. Script handles everything automatically

### Distributed
1. Upload each component to separate servers
2. Configure environment variables
3. Deploy each component individually
4. Configure network connectivity

## 🛠️ Maintenance

### Updates
- Pull latest code
- Rebuild Docker images
- Restart services

### Backups
- Database: MongoDB dump
- Files: Upload directory backup
- Configuration: Environment files

### Scaling
- Add more backend instances
- Use load balancer
- Configure MongoDB replica set

## 📞 Support

### Documentation
- `README.md` - Complete project guide
- `ORACLE_DEPLOYMENT.md` - Oracle-specific deployment
- Component-specific README files

### Troubleshooting
- Check service logs
- Verify network connectivity
- Test API endpoints
- Monitor resource usage

---

**This structure enables true distributed deployment while maintaining simplicity for single-server setups.** 