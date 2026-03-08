const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replacements mapping
        const replacements = [
            [/text-gray-/g, 'text-secondary-'],
            [/bg-gray-/g, 'bg-secondary-'],
            [/border-gray-/g, 'border-secondary-'],
            [/ring-gray-/g, 'ring-secondary-'],
            [/divide-gray-/g, 'divide-secondary-'],
            [/text-blue-/g, 'text-brand-'],
            [/bg-blue-/g, 'bg-brand-'],
            [/border-blue-/g, 'border-brand-'],
            [/ring-blue-/g, 'ring-brand-'],
            [/text-green-/g, 'text-success-'],
            [/bg-green-/g, 'bg-success-'],
            [/border-green-/g, 'border-success-'],
            [/text-red-/g, 'text-danger-'],
            [/bg-red-/g, 'bg-danger-'],
            [/border-red-/g, 'border-danger-'],
            [/text-yellow-/g, 'text-warning-'],
            [/bg-yellow-/g, 'bg-warning-'],
            [/text-amber-/g, 'text-warning-'],
            [/bg-amber-/g, 'bg-warning-'],
            [/text-orange-/g, 'text-warning-'],
            [/bg-orange-/g, 'bg-warning-'],
            [/text-purple-/g, 'text-accent-'],
            [/bg-purple-/g, 'bg-accent-'],
            [/text-emerald-/g, 'text-success-'],
            [/bg-emerald-/g, 'bg-success-'],
            [/\brounded-2xl\b/g, 'rounded-xl'],
            [/\bshadow-sm\b/g, 'shadow-card'],
            [/\bshadow-md\b/g, 'shadow-card-hover'],
            [/\bshadow-lg\b/g, 'shadow-card-hover'],
            [/\btracking-tight\b/g, 'tracking-tight mb-1'],
        ];

        for (const [oldRegex, newStr] of replacements) {
            content = content.replace(oldRegex, newStr);
        }

        // Make table headers uppercase and tighter
        content = content.replace(/text-xs font-medium text-secondary-500 uppercase/g, 'text-xs font-semibold text-secondary-500 uppercase tracking-wider');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Processed ${filePath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

const files = [
    path.join(__dirname, 'frontend', 'src', 'pages', 'admin', 'Users.jsx'),
    path.join(__dirname, 'frontend', 'src', 'pages', 'admin', 'Quizzes.jsx'),
    path.join(__dirname, 'frontend', 'src', 'pages', 'coordinator', 'Quizzes.jsx'),
    path.join(__dirname, 'frontend', 'src', 'pages', 'student', 'Quizzes.jsx'),
];

for (const f of files) {
    if (fs.existsSync(f)) {
        processFile(f);
    } else {
        console.log(`File not found: ${f}`);
    }
}
