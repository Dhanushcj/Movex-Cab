const fs = require('fs');

const contextPath = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\context\\\\AuthContext.tsx';
let context = fs.readFileSync(contextPath, 'utf8');

// Ensure messaging is imported
if (!context.includes("import messaging from '@react-native-firebase/messaging';")) {
  context = context.replace(
    "import auth from '@react-native-firebase/auth';", 
    "import auth from '@react-native-firebase/auth';\nimport messaging from '@react-native-firebase/messaging';"
  );
}

// Update handleFirebaseLogin to grab token
const newHandleFirebase = `
  const handleFirebaseLogin = async (idToken: string, role: string): Promise<boolean> => {
    try {
      let fcmToken = null;
      try {
        fcmToken = await messaging().getToken();
      } catch(e) {
        console.warn('Failed to get FCM token', e);
      }
      
      const response = await API.post('/auth/firebase-login', { idToken, role, fcmToken });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Backend firebase login failed:', error);
      throw error;
    }
  };
`;

if (!context.includes('let fcmToken = null;')) {
  context = context.replace(
    /const handleFirebaseLogin = async \([^)]*\): Promise<boolean> => \{[\s\S]*?catch \(error\) \{[\s\S]*?throw error;\s*\}\s*\};/,
    newHandleFirebase.trim()
  );
  fs.writeFileSync(contextPath, context, 'utf8');
  console.log('AuthContext successfully updated to include fcmToken.');
} else {
  console.log('AuthContext already includes fcmToken logic.');
}
