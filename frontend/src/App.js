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

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminQuizzes from "./pages/admin/Quizzes";
import AdminAnalytics from "./pages/admin/Analytics";

// Coordinator Pages
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorQuizzes from "./pages/coordinator/Quizzes";
import CoordinatorAnalytics from "./pages/coordinator/Analytics";
import CreateQuiz from "./pages/coordinator/CreateQuiz";
import QuestionBank from "./pages/coordinator/QuestionBank";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentQuizzes from "./pages/student/Quizzes";
import QuizAttempt from "./pages/student/QuizAttempt";
import StudentResults from "./pages/student/Results";
import StudentAnalytics from "./pages/student/Analytics";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

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
            path="/coordinator/question-bank"
            element={
              <PrivateRoute allowedRoles={["coordinator"]}>
                <QuestionBank />
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
