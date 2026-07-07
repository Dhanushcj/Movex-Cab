import re

def fix_profile():
    with open('src/components/ProfileEditScreen.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # It complains styles is missing on line 118, which is inside OptionRow or something.
    # Actually, let's just make styles global but use a React Hook!
    # No, let's just make a global let styles: any; and initialize it inside the main component?
    # No, that's bad React.
    
    # Just inject it into every function that returns JSX!
    content = re.sub(
        r'(function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )
    content = re.sub(
        r'(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )
    
    # Fix duplicates
    content = re.sub(r'(    const \{ isDark \} = useTheme\(\);\n)+(    const styles = getStyles\(Colors\);\n)+', r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n', content)

    with open('src/components/ProfileEditScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_registration():
    with open('src/components/RegistrationScreen.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r'(function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )
    content = re.sub(
        r'(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
        content
    )
    
    content = re.sub(r'(    const \{ isDark \} = useTheme\(\);\n)+(    const styles = getStyles\(Colors\);\n)+', r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n', content)

    with open('src/components/RegistrationScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix_profile()
fix_registration()
print('Done')
