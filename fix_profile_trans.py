with open('src/components/ProfileScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("Profile", "{t('app.Profile')}")
content = content.replace("Edit Profile", "{t('app.EditProfile')}")
content = content.replace("Language", "{t('app.Language')}")
content = content.replace("Logout", "{t('app.Logout')}")
content = content.replace("Ride History", "{t('app.RideHistory')}")
content = content.replace("Wallet", "{t('app.Wallet')}")

with open('src/components/ProfileScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure App.tsx has useLanguage in HomeScreen
if 'const { t } = useLanguage();' not in content:
    content = content.replace('const { user, logout, updateUserWallet } = useAuth();', 'const { user, logout, updateUserWallet } = useAuth();\n  const { t } = useLanguage();')
    
if 'const { t } = useLanguage();' not in content.replace('function LocationPickerScreen', 'XXX'):
    # In LocationPickerScreen
    content = content.replace('const { location, geocodeSearch } = useLocation();', 'const { location, geocodeSearch } = useLocation();\n  const { t } = useLanguage();')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
