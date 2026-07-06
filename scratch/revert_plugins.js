const fs = require('fs');

const apps = [
    'd:\\Cab Application\\customer-app\\app.json',
    'd:\\Cab Application\\driver-app\\app.json'
];

apps.forEach(app => {
    const data = JSON.parse(fs.readFileSync(app, 'utf8'));
    
    if (data.expo.plugins) {
        data.expo.plugins = data.expo.plugins.filter(p => {
            if (Array.isArray(p)) return p[0] !== 'react-native-maps';
            return p !== 'react-native-maps';
        });
    }
    
    // Ensure the apiKey is still there inside android.config.googleMaps
    if (!data.expo.android) data.expo.android = {};
    if (!data.expo.android.config) data.expo.android.config = {};
    if (!data.expo.android.config.googleMaps) data.expo.android.config.googleMaps = {};
    data.expo.android.config.googleMaps.apiKey = "AIzaSyBGE1_F2LBc8HMXvlXloBAgzd7GaN9iJds";
    
    fs.writeFileSync(app, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Fixed plugins in ${app}`);
});
