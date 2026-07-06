const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import NotificationScreen
if (!content.includes('import NotificationScreen')) {
  content = content.replace(
    `import EmergencyScreen from './src/components/EmergencyScreen';`,
    `import EmergencyScreen from './src/components/EmergencyScreen';\nimport NotificationScreen from './src/components/NotificationScreen';`
  );
}

// 2. Add state
if (!content.includes('const [showNotificationScreen, setShowNotificationScreen] = useState(false);')) {
  content = content.replace(
    `  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);`,
    `  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);\n  const [showNotificationScreen, setShowNotificationScreen] = useState(false);`
  );
}

// 3. Render NotificationScreen
if (!content.includes('<NotificationScreen')) {
  const renderPoint = `<EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />`;
  content = content.replace(renderPoint, `<EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />`);
}

// 4. Add Notification Bell to Customer Home map (around line 816)
// Let's replace the whole View containing the SOS button for the customer.
// It's the one inside the floating top header on map.
const customerTopBarSearch = `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="alert-triangle" size={18} color="#F71313" />
                    </TouchableOpacity>
                  </View>`;

const customerTopBarReplacement = `<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="alert-triangle" size={18} color="#F71313" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="bell" size={18} color="#9098A2" />
                    </TouchableOpacity>
                  </View>`;

if (content.includes(customerTopBarSearch)) {
  content = content.replace(customerTopBarSearch, customerTopBarReplacement);
} else {
  // If exact whitespace matching fails, let's use a robust approach
  console.log("Warning: Exact match for customer top bar failed. Searching flexibly.");
  const customerSosRegex = /<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>\s*<TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>\s*<Feather name="alert-triangle" size={18} color="#F71313" \/>\s*<\/TouchableOpacity>\s*<\/View>/;
  if (customerSosRegex.test(content)) {
    content = content.replace(customerSosRegex, customerTopBarReplacement);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('App.tsx updated with Notification Screen');
