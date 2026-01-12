const Joi = require("joi");

// User validation
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "coordinator", "student"),
    enrollmentNumber: Joi.string().allow("", null),
    department: Joi.string().allow("", null),
    semester: Joi.string().allow("", null),
    batch: Joi.string().allow("", null),
  });

  return schema.validate(data);
};

// Quiz validation
const validateQuiz = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().allow("", null),
    department: Joi.string().required(),
    semester: Joi.string().required(),
    subject: Joi.string().required(),
    batch: Joi.string().allow("", null),
    startTime: Joi.date().required(),
    endTime: Joi.date().greater(Joi.ref("startTime")).required(),
    duration: Joi.number().min(1).required(),
    totalMarks: Joi.number().min(1).required(),
    passingMarks: Joi.number().min(0).max(Joi.ref("totalMarks")).required(),
    isActive: Joi.boolean(),
    isPublished: Joi.boolean(),
  });

  return schema.validate(data);
};

// Question validation
const validateQuestion = (data) => {
  const schema = Joi.object({
    questionText: Joi.string().required(),
    options: Joi.object({
      A: Joi.string().required(),
      B: Joi.string().required(),
      C: Joi.string().required(),
      D: Joi.string().required(),
    }).required(),
    correctAnswer: Joi.string().valid("A", "B", "C", "D").required(),
    marks: Joi.number().min(1).required(),
  });

  return schema.validate(data);
};

// Quiz attempt validation
const validateQuizAttempt = (data) => {
  const schema = Joi.object({
    quizId: Joi.string().required(),
    answers: Joi.array().items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedAnswer: Joi.string()
          .valid("A", "B", "C", "D", null)
          .allow(null),
      })
    ),
  });

  return schema.validate(data);
};

module.exports = {
  validateUser,
  validateQuiz,
  validateQuestion,
  validateQuizAttempt,
};
