// Shared constants for dropdowns across the application
// This ensures consistency between student registration and quiz creation

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "CSE",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
];

export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const getCurrentAndPastYears = (count = 5) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => (currentYear - i).toString());
};
