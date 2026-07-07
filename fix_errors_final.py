import re

# Fix RegistrationScreen.tsx (remove double declaration)
with open('src/components/RegistrationScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'(    const styles = getStyles\(Colors\);\n)+(    const styles = getStyles\(Colors\);\n)+',
    r'    const styles = getStyles(Colors);\n',
    content
)

# If it's declared twice on different lines:
content = re.sub(
    r'(const \{ isDark \} = useTheme\(\);\n\s*const styles = getStyles\(Colors\);\n\s*const styles = getStyles\(Colors\);)',
    r'const { isDark } = useTheme();\n    const styles = getStyles(Colors);',
    content
)

# And fix any nested CustomDropdown missing styles
def inject_custom(match):
    prefix = match.group(1)
    params = match.group(2)
    suffix = match.group(3)
    injection = "\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n"
    if 'const styles = getStyles' not in match.group(0):
        return prefix + params + suffix + injection
    return match.group(0)

content = re.sub(
    r'(const\s+CustomDropdown\s*=\s*\()([^)]*)(\)\s*=>\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
    inject_custom,
    content
)

with open('src/components/RegistrationScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# Fix ProfileEditScreen.tsx (add missing declaration)
with open('src/components/ProfileEditScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def inject_profile(match):
    prefix = match.group(1)
    params = match.group(2)
    suffix = match.group(3)
    injection = "\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n"
    return prefix + params + suffix + injection

content = re.sub(
    r'(export default function ProfileEditScreen\s*\()([^)]*)(\)\s*\{)(?![\s\S]{0,100}const styles = getStyles)',
    inject_profile,
    content
)

with open('src/components/ProfileEditScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
