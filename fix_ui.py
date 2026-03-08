import re
import sys

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements mapping
    replacements = [
        (r'text-gray-', r'text-secondary-'),
        (r'bg-gray-', r'bg-secondary-'),
        (r'border-gray-', r'border-secondary-'),
        (r'ring-gray-', r'ring-secondary-'),
        (r'divide-gray-', r'divide-secondary-'),
        (r'text-blue-', r'text-brand-'),
        (r'bg-blue-', r'bg-brand-'),
        (r'border-blue-', r'border-brand-'),
        (r'ring-blue-', r'ring-brand-'),
        (r'text-green-', r'text-success-'),
        (r'bg-green-', r'bg-success-'),
        (r'border-green-', r'border-success-'),
        (r'text-red-', r'text-danger-'),
        (r'bg-red-', r'bg-danger-'),
        (r'border-red-', r'border-danger-'),
        (r'text-yellow-', r'text-warning-'),
        (r'bg-yellow-', r'bg-warning-'),
        (r'text-amber-', r'text-warning-'),
        (r'bg-amber-', r'bg-warning-'),
        (r'text-orange-', r'text-warning-'),
        (r'bg-orange-', r'bg-warning-'),
        (r'text-purple-', r'text-accent-'),
        (r'bg-purple-', r'bg-accent-'),
        (r'text-emerald-', r'text-success-'),
        (r'bg-emerald-', r'bg-success-'),
        (r'rounded-2xl', r'rounded-xl'),
        (r'shadow-sm', r'shadow-card'),
        (r'shadow-md', r'shadow-card-hover'),
        (r'shadow-lg', r'shadow-card-hover'),
        (r'tracking-tight', r'tracking-tight mb-1'),
        (r'bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden', r'bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Make table headers uppercase and tighter
    content = content.replace('text-xs font-medium text-secondary-500 uppercase', 'text-xs font-semibold text-secondary-500 uppercase tracking-wider')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {file_path}")

files = [
    r'c:\Users\Dell\Desktop\Quiz_Managment_System\frontend\src\pages\admin\Users.jsx',
    r'c:\Users\Dell\Desktop\Quiz_Managment_System\frontend\src\pages\admin\Quizzes.jsx',
    r'c:\Users\Dell\Desktop\Quiz_Managment_System\frontend\src\pages\coordinator\Quizzes.jsx',
    r'c:\Users\Dell\Desktop\Quiz_Managment_System\frontend\src\pages\student\Quizzes.jsx'
]

for f in files:
    try:
        process_file(f)
    except Exception as e:
        print(f"Error processing {f}: {e}")
