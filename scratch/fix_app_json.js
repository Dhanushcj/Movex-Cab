const fs = require('fs');

const apps = [
    'd:\\Cab Application\\customer-app\\app.json',
    'd:\\Cab Application\\driver-app\\app.json'
];

apps.forEach(app => {
    const data = JSON.parse(fs.readFileSync(app, 'utf8'));

    // 1. Add newArchEnabled: false
    data.expo.newArchEnabled = false;

    // 2. Add react-native-maps to plugins
    const plugins = data.expo.plugins || [];
    
    // Remove if already exists
    const filteredPlugins = plugins.filter(p => {
        if (Array.isArray(p)) return p[0] !== 'react-native-maps';
        return p !== 'react-native-maps';
    });

    // Add with API Key
    filteredPlugins.push([
        "react-native-maps",
        {
            "androidGoogleMapsApiKey": "AIzaSyBGE1_F2LBc8HMXvlXloBAgzd7GaN9iJds"
        }
    ]);

    data.expo.plugins = filteredPlugins;

    fs.writeFileSync(app, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${app}`);
});
