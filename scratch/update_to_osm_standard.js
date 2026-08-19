const fs = require('fs');

const files = [
    'd:\\Cab Application\\customer-app\\App.tsx',
    'd:\\Cab Application\\driver-app\\App.tsx'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace CartoDB URL with OSM Standard / HOT URL
    // Standard OSM: https://tile.openstreetmap.org/{z}/{x}/{y}.png
    // HOT OSM (Humanitarian): https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
    
    // We will use HOT OSM because it's vibrant, colorful, and has high density of shops and street names.
    content = content.replace(
        /urlTemplate="https:\/\/basemaps\.cartocdn\.com\/rastertiles\/voyager\/\{z\}\/\{x\}\/\{y\}\.png"/g,
        'urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath} to Standard OpenStreetMap`);
});
