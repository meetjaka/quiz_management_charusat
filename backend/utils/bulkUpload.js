const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Parse CSV file for questions
const parseQuestionsCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const questions = [];
    const errors = [];
    let rowNumber = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowNumber++;
        
        try {
          // Validate required fields
          if (!row.questionText || !row.questionType) {
            errors.push(`Row ${rowNumber}: Missing required fields (questionText, questionType)`);
            return;
          }

          const question = {
            questionText: row.questionText.trim(),
            questionType: row.questionType.toLowerCase().trim(),
            marks: parseFloat(row.marks) || 1,
            subject: row.subject?.trim() || '',
            topic: row.topic?.trim() || '',
            difficulty: row.difficulty?.toLowerCase().trim() || 'medium',
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          };

          // Validate question type
          if (!['mcq', 'true_false', 'short_answer'].includes(question.questionType)) {
            errors.push(`Row ${rowNumber}: Invalid question type. Must be: mcq, true_false, or short_answer`);
            return;
          }

          // Handle options for MCQ questions
          if (question.questionType === 'mcq') {
            const options = [];
            for (let i = 1; i <= 4; i++) {
              const optionText = row[`option${i}`]?.trim();
              if (optionText) {
                options.push({
                  text: optionText,
                  isCorrect: row.correctOption == i,
                });
              }
            }

            if (options.length < 2) {
              errors.push(`Row ${rowNumber}: MCQ questions must have at least 2 options`);
              return;
            }

            if (!options.some(opt => opt.isCorrect)) {
              errors.push(`Row ${rowNumber}: MCQ questions must have one correct option`);
              return;
            }

            question.options = options;
          }

          // Handle True/False questions
          if (question.questionType === 'true_false') {
            question.correctAnswer = row.correctAnswer?.toLowerCase().trim() === 'true';
          }

          // Handle Short Answer questions
          if (question.questionType === 'short_answer') {
            question.correctAnswer = row.correctAnswer?.trim() || '';
          }

          questions.push(question);
        } catch (error) {
          errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      })
      .on('end', () => {
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        if (errors.length > 0) {
          resolve({ success: false, errors, questions: [] });
        } else {
          resolve({ success: true, questions, errors: [] });
        }
      })
      .on('error', (error) => {
        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(error);
      });
  });
};

// Generate CSV template for questions
const generateQuestionTemplate = () => {
  const csvContent = [
    'questionText,questionType,marks,option1,option2,option3,option4,correctOption,correctAnswer,subject,topic,difficulty,tags',
    '"What is 2+2?",mcq,1,"2","3","4","5",3,"","Mathematics","Arithmetic",easy,"math,addition"',
    '"The sky is blue",true_false,1,"","","","","","true","Science","Nature",easy,"science,nature"',
    '"What is the capital of France?",short_answer,2,"","","","","","Paris","Geography","Capitals",medium,"geography,capitals"',
  ].join('\n');

  return csvContent;
};

module.exports = {
  upload,
  parseQuestionsCSV,
  generateQuestionTemplate,
};
