# Quiz Management System - MERN Stack

A full-stack Quiz Management System built with MongoDB, Express.js, React, and Node.js (MERN).

## 📚 Documentation

- 📖 **[Design Improvement Guide](DESIGN_IMPROVEMENT_GUIDE.md)** - Comprehensive UI/UX design documentation
- 🚀 **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions  
- 📡 **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference

## ✅ Project Status: 100% Complete

All features implemented including:
- ✅ Advanced analytics with charts (Admin, Coordinator, Student)
- ✅ Email notifications (assignment, reminders, results)
- ✅ Bulk CSV upload with validation
- ✅ Rate limiting (global, auth, sensitive routes)
- ✅ Comprehensive audit logging
- ✅ Role-based access control (Admin, Coordinator, Student)

## Project Structure

```
Quiz_Managment_System/
├── backend/                    # Node.js + Express API
│   ├── config/                # Configuration files
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Custom middleware
│   ├── server.js              # Entry point
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Backend environment variables
│   ├── .gitignore            # Git ignore rules
│   └── README.md             # Backend setup guide
│
└── frontend/                  # React application
    ├── public/               # Static files
    ├── src/                  # React source code
    │   ├── components/       # React components
    │   ├── api.js           # API client
    │   ├── App.js           # Main component
    │   └── index.js         # React entry point
    ├── package.json         # Frontend dependencies
    ├── .env                 # Frontend environment variables
    ├── .gitignore          # Git ignore rules
    └── README.md           # Frontend setup guide
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure `.env` file with your MongoDB URI and other settings:

```
MONGODB_URI=mongodb://localhost:27017/quiz_management_charusat
PORT=5001
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@charusat.edu.in
EMAIL_PASS=your_app_password
```

4. Start the backend server:

```bash
npm run dev      # Development mode with auto-restart
# or
npm start        # Production mode
```

Backend will run on: `http://localhost:5001`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

4. Start the React development server:

```bash
npm start
```

Frontend will run on: `http://localhost:3000`

## Running Both Simultaneously

You can run both backend and frontend in parallel using two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

## Technology Stack

### Backend

- **Express.js** - Web framework
- **Node.js** - Runtime
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Dotenv** - Environment variables

### Frontend

- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS** - Styling

## Features Included

### Backend

- Express server setup with CORS
- MongoDB connection configuration
- User model with password hashing
- Quiz model for quiz management
- JWT authentication middleware
- Error handling middleware
- Environment variable management

### Frontend

- React app setup with routing support
- API client configuration with Axios
- Interceptors for token management
- Health check to verify backend connection
- Basic navigation structure
- Responsive styling

## Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/quiz_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## API Endpoints

### Health Check

- `GET /api/health` - Check if backend is running

Additional endpoints can be added in the `backend/routes` folder.

## Development Tips

1. **Backend auto-restart**: Uses `nodemon` in dev mode
2. **Frontend hot-reload**: React automatically reloads on file changes
3. **CORS Configuration**: Configured to allow frontend origin
4. **Token Management**: Frontend automatically includes JWT token in requests

## MongoDB Setup

If running MongoDB locally:

```bash
# Make sure MongoDB service is running
# Windows: mongod
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

For MongoDB Atlas (Cloud):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz_management?retryWrites=true&w=majority
```

## Project Next Steps

1. Create authentication routes (login, register, logout)
2. Implement quiz CRUD operations
3. Add question management
4. Build user dashboard
5. Add quiz answering functionality
6. Implement result tracking
7. Add admin panel
8. Deploy to production

## Troubleshooting

### Backend won't start

- Check if port 5000 is already in use
- Ensure MongoDB is running
- Check `.env` file configuration

### Frontend can't connect to backend

- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check browser console for CORS errors

### MongoDB connection fails

- Verify MongoDB connection string
- Check MongoDB service is running
- Ensure credentials are correct (for Atlas)

## License

ISC

## Support

For issues or questions, please check the individual README files in backend and frontend directories.
