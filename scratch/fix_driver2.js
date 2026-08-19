const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const anchor = 'const [isOnline, setIsOnline] = useState(user?.isOnline || false);';
const statesToAdd = `\n  const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);\n  const [showNotificationScreen, setShowNotificationScreen] = useState(false);`;

if (!content.includes('const [showEmergencyScreen, setShowEmergencyScreen] = useState(false);', content.indexOf('function DriverHomeScreen'))) {
  // we can just replace the first instance of anchor that occurs AFTER DriverHomeScreen
  const driverIndex = content.indexOf('function DriverHomeScreen');
  const anchorIndex = content.indexOf(anchor, driverIndex);
  if (anchorIndex !== -1) {
    content = content.slice(0, anchorIndex) + anchor + statesToAdd + content.slice(anchorIndex + anchor.length);
    console.log("Added states to DriverHomeScreen successfully!");
  }
}

fs.writeFileSync(path, content, 'utf8');
