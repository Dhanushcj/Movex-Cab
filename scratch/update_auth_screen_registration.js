const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\AuthScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add confirmPassword state
if (!content.includes("const [confirmPassword, setConfirmPassword] = useState('');")) {
  content = content.replace(
    "const [password, setPassword] = useState('');",
    "const [password, setPassword] = useState('');\n  const [confirmPassword, setConfirmPassword] = useState('');"
  );
}

// 2. Fix handleLogin
const brokenHandleLogin = `      if (isGoogleRegister) {
        if (role === 'driver') {
          success = await completeGoogleRegistration('driver', name, dob, gender, googleIdToken);
        } else {
          success = await completeGoogleRegistration('customer', name, dob, gender, googleIdToken);
        }
      } else {
        if (role === 'driver') {
          success = await registerWithEmail(email, password, name, 'driver');
        } else {
          success = await registerWithEmail(email, password, name, 'customer');
        }
      }`;

const fixedHandleLogin = `      if (role === 'driver') {
        success = await loginWithEmail(email, password, 'driver');
      } else if (role === 'admin') {
        success = await loginWithEmail(email, password, 'admin');
      } else {
        success = await loginWithEmail(email, password, 'customer');
      }`;

content = content.replace(brokenHandleLogin, fixedHandleLogin);

// 3. Update handleRegister
const oldHandleRegister = `      // Note: we pass role to registerWithEmail
      success = await registerWithEmail(email, password, name, role);`;

const newHandleRegister = `      if (isGoogleRegister) {
        success = await completeGoogleRegistration(role, name, dob, gender, googleIdToken);
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
      }`;

content = content.replace(oldHandleRegister, newHandleRegister);

// 4. Update the UI inputs to add confirmPassword and phone for customers
const oldInputs = `          {!isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#7C848D"
                  secureTextEntry
                  style={styles.inputText}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
          )}`;

const newInputs = `          {mode === 'register' && !isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter mobile number"
                  placeholderTextColor="#7C848D"
                  keyboardType="phone-pad"
                  style={styles.inputText}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          )}

          {!isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#7C848D"
                  secureTextEntry
                  style={styles.inputText}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
          )}
          
          {mode === 'register' && !isGoogleRegister && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#7C848D"
                  secureTextEntry
                  style={styles.inputText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          )}`;

content = content.replace(oldInputs, newInputs);

fs.writeFileSync(path, content, 'utf8');
console.log('Done modifying AuthScreen.tsx');
