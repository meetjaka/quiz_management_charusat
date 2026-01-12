# Quiz Management System - Backend

Express.js backend API for the Quiz Management System

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your configuration:

- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend application URL
- Other optional configurations

### 3. Run the Server

**Development Mode (with auto-restart):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

## Project Structure

```
backend/
├── config/           # Configuration files (database connection)
├── controllers/      # Route controllers
├── middleware/       # Custom middleware (auth, validation)
├── models/          # MongoDB models
├── routes/          # API routes
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
└── server.js        # Main server file
```

## API Endpoints

### Health Check

- `GET /api/health` - Check if server is running

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/quiz_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **validator**: Data validation

## Development Dependencies

- **nodemon**: Auto-restart server on file changes

## Notes

- Make sure MongoDB is running before starting the server
- Keep `.env` file secure and never commit it to version control
- Change `JWT_SECRET` in production
