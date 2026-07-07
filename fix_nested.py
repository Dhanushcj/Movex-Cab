import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find const CustomDropdown =  and inject styles
    def inject_arrow(match):
        prefix = match.group(1)
        params = match.group(2)
        suffix = match.group(3)
        
        injection = "\n    const { isDark } = useTheme();\n"
        if 'const getStyles = ' in content:
            injection += "    const styles = getStyles(Colors);\n"
            
        return prefix + params + suffix + injection

    content = re.sub(
        r'(const\s+CustomDropdown\s*=\s*\()([^)]*)(\)\s*=>\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
        inject_arrow,
        content
    )
    
    # Check for duplicate const styles =  in RegistrationScreen
    content = re.sub(r'(    const \{ isDark \} = useTheme\(\);\n)+(    const styles = getStyles\(Colors\);\n)+', r'    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

fix_file('src/components/RegistrationScreen.tsx')
fix_file('src/components/ProfileEditScreen.tsx')
