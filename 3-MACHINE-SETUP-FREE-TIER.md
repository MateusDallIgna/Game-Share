# 🚀 3-Machine Distributed Setup Guide - Oracle Cloud Free Tier

This guide explains how to deploy the Game Share system across 3 separate Oracle Cloud Free Tier machines for true distributed architecture.

## 🆓 Oracle Cloud Free Tier Overview

### What's Included (Always Free)
- **4 ARM-based Compute VMs** (1 OCPU, 6GB RAM each)
- **200GB total storage**
- **10TB data transfer per month**
- **No expiration date**

### Our Resource Allocation
```
Machine 1 (Frontend)     Machine 2 (Backend)     Machine 3 (Database)
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ React App    │────▶│ Node.js API  │────▶│ 🗄️ MongoDB     │
│ 1 OCPU, 6GB RAM │     │ 1 OCPU, 6GB RAM │     │ 1 OCPU, 6GB RAM │
│ Port: 80        │     │ Port: 4000      │     │ Port: 27017     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```
**Total Usage: 3/4 Free Tier VMs (75%)**

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Oracle Cloud Free Tier Infrastructure                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Machine 1 (Frontend)          Machine 2 (Backend)          Machine 3 (DB) │
│  ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────┐ │
│  │ 🌐 React App        │──────▶│ 🔧 Node.js API      │──────▶│ 🗄️ MongoDB  │ │
│  │ Port: 80            │       │ Port: 4000          │       │ Port: 27017 │ │
│  │ 1 OCPU, 6GB RAM     │       │ 1 OCPU, 6GB RAM     │       │ 1 OCPU, 6GB │ │
│  │ Public IP: Yes      │       │ Public IP: Yes      │       │ Private IP  │ │
│  │ Users Interface     │       │ REST API Endpoints  │       │ Data Storage│ │
│  └─────────────────────┘       └─────────────────────┘       └─────────────┘ │
│                                                                             │
│  💰 Free Tier Usage: 3/4 VMs (75%) | Remaining: 1 VM for other projects    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### Oracle Cloud Free Tier Requirements
- **Oracle Cloud Free Tier Account** (always free)
- **3 ARM-based Compute Instances** (1 OCPU, 6GB RAM each)
- **VCN (Virtual Cloud Network)** with public and private subnets
- **Security Lists** configured for inter-server communication
- **SSH Access** to all servers

### Software Requirements
- **Docker** on Frontend and Backend servers
- **MongoDB** on Database server
- **Node.js** on all servers
- **Git** for code deployment

## 🌐 Machine 1: Frontend Server Setup (Free Tier)

### Step 1: Create Frontend Instance
```bash
# Oracle Cloud Console → Compute → Create Instance
- Name: game-share-frontend
- Image: Canonical Ubuntu 22.04 (ARM-based)
- Shape: VM.Standard.A1.Flex (1 OCPU, 6GB RAM) - FREE TIER
- Network: Public subnet
- Public IP: Yes
- Storage: 20GB (sufficient for React app)
- Security List: Allow ports 22, 80, 443
```

### Step 2: Install Dependencies
```bash
# SSH into frontend server
ssh ubuntu@frontend-server-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Git
sudo apt install -y git

# Logout and login again for Docker group to take effect
exit
ssh opc@frontend-server-public-ip
```

### Step 3: Deploy Frontend Application
```bash
# Clone the project
git clone https://github.com/your-username/game-share-system.git
cd game-share-system/frontend

# Install dependencies
npm install

# Create production build
npm run build

# Create Dockerfile for frontend
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx configuration
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (will be configured later)
        location /api/ {
            proxy_pass http://backend-server-public-ip:4000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF
```

### Step 4: Configure Environment Variables
```bash
# Create environment file
cat > .env << 'EOF'
REACT_APP_API_URL=http://backend-server-public-ip:4000
REACT_APP_FRONTEND_URL=http://frontend-server-public-ip
EOF

# Rebuild with environment variables
npm run build
```

