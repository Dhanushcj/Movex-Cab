const fs = require('fs');

const files = [
    'd:\\Cab Application\\customer-app\\App.tsx',
    'd:\\Cab Application\\driver-app\\App.tsx'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove mapType="none"
    content = content.replace(/ mapType="none"/g, '');
    
    // 2. Remove the UrlTile component completely (it spans multiple lines or has spaces)
    // We use a regex that matches <UrlTile ... />
    content = content.replace(/[ \t]*<UrlTile[^>]+>\s*/g, '');
    content = content.replace(/[ \t]*<UrlTile[^>]+\/>\s*/g, '');

    // 3. Remove the import of UrlTile if we modified it
    // Wait, earlier I did `import MapView, { Marker, UrlTile } from 'react-native-maps';`
    content = content.replace(/, UrlTile /g, ' ');
    content = content.replace(/, UrlTile}/g, '}');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reverted ${filePath} to native Google Maps`);
});
