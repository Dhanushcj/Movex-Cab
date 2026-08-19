const fs = require('fs');
const files = [
    'd:\\Cab Application\\customer-app\\App.tsx',
    'd:\\Cab Application\\driver-app\\App.tsx'
];
files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the broken generics caused by the previous replace script
    content = content.replace(/useRef<MapView provider=\{PROVIDER_GOOGLE\}>/g, 'useRef<MapView>');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax error in ${filePath}`);
});
