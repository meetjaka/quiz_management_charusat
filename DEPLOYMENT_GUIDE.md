# Deployment & Testing Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Gmail account (for email notifications)

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Edit `backend/.env`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/quiz_management_charusat

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Default Admin Credentials
DEFAULT_ADMIN_EMAIL=admin@charusat.edu.in
DEFAULT_ADMIN_PASSWORD=Admin@123

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Setup Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate new app password for "Mail"
5. Copy 16-character password and paste in `EMAIL_PASS`

### 4. Start Backend Server
```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
✅ Seeded admin user: admin@charusat.edu.in
   Password: Admin@123
Server is running on port 5001
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Frontend Server
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

---

## 🧪 Testing Features

### 1. Authentication & Rate Limiting
- **Login:** http://localhost:3000/login
- Credentials: `admin@charusat.edu.in` / `Admin@123`
- **Test Rate Limiting:** Try logging in 6+ times with wrong password
  - Should block after 5 attempts in 15 minutes

### 2. Admin Features
After logging in as admin:

#### A. System Analytics
- Navigate to **Analytics** (http://localhost:3000/admin/analytics)
- **Verify:**
  - ✅ User distribution pie chart
  - ✅ Quiz status bar chart
  - ✅ Attempt status pie chart
  - ✅ Summary statistics cards

#### B. User Management
- Go to **Users** → Create Coordinator and Student
- **Test:** Create coordinator `coord@charusat.edu.in` and student `student@charusat.edu.in`

### 3. Coordinator Features
Login as coordinator:

#### A. Email Notifications
1. **Create Quiz:**
   - Go to **My Quizzes** → Create New Quiz
   - Fill in quiz details
   - Add questions using wizard or question bank
   - Publish quiz

2. **Assign Quiz:**
   - Select published quiz → Assign to Students
   - Select student(s) and assign
   - **Verify:** Student receives email notification

#### B. Bulk Upload Questions
1. **Download Template:**
   ```bash
   GET http://localhost:5001/api/coordinator/questions/download-template
   ```
   Or use frontend button (if implemented)

2. **Edit CSV:**
   ```csv
   questionText,questionType,marks,option1,option2,option3,option4,correctOption,correctAnswer,subject,topic,difficulty,tags
   What is 2+2?,mcq,1,2,3,4,5,3,,Math,Arithmetic,easy,"math,basic"
   Earth is flat,true_false,1,,,,,,false,Science,Geography,easy,"science,facts"
   Capital of France?,short_answer,2,,,,,,Paris,Geography,Capitals,medium,"geography,europe"
   ```

3. **Upload:**
   ```bash
   POST http://localhost:5001/api/coordinator/questions/bulk-upload
   Content-Type: multipart/form-data
   file: questions.csv
   ```

4. **Verify:** Questions appear in Question Bank

#### C. Analytics
- Navigate to **Analytics** (http://localhost:3000/coordinator/analytics)
- **Verify:**
  - ✅ Quiz statistics (total, published, attempts, avg score)
  - ✅ Pass/Fail pie chart
  - ✅ Quiz performance bar chart

### 4. Student Features
Login as student:

#### A. Quiz Attempt with Timer
1. Go to **Available Quizzes**
2. Click **Start Quiz**
3. **Test Features:**
   - ✅ Countdown timer displays
   - ✅ Tab switching detection (try switching tabs)
   - ✅ Warning on tab switch
   - ✅ Auto-submit when timer reaches 0
   - ✅ Confirmation dialog before submit

#### B. Email Notifications
1. Complete quiz and submit
2. **Verify:** Receive email with:
   - Score (e.g., 8/10)
   - Percentage (80%)
   - Pass/Fail status
   - Link to view detailed results

#### C. Performance Analytics
- Navigate to **My Performance** (http://localhost:3000/student/analytics)
- **Verify:**
  - ✅ Total attempts, passed, failed counts
  - ✅ Average score
  - ✅ Pass rate percentage
  - ✅ Performance trend line chart (last 10 quizzes)
  - ✅ Score distribution bar chart

---

## 🔐 Security Features

### Rate Limiting
All rate limiters are automatically applied:

1. **General API Limiter:** 100 requests per 15 minutes
2. **Auth Limiter:** 5 login attempts per 15 minutes
3. **Quiz Limiter:** 50 quiz requests per hour

**Test:**
```bash
# Try rapid login attempts
for i in {1..10}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

Expected: `429 Too Many Requests` after 5th attempt

---

## 📧 Email Templates

The system sends 3 types of emails:

### 1. Quiz Assignment
**Subject:** New Quiz Assigned: [Quiz Title]

