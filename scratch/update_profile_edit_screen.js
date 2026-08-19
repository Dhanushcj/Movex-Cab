const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\components\\\\ProfileEditScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldDriverDetails = `          {/* Driver Details */}
          <Text style={styles.sectionTitle}>Driver details</Text>
          <View style={styles.cardBlock}>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={plate} onChangeText={setPlate} />
            </View>
          </View>

          {/* Bank details header */}
          <TouchableOpacity style={styles.bankHeader} onPress={() => setBankExpanded(!bankExpanded)} activeOpacity={0.8}>
            <Text style={styles.sectionTitle}>Bank details</Text>
            <Feather name={bankExpanded ? 'chevron-down' : 'chevron-right'} size={24} color="#262D36" />
          </TouchableOpacity>

          {/* Bank details card */}
          {bankExpanded && (
            <View style={styles.cardBlock}>
              <Text style={styles.bankDetailText}>Bank Name: {bankName}</Text>
              <Text style={styles.bankDetailText}>Account No: {accountNo}</Text>
              <Text style={styles.bankDetailText}>IFSC Code : {ifsc}</Text>
            </View>
          )}`;

const newDriverDetails = `          {/* User Details */}
          <Text style={styles.sectionTitle}>{user?.role === 'driver' ? 'Driver details' : 'Personal details'}</Text>
          <View style={styles.cardBlock}>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor="#7C848D" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Mobile Number" placeholderTextColor="#7C848D" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="New Password (Optional)" placeholderTextColor="#7C848D" secureTextEntry />
            </View>
            
            {user?.role === 'driver' && (
              <>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#7C848D" />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="Vehicle Type" placeholderTextColor="#7C848D" />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} value={plate} onChangeText={setPlate} placeholder="Plate Number" placeholderTextColor="#7C848D" />
                </View>
              </>
            )}
          </View>

          {/* Bank details header - Only for Drivers */}
          {user?.role === 'driver' && (
            <>
              <TouchableOpacity style={styles.bankHeader} onPress={() => setBankExpanded(!bankExpanded)} activeOpacity={0.8}>
                <Text style={styles.sectionTitle}>Bank details</Text>
                <Feather name={bankExpanded ? 'chevron-down' : 'chevron-right'} size={24} color="#262D36" />
              </TouchableOpacity>

              {/* Bank details card */}
              {bankExpanded && (
                <View style={styles.cardBlock}>
                  <Text style={styles.bankDetailText}>Bank Name: {bankName}</Text>
                  <Text style={styles.bankDetailText}>Account No: {accountNo}</Text>
                  <Text style={styles.bankDetailText}>IFSC Code : {ifsc}</Text>
                </View>
              )}
            </>
          )}`;

content = content.replace(oldDriverDetails, newDriverDetails);

// Add password state
if (!content.includes('const [password, setPassword] = useState')) {
  content = content.replace(
    "const [name, setName] = useState(user?.name || 'Sabari A');",
    "const [name, setName] = useState(user?.name || 'Sabari A');\n  const [password, setPassword] = useState('');"
  );
}

// Hide plateId for customer
const oldPlateId = `<Text style={styles.plateId}>{plate}</Text>`;
const newPlateId = `{user?.role === 'driver' && <Text style={styles.plateId}>{plate}</Text>}`;
content = content.replace(oldPlateId, newPlateId);

fs.writeFileSync(path, content, 'utf8');
console.log('ProfileEditScreen updated successfully!');
