import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # 1. Backgrounds (Light/White) -> bgSecondary
    content = re.sub(r"['\"]#(?:FFF|FFFFFF|fff|ffffff)['\"]", "Colors.bgSecondary", content)
    content = re.sub(r"['\"]white['\"]", "Colors.bgSecondary", content)
    
    # 2. Backgrounds (Off-white/Gray) -> bgPrimary
    content = re.sub(r"['\"]#(?:F3F4F6|f3f4f6|F8F9FA|f8f9fa|F9F9F9|f9f9f9|FAFAFA|fafafa)['\"]", "Colors.bgPrimary", content)
    
    # 3. Dark Text -> textPrimary
    content = re.sub(r"['\"]#(?:000|000000|111|111111|1F2937|1f2937|222|222222|262D36|262d36|333|333333)['\"]", "Colors.textPrimary", content)
    content = re.sub(r"['\"]black['\"]", "Colors.textPrimary", content)
    
    # 4. Gray Text -> textSecondary
    content = re.sub(r"['\"]#(?:4B5563|4b5563|475569|475569|666|666666|6B7280|6b7280)['\"]", "Colors.textSecondary", content)
    
    # 5. Muted Text -> textMuted
    content = re.sub(r"['\"]#(?:7C848D|7c848d|888|888888|999|999999|9CA3AF|9ca3af|A1A3A6|a1a3a6)['\"]", "Colors.textMuted", content)
    
    # 6. Borders -> borderGlass
    content = re.sub(r"['\"]#(?:DDD|DDDDDD|ddd|dddddd|E2E8F0|e2e8f0|E5E7EB|e5e7eb|EEE|EEEEEE|eee|eeeeee)['\"]", "Colors.borderGlass", content)

    if content != original_content:
        # Ensure Colors is imported if we just added it
        if 'Colors.' in content and 'import Colors' not in content:
            depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
            content = f"import Colors from '{depth}constants/colors';\n" + content
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

# Also run on App.tsx
fix_file('App.tsx')

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

print('Done')
