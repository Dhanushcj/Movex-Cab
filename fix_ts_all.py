import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    if 'useTheme' in content and 'import { useTheme }' not in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import {{ useTheme }} from '{depth}context/ThemeContext';\n" + content
    
    if 'Colors' in content and 'import Colors' not in content:
        depth = '../' if 'src/components' in filepath.replace(r'\\', '/') else './src/'
        content = f"import Colors from '{depth}constants/colors';\n" + content

    if 'getStyles(Colors)' not in content and 'const getStyles =' in content:
        # inject safely into the default export function
        content = re.sub(
            r'(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)',
            r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
            content
        )
        # inject into other non-default exported or internal functions that might need it
        content = re.sub(
            r'(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{)',
            r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
            content
        )
        content = re.sub(
            r'(function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)(?![\s\S]*const styles =)',
            r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
            content
        )

    # Clean up double injections if they happened
    content = re.sub(r'(const \{ isDark \} = useTheme\(\);\s*\n\s*const styles = getStyles\(Colors\);\s*\n)+', r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

print('Done')
