import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the main component function and inject
    content = re.sub(
        r'(export default function [A-Za-z0-9_]+\s*\([^)]*\)\s*\{)',
        r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )

    # Clean up any potential double declarations we just made
    content = re.sub(
        r'(    const \{ isDark \} = useTheme\(\);\n)+(    const styles = getStyles\(Colors\);\n)+',
        r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )
    content = re.sub(
        r'(const \{ isDark \} = useTheme\(\);\n\s*const styles = getStyles\(Colors\);\n\s*const \{ isDark \} = useTheme\(\);\n\s*const styles = getStyles\(Colors\);)',
        r'const { isDark } = useTheme();\n    const styles = getStyles(Colors);',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('src/components/ProfileEditScreen.tsx')
fix_file('src/components/RegistrationScreen.tsx')
print('Done')
