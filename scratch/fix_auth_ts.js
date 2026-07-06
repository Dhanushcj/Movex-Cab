const fs = require('fs');

// 1. Fix ProfileEditScreen.tsx
const pathProfileEdit = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\ProfileEditScreen.tsx';
let profileEditContent = fs.readFileSync(pathProfileEdit, 'utf8');

if (!profileEditContent.includes('Alert,')) {
  profileEditContent = profileEditContent.replace(
    `import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, KeyboardAvoidingView } from 'react-native';`,
    `import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';`
  );
  fs.writeFileSync(pathProfileEdit, profileEditContent, 'utf8');
}

// 2. Fix AuthContext.tsx
const pathAuthContext = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\context\\\\AuthContext.tsx';
let authContextContent = fs.readFileSync(pathAuthContext, 'utf8');

// Fix updateProfile firebase signature
authContextContent = authContextContent.replace(
  `await updateProfile(userCredential.user as any, { displayName: name });`,
  `await (userCredential.user as any).updateProfile({ displayName: name });`
);

// Fix sendEmailVerification
authContextContent = authContextContent.replace(
  `await userCredential.user.sendEmailVerification();`,
  `await (userCredential.user as any).sendEmailVerification();`
);

// Add updateProfile to Provider value
const targetProvider = `updateOnlineStatus,`;
const replaceProvider = `updateOnlineStatus,\n    updateProfile,`;
if (authContextContent.includes(targetProvider)) {
  authContextContent = authContextContent.replace(targetProvider, replaceProvider);
}

fs.writeFileSync(pathAuthContext, authContextContent, 'utf8');

console.log('TypeScript errors fixed');
