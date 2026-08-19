const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import EmergencyScreen
if (!content.includes('import EmergencyScreen')) {
  content = content.replace(
    `import CustomerWalletScreen from './src/components/CustomerWalletScreen';`,
    `import CustomerWalletScreen from './src/components/CustomerWalletScreen';\nimport EmergencyScreen from './src/components/EmergencyScreen';`
  );
}

// 2. Add state
if (!content.includes('const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);')) {
  content = content.replace(
    `  const [showWalletModal, setShowWalletModal] = useState(false);`,
    `  const [showWalletModal, setShowWalletModal] = useState(false);\n  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);`
  );
}

// 3. Update handleSOS
const oldHandleSOS = `  const handleSOS = () => Alert.alert('Emergency SOS',
    'Are you in danger? Do you want to call Police or Ambulance?\\n\\nFor this demo, we will notify our support team.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Police', onPress: () => Alert.alert('Calling Police...') },
      { text: 'Call Ambulance', onPress: () => Alert.alert('Calling Ambulance...') }
    ]
  );`;
const newHandleSOS = `  const handleSOS = () => setShowEmergencyScreen(true);`;
if (content.includes(oldHandleSOS)) {
  content = content.replace(oldHandleSOS, newHandleSOS);
}

// 4. Update Driver SOS buttons
const driverSos1 = `<TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`;
const driverSos2 = `<TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`;

// Just replace all occurrences of this exact block with onPress={handleSOS}
// Wait, the indentation might be slightly different. Let's use regex.
const driverSosRegex = /<TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>\s*<Feather name="alert-triangle" size={18} color="#F71313" \/>\s*<\/TouchableOpacity>/g;

content = content.replace(driverSosRegex, `<TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`);

// 5. Render EmergencyScreen
if (!content.includes('<EmergencyScreen')) {
  const renderPoint = `{/* ─────────────────── WALLET MODAL ─────────────────── */}`;
  content = content.replace(renderPoint, `<EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n\n      {/* ─────────────────── WALLET MODAL ─────────────────── */}`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx updated for EmergencyScreen');
