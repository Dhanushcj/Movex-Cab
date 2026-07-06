with open('src/components/RegistrationScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we don't duplicate
if 'const { colors: Colors } = useTheme();' not in content[:3000]:
    content = content.replace(
        'export default function RegistrationScreen({ onBack, prefillData = null, \nisCorrection = false }: { onBack: () => void, prefillData?: any, isCorrection?: boolean }) {',
        'export default function RegistrationScreen({ onBack, prefillData = null, \nisCorrection = false }: { onBack: () => void, prefillData?: any, isCorrection?: boolean }) {\n  const { colors: Colors } = useTheme();\n  const styles = useStyles(Colors);'
    )
    with open('src/components/RegistrationScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
print('Done')
