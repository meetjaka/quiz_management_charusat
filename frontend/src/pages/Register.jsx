import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  BookOpen,
  AlertCircle,
  Building,
  Calendar,
  Building2,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    enrollmentNumber: "",
    department: "",
    semester: "",
    batch: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};
    if (!formData.name) {
      errors.name = "Full Name is required.";
      isValid = false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }
    if (!formData.enrollmentNumber) {
      errors.enrollmentNumber = "Enrollment Number is required.";
      isValid = false;
    }
    if (!formData.department) {
      errors.department = "Please select a department.";
      isValid = false;
    }
    if (!formData.semester) {
      errors.semester = "Please select a semester.";
      isValid = false;
    }
    if (!formData.batch) {
      errors.batch = "Please select a batch.";
      isValid = false;
    }
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate("/student/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const InputField = ({ id, label, icon: Icon, type, placeholder, options }) => {
    const errorMsg = fieldErrors[id];
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-secondary">
          {label}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-4 w-4 ${errorMsg ? 'text-danger' : 'text-gray-400'}`} />
          </div>
          {options ? (
            <select
              id={id}
              name={id}
              value={formData[id]}
              onChange={handleChange}
              className={`block w-full pl-9 pr-8 py-2.5 text-sm rounded-md border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none ${errorMsg
                  ? "border-danger text-danger focus:ring-danger/20 focus:border-danger"
                  : "border-border text-secondary focus:border-primary focus:ring-primary/20 hover:border-gray-300"
                }`}
            >
              <option value="" disabled hidden>{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={id}
              type={type}
              value={formData[id]}
              onChange={handleChange}
              placeholder={placeholder}
              className={`block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${errorMsg
                  ? "border-danger text-danger placeholder-danger/60 focus:ring-danger/20 focus:border-danger"
                  : "border-border text-secondary placeholder-gray-400 hover:border-gray-300 focus:border-primary focus:ring-primary/20"
                }`}
            />
          )}
        </div>
        {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex text-secondary bg-background font-sans">
      {/* Left side: Branding / Info */}
      <div className="hidden lg:flex lg:w-5/12 bg-card border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-primary/10/50 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Charusat QMS</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Join the learning revolution.
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Create an account to participate in modern assessments, track your progress, and excel in your academic journey.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-gray-400">
          <Building2 className="w-4 h-4" />
          <span>© {new Date().getFullYear()} CHARUSAT University</span>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl py-8"
        >
          {/* Mobile Header (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Charusat QMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-1">Create an account</h2>
            <p className="text-sm text-gray-500">
              Register as a student to access the platform
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 rounded-md bg-danger/10 p-3 flex items-start gap-2 border border-danger/20"
            >
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger font-medium leading-snug">{error}</p>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InputField id="name" label="Full Name" icon={User} type="text" placeholder="John Doe" />
              <InputField id="email" label="Email Address" icon={Mail} type="email" placeholder="name@charusat.edu.in" />

              <InputField id="password" label="Password" icon={Lock} type="password" placeholder="Min. 6 characters" />
              <InputField id="confirmPassword" label="Confirm Password" icon={Lock} type="password" placeholder="Repeat password" />

              <InputField id="enrollmentNumber" label="Enrollment Number" icon={BookOpen} type="text" placeholder="EN001" />

              <InputField
                id="department"
                label="Department"
                icon={Building}
                type="select"
                placeholder="Select Department"
                options={["Computer Science", "Information Technology", "Electronics", "Electrical", "Mechanical", "Civil"]}
              />

              <InputField
                id="semester"
                label="Semester"
                icon={Calendar}
                type="select"
                placeholder="Select Semester"
                options={[1, 2, 3, 4, 5, 6, 7, 8]}
              />

              <InputField
                id="batch"
                label="Batch"
                icon={UserPlus}
                type="select"
                placeholder="Select Batch"
                options={Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium text-white bg-primary hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Sign in to your account
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
