const xlsx = require("xlsx");

// Parse Excel file for student enrollment
const parseStudentsExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate and map data
    const students = data.map((row, index) => {
      if (!row.name || !row.email || !row.password) {
        throw new Error(
          `Row ${index + 2}: Missing required fields (name, email, password)`
        );
      }

      return {
        name: row.name.trim(),
        email: row.email.trim().toLowerCase(),
        password: row.password.toString(),
        role: "student",
        enrollmentNumber: row.enrollmentNumber?.toString().trim(),
        department: row.department?.trim(),
        semester: row.semester?.toString().trim(),
        batch: row.batch?.toString().trim(),
      };
    });

    return students;
  } catch (error) {
    throw new Error(`Excel parsing error: ${error.message}`);
  }
};

// Parse Excel file for quiz questions
const parseQuizExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate and map data
    const questions = data.map((row, index) => {
      if (
        !row.question ||
        !row.optionA ||
        !row.optionB ||
        !row.optionC ||
        !row.optionD ||
        !row.correctAnswer ||
        !row.marks
      ) {
        throw new Error(`Row ${index + 2}: Missing required fields`);
      }

      const correctAnswer = row.correctAnswer.toString().toUpperCase();
      if (!["A", "B", "C", "D"].includes(correctAnswer)) {
        throw new Error(
          `Row ${index + 2}: Invalid correct answer (must be A, B, C, or D)`
        );
      }

      return {
        questionText: row.question.trim(),
        options: {
          A: row.optionA.trim(),
          B: row.optionB.trim(),
          C: row.optionC.trim(),
          D: row.optionD.trim(),
        },
        correctAnswer,
        marks: parseInt(row.marks),
        order: index + 1,
      };
    });

    return questions;
  } catch (error) {
    throw new Error(`Excel parsing error: ${error.message}`);
  }
};

// Export data to Excel
const exportToExcel = (data, filename) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  xlsx.writeFile(workbook, filename);
  return filename;
};

module.exports = {
  parseStudentsExcel,
  parseQuizExcel,
  exportToExcel,
};
