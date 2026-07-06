const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\AuthScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Re-enable password fields for Google Registration
const oldRegisterFields = `
    if (!password && !isGoogleRegister) {
      return Alert.alert('Required', 'Please enter a password');
    }`;

const newRegisterFields = `
    if (!password) {
      return Alert.alert('Required', 'Please enter a password');
    }`;
content = content.replace(oldRegisterFields, newRegisterFields);

// Update AuthScreen handleRegister
const oldHandleRegister = `        if (!phone) {
          setLoading(false);
          return Alert.alert('Error', 'Mobile number is required');
        }
        success = await completeGoogleRegistration(role, name, dob, gender, phone, googleIdToken);
      } else {
        if (password !== confirmPassword) {
          setLoading(false);
          return Alert.alert('Error', 'Passwords do not match');
        }
        if (!phone) {
          setLoading(false);
          return Alert.alert('Error', 'Mobile number is required');
        }
        success = await registerWithEmail(email, password, name, phone, role);
      }
      if (success) {
        Alert.alert('Success', 'Account created successfully!');
      }`;

const newHandleRegister = `        if (!phone) {
          setLoading(false);
          return Alert.alert('Error', 'Mobile number is required');
        }
        if (password !== confirmPassword) {
          setLoading(false);
          return Alert.alert('Error', 'Passwords do not match');
        }
        // pass the password down so backend can set it in Firebase
        success = await completeGoogleRegistration(role, name, dob, gender, phone, googleIdToken, password);
        if (success) {
          Alert.alert('Success', 'Google Account linked with a password successfully!');
        }
      } else {
        if (password !== confirmPassword) {
          setLoading(false);
          return Alert.alert('Error', 'Passwords do not match');
        }
        if (!phone) {
          setLoading(false);
          return Alert.alert('Error', 'Mobile number is required');
        }
        success = await registerWithEmail(email, password, name, phone, role);
        if (success) {
          Alert.alert('Verification Sent', 'Please check your email and verify before logging in.');
          setMode('login'); // Force login mode, wait for verification
        }
      }`;
content = content.replace(oldHandleRegister, newHandleRegister);

// Modify password UI fields in render to always show if registering
const oldPassUI = `{mode === 'register' && !isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>`;

const newPassUI = `{mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>`;
content = content.replace(oldPassUI, newPassUI);

const oldConfirmUI = `{mode === 'register' && !isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>`;

const newConfirmUI = `{mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>`;
content = content.replace(oldConfirmUI, newConfirmUI);

fs.writeFileSync(path, content, 'utf8');
console.log('AuthScreen updated for Google password and email verification');
