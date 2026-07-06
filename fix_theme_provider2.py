with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''export default function App() {
    return (
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <SocketProvider>
              <NavigationRoot />
            </SocketProvider>
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    );
  }'''

replacement = '''export default function App() {
    return (
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <SocketProvider>
                <NavigationRoot />
              </SocketProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    );
  }'''

if target in content:
    content = content.replace(target, replacement)
else:
    print('Target not found! Attempting regex...')
    import re
    content = re.sub(
        r'<LanguageProvider>\s*<AuthProvider>\s*<LocationProvider>\s*<SocketProvider>\s*<NavigationRoot />\s*</SocketProvider>\s*</LocationProvider>\s*</AuthProvider>\s*</LanguageProvider>',
        '''<LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <LocationProvider>
              <SocketProvider>
                <NavigationRoot />
              </SocketProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>''',
        content
    )

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
