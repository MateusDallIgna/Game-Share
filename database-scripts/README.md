# Database Scripts for Game Share

This folder contains the database initialization scripts for the Game Share distributed system.

## Oracle Server Deployment

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- Access to Oracle Cloud Infrastructure

### Setup Instructions

1. **Upload to Oracle Server**
   ```bash
   # Upload this folder to your Oracle server
   scp -r database-scripts/ user@your-oracle-server:/path/to/database/
   ```

2. **Install Dependencies**
   ```bash
   cd /path/to/database/
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Set your MongoDB connection string
   export MONGODB_URI="mongodb://your-mongodb-host:27017/game-share"
   ```

4. **Initialize Database**
   ```bash
   npm run init
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/game-share` |

### What This Script Does

- Creates database collections (users, games)
- Sets up database indexes for performance
- Creates admin user account
- Creates sample user accounts
- Validates database setup

### Default Users Created

- **Admin**: admin@gameshare.com / admin123
- **User 1**: john@example.com / password123
- **User 2**: jane@example.com / password123

## Troubleshooting

### Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity

### Permission Issues
- Run with appropriate user permissions
- Check MongoDB authentication if enabled

## Maintenance

### Backup Database
```bash
mongodump --uri="your-mongodb-uri" --out=/backup/path
```

### Restore Database
```bash
mongorestore --uri="your-mongodb-uri" /backup/path
``` 