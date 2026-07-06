with open('src/components/RegistrationScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
if 'const styles = useStyles(Colors);' not in content:
    content = content.replace('export default function RegistrationScreen({ onBack, prefillData = null, \nisCorrection = false }: { onBack: () => void, prefillData?: any, isCorrection?: boolean }) {', 'export default function RegistrationScreen({ onBack, prefillData = null, \nisCorrection = false }: { onBack: () => void, prefillData?: any, isCorrection?: boolean }) {\n  const { colors: Colors } = useTheme();\n  const styles = useStyles(Colors);')
    with open('src/components/RegistrationScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

with open('src/components/TripCompletedPaymentSheet.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
if 'const styles = useStyles(Colors);' not in content:
    content = content.replace('export default function TripCompletedPaymentSheet({ amount, onPaymentComplete }: { amount: number, onPaymentComplete: (success: boolean) => void }) {', 'export default function TripCompletedPaymentSheet({ amount, onPaymentComplete }: { amount: number, onPaymentComplete: (success: boolean) => void }) {\n  const { colors: Colors } = useTheme();\n  const styles = useStyles(Colors);')
    with open('src/components/TripCompletedPaymentSheet.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

with open('src/components/VerticalSwipeButton.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
if 'const styles = useStyles(Colors);' not in content:
    content = content.replace('const VerticalSwipeButton: React.FC<VerticalSwipeButtonProps> = ({ onSwipeComplete, label }) => {', 'const VerticalSwipeButton: React.FC<VerticalSwipeButtonProps> = ({ onSwipeComplete, label }) => {\n  const { colors: Colors } = useTheme();\n  const styles = useStyles(Colors);')
    with open('src/components/VerticalSwipeButton.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

print('Success')
