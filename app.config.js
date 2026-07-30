export default {
  "expo": {
    "name": "MoveX",
    "slug": "customer-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/app-icon.png",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff",
        "foregroundImage": "./assets/adaptive-icon.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.movex.app",
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      "notification": {
        "icon": "./assets/icon.png",
        "color": "#0053B3"
      },
      "permissions": [
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      "expo-font",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ],
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/messaging",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow MoveX to access your camera to scan QR codes for payments."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "72915a97-2e5f-447f-a669-d79fcb451955"
      }
    },
    "newArchEnabled": true
  }
};