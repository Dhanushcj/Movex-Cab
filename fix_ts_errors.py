with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix missing onNavigateLanguage in HomeScreen instantiation
content = content.replace(
    "onNavigateProfileEdit={() => setActiveScreen('driverProfileEdit')} \n        />",
    "onNavigateProfileEdit={() => setActiveScreen('driverProfileEdit')} \n          onNavigateLanguage={() => setActiveScreen('customerLanguage')}\n        />"
)

# 2. Add 'customerLanguage' to activeScreen type
content = content.replace(
    "const [activeScreen, setActiveScreen] = useState<'onboarding' | 'login' | 'home' | 'tracking' | 'register' | 'driverProfile' | 'driverProfileEdit' | 'driverLanguage' | 'driverHistory' | 'driverWallet' | 'adminDashboard'>('onboarding');",
    "const [activeScreen, setActiveScreen] = useState<'onboarding' | 'login' | 'home' | 'tracking' | 'register' | 'driverProfile' | 'driverProfileEdit' | 'driverLanguage' | 'customerLanguage' | 'driverHistory' | 'driverWallet' | 'adminDashboard'>('onboarding');"
)

# 3. Add useTheme import if missing
if "import { useTheme } from './src/context/ThemeContext';" not in content:
    content = content.replace(
        "import { useLanguage } from './src/context/LanguageContext';",
        "import { useLanguage } from './src/context/LanguageContext';\nimport { useTheme } from './src/context/ThemeContext';"
    )

# 4. Fix TS error for map items: add type cast to the arrays
import re
content = re.sub(
    r"\[\s*\{\s*key: 'darkTheme'",
    "([ { key: 'darkTheme'",
    content
)
content = re.sub(
    r"\{ key: 'alertSound', icon: 'volume-2', color: '#0053B3' \},\s*\]\.map\(\(item, idx\)",
    "{ key: 'alertSound', icon: 'volume-2', color: '#0053B3' }, ] as any[]).map((item, idx)",
    content
)

content = re.sub(
    r"\[\s*\{\s*key: 'helpCentre'",
    "([ { key: 'helpCentre'",
    content
)
content = re.sub(
    r"\{ key: 'settings', icon: 'settings', color: '#0053B3' \},\s*\]\.map\(\(item, idx\)",
    "{ key: 'settings', icon: 'settings', color: '#0053B3' }, ] as any[]).map((item, idx)",
    content
)

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
