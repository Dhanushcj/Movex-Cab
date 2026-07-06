import re
import sys

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Backgrounds
    content = re.sub(r"backgroundColor:\s*['\"]#(?:fff|ffffff|FFF|FFFFFF)['\"]", "backgroundColor: Colors.bgSecondary", content)
    content = re.sub(r"backgroundColor:\s*['\"]#(?:F3F4F6|f3f4f6|f9f9f9|F9F9F9)['\"]", "backgroundColor: Colors.bgPrimary", content)
    content = re.sub(r"backgroundColor:\s*['\"]white['\"]", "backgroundColor: Colors.bgSecondary", content)
    
    # Borders
    content = re.sub(r"borderColor:\s*['\"]#(?:eee|eeeeee|ddd|dddddd|E5E7EB|e5e7eb)['\"]", "borderColor: Colors.borderGlass", content)

    if 'Colors' in content and 'import Colors' not in content:
        content = "import Colors from '../constants/colors';\n" + content

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

process_file('src/components/RegistrationScreen.tsx')
process_file('src/components/ProfileEditScreen.tsx')
