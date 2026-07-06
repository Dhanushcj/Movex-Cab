const fs = require('fs');

const pathEmerg = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\EmergencyScreen.tsx';
let contentEmerg = fs.readFileSync(pathEmerg, 'utf8');

// Remove Spacer comment
contentEmerg = contentEmerg.replace(/<View style={{ width: 40 }} \/> \{\/\* Spacer \*\/}/g, '<View style={{ width: 40 }} />');

// Remove large comment
const largeComment = `{/* Note: The design shows an exclamation mark inside the shield, 
                  we'll simulate it by placing a shield icon. Since exact icon 
                  might not be in Feather, we can use MaterialCommunityIcons 'shield-alert-outline' */}`;
contentEmerg = contentEmerg.replace(largeComment, '');

fs.writeFileSync(pathEmerg, contentEmerg, 'utf8');

const pathNotif = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\NotificationScreen.tsx';
let contentNotif = fs.readFileSync(pathNotif, 'utf8');

// Remove Spacer comment
contentNotif = contentNotif.replace(/<View style={{ width: 40 }} \/> \{\/\* Spacer \*\/}/g, '<View style={{ width: 40 }} />');

fs.writeFileSync(pathNotif, contentNotif, 'utf8');

console.log("Cleaned up comments");
