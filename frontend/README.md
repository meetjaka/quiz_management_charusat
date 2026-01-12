# Quiz Management System - Frontend

React frontend application for the Quiz Management System

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your configuration:

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `REACT_APP_ENV`: Environment type (development/production)
- Other feature flags as needed

### 3. Run the Application

**Development Mode:**

```bash
npm start
```

The application will open at `http://localhost:3000`

**Build for Production:**

```bash
npm build
```

### 4. Make sure Backend is Running

Ensure the backend server is running on port 5000 before starting the frontend.

## Project Structure

```
frontend/
├── public/          # Static files
│   └── index.html   # Main HTML file
├── src/
│   ├── App.js       # Main App component
│   ├── index.js     # React entry point
│   ├── index.css    # Global styles
│   ├── api.js       # API client configuration
│   └── components/  # React components (to be created)
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
└── package.json     # Dependencies
```

## Environment Variables

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_ENABLE_ANALYTICS=false
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject configuration (not reversible)

## Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **dotenv**: Environment variable management
- **react-scripts**: Build scripts and configuration

## Notes

- Frontend runs on `http://localhost:3000`
- Backend proxy configured in package.json to `http://localhost:5000`
- Token-based authentication with JWT
- Automatically redirects to login if token expires
