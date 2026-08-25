const fs = require('fs');

const appPath = 'd:\\Movex-Cab-main\\customer-app\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');
const lines = content.split('\n');

// 1. Add Import
const importToAdd = "import DriverHomeScreen from './src/components/DriverHomeScreen';";
if (!content.includes(importToAdd)) {
    // find last import
    let lastImportIdx = -1;
    for(let i=0; i<lines.length; i++){
        if(lines[i].startsWith('import ')){
            lastImportIdx = i;
        }
    }
    if(lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, importToAdd);
    }
}

// 2. Remove local DriverHomeScreen function (lines 2784 to 3392 approximately)
// We will look for "function DriverHomeScreen" and the next navigation helper function
let startIdx = -1;
let endIdx = -1;

for(let i=0; i<lines.length; i++){
    if(startIdx === -1 && lines[i].includes('function DriverHomeScreen(')) {
        startIdx = i;
    }
    // Found the comment after the function ends
    if(startIdx !== -1 && i > startIdx && lines[i].includes('// Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡ Navigation Helper Functions')) {
        endIdx = i;
        break;
    }
}

if(startIdx !== -1 && endIdx !== -1) {
    // Remove the function
    lines.splice(startIdx, endIdx - startIdx);
    console.log(`Removed local DriverHomeScreen from line ${startIdx} to ${endIdx}`);
}

// 3. Remove onNavigateWallet from props
let contentNew = lines.join('\n');
contentNew = contentNew.replace(/onNavigateWallet=\{\(\) => props\.navigation\.navigate\('DriverWallet'\)\}\s*/g, '');

fs.writeFileSync(appPath, contentNew);
console.log('App.tsx fixed');
