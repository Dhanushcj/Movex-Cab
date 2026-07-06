with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if "import { ThemeProvider" not in content:
    content = content.replace(
        "import { LanguageProvider, useLanguage } from './src/context/LanguageContext';",
        "import { LanguageProvider, useLanguage } from './src/context/LanguageContext';\nimport { ThemeProvider, useTheme } from './src/context/ThemeContext';"
    )

# 2. Add ThemeProvider wrap
content = content.replace(
    '''      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <SocketProvider>
              <NavigationRoot />
            </SocketProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>''',
    '''      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <SocketProvider>
                <NavigationRoot />
              </SocketProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>'''
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
