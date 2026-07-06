with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HomeScreen props and hooks
content = content.replace(
    "function HomeScreen({ onRideBooked, onNavigateProfileEdit }: { onRideBooked: (ride: any) => void; onNavigateProfileEdit: () => void; }) {",
    "function HomeScreen({ onRideBooked, onNavigateProfileEdit, onNavigateLanguage }: { onRideBooked: (ride: any) => void; onNavigateProfileEdit: () => void; onNavigateLanguage: () => void; }) {"
)
content = content.replace(
    "  const { t } = useLanguage();\n  const { location, locationAddress, geocodeSearch } = useLocation();",
    "  const { t } = useLanguage();\n  const { isDark, toggleTheme } = useTheme();\n  const { location, locationAddress, geocodeSearch } = useLocation();"
)

# 2. Update HomeScreen usage
content = content.replace(
    "            onNavigateProfileEdit={() => setActiveScreen('customerProfileEdit')}\n          />",
    "            onNavigateProfileEdit={() => setActiveScreen('customerProfileEdit')}\n            onNavigateLanguage={() => setActiveScreen('customerLanguage')}\n          />"
)

# 3. Add customerLanguage route
content = content.replace(
    "      {activeScreen === 'driverLanguage' && (",
    "      {activeScreen === 'customerLanguage' && (\n        <LanguageScreen onBack={() => setActiveScreen('home')} />\n      )}\n      {activeScreen === 'driverLanguage' && ("
)

# 4. Replace the array map for options
import re
content = re.sub(
    r"\{\[\s*\{ icon: 'moon', label: 'Dark theme', color: '#0053B3', toggle: true \},\s*\{ icon: 'globe', label: 'App language', color: '#0053B3' \},\s*\{ icon: 'volume-2', label: 'Alert sound', color: '#0053B3' \},\s*\]\.map\(\(item, idx\) => \(",
    '''{[
                { key: 'darkTheme', icon: 'moon', color: '#0053B3', toggle: true },
                { key: 'appLanguage', icon: 'globe', color: '#0053B3', onPress: onNavigateLanguage },
                { key: 'alertSound', icon: 'volume-2', color: '#0053B3' },
              ].map((item, idx) => (''',
    content
)

# Replace the inner map logic
content = content.replace(
    "<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7}>",
    "<TouchableOpacity onPress={item.toggle ? toggleTheme : item.onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }} activeOpacity={0.7} disabled={!item.toggle && !item.onPress}>"
)

content = content.replace(
    "{item.label}</Text>",
    "{t('profile.' + item.key)}</Text>"
)

# Fix backgrounds
content = content.replace(
    "backgroundColor: '#FCFCFC', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20",
    "backgroundColor: Colors.bgSecondary, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20"
)

content = content.replace(
    "backgroundColor: '#F6F8FE'",
    "backgroundColor: Colors.iconBg"
)

content = content.replace(
    "backgroundColor: '#F3F4F6', marginHorizontal: -16",
    "backgroundColor: Colors.bgPrimary, marginHorizontal: -16"
)

content = content.replace(
    "color: '#262D36'",
    "color: Colors.textPrimary"
)

content = content.replace(
    "backgroundColor: '#DEE0E3', borderRadius: 16",
    "backgroundColor: Colors.borderGlass, borderRadius: 16 }, isDark && { backgroundColor: '#0053B3'"
)

content = content.replace(
    "backgroundColor: '#F5F5F5' }} />",
    "backgroundColor: '#F5F5F5' }, isDark && { transform: [{ translateX: 28 }] }]} />"
)

# Fix support block array
content = re.sub(
    r"\{\[\s*\{ icon: 'help-circle', label: 'Help Centre', color: '#0053B3' \},\s*\{ icon: 'message-square', label: 'Support tickets', color: '#0053B3' \},\s*\{ icon: 'settings', label: 'Settings', color: '#0053B3' \},\s*\]\.map\(\(item, idx\) => \(",
    '''{[
                { key: 'helpCentre', icon: 'help-circle', color: '#0053B3' },
                { key: 'supportTickets', icon: 'message-square', color: '#0053B3' },
                { key: 'settings', icon: 'settings', color: '#0053B3' },
              ].map((item, idx) => (''',
    content
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
