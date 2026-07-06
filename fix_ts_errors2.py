import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for all occurrences of "export default function" or "function" without styles
    def inject_styles(match):
        decl = match.group(1)
        if 'getStyles' in content and 'styles = getStyles(Colors)' not in decl and decl.strip() != 'function NavigationRoot()':
            return decl + "\n    const styles = getStyles(Colors);\n"
        return decl
    
    # RegistrationScreen has multiple components maybe. Or maybe the previous replace failed.
    # Let's forcefully inject const styles = getStyles(Colors) if isDark is defined but styles isn't.
    content = re.sub(
        r'(const\s+\{\s*isDark\s*\}\s*=\s*useTheme\(\);\n)',
        r'\1    const styles = getStyles(Colors);\n',
        content
    )
    
    # If the file still doesn't have const styles = getStyles, it means useTheme might not be injected.
    if 'getStyles(Colors)' not in content:
        content = re.sub(
            r'(export default function [A-Za-z0-9_]+\([^)]*\)\s*\{)',
            r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
            content
        )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/components/RegistrationScreen.tsx')
fix_file('src/components/ProfileEditScreen.tsx')

print('Success')
