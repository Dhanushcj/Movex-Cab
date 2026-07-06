const fs = require('fs');

const files = [
    'd:\\Cab Application\\customer-app\\App.tsx',
    'd:\\Cab Application\\driver-app\\App.tsx'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace OSM URL with CartoDB Voyager URL (which doesn't block generic User-Agents)
    // Also add shouldReplaceMapContent={true}
    content = content.replace(
        /urlTemplate="https:\/\/{s}\.tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png" maximumZ=\{19\}/g,
        'urlTemplate="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" maximumZ={19} shouldReplaceMapContent={true}'
    );

    // If they were already replaced but without shouldReplaceMapContent, we can catch them:
    content = content.replace(
        /urlTemplate="https:\/\/basemaps\.cartocdn\.com\/rastertiles\/voyager\/\{z\}\/\{x\}\/\{y\}\.png" maximumZ=\{19\} \/>/g,
        'urlTemplate="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" maximumZ={19} shouldReplaceMapContent={true} />'
    );

    // One more thing: some Android devices need mapType="standard" instead of "none" for UrlTile to show.
    // Let's change mapType="none" to mapType={Platform.OS === 'android' ? 'none' : 'standard'}
    // Or just "standard", since with shouldReplaceMapContent=true it covers the base map anyway!
    // But without Google API key, "standard" might crash or show "For development purposes only".
    // "none" is safer without API key.

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
});
