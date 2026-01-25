import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileJson, Eye, CheckCircle, AlertCircle, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { showToast } from '../../utils/toast';
import apiClient from '../../api';

const JSONQuizGenerator = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Parse and validate JSON
  const handleParse = () => {
    setError('');
    try {
      // Remove markdown code blocks if ChatGPT added them
      let cleanedInput = jsonInput.trim();
      
      // Remove ```json and ``` if present
      if (cleanedInput.startsWith('```')) {
        cleanedInput = cleanedInput.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const parsed = JSON.parse(cleanedInput);

      // Validate structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid format: "questions" array is required');
      }

      if (parsed.questions.length === 0) {
        throw new Error('No questions found in the JSON');
      }

      // Validate each question
      parsed.questions.forEach((q, idx) => {
        if (!q.questionText) {
          throw new Error(`Question ${idx + 1}: questionText is required`);
        }
        if (!q.questionType) {
          throw new Error(`Question ${idx + 1}: questionType is required`);
        }
        if (q.questionType !== 'short_answer' && (!q.options || q.options.length === 0)) {
          throw new Error(`Question ${idx + 1}: options array is required for ${q.questionType} type`);
        }
        
        // Validate at least one correct answer for MCQ and true/false
        if (q.questionType !== 'short_answer') {
          const hasCorrect = q.options.some(opt => opt.isCorrect);
          if (!hasCorrect) {
            throw new Error(`Question ${idx + 1}: At least one option must be marked as correct`);
          }
        }
      });

      setParsedData(parsed);
      setShowPreview(true);
      showToast.success(`Successfully parsed ${parsed.questions.length} questions!`);
      
    } catch (err) {
      setError(err.message);
      setParsedData(null);
      setShowPreview(false);
      showToast.error('Failed to parse JSON: ' + err.message);
    }
  };

  // Create quiz from parsed data
  const handleCreateQuiz = async () => {
    if (loading) return; // Prevent double submission
    
    setLoading(true);
    try {
      const totalMarks = parsedData.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
      
      // Create quiz with basic info (quiz details should be collected elsewhere)
      const quizResponse = await apiClient.post('/coordinator/quizzes', {
        title: 'JSON Generated Quiz',
        description: `Auto-generated from ChatGPT with ${parsedData.questions.length} questions`,
        totalMarks: totalMarks,
        passingMarks: Math.ceil(totalMarks * 0.4), // Default 40%
        durationMinutes: parsedData.questions.length * 2, // Default 2 min per question
        maxAttempts: 1,
        shuffleQuestions: false,
        shuffleOptions: false,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: false // Draft mode
      });

      const quizId = quizResponse.data.data._id;

      // Add questions with proper structure
      const questionsToAdd = parsedData.questions.map((q, idx) => {
        const questionData = {
          questionText: q.questionText,
          questionType: q.questionType,
          marks: q.marks || 1,
          orderNumber: idx + 1,
        };

        // Handle different question types
        if (q.questionType === 'short_answer') {
          questionData.correctAnswer = q.correctAnswer || '';
        } else {
          questionData.options = q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false
          }));
        }

        return questionData;
      });

      // Add questions to quiz
      await apiClient.post(`/coordinator/quizzes/${quizId}/questions/bulk`, {
        questions: questionsToAdd
      });

      showToast.success(`Quiz created successfully with ${parsedData.questions.length} questions!`);
      
      // Reset
      setJsonInput('');
      setParsedData(null);
      setShowPreview(false);
      
      // Redirect to edit page to allow further customization
      navigate(`/coordinator/quizzes/edit/${quizId}`);

    } catch (err) {
      console.error('Error creating quiz:', err);
      showToast.error('Error creating quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-700';
      case 'mcq_multiple': return 'bg-indigo-100 text-indigo-700';
      case 'true_false': return 'bg-purple-100 text-purple-700';
      case 'short_answer': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-green-600" />
            Generate Quiz from ChatGPT JSON
          </h2>
          <p className="text-gray-600 mt-2">Paste the JSON generated by ChatGPT to import questions (quiz details are collected separately)</p>
        </div>

        {/* Help Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Need help getting the JSON?
              </h3>
              <p className="text-sm text-blue-700 mt-1">Follow our step-by-step guide to use ChatGPT</p>
            </div>
            <a
              href="/coordinator/quiz-format-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Guide
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* JSON Input */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📝 Step 1: Paste JSON from ChatGPT</h3>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='Paste the JSON code here... Should start with { and end with }'
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <button
            onClick={handleParse}
            disabled={!jsonInput.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <Eye className="w-5 h-5" />
            Parse & Preview Questions
          </button>
        </div>

        {/* Preview */}
        {showPreview && parsedData && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Preview: {parsedData.questions.length} Questions Found
            </h3>

            {/* Quiz Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Questions:</span>
                  <div className="font-medium text-gray-900 mt-1">{parsedData.questions.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Marks:</span>
                  <div className="font-medium text-gray-900 mt-1">
                    {parsedData.questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Quiz details (title, duration, etc.) will be collected when you create the quiz
              </div>
            </div>

            {/* Questions List */}
            <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
              {parsedData.questions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 flex-1">
                      Q{idx + 1}. {q.questionText}
                    </div>
                    <div className="flex gap-2 text-xs ml-4 flex-shrink-0">
                      <span className={`px-2 py-1 rounded ${getTypeColor(q.questionType)}`}>
                        {q.questionType}
                      </span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                        {q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}
                      </span>
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty || 'medium'}
                      </span>
                    </div>
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`pl-4 py-1 rounded ${
                            opt.isCorrect ? 'text-green-700 font-medium bg-green-50' : 'text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt.text}
                          {opt.isCorrect && ' ✓'}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short Answer */}
                  {q.questionType === 'short_answer' && (
                    <div className="mt-2 text-sm bg-green-50 text-green-700 p-2 rounded">
                      <strong>Correct Answer:</strong> {q.correctAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Create Quiz Button */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateQuiz}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Import Questions to New Quiz
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setParsedData(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-3">💡 Tips:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span>•</span>
              <span>The JSON should only contain questions array - quiz details are collected separately</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Make sure the JSON is valid (check brackets and commas)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>If you see an error, copy the JSON again from ChatGPT</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>This will create a draft quiz that you can edit and activate later</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>If ChatGPT added ```json before the code, that's okay - we'll clean it automatically</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONQuizGenerator;