### Step 5: Deploy with Docker
```bash
# Build Docker image
docker build -t game-share-frontend .

# Run container
docker run -d \
  --name game-share-frontend \
  --restart unless-stopped \
  -p 80:80 \
  game-share-frontend

# Check if container is running
docker ps
```

### Step 6: Test Frontend
```bash
# Test if frontend is accessible
curl http://localhost
# Should return HTML content

# Test from external network
curl http://frontend-server-public-ip
```

## 🔧 Machine 2: Backend API Server Setup (Free Tier)

### Step 1: Create Backend Instance
```bash
# Oracle Cloud Console → Compute → Create Instance
- Name: game-share-backend
- Image: Canonical Ubuntu 22.04 (ARM-based)
- Shape: VM.Standard.A1.Flex (1 OCPU, 6GB RAM) - FREE TIER
- Network: Public subnet
- Public IP: Yes
- Storage: 50GB (for file uploads)
- Security List: Allow ports 22, 4000
```

### Step 2: Install Dependencies
```bash
# SSH into backend server
ssh ubuntu@backend-server-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Git
sudo apt install -y git

# Logout and login again for Docker group to take effect
exit
ssh opc@backend-server-public-ip
```

### Step 3: Deploy Backend Application
```bash
# Clone the project
git clone https://github.com/your-username/game-share-system.git
cd game-share-system/backend

# Install dependencies
npm install

# Create environment file (database connection will be updated later)
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
MONGODB_URI=mongodb://database-server-private-ip:27017/game-share
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=http://frontend-server-public-ip
UPLOAD_PATH=/home/ubuntu/uploads
MAX_FILE_SIZE=100MB
EOF

# Create uploads directory
mkdir -p /home/ubuntu/uploads
chmod 755 /home/ubuntu/uploads
```

### Step 4: Create Dockerfile for Backend
```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p /app/uploads
VOLUME /app/uploads

EXPOSE 4000

CMD ["npm", "start"]
EOF

# Build Docker image
docker build -t game-share-backend .

# Run container
docker run -d \
  --name game-share-backend \
  --restart unless-stopped \
  -p 4000:4000 \
  -v /home/ubuntu/uploads:/app/uploads \
  --env-file .env \
  game-share-backend

# Check if container is running
docker ps
```

### Step 5: Test Backend API
```bash
# Test if backend is running
curl http://localhost:4000/health
# Should return: {"status":"ok","message":"Game Share API is running"}

# Test from external network
curl http://backend-server-public-ip:4000/health
```

### Step 6: Update Frontend API Configuration
```bash
# SSH back to frontend server
ssh opc@frontend-server-public-ip

# Update nginx configuration with actual backend IP
sudo nano /etc/nginx/nginx.conf
# Replace 'backend-server-public-ip' with actual IP

# Restart nginx container
docker restart game-share-frontend
```

## 🗄️ Machine 3: Database Server Setup (Free Tier)

### Step 1: Create Database Instance
```bash
# Oracle Cloud Console → Compute → Create Instance
- Name: game-share-database
- Image: Canonical Ubuntu 22.04 (ARM-based)
- Shape: VM.Standard.A1.Flex (1 OCPU, 6GB RAM) - FREE TIER
- Network: Private subnet (no public IP for security)
- Storage: 20GB (Free Tier optimized)
- Security List: Allow port 27017 from backend subnet
```

### Step 2: Install MongoDB (Free Tier Optimized)
```bash
# SSH into database server (via bastion host or backend server)
ssh ubuntu@database-server-private-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
```

### Step 3: Configure MongoDB for Free Tier
```bash
# Edit MongoDB configuration (Free Tier optimized)
sudo nano /etc/mongod.conf

# Use this optimized configuration:
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

storage:
  dbPath: /var/lib/mongo
  journal:
    enabled: true
  # Free Tier optimization: smaller WiredTiger cache
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.5

net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled

# Free Tier optimization: reduce memory usage
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100

# Free Tier optimization: smaller oplog
replication:
  oplogSizeMB: 64

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 4: Create Database Users
```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "admin-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})

