import os
import re

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

    # Note: I am NOT changing text color to textPrimary safely because white text on buttons might be changed to bgSecondary incorrectly.
    # We will do text colors manually or explicitly.
    content = re.sub(r"color:\s*['\"]#(?:000|000000|222|222222|333|333333)['\"]", "color: Colors.textPrimary", content)
    content = re.sub(r"color:\s*['\"]#(?:666|666666|888|888888|999|999999|A1A3A6|a1a3a6)['\"]", "color: Colors.textSecondary", content)

    if 'Colors.' in content and 'import Colors' not in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import Colors from '{depth}constants/colors';\n" + content

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

print('Done')
