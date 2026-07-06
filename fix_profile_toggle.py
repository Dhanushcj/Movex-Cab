with open('src/components/ProfileScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTheme import
if 'useTheme' not in content:
    content = content.replace(
        "import { useLanguage } from '../context/LanguageContext';",
        "import { useLanguage } from '../context/LanguageContext';\nimport { useTheme } from '../context/ThemeContext';"
    )

# Add useTheme hook
if 'const { isDark, toggleTheme } = useTheme();' not in content:
    content = content.replace(
        'const { t } = useLanguage();',
        'const { t } = useLanguage();\n  const { isDark, toggleTheme } = useTheme();'
    )

# Update renderOptionRow signature and JSX
content = content.replace(
    'const renderOptionRow = (titleKey: string, showToggle: boolean = false, onPress?: () => void) => (',
    'const renderOptionRow = (titleKey: string, showToggle: boolean = false, onPress?: () => void, toggleState: boolean = false) => ('
)

# Update toggle switch styling in renderOptionRow
old_toggle = '''
      {showToggle ? (
        <View style={styles.toggleTrack}>
          <View style={styles.toggleThumb} />
        </View>
'''
new_toggle = '''
      {showToggle ? (
        <View style={[styles.toggleTrack, toggleState && { backgroundColor: '#0053B3' }]}>
          <View style={[styles.toggleThumb, toggleState && { transform: [{ translateX: 28 }] }]} />
        </View>
'''
content = content.replace(old_toggle.strip(), new_toggle.strip())

# Update the call for darkTheme
content = content.replace(
    "{renderOptionRow('darkTheme', true)}",
    "{renderOptionRow('darkTheme', true, toggleTheme, isDark)}"
)

with open('src/components/ProfileScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
