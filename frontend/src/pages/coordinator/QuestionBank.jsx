import React, { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { showToast } from '../../utils/toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import apiClient from '../../api';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    questionType: 'mcq',
    subject: '',
    topic: '',
    difficulty: 'medium',
    tags: [],
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, questionId: null });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.topic) params.append('topic', filters.topic);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await apiClient.get(`/coordinator/question-bank?${params}`);
      setQuestions(response.data.data);
    } catch (err) {
      showToast.error('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim()) {
      showToast.error('Question text is required');
      return;
    }

    if (!newQuestion.subject.trim() || !newQuestion.topic.trim()) {
      showToast.error('Subject and topic are required');
      return;
    }

    try {
      await apiClient.post('/coordinator/question-bank', newQuestion);
      showToast.success('Question added to bank');
      setShowAddDialog(false);
      setNewQuestion({
        questionText: '',
        questionType: 'mcq',
        subject: '',
        topic: '',
        difficulty: 'medium',
        tags: [],
        options: ['', '', '', ''],
        correctAnswer: 0,
      });
      fetchQuestions();
    } catch (err) {
      showToast.error('Failed to add question');
      console.error('Error adding question:', err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await apiClient.delete(`/coordinator/question-bank/${questionId}`);
      showToast.success('Question deleted');
      fetchQuestions();
    } catch (err) {
      showToast.error('Failed to delete question');
      console.error('Error deleting question:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiBook className="mr-3 text-blue-600" />
              Question Bank
            </h1>
            <p className="text-gray-600 mt-1">Manage reusable questions for your quizzes</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Subject"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Topic"
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiBook className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-600">No questions in your bank yet</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg text-gray-900 font-medium">{question.questionText}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold">Subject:</span> {question.subject}
                          </span>
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold">Topic:</span> {question.topic}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              question.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : question.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {question.difficulty.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {question.questionType === 'mcq' && question.options && (
                      <div className="ml-12 mt-3 space-y-2">
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <span className="font-semibold text-gray-700 mr-2">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className={option.isCorrect ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                              {option.text}
                              {option.isCorrect && ' ✓'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, questionId: question._id })}
                    className="text-red-600 hover:text-red-800 transition-colors ml-4"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Question Dialog */}
        {showAddDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Question to Bank</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                    <textarea
                      value={newQuestion.questionText}
                      onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter question text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        value={newQuestion.subject}
                        onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mathematics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                      <input
                        type="text"
                        value={newQuestion.topic}
                        onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Algebra"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                      <select
                        value={newQuestion.questionType}
                        onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={newQuestion.difficulty}
                        onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {newQuestion.questionType === 'mcq' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="correct-answer"
                              checked={newQuestion.correctAnswer === idx}
                              onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: idx })}
                              className="h-4 w-4 text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[idx] = e.target.value;
                                setNewQuestion({ ...newQuestion, options: newOptions });
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddDialog(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add to Bank
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, questionId: null })}
          onConfirm={() => {
            handleDeleteQuestion(deleteDialog.questionId);
            setDeleteDialog({ isOpen: false, questionId: null });
          }}
          title="Delete Question?"
          message="This question will be permanently removed from your bank. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default QuestionBank;
