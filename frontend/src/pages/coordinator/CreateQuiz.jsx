import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { showToast } from '../../utils/toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import apiClient from '../../api';

const CreateQuizWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    totalMarks: 0,
    passingMarks: 0,
    durationMinutes: 60,
    startTime: '',
    endTime: '',
    shuffleQuestions: false,
    shuffleOptions: false,
    maxAttempts: 1,
  });

  const [questions, setQuestions] = useState([
    {
      questionText: '',
      questionType: 'mcq',
      marks: 1,
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
  ]);

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'mcq',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      showToast.error('At least one question is required');
    }
  };

  const validateStep1 = () => {
    if (!quizData.title.trim()) {
      showToast.error('Quiz title is required');
      return false;
    }
    if (quizData.totalMarks <= 0) {
      showToast.error('Total marks must be greater than 0');
      return false;
    }
    if (quizData.passingMarks < 0 || quizData.passingMarks > quizData.totalMarks) {
      showToast.error('Passing marks must be between 0 and total marks');
      return false;
    }
    if (quizData.durationMinutes <= 0) {
      showToast.error('Duration must be greater than 0');
      return false;
    }
    if (!quizData.startTime || !quizData.endTime) {
      showToast.error('Start and end times are required');
      return false;
    }
    if (new Date(quizData.startTime) >= new Date(quizData.endTime)) {
      showToast.error('End time must be after start time');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showToast.error(`Question ${i + 1}: Question text is required`);
        return false;
      }
      if (q.marks <= 0) {
        showToast.error(`Question ${i + 1}: Marks must be greater than 0`);
        return false;
      }
      if (q.questionType === 'mcq') {
        const emptyOptions = q.options.filter(opt => !opt.trim()).length;
        if (emptyOptions > 0) {
          showToast.error(`Question ${i + 1}: All options must be filled`);
          return false;
        }
      }
    }

    const totalQuestionMarks = questions.reduce((sum, q) => sum + parseFloat(q.marks), 0);
    if (totalQuestionMarks !== quizData.totalMarks) {
      showToast.error(`Total question marks (${totalQuestionMarks}) must equal quiz total marks (${quizData.totalMarks})`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);

      // Create quiz
      const quizResponse = await apiClient.post('/coordinator/quizzes', quizData);
      const quizId = quizResponse.data.data._id;

      // Add questions
      for (const question of questions) {
        await apiClient.post(`/coordinator/quizzes/${quizId}/questions`, {
          ...question,
          orderNumber: questions.indexOf(question) + 1,
        });
      }

      showToast.success('Quiz created successfully!');
      navigate('/coordinator/quizzes');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create quiz';
      showToast.error(errorMsg);
      console.error('Error creating quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              Quiz Details
            </span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              Add Questions
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Quiz Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quiz title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={quizData.totalMarks}
                    onChange={(e) => handleQuizDataChange('totalMarks', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    value={quizData.passingMarks}
                    onChange={(e) => handleQuizDataChange('passingMarks', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={quizData.durationMinutes}
                    onChange={(e) => handleQuizDataChange('durationMinutes', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts *
                  </label>
                  <input
                    type="number"
                    value={quizData.maxAttempts}
                    onChange={(e) => handleQuizDataChange('maxAttempts', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={quizData.startTime}
                    onChange={(e) => handleQuizDataChange('startTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={quizData.endTime}
                    onChange={(e) => handleQuizDataChange('endTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizData.shuffleQuestions}
                    onChange={(e) => handleQuizDataChange('shuffleQuestions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Shuffle questions for each student</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizData.shuffleOptions}
                    onChange={(e) => handleQuizDataChange('shuffleOptions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Shuffle answer options</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowCancelDialog(true)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Add Questions
                <FiArrowRight className="inline ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Questions */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Questions</h2>
                <div className="text-sm text-gray-600">
                  Total: {questions.reduce((sum, q) => sum + parseFloat(q.marks || 0), 0)} / {quizData.totalMarks} marks
                </div>
              </div>

              {questions.map((question, qIndex) => (
                <div key={qIndex} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Question {qIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.questionType}
                          onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marks *
                        </label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) => handleQuestionChange(qIndex, 'marks', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0.5"
                          step="0.5"
                        />
                      </div>
                    </div>

                    {question.questionType === 'mcq' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options *
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === optIndex}
                                onChange={() => handleQuestionChange(qIndex, 'correctAnswer', optIndex)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Select the correct answer</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <FiPlus className="inline mr-2" />
                Add Another Question
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiSave className="inline mr-2" />
                {loading ? 'Creating Quiz...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={() => navigate('/coordinator/quizzes')}
          title="Cancel Quiz Creation?"
          message="All your progress will be lost. Are you sure you want to cancel?"
          confirmText="Yes, Cancel"
          cancelText="Continue Editing"
          type="danger"
        />
      </div>
    </div>
  );
};

export default CreateQuizWizard;