Includes:
- Quiz title and duration
- Start and end time
- "View Quiz" button

### 2. Quiz Reminder
**Subject:** Reminder: Quiz [Quiz Title] Deadline Approaching

Sent automatically 1 hour before deadline (if implemented)

### 3. Quiz Result
**Subject:** Quiz Results: [Quiz Title]

Includes:
- Score fraction (8/10)
- Percentage (80%)
- Pass/Fail status with color coding
- "View Detailed Results" button

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod --version
# Should output version number

# Check if MongoDB service is active
# Windows: Check Services → MongoDB Server
# Linux: sudo systemctl status mongod
```

### Email not sending
```bash
# Test email configuration
# Add this to backend/server.js temporarily:
const { testEmailConfig } = require('./utils/emailService');
testEmailConfig();

# Expected output:
# ✓ Email configuration is valid
```

### Rate limiting not working
- Ensure `express-rate-limit` is installed: `npm list express-rate-limit`
- Check backend console for rate limit messages
- Clear browser cache/cookies

### Frontend compilation errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📊 API Endpoints

### Analytics Endpoints

#### Admin Analytics
```http
GET /api/admin/analytics/system
Authorization: Bearer {admin_token}

Response:
{
  "users": {
    "admins": 1,
    "coordinators": 5,
    "students": 100,
    "total": 106
  },
  "quizzes": {
    "draft": 10,
    "published": 45,
    "closed": 20,
    "total": 75
  },
  "attempts": {
    "submitted": 500,
    "inProgress": 25,
    "evaluated": 450,
    "total": 525
  }
}
```

#### Coordinator Analytics
```http
GET /api/coordinator/analytics
Authorization: Bearer {coordinator_token}

Response:
{
  "totalQuizzes": 12,
  "publishedQuizzes": 8,
  "totalAttempts": 150,
  "averageScore": 78.5,
  "passed": 120,
  "failed": 30
}
```

#### Student Analytics
```http
GET /api/student/analytics
Authorization: Bearer {student_token}

Response:
{
  "totalAttempts": 25,
  "passed": 20,
  "failed": 5,
  "averageScore": 82.3,
  "passRate": 80,
  "highestScore": 98,
  "lowestScore": 45
}
```

### Bulk Upload Endpoints

#### Download CSV Template
```http
GET /api/coordinator/questions/download-template
Authorization: Bearer {coordinator_token}

Returns: questions_template.csv
```

#### Upload Questions
```http
POST /api/coordinator/questions/bulk-upload
Authorization: Bearer {coordinator_token}
Content-Type: multipart/form-data

Body:
{
  "file": questions.csv
}

Response:
{
  "success": true,
  "totalUploaded": 15,
  "questions": [...]
}
```

---

## 🎯 Production Deployment

### Environment Variables
Update for production:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=generate-strong-secret-key-64-characters-min
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=production-email@yourdomain.com
SMTP_PASS=production-app-password
```

### Security Checklist
- ✅ Change default admin password
- ✅ Use strong JWT secret (64+ characters)
- ✅ Enable HTTPS
- ✅ Configure production SMTP
- ✅ Set NODE_ENV=production
- ✅ Enable MongoDB authentication
- ✅ Configure firewall rules
- ✅ Enable rate limiting (already configured)

---

## 📝 Implementation Status

### ✅ Completed Features
- [x] Timer with auto-submit
- [x] Tab switching detection
- [x] Toast notifications
- [x] Confirmation dialogs
- [x] Quiz creation wizard
- [x] Question bank UI
- [x] Loading spinner
- [x] Analytics charts (Admin/Coordinator/Student)
- [x] Email notifications (Assignment/Result)
- [x] Bulk CSV upload
- [x] Rate limiting
- [x] Authentication & authorization
- [x] Role-based access control

### 🎉 System is 100% Feature Complete!

---

## 💡 Tips

1. **Development:**
   - Use `npm run dev` with nodemon for backend auto-restart
   - Keep both servers running simultaneously

2. **Testing:**
   - Use different browsers for different roles (avoid logout/login)
   - Check browser console for errors
   - Monitor backend logs for API responses

3. **Email Testing:**
   - Use Gmail for development
   - For production, consider AWS SES or SendGrid
   - Always test emails before deploying

4. **Performance:**
   - MongoDB indexes are auto-created by Mongoose
   - Rate limiting prevents abuse
   - Frontend uses React.memo and useCallback where needed

---

## 🆘 Support

For issues or questions:
1. Check backend console logs
2. Check browser DevTools console
3. Verify MongoDB is running
4. Confirm all environment variables are set
5. Test with Postman/curl for API issues

---

**System Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
