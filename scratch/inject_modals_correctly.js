const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalsCode = `
      <EmergencyScreen visible={showEmergencyScreen} onClose={() => setShowEmergencyScreen(false)} />
      <NotificationScreen visible={showNotificationScreen} onClose={() => setShowNotificationScreen(false)} />`;

// Helper to inject modals for a specific component
function injectModals(componentName) {
  const componentIndex = content.indexOf(`function ${componentName}(`);
  if (componentIndex === -1) {
    console.log(`Could not find ${componentName}`);
    return;
  }

  // Find the return statement for this component
  const returnRegex = /return \(\s*<View style=\{styles\.container\}>/g;
  returnRegex.lastIndex = componentIndex;
  const match = returnRegex.exec(content);

  if (match) {
    const matchEndIndex = match.index + match[0].length;
    // Check if modals are already injected right after
    const nextFewChars = content.substring(matchEndIndex, matchEndIndex + 100);
    if (!nextFewChars.includes('EmergencyScreen')) {
      content = content.substring(0, matchEndIndex) + modalsCode + content.substring(matchEndIndex);
      console.log(`Injected modals into ${componentName}`);
    } else {
      console.log(`Modals already present in ${componentName}`);
    }
  } else {
    console.log(`Could not find return statement for ${componentName}`);
  }
}

injectModals('HomeScreen');
injectModals('DriverHomeScreen');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
