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

# Replace 'export default App;' with a wrapper
# (Wait, actually App itself needs useTheme! But App contains ThemeProvider so App cannot call useTheme directly.)
# Instead of injecting into App, we inject into NavigationRoot.
content = content.replace(
    "function NavigationRoot() {",
    "function NavigationRoot() {\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);"
)

# Replace for LocationPickerScreen
content = re.sub(
    r"(function LocationPickerScreen\([^)]+\)\s*\{)",
    r"\1\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);",
    content
)

# Replace for HomeScreen
content = re.sub(
    r"(function HomeScreen\([^)]+\)\s*\{)",
    r"\1\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);",
    content
)

# Replace for TrackingScreen
content = re.sub(
    r"(function TrackingScreen\([^)]+\)\s*\{)",
    r"\1\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);",
    content
)

# Replace for DriverHomeScreen
content = re.sub(
    r"(function DriverHomeScreen\([^)]+\)\s*\{)",
    r"\1\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);",
    content
)

# Replace for DriverActiveRideScreen
content = re.sub(
    r"(function DriverActiveRideScreen\([^)]+\)\s*\{)",
    r"\1\n  const { colors: Colors, isDark, toggleTheme } = useTheme();\n  const styles = useStyles(Colors);",
    content
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
