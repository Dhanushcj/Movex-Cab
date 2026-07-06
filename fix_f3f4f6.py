import glob
import re

for filepath in glob.glob('src/components/**/*.tsx', recursive=True) + ['App.tsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 4. Color replacements
    pattern1 = r'([a-zA-Z0-9_]+)=[\'"]#(F3F4F6|f3f4f6)[\'"]'
    content = re.sub(pattern1, r'\1={Colors.bgPrimary}', content, flags=re.IGNORECASE)
    
    pattern2 = r':\s*[\'"]#(F3F4F6|f3f4f6)[\'"]'
    content = re.sub(pattern2, r': Colors.bgPrimary', content, flags=re.IGNORECASE)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
print('Success')
