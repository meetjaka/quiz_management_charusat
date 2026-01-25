import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, BookOpen, FileJson, CheckCircle, ArrowLeft } from 'lucide-react';
import { showToast } from '../../utils/toast';

const QuizFormatGuide = () => {
  const navigate = useNavigate();
  
  const promptForChatGPT = `I need you to generate quiz questions from a chapter/PDF in a specific JSON format.

Please analyze the content and create questions following this EXACT format:

{
  "questions": [
    {
      "questionText": "What is photosynthesis?",
      "questionType": "mcq",
      "marks": 2,
      "difficulty": "medium",
      "options": [
        {"text": "Process of making food using sunlight", "isCorrect": true},
        {"text": "Process of breaking down food", "isCorrect": false},
        {"text": "Process of respiration", "isCorrect": false}
      ]
    },
    {
      "questionText": "Which of the following are products of photosynthesis? (Select all that apply)",
      "questionType": "mcq_multiple",
      "marks": 3,
      "difficulty": "medium",
      "options": [
        {"text": "Glucose", "isCorrect": true},
        {"text": "Oxygen", "isCorrect": true},
        {"text": "Carbon Dioxide", "isCorrect": false},
        {"text": "Water", "isCorrect": false}
      ]
    },
    {
      "questionText": "Chlorophyll is green in color",
      "questionType": "true_false",
      "marks": 1,
      "difficulty": "easy",
      "options": [
        {"text": "True", "isCorrect": true},
        {"text": "False", "isCorrect": false}
      ]
    },
    {
      "questionText": "What is the primary pigment in chloroplasts?",
      "questionType": "short_answer",
      "marks": 2,
      "difficulty": "medium",
      "correctAnswer": "chlorophyll"
    }
  ]
}

Return ONLY valid JSON, no extra text or explanations. Generate 10-15 questions covering the entire chapter with varied question types.`;

  const exampleJSON = `{
  "questions": [
    {
      "questionText": "What does 'let' keyword do in JavaScript?",
      "questionType": "mcq",
      "marks": 2,
      "difficulty": "medium",
      "options": [
        {"text": "Declares a block-scoped variable", "isCorrect": true},
        {"text": "Declares a global variable", "isCorrect": false},
        {"text": "Declares a constant", "isCorrect": false},
        {"text": "Declares a function", "isCorrect": false}
      ]
    },
    {
      "questionText": "Which of these are valid JavaScript data types? (Select all that apply)",
      "questionType": "mcq_multiple",
      "marks": 3,
      "difficulty": "medium",
      "options": [
        {"text": "String", "isCorrect": true},
        {"text": "Number", "isCorrect": true},
        {"text": "Boolean", "isCorrect": true},
        {"text": "Character", "isCorrect": false},
        {"text": "Integer", "isCorrect": false}
      ]
    },
    {
      "questionText": "JavaScript is a compiled language",
      "questionType": "true_false",
      "marks": 1,
      "difficulty": "easy",
      "options": [
        {"text": "True", "isCorrect": false},
        {"text": "False", "isCorrect": true}
      ]
    },
    {
      "questionText": "What keyword is used to declare a constant in JavaScript?",
      "questionType": "mcq",
      "marks": 2,
      "difficulty": "easy",
      "options": [
        {"text": "const", "isCorrect": true},
        {"text": "let", "isCorrect": false},
        {"text": "var", "isCorrect": false}
      ]
    },
    {
      "questionText": "What is the output of console.log(typeof [])?",
      "questionType": "short_answer",
      "marks": 2,
      "difficulty": "medium",
      "correctAnswer": "object"
    },
    {
      "questionText": "Which operators are used for comparison in JavaScript? (Select all that apply)",
      "questionType": "mcq_multiple",
      "marks": 5,
      "difficulty": "hard",
      "options": [
        {"text": "===", "isCorrect": true},
        {"text": "==", "isCorrect": true},
        {"text": "!=", "isCorrect": true},
        {"text": "!==", "isCorrect": true},
        {"text": "=>", "isCorrect": false},
        {"text": "=", "isCorrect": false}
      ]
    }
  ]
}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast.success('Copied to clipboard! Paste this in ChatGPT.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/coordinator/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Generate Quiz from ChatGPT
          </h1>
          <p className="text-gray-600 mt-2">Follow these steps to quickly generate quizzes using AI</p>
        </div>
        
        {/* Step-by-Step Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            How to Use:
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="font-medium text-gray-700">Copy the prompt below using the copy button</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span className="font-medium text-gray-700">Go to ChatGPT (chatgpt.com or app)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span className="font-medium text-gray-700">Upload your chapter PDF or paste text content</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <div className="flex-1">
                <span className="font-medium text-gray-700">Paste the prompt and ask ChatGPT to generate questions from your content</span>
                <div className="mt-1 text-sm text-gray-600">
                  Note: Quiz details (title, marks, duration) will be collected separately in the quiz creation form.
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <span className="font-medium text-gray-700">ChatGPT will generate questions in our format</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
              <span className="font-medium text-gray-700">Copy the JSON code from ChatGPT</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
              <span className="font-medium text-gray-700">Come back here and paste in the JSON Generator!</span>
            </li>
          </ol>
        </div>

        {/* Customization Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">📝 Optional: Customize Your Quiz</h2>
          <p className="text-sm text-gray-700 mb-3">You can add these specifications with the prompt according to your preference:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Question Types:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>"mcq"</strong> = Single correct answer (2-6 options flexible)</li>
                <li><strong>"mcq_multiple"</strong> = Multiple correct answers (3-8 options flexible)</li>
                <li><strong>"true_false"</strong> = True or False (exactly 2 options)</li>
                <li><strong>"short_answer"</strong> = Text answer (no options needed)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Question Formatting:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>For MCQ: Provide 2-6 options (flexible, not fixed to 4), mark EXACTLY ONE as correct</li>
                <li>For Multiple Answer: Use "mcq_multiple", provide 3-8 options, mark ALL correct answers</li>
                <li>For Multi-select: Add "(Select all that apply)" in question text</li>
                <li>For Short Answer: Provide "correctAnswer" field instead of options</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Difficulty & Marks:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li><strong>Easy</strong> = 1 mark</li>
                <li><strong>Medium</strong> = 2-3 marks</li>
                <li><strong>Hard</strong> = 4-5 marks</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Number of Options:</h3>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Not restricted to 4 options - use 2-3 for simpler questions</li>
                <li>Use 4-6 for complex questions</li>
                <li>Adjust based on question complexity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prompt to Copy */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-blue-600" />
              Step 1: Copy This Prompt
            </h3>
            <button
              onClick={() => copyToClipboard(promptForChatGPT)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Prompt
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {promptForChatGPT}
            </pre>
          </div>
        </div>

        {/* Example Output */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Example: What ChatGPT Will Give You</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 font-mono">
              {exampleJSON}
            </pre>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-yellow-900 mb-3">⚠️ Important Notes:</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Make sure ChatGPT returns ONLY the JSON code</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>No extra text before or after the JSON</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>If ChatGPT adds explanation, tell it: "Give me ONLY the JSON, no explanation"</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Copy the ENTIRE JSON including the curly braces {'{}'}</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>If ChatGPT wraps code in ```json and ```, that's okay - our system handles it</span>
            </li>
          </ul>
        </div>

        {/* Next Step Button */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-3">Ready to Generate Your Quiz?</h3>
          <p className="text-gray-600 mb-4">Once you have the JSON from ChatGPT, proceed to the generator.</p>
          <a
            href="/coordinator/json-generator"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FileJson className="w-5 h-5" />
            Go to JSON Generator
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuizFormatGuide;
