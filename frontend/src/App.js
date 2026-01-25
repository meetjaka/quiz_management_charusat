import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import FirstTimeLogin from "./pages/FirstTimeLogin";
import BulkUserCreation from "./pages/admin/BulkUserCreation";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminQuizzes from "./pages/admin/Quizzes";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminProfile from "./pages/admin/AdminProfile";
import GroupManagement from "./pages/admin/groups/GroupManagement";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorQuizzes from "./pages/coordinator/Quizzes";
import CoordinatorAnalytics from "./pages/coordinator/Analytics";
import CreateQuiz from "./pages/coordinator/CreateQuiz";
import CoordinatorProfile from "./pages/coordinator/CoordinatorProfile";
import EditQuiz from "./pages/coordinator/EditQuiz";
import QuestionBank from "./pages/coordinator/QuestionBank";
import QuizFormatGuide from "./pages/coordinator/QuizFormatGuide";
import JSONQuizGenerator from "./pages/coordinator/JSONQuizGenerator";
import CoordinatorSettings from "./pages/coordinator/Settings";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentQuizzes from "./pages/student/Quizzes";
import QuizAttempt from "./pages/student/QuizAttempt";
import StudentResults from "./pages/student/Results";
import StudentAnalytics from "./pages/student/Analytics";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSettings from "./pages/student/Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/first-time-login" element={<FirstTimeLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/quizzes"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminQuizzes />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/bulk-users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <BulkUserCreation />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <GroupManagement />
              </PrivateRoute>
            }
          />

          {/* Coordinator Routes */}
          <Route
            path="/coordinator/dashboard"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CoordinatorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/quizzes"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CoordinatorQuizzes />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/analytics"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CoordinatorAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/quizzes/create"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CreateQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/quizzes/edit/:id"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <EditQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/question-bank"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <QuestionBank />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/quiz-format-guide"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <QuizFormatGuide />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/json-generator"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <JSONQuizGenerator />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/settings"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CoordinatorSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/coordinator/profile"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <CoordinatorProfile />
              </PrivateRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentQuizzes />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/analytics"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentAnalytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/quiz/:quizId/attempt"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <QuizAttempt />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentSettings />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentProfile />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
