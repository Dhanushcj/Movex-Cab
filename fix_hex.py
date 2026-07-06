import os
import glob
import re

color_map = {
    r'#(FFF|FFFFFF|fff|ffffff)': 'Colors.bgSecondary',
    r'#(F8F9FA|f8f9fa)': 'Colors.bgPrimary',
    r'#(000|000000)': 'Colors.textPrimary',
    r'#262D36': 'Colors.textPrimary',
    r'#FCFCFC': 'Colors.textPrimary',
    r'#7C848D': 'Colors.textMuted',
    r'#A1A3A6': 'Colors.textSecondary'
}

for filepath in glob.glob('src/components/**/*.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # 4. Color replacements
    for hex_pattern, replacement in color_map.items():
        pattern1 = r'([a-zA-Z0-9_]+)=[\'"]' + hex_pattern + r'[\'"]'
        content = re.sub(pattern1, r'\1={' + replacement + '}', content, flags=re.IGNORECASE)
        pattern2 = r':\s*[\'"]' + hex_pattern + r'[\'"]'
        content = re.sub(pattern2, r': ' + replacement, content, flags=re.IGNORECASE)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
print('Success')
