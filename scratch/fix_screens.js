const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix Customer handleSOS
const oldHandleSOS = `  const handleSOS = () => Alert.alert('Emergency SOS',
    'This will send your live location and alert local authorities.',
    [{ text: 'Cancel', style: 'cancel' },
     { text: 'SEND ALERT', style: 'destructive', onPress: () => Alert.alert('SOS Triggered', 'Authorities notified.') }]
  );`;
if (content.includes(oldHandleSOS)) {
  content = content.replace(oldHandleSOS, `  const handleSOS = () => setShowEmergencyScreen(true);`);
  console.log("Replaced handleSOS in HomeScreen");
} else {
  // Try regex in case of slight whitespace difference
  const handleSOSRegex = /const handleSOS = \(\) => Alert\.alert\('Emergency SOS',[\s\S]*?\);/;
  content = content.replace(handleSOSRegex, `const handleSOS = () => setShowEmergencyScreen(true);`);
  console.log("Replaced handleSOS using Regex");
}

// 2. Add Bell to Customer
const customerSosBlock = `<TouchableOpacity onPress={handleSOS} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="alert-triangle" size={18} color="#F71313" />
                    </TouchableOpacity>`;
const customerBellBlock = `
                    <TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="bell" size={18} color="#9098A2" />
                    </TouchableOpacity>`;

// Ensure we don't duplicate if it already exists
if (!content.includes('onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: \'#F6F8FE\'')) {
    // Only in customer top bar, which is right after user initials/greeting
    content = content.replace(customerSosBlock, customerSosBlock + customerBellBlock);
    console.log("Added Bell to Customer");
}

// 3. Driver HomeScreen States
const driverHomeStart = `function DriverHomeScreen({ onRideAccepted, onNavigateProfile, onNavigateHistory, onNavigateWallet }: { onRideAccepted: (ride: any) => void; onNavigateProfile: () => void; onNavigateHistory: () => void; onNavigateWallet: () => void; }) {
  const { user, updateDriverLocation } = useAuth();
  const { location } = useLocation();`;
const driverHomeStates = `
  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);
  const [showNotificationScreen, setShowNotificationScreen] = useState(false);`;

if (!content.includes('const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);', content.indexOf('function DriverHomeScreen'))) {
    content = content.replace(driverHomeStart, driverHomeStart + driverHomeStates);
    console.log("Added states to DriverHomeScreen");
}

// 4. Update Driver SOS buttons
const driverSosBtn = `<TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`;
const driverSosBtnWithPress = `<TouchableOpacity onPress={() => setShowEmergencyScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`;
content = content.split(driverSosBtn).join(driverSosBtnWithPress);

// 5. Update Driver Bell buttons
const driverBellBtn = `<TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="bell" size={18} color="#9098A2" />
                  </TouchableOpacity>`;
const driverBellBtnWithPress = `<TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="bell" size={18} color="#9098A2" />
                  </TouchableOpacity>`;
content = content.split(driverBellBtn).join(driverBellBtnWithPress);

// 6. Inject Modals into DriverHomeScreen
// Let's find the closing tag of DriverHomeScreen main return.
// DriverHomeScreen returns <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
// We can just look for the first occurrence of:
const driverModals = `
      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />
`;
const driverReturnView = `  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>`;
if (!content.includes('<EmergencyScreen visible={showEmergencyScreen}', content.indexOf('function DriverHomeScreen'))) {
    content = content.replace(driverReturnView, driverReturnView + driverModals);
    console.log("Added Modals to DriverHomeScreen");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done fixing screens in App.tsx");
