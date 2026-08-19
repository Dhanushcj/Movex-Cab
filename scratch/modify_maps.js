const fs = require('fs');
const filePath = 'd:\\Cab Application\\customer-app\\App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Handle self-closing MapViews first
content = content.replace(/<MapView([^>]*?)\/>/g, (match, p1) => {
    return `<MapView${p1} mapType="none">\n  <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />\n</MapView>`;
});

// Handle opening MapViews
content = content.replace(/<MapView([^>]*?)>/g, (match, p1) => {
    // If we just added mapType="none" above, it will have mapType="none"
    if (p1.includes('mapType="none"')) return match;
    return `<MapView${p1} mapType="none">\n  <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('customer-app/App.tsx MapView replaced successfully');
