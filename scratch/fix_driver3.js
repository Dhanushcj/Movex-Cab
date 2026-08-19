const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove from offline dashboard
const badModals = `\n      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />\n      `;
content = content.replace(badModals, '');

// Driver HomeScreen has <View style={styles.container}> as its root wrapper.
// We can find the end of DriverHomeScreen.
// The easiest way is to inject it right AFTER <View style={styles.container}>.
// Let's find:
//   return (
//     <View style={styles.container}>
//       {isOnline ? (

const correctPlacement = `  return (\n    <View style={styles.container}>\n      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />\n      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />`;

const driverReturnRegex = /return \(\s*<View style=\{styles\.container\}>/;
if (driverReturnRegex.test(content)) {
  content = content.replace(driverReturnRegex, correctPlacement);
  console.log("Moved Modals to top of DriverHomeScreen return");
}

fs.writeFileSync(path, content, 'utf8');
