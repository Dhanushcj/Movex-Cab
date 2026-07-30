import re
import os

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change StyleSheet.create to getStyles
content = re.sub(r'const styles = StyleSheet\.create\(\{', 'const getStyles = (colors: any) => StyleSheet.create({', content)

# 2. Replace Colors. with colors. globally, except in import statements
# First, remove the import of Colors to avoid issues, wait, we need it if we didn't remove it.
# Actually we can just replace Colors. with colors. using a regex
content = re.sub(r'(?<!import )Colors\.', 'colors.', content)

# 3. Inject useTheme hook into the 7 components
components = [
    r'(function NavigationRoot\(\)\s*\{)',
    r'(function LocationPickerScreen\(\{[\s\S]*?onBack:\s*\(\)\s*=>\s*void;\s*\}\)\s*\{)',
    r'(function HomeScreen\(\{[\s\S]*?onPassPurchased\?:\s*\(\)\s*=>\s*void;\s*\}\)\s*\{)',
    r'(function TrackingScreen\(\{[\s\S]*?\}\)\s*\{)',
    r'(export default function App\(\)\s*\{)',
    r'(function DriverHomeScreen\(\{[\s\S]*?\}\)\s*\{)',
    r'(function DriverActiveRideScreen\(\{[\s\S]*?\}\)\s*\{)'
]

for comp in components:
    match = re.search(comp, content)
    if match:
        insertion = "\n  const { colors, isDark } = useTheme();\n  const styles = getStyles(colors);"
        content = content[:match.end()] + insertion + content[match.end():]

# Also remove duplicate useTheme in HomeScreen
content = content.replace("const { isDark, toggleTheme } = useTheme();", "const { toggleTheme } = useTheme();")

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
