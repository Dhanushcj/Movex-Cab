import os
import re

dir_path = 'src/components'
app_path = 'd:/Cab Application/customer-app'
full_dir_path = os.path.join(app_path, dir_path)

def get_relative_path(filepath):
    depth = filepath.replace(full_dir_path, '').count(os.sep)
    if depth == 0:
        return '../context/ThemeContext'
    else:
        return '../../context/ThemeContext'

for root, _, files in os.walk(full_dir_path):
    for file in files:
        if not file.endswith('.tsx'): continue
        filepath = os.path.join(root, file)
        
        if file in ['DashboardUI.tsx', 'MyPassScreen.tsx']:
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'StyleSheet.create' not in content: continue
        if 'getStyles' in content: continue
        
        original_content = content
        
        content = re.sub(r'const styles = StyleSheet\.create\(\{', 'const getStyles = (colors: any) => StyleSheet.create({', content)
        
        if 'useTheme' not in content:
            rel_path = get_relative_path(filepath)
            content = re.sub(r'(import .* from \'react-native\';)', r'\1\nimport { useTheme } from \'' + rel_path + '\';', content)
        
        comp_match = re.search(r'(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{)', content)
        if comp_match:
            insertion = '\n  const { colors, isDark } = useTheme();\n  const styles = getStyles(colors);'
            content = content.replace(comp_match.group(1), comp_match.group(1) + insertion, 1)
            
            content = re.sub(r'(?<!import )Colors\.', 'colors.', content)
            
            content = content.replace("'#F3F4F6'", 'colors.bgPrimary')
            content = content.replace('"#F3F4F6"', 'colors.bgPrimary')
            
            content = content.replace("'#FFFFFF'", 'colors.bgSecondary')
            content = content.replace('"#FFFFFF"', 'colors.bgSecondary')
            
            content = content.replace("'#262D36'", 'colors.textPrimary')
            content = content.replace('"#262D36"', 'colors.textPrimary')
            
            content = content.replace("'#7C848D'", 'colors.textSecondary')
            content = content.replace('"#7C848D"', 'colors.textSecondary')
            
            content = content.replace("'#E9EAEC'", 'colors.border')
            content = content.replace('"#E9EAEC"', 'colors.border')
            
            content = content.replace("'#F9FAFB'", 'colors.bgTertiary')
            content = content.replace('"#F9FAFB"', 'colors.bgTertiary')

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {file}')
