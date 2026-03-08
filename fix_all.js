const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Make sure we don't double replace already replaced items
        // E.g. we changed text-gray- to text-secondary-, so we shouldn't change
        // something that is already text-secondary back if we rerun.

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
            [/border-yellow-/g, 'border-warning-'],
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
        ];

        for (const [oldRegex, newStr] of replacements) {
            content = content.replace(oldRegex, newStr);
        }

        // Specific structural replacements
        content = content.replace(/text-xs font-medium text-secondary-500 uppercase/g, 'text-xs font-semibold text-secondary-500 uppercase tracking-wider');

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Processed ${filePath}`);
        }
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

const basePath = path.join(__dirname, 'frontend', 'src', 'pages');

const dirs = ['admin', 'coordinator', 'student'];

for (const dir of dirs) {
    const fullDir = path.join(basePath, dir);
    if (fs.existsSync(fullDir)) {
        processDirectory(fullDir);
    }
}
