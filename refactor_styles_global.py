import os
import re

def process_file(filepath):
    if 'RegistrationScreen.tsx' in filepath or 'ProfileEditScreen.tsx' in filepath:
        return False
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'const getStyles = (Colors' in content or 'getStyles(Colors' in content:
        return False

    original_content = content
    
    content = re.sub(
        r'const\s+styles\s*=\s*StyleSheet\.create\s*\(\s*\{',
        r'const getStyles = (Colors: any) => StyleSheet.create({',
        content
    )
    
    content = re.sub(r"backgroundColor:\s*['\"]#(?:fff|ffffff|FFF|FFFFFF)['\"]", "backgroundColor: Colors.bgSecondary", content)
    content = re.sub(r"backgroundColor:\s*['\"]#(?:F3F4F6|f3f4f6|f9f9f9|F9F9F9)['\"]", "backgroundColor: Colors.bgPrimary", content)
    content = re.sub(r"backgroundColor:\s*['\"]white['\"]", "backgroundColor: Colors.bgSecondary", content)
    content = re.sub(r"backgroundColor:\s*['\"]#(?:000|000000|333|333333)['\"]", "backgroundColor: Colors.textPrimary", content)
    
    content = re.sub(r"color:\s*['\"]#(?:000|000000|222|222222|333|333333)['\"]", "color: Colors.textPrimary", content)
    content = re.sub(r"color:\s*['\"]#(?:666|666666|888|888888|999|999999|A1A3A6|a1a3a6)['\"]", "color: Colors.textSecondary", content)
    content = re.sub(r"color:\s*['\"]#(?:fff|ffffff|FFF|FFFFFF)['\"]", "color: Colors.bgPrimary", content)
    
    content = re.sub(r"borderColor:\s*['\"]#(?:eee|eeeeee|ddd|dddddd|E5E7EB|e5e7eb)['\"]", "borderColor: Colors.borderGlass", content)

    component_pattern = r'(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)'
    
    def inject_hooks(match):
        decl = match.group(1)
        func_name = re.search(r'function\s+([A-Za-z0-9_]+)', decl)
        if func_name and func_name.group(1)[0].isupper():
            injection = "\n    const { isDark } = useTheme();\n"
            if 'const getStyles =' in content:
                injection += "    const styles = getStyles(Colors);\n"
            return decl + injection
        return decl

    content = re.sub(component_pattern, inject_hooks, content)

    if 'useTheme' not in content and 'const { isDark } = useTheme();' in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import {{ useTheme }} from '{depth}context/ThemeContext';\n" + content
            
    if 'Colors' in content and 'import Colors' not in content:
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
            filepath = os.path.join(root, file)
            print(f"{filepath}: {process_file(filepath)}")
