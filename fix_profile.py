import os
import re

filepath = 'src/components/ProfileScreen.tsx'

color_map = {
    r'#(FFF|FFFFFF|fff|ffffff)': 'Colors.bgSecondary',
    r'#(F8F9FA|f8f9fa)': 'Colors.bgPrimary',
    r'#(000|000000)': 'Colors.textPrimary',
    r'#262D36': 'Colors.textPrimary',
    r'#FCFCFC': 'Colors.textPrimary',
    r'#7C848D': 'Colors.textMuted',
    r'#A1A3A6': 'Colors.textSecondary',
    r'#(F3F4F6|f3f4f6)': 'Colors.bgPrimary',
}

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

for hex_pattern, replacement in color_map.items():
    pattern1 = r'([a-zA-Z0-9_]+)=[\'"]' + hex_pattern + r'[\'"]'
    content = re.sub(pattern1, r'\1={' + replacement + '}', content, flags=re.IGNORECASE)
    pattern2 = r':\s*[\'"]' + hex_pattern + r'[\'"]'
    content = re.sub(pattern2, r': ' + replacement, content, flags=re.IGNORECASE)

if 'Colors.' in content and 'import Colors from' not in content:
    lines = content.split('\n')
    last_import = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import = i
    lines.insert(last_import + 1, "import Colors from '../constants/colors';")
    content = '\n'.join(lines)

# Fix Language in JSX and text
content = content.replace(">Edit Profile<", ">{t('app.EditProfile')}<")
content = content.replace(">Language<", ">{t('app.Language')}<")
content = content.replace(">Logout<", ">{t('app.Logout')}<")
content = content.replace(">Ride History<", ">{t('app.RideHistory')}<")
content = content.replace(">Wallet<", ">{t('app.Wallet')}<")
content = content.replace(">Profile<", ">{t('app.Profile')}<")

# Ensure useLanguage hook
if 'const { t } = useLanguage();' not in content:
    content = content.replace("const { user } = useAuth();", "const { user } = useAuth();\n  const { t } = useLanguage();")
if "import { useLanguage }" not in content:
    content = content.replace("import { useAuth }", "import { useLanguage } from '../context/LanguageContext';\nimport { useAuth }")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

with open('App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()
    app_content = app_content.replace("'{t('app.ConfirmPickupLocation')}'", "t('app.ConfirmPickupLocation')")
    app_content = app_content.replace("'{t('app.ConfirmDropLocation')}'", "t('app.ConfirmDropLocation')")

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

print('Success')
