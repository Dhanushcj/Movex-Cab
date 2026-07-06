with open('src/components/ProfileScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace global StyleSheet.create with getStyles
content = content.replace("const styles = StyleSheet.create({", "const getStyles = () => StyleSheet.create({")

# Inject getStyles call at the top of ProfileScreen
# Look for export default function ProfileScreen({ ... }) {
# Actually just inject it after const { isDark, toggleTheme } = useTheme();
content = content.replace(
    "const { isDark, toggleTheme } = useTheme();",
    "const { isDark, toggleTheme } = useTheme();\n  const styles = getStyles();"
)

with open('src/components/ProfileScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
