const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject Driver states
const driverHomeFunctionHeaderRegex = /(function DriverHomeScreen\([^)]*\)\s*\{)([\s\S]*?)(const \[isOnline, setIsOnline\] = useState)/;
if (driverHomeFunctionHeaderRegex.test(content)) {
  const replacement = `$1$2  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);\n  const [showNotificationScreen, setShowNotificationScreen] = useState(false);\n  $3`;
  if (!content.includes('const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);', content.indexOf('function DriverHomeScreen'))) {
    content = content.replace(driverHomeFunctionHeaderRegex, replacement);
    console.log("Added states to DriverHomeScreen");
  }
}

// 2. Inject Modals to DriverHomeScreen
const driverReturnRegex = /(return \([\s\S]*?<View style=\{styles\.container\}>\s*\{isOnline \? \(\s*<>\s*)([\s\S]*?)(<View style=\{\{ flex: 1)/;
if (driverReturnRegex.test(content)) {
  const driverModals = `\n      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />\n      `;
  
  if (!content.includes('<EmergencyScreen visible={showEmergencyScreen}', content.indexOf('function DriverHomeScreen'))) {
    content = content.replace(driverReturnRegex, `$1${driverModals}$2$3`);
    console.log("Added Modals to DriverHomeScreen");
  }
}

// 3. Driver SOS Button
const driverSosBtnRegex = /<TouchableOpacity style=\{\{\s*width: 40,\s*height: 40,\s*borderRadius: 20,\s*backgroundColor: '#FEECEC',\s*borderWidth: 1\.5,\s*borderColor: '#F71313',\s*alignItems: 'center',\s*justifyContent: 'center'\s*\}\}>\s*<Feather name="alert-triangle" size=\{18\} color="#F71313" \/>\s*<\/TouchableOpacity>/g;
content = content.replace(driverSosBtnRegex, `<TouchableOpacity onPress={() => setShowEmergencyScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEECEC', borderWidth: 1.5, borderColor: '#F71313', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="alert-triangle" size={18} color="#F71313" />
                  </TouchableOpacity>`);

// 4. Driver Bell Button
const driverBellBtnRegex = /<TouchableOpacity style=\{\{\s*width: 40,\s*height: 40,\s*borderRadius: 20,\s*backgroundColor: '#F6F8FE',\s*borderWidth: 1\.2,\s*borderColor: '#9098A2',\s*alignItems: 'center',\s*justifyContent: 'center'\s*\}\}>\s*<Feather name="bell" size=\{18\} color="#9098A2" \/>\s*<\/TouchableOpacity>/g;
content = content.replace(driverBellBtnRegex, `<TouchableOpacity onPress={() => setShowNotificationScreen(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F6F8FE', borderWidth: 1.2, borderColor: '#9098A2', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="bell" size={18} color="#9098A2" />
                  </TouchableOpacity>`);

fs.writeFileSync(path, content, 'utf8');
console.log("Done fixing driver screens in App.tsx");
