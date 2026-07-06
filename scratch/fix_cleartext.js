const fs = require('fs');

const apps = [
    'd:\\Cab Application\\customer-app\\app.json',
    'd:\\Cab Application\\driver-app\\app.json'
];

apps.forEach(app => {
    try {
        const data = JSON.parse(fs.readFileSync(app, 'utf8'));

        // Initialize plugins if not exist
        if (!data.expo.plugins) {
            data.expo.plugins = [];
        }

        // Check if expo-build-properties is already there
        const buildPropsIndex = data.expo.plugins.findIndex(p => Array.isArray(p) && p[0] === 'expo-build-properties');
        
        if (buildPropsIndex > -1) {
            if (!data.expo.plugins[buildPropsIndex][1].android) {
                data.expo.plugins[buildPropsIndex][1].android = {};
            }
            data.expo.plugins[buildPropsIndex][1].android.usesCleartextTraffic = true;
        } else {
            data.expo.plugins.push([
                "expo-build-properties",
                {
                    "android": {
                        "usesCleartextTraffic": true
                    }
                }
            ]);
        }

        fs.writeFileSync(app, JSON.stringify(data, null, 2), 'utf8');
        console.log('Updated', app);
    } catch(e) {
        console.error('Error on', app, e.message);
    }
});
