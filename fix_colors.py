with open('src/constants/colors.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the default export if it's currently a direct export
content = content.replace('export default lightColors;', '')

new_logic = '''
// Mutable global object for dynamic theming
const Colors: ThemeColors = { ...lightColors };

export const setGlobalThemeColors = (isDark: boolean) => {
  const newTheme = isDark ? darkColors : lightColors;
  for (const key in newTheme) {
    (Colors as any)[key] = (newTheme as any)[key];
  }
};

export default Colors;
'''

if 'setGlobalThemeColors' not in content:
    with open('src/constants/colors.ts', 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n' + new_logic)

with open('src/context/ThemeContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "import { lightColors, darkColors, ThemeColors } from '../constants/colors';",
    "import { lightColors, darkColors, ThemeColors, setGlobalThemeColors } from '../constants/colors';"
)

content = content.replace(
    "if (theme === 'dark') setIsDark(true);",
    "if (theme === 'dark') { setIsDark(true); setGlobalThemeColors(true); }"
)

content = content.replace(
    "const newTheme = !prev;\n      SecureStore.setItemAsync('app_theme', newTheme ? 'dark' : 'light');",
    "const newTheme = !prev;\n      setGlobalThemeColors(newTheme);\n      SecureStore.setItemAsync('app_theme', newTheme ? 'dark' : 'light');"
)

with open('src/context/ThemeContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
