const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// The bad lines inside NavigationRoot:
//       <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
//       <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />

const badNavigationModals = `      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />\n`;

content = content.replace(badNavigationModals, '');

fs.writeFileSync(path, content, 'utf8');
console.log("Removed rogue modals from NavigationRoot");
