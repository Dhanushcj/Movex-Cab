import re

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import Colors from './src/constants/colors';",
    "import { ThemeColors } from './src/constants/colors';\nimport { ThemeProvider, useTheme } from './src/context/ThemeContext';"
)

# 2. Inject ThemeProvider into App export
content = content.replace(
    "<LanguageProvider>",
    "<ThemeProvider>\n      <LanguageProvider>"
)
content = content.replace(
    "</LanguageProvider>",
    "</LanguageProvider>\n    </ThemeProvider>"
)

# 3. Convert styles
content = content.replace(
    "const styles = StyleSheet.create({",
    "const useStyles = (Colors: ThemeColors) => StyleSheet.create({"
)
content = content.replace(
    "export default App;",
    "// Note: styles are now provided via useStyles hook.\nexport default App;"
)

# 4. Inject hooks into functional components
# We'll find lines starting with 'function ' or 'export default function '
# Or 'const xxx = () => {'
import ast
components_to_patch = []
lines = content.split('\n')
for i, line in enumerate(lines):
    if line.startswith('function ') or line.startswith('export default function '):
        # Check if the function actually returns JSX (naive check: contains 'return (')
        components_to_patch.append(i)

# For each component, find the opening brace { and inject the hook
offset = 0
for i in components_to_patch:
    line = lines[i]
    if '{' in line:
        idx = line.find('{')
        # Inject right after the {
        # Check if we already injected t
        inject_code = "\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);"
        lines[i] = line[:idx+1] + inject_code + line[idx+1:]
    else:
        # { is on next line
        inject_code = "  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);\n"
        lines[i+1] = lines[i+1] + inject_code

content = '\n'.join(lines)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
