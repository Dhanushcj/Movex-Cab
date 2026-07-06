const fs = require('fs');
const filePath = 'd:\\Cab Application\\customer-app\\App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The replacement should be exact string or safe regex
content = content.replace(/useRef<MapView mapType="none">\n  <UrlTile urlTemplate="https:\/\/\{s\}\.tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png" maximumZ=\{19\} \/>/g, 'useRef<MapView>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed typings');
