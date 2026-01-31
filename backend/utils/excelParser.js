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
          `Row ${index + 2}: Missing required fields (name, email, password)`,
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
    console.log("📂 1. Reading Excel file:", filePath);

    const workbook = xlsx.readFile(filePath);
    console.log("📊 2. Sheet names:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("📝 3. Excel data rows:", data.length);
    console.log("🔍 4. First row data:", data[0]);
    console.log(
      "🔑 5. Column names:",
      data[0] ? Object.keys(data[0]) : "No data",
    );

    // Filter out empty rows and validate
    const validRows = data.filter((row) => row.question);
    console.log("✅ 6. Valid rows (non-empty):", validRows.length);

    // Validate and map data
    const questions = validRows.map((row, index) => {
      // Handle both correctAnswer and correctAn (truncated version)
      const correctAnswerField =
        row.correctAnswer || row.correctAn || row.correctan;

      if (
        !row.question ||
        !row.optionA ||
        !row.optionB ||
        !row.optionC ||
        !row.optionD ||
        !correctAnswerField ||
        !row.marks
      ) {
        console.error("❌ Missing fields in row:", row);
        throw new Error(
          `Row ${index + 2}: Missing required fields. Found columns: ${Object.keys(row).join(", ")}`,
        );
      }

      const correctAnswer = correctAnswerField.toString().toUpperCase().trim();
      if (!["A", "B", "C", "D"].includes(correctAnswer)) {
        throw new Error(
          `Row ${index + 2}: Invalid correct answer '${correctAnswer}' (must be A, B, C, or D)`,
        );
      }

      const mappedQuestion = {
        questionText: row.question.toString().trim(),
        questionType: "mcq",
        marks: parseInt(row.marks) || 1,
        orderNumber: index + 1,
        options: [
          {
            text: row.optionA.toString().trim(),
            isCorrect: correctAnswer === "A",
          },
          {
            text: row.optionB.toString().trim(),
            isCorrect: correctAnswer === "B",
          },
          {
            text: row.optionC.toString().trim(),
            isCorrect: correctAnswer === "C",
          },
          {
            text: row.optionD.toString().trim(),
            isCorrect: correctAnswer === "D",
          },
        ],
      };

      console.log(
        `✓ Question ${index + 1} mapped:`,
        mappedQuestion.questionText,
      );
      return mappedQuestion;
    });

    console.log("🎯 7. Total parsed questions:", questions.length);
    if (questions.length > 0) {
      console.log(
        "📋 8. First mapped question:",
        JSON.stringify(questions[0], null, 2),
      );
    }

    return questions;
  } catch (error) {
    console.error("❌ Excel parsing error:", error);
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

// Parse Excel file for bulk user creation (updated format)
const parseBulkUsersExcel = (filePath) => {
  try {
    console.log("📂 1. Reading bulk users Excel file:", filePath);

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log("📝 2. Excel data rows:", data.length);
    console.log("🔍 3. First row data:", data[0]);

    // Filter out empty rows
    const validRows = data.filter((row) => row.email);
    console.log("✅ 4. Valid rows (non-empty):", validRows.length);

    // Validate and map data
    const users = validRows.map((row, index) => {
      // Validate required fields
      if (!row.email) {
        console.error("❌ Missing email in row:", row);
        throw new Error(
          `Row ${index + 2}: Missing required field (email). Found columns: ${Object.keys(row).join(", ")}`,
        );
      }

      // Generate password if not provided
      // Use a consistent default password that students can use for first login
      // If password is provided in Excel, use it; otherwise use "Password@123"
      const generatedPassword =
        row.password?.toString().trim() || "Password@123";

      // Generate temporary fullName from email if not provided
      const tempFullName =
        row.fullName?.toString().trim() ||
        row.email
          .toString()
          .split("@")[0]
          .replace(/[._]/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      // Create basic user object - other details will be filled during first-time login
      const mappedUser = {
        email: row.email.toString().trim().toLowerCase(),
        password: generatedPassword,
        fullName: tempFullName, // Temporary name from email, will be updated on first login
        role: "student", // Default role, admin can change later
        isFirstLogin: true, // Mark as first-time login
      };

      console.log(`📋 5.${index + 1}. Mapped user:`, {
        email: mappedUser.email,
        hasPassword: !!mappedUser.password,
        isFirstLogin: mappedUser.isFirstLogin,
      });

      return mappedUser;
    });

    console.log(`✅ 6. Successfully parsed ${users.length} users from Excel`);
    return users;
  } catch (error) {
    console.error("❌ Excel parsing error:", error);
    throw new Error(`Excel parsing error: ${error.message}`);
  }
};

module.exports = {
  parseStudentsExcel,
  parseQuizExcel,
  exportToExcel,
  parseBulkUsersExcel,
};