# Create application user
use game-share
db.createUser({
  user: "gameshare_user",
  pwd: "your-app-password",
  roles: ["readWrite"]
})

# Exit MongoDB
exit
```

### Step 5: Initialize Database
```bash
# Upload database scripts
scp -r database-scripts/ ubuntu@database-server-private-ip:/home/ubuntu/

# On database server
cd database-scripts
npm install

# Set environment variable
export MONGODB_URI="mongodb://gameshare_user:your-app-password@localhost:27017/game-share"

# Initialize database
npm run init
```

### Step 6: Update Backend Database Connection
```bash
# SSH to backend server
ssh opc@backend-server-public-ip

# Update environment file with actual database IP and credentials
nano .env
# Update MONGODB_URI with actual database private IP and credentials

# Restart backend container
docker restart game-share-backend

# Check logs for successful database connection
docker logs game-share-backend
```

## 🔗 Final Integration and Testing

### Step 1: Test Complete System
```bash
# Test frontend → backend communication
curl http://frontend-server-public-ip/api/health

# Test backend → database communication
curl http://backend-server-public-ip:4000/health

# Test user registration
curl -X POST http://backend-server-public-ip:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Step 2: Configure Security Lists
```bash
# Frontend Security List
- Inbound: Port 80 (HTTP), Port 443 (HTTPS), Port 22 (SSH)
- Source: 0.0.0.0/0

# Backend Security List
- Inbound: Port 4000 (API), Port 22 (SSH)
- Source: Frontend subnet, specific IPs

# Database Security List
- Inbound: Port 27017 (MongoDB)
- Source: Backend subnet only
```

### Step 3: Set Up Monitoring (Free Tier Optimized)
```bash
# Create monitoring script on each server
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Status $(date) ==="
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.2f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo "Docker Containers: $(docker ps --format "table {{.Names}}\t{{.Status}}" | wc -l)"
EOF

chmod +x /home/ubuntu/monitor.sh

# Add to crontab for regular monitoring
echo "*/5 * * * * /home/ubuntu/monitor.sh >> /home/ubuntu/monitor.log 2>&1" | crontab -
```

## 🚀 Deployment Order Summary

1. **Frontend First** - Deploy React app with nginx
2. **Backend Second** - Deploy Node.js API with Docker
3. **Database Last** - Deploy MongoDB with security
4. **Integration** - Connect all components
5. **Testing** - Verify complete system functionality

## 💰 Free Tier Cost Optimization

### Resource Usage
- **3/4 VMs used** (75% of free tier)
- **~60GB storage used** (30% of free tier)
- **Minimal data transfer** (well under 10TB limit)

### Cost-Saving Tips
1. **Use ARM-based instances** (VM.Standard.A1.Flex)
2. **Optimize MongoDB cache** (0.5GB instead of default)
3. **Regular monitoring** to prevent resource waste
4. **Clean up unused files** and logs
5. **Use private subnets** for database security

## 🔧 Troubleshooting

### Common Issues
1. **Frontend can't reach backend**: Check security lists and nginx proxy
2. **Backend can't reach database**: Verify private subnet routing
3. **MongoDB connection failed**: Check authentication and network access
4. **Docker containers not starting**: Check logs with `docker logs container-name`

### Useful Commands
```bash
# Check container status
docker ps -a

# View container logs
docker logs container-name

# Check network connectivity
telnet target-ip port

# Monitor system resources
htop

# Check MongoDB status
sudo systemctl status mongod
```

## 📊 Performance Monitoring

### Free Tier Limits Monitoring
```bash
# Create monitoring dashboard
cat > /home/ubuntu/dashboard.sh << 'EOF'
#!/bin/bash
echo "=== Oracle Cloud Free Tier Usage ==="
echo "VMs Used: 3/4 (75%)"
echo "Storage Used: $(df -h / | awk 'NR==2 {print $3}')/200GB"
echo "Memory Usage: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
EOF

chmod +x /home/ubuntu/dashboard.sh
```

This setup provides a complete distributed game sharing system optimized for Oracle Cloud Free Tier, following your preferred deployment order: Frontend → Backend → Database. 