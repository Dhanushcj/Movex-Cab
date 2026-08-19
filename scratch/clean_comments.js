const fs = require('fs');

const cleanFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  // Remove all {/* ... */} comments
  content = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  fs.writeFileSync(path, content, 'utf8');
};

cleanFile('d:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\EmergencyScreen.tsx');
cleanFile('d:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\NotificationScreen.tsx');
// Also clean App.tsx just in case we injected a bad comment somewhere in there?
// Wait, App.tsx has lots of JSX comments that are perfectly fine, maybe let's not touch App.tsx entirely unless we must.
// But Emergency and Notification screens were newly created, so they're the suspects!
console.log("Cleaned all JSX comments from EmergencyScreen and NotificationScreen");
