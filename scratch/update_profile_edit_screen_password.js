const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\ProfileEditScreen.tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables
if (!content.includes('const [oldPassword, setOldPassword] = useState')) {
  content = content.replace(
    `const [password, setPassword] = useState('');`,
    `const [oldPassword, setOldPassword] = useState('');\n  const [newPassword, setNewPassword] = useState('');\n  const [confirmNewPassword, setConfirmNewPassword] = useState('');\n  const [changePasswordExpanded, setChangePasswordExpanded] = useState(false);`
  );
}

// 2. Replace the single password field with the toggle and 3 fields
const oldPasswordField = `            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="New Password (Optional)" placeholderTextColor="#7C848D" secureTextEntry />
            </View>`;

const newPasswordSection = `            <TouchableOpacity style={styles.bankHeader} onPress={() => setChangePasswordExpanded(!changePasswordExpanded)} activeOpacity={0.8}>
              <Text style={styles.sectionTitle}>Change Password</Text>
              <Feather name={changePasswordExpanded ? 'chevron-down' : 'chevron-right'} size={24} color="#262D36" />
            </TouchableOpacity>

            {changePasswordExpanded && (
              <View style={[styles.cardBlock, { marginTop: -10, paddingTop: 10, backgroundColor: 'transparent' }]}>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={oldPassword} onChangeText={setOldPassword} placeholder="Old Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="New Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={confirmNewPassword} onChangeText={setConfirmNewPassword} placeholder="Confirm New Password" placeholderTextColor="#7C848D" secureTextEntry />
                </View>
              </View>
            )}`;

content = content.replace(oldPasswordField, newPasswordSection);

fs.writeFileSync(path, content, 'utf8');
console.log('ProfileEditScreen changed for password change option');
