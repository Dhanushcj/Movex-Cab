const fs = require('fs');

const appPath = 'd:\\\\Cab Application\\\\customer-app\\\\App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

if (!appCode.includes('@react-native-firebase/messaging')) {
  // Add imports
  const imports = `
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
`;
  appCode = appCode.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';" + imports);

  // Configure Notifications handler for foreground display
  const notificationsConfig = `
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
`;
  appCode = appCode.replace("export default function App() {", notificationsConfig + "\nexport default function App() {");

  // Add useEffect to App component
  const foregroundEffect = `
  useEffect(() => {
    // Request permission (mostly for iOS)
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };
    
    requestUserPermission();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Foreground push notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'New Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
        },
        trigger: null, // show immediately
      });
    });

    return unsubscribe;
  }, []);
`;
  appCode = appCode.replace("export default function App() {\n", "export default function App() {\n" + foregroundEffect);
  
  fs.writeFileSync(appPath, appCode, 'utf8');
  console.log('App.tsx successfully updated with Push Notification configuration.');
} else {
  console.log('App.tsx already contains messaging.');
}
