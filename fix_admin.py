import os
import re

admin_dir = 'src/components/admin'
for filename in os.listdir(admin_dir):
    if filename.endswith('.tsx'):
        filepath = os.path.join(admin_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = content.replace("import { useTheme } from '../context/ThemeContext';", "import { useTheme } from '../../context/ThemeContext';")
        content = content.replace("import Colors from '../constants/colors';", "import Colors from '../../constants/colors';")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

with open('src/components/AdminDashboardScreen.tsx', 'r', encoding='utf-8') as f:
    admin_content = f.read()

admin_content = re.sub(
    r'(export default function AdminDashboardScreen\s*\([^)]*\)\s*\{)',
    r'\1\n    const { isDark } = useTheme();\n    const styles = getStyles(Colors);\n',
    admin_content
)
with open('src/components/AdminDashboardScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(admin_content)

print('Done')
