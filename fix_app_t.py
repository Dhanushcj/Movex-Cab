with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For LocationPickerScreen
content = content.replace(
    'const { location, geocodeSearch } = useLocation();\n\n  const [activeField',
    'const { location, geocodeSearch } = useLocation();\n  const { t } = useLanguage();\n\n  const [activeField'
)

# For HomeScreen, maybe the previous replace failed because it was slightly different?
content = content.replace(
    'const { user, logout, updateUserWallet } = useAuth();\n  const { location, locationAddress',
    'const { user, logout, updateUserWallet } = useAuth();\n  const { t } = useLanguage();\n  const { location, locationAddress'
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
