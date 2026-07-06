import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # If useTheme is not imported but used
    if 'useTheme' in content and 'import { useTheme }' not in content:
        content = "import { useTheme } from '../context/ThemeContext';\n" + content
    if 'Colors' in content and 'import Colors' not in content:
        content = "import Colors from '../constants/colors';\n" + content

    # If getStyles is defined but styles is missing
    if 'const getStyles = (Colors: any)' in content and 'const styles = getStyles(Colors);' not in content:
        # inject const styles = getStyles(Colors); inside the component
        content = re.sub(
            r'(const\s+\{\s*isDark\s*\}\s*=\s*useTheme\(\);\n)',
            r'\1    const styles = getStyles(Colors);\n',
            content
        )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

files = [
    'src/components/ProfileEditScreen.tsx',
    'src/components/RegistrationScreen.tsx',
    'src/components/SlideToStartScreen.tsx',
    'src/components/TripCompletedPaymentSheet.tsx',
    'src/components/VerticalSwipeButton.tsx'
]

for file in files:
    fix_file(file)

print('Success')
