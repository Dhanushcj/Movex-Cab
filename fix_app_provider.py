with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'ThemeProvider' not in content:
    content = content.replace("import { LanguageProvider, useLanguage } from './src/context/LanguageContext';", "import { LanguageProvider, useLanguage } from './src/context/LanguageContext';\nimport { ThemeProvider, useTheme } from './src/context/ThemeContext';")

# Add RootWrapper
wrapper_code = '''
function RootWrapper() {
  const { isDark } = useTheme();
  return <NavigationRoot key={isDark ? 'dark' : 'light'} />;
}
'''
if 'function RootWrapper()' not in content:
    content = content.replace('export default function App() {', wrapper_code + '\nexport default function App() {')

# Add ThemeProvider
if '<ThemeProvider>' not in content:
    content = content.replace('<NavigationRoot />', '<ThemeProvider>\n              <RootWrapper />\n            </ThemeProvider>')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
