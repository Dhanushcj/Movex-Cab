export default {
  "expo": {
    "name": "customer-app",
    "slug": "customer-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
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
        "android.permission.POST_NOTIFICATIONS"
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
        "projectId": "a73c2161-71de-4556-9982-57bd43f2925e"
      }
    },
    "newArchEnabled": true
  }
};