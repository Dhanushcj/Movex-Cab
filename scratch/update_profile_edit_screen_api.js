const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\ProfileEditScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const handleSaveCode = `  const handleSave = async () => {
    try {
      if (newPassword || oldPassword || confirmNewPassword) {
        if (!oldPassword) return Alert.alert('Error', 'Please enter your old password');
        if (newPassword !== confirmNewPassword) return Alert.alert('Error', 'New passwords do not match');
      }
      
      const payload: any = { name, phone };
      if (user?.role === 'driver') {
        payload.city = city;
        payload.vehicleType = vehicleType;
        payload.plate = plate;
        payload.bankName = bankName;
        payload.accountNo = accountNo;
        payload.ifsc = ifsc;
      }
      if (oldPassword && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      Alert.alert('Success', 'Profile updated successfully');
      onSave();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    }
  };`;

// replace handleSave
content = content.replace(
  `  const handleSave = () => {
    // In a real app we'd save the profile data back to the server here.
    onSave();
  };`,
  handleSaveCode
);

// import Alert
if (!content.includes('Alert')) {
  content = content.replace(
    `import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, KeyboardAvoidingView } from 'react-native';`,
    `import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';`
  );
}

// pull updateProfile from context
content = content.replace(
  `const { user } = useAuth();`,
  `const { user, updateProfile } = useAuth();`
);

fs.writeFileSync(path, content, 'utf8');
console.log('ProfileEditScreen handleSave updated');
