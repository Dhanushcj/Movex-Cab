import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hex codes with dynamic Colors in inline styles and StyleSheet
replacements = {
    r"'#FFFFFF'": "Colors.bgSecondary",
    r'"#FFFFFF"': "Colors.bgSecondary",
    r"'#fff'": "Colors.bgSecondary",
    r'"#fff"': "Colors.bgSecondary",
    r"'#FFF'": "Colors.bgSecondary",
    r'"#FFF"': "Colors.bgSecondary",
    
    r"'#F8F9FA'": "Colors.bgPrimary",
    r'"#F8F9FA"': "Colors.bgPrimary",
    r"'#f8f9fa'": "Colors.bgPrimary",
    r'"#f8f9fa"': "Colors.bgPrimary",
    
    r"'#000000'": "Colors.textPrimary",
    r'"#000000"': "Colors.textPrimary",
    r"'#000'": "Colors.textPrimary",
    r'"#000"': "Colors.textPrimary",
    
    r"'#262D36'": "Colors.textPrimary",
    r'"#262D36"': "Colors.textPrimary",
    
    r"'#7C848D'": "Colors.textMuted",
    r'"#7C848D"': "Colors.textMuted",
    
    r"'#A1A3A6'": "Colors.textSecondary",
    r'"#A1A3A6"': "Colors.textSecondary",
    
    r"'#FCFCFC'": "Colors.textPrimary",
    r'"#FCFCFC"': "Colors.textPrimary"
}

for pattern, replacement in replacements.items():
    content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
