const fs = require('fs');

const files = [
    'd:\\Cab Application\\customer-app\\App.tsx',
    'd:\\Cab Application\\driver-app\\App.tsx'
];

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Add PROVIDER_GOOGLE to the import
    if (!content.includes('PROVIDER_GOOGLE')) {
        content = content.replace(
            /import MapView, \{ Marker/g, 
            'import MapView, { Marker, PROVIDER_GOOGLE'
        );
        // If they didn't have Marker (unlikely based on my earlier check), fallback
        if (content === fs.readFileSync(filePath, 'utf8')) {
            content = content.replace(
                /import MapView from 'react-native-maps';/g,
                "import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';"
            );
        }
    }

    // 2. Add provider={PROVIDER_GOOGLE} to all <MapView> tags
    // We match <MapView and add provider={PROVIDER_GOOGLE} if it's not already there.
    content = content.replace(/<MapView(?![^>]*provider=\{PROVIDER_GOOGLE\})/g, '<MapView provider={PROVIDER_GOOGLE}');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added PROVIDER_GOOGLE to ${filePath}`);
});
