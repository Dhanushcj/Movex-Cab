import { useTheme } from '../context/ThemeContext';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';

const KARNATAKA_DISTRICTS = [
  'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
  'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur',
  'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
];

const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
  'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
  'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
  'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder }: any) => {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.inputBox} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={[{ fontFamily: 'sans-serif', fontSize: 14, color: Colors.textPrimary, flex: 1 }, !selectedValue && { color: Colors.textMuted }]}>
          {selectedValue || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedValue === item && { color: Colors.accent, fontWeight: 'bold' }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function RegistrationScreen({ onBack, prefillData = null, isCorrection = false }: { onBack: () => void, prefillData?: any, isCorrection?: boolean }) {
  const { isDark } = useTheme();
  const styles = getStyles(Colors);
  const { registerDriverProfile, resubmitDriverProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(prefillData?.name || '');
  const [phone, setPhone] = useState(prefillData?.phone || '');
  const [password, setPassword] = useState(prefillData?.password || '');
  const [gender, setGender] = useState(prefillData?.gender || 'male');
  const [email, setEmail] = useState(prefillData?.email || '');
  const [selectedState, setSelectedState] = useState(prefillData?.address?.split(', ')[1] || '');
  const [city, setCity] = useState(prefillData?.address?.split(', ')[0] || '');

  const [vehicleType, setVehicleType] = useState(prefillData?.vehicle?.type || '');
  const [vehicleMake, setVehicleMake] = useState(prefillData?.vehicle?.make || '');
  const [vehicleModel, setVehicleModel] = useState(prefillData?.vehicle?.model || '');
  const [vehicleColor, setVehicleColor] = useState(prefillData?.vehicle?.color || '');
  const [plateNumber, setPlateNumber] = useState(prefillData?.vehicle?.plateNumber || '');
  const [plateType, setPlateType] = useState(prefillData?.vehicle?.plateType || '');

  const [aadhaarNumber, setAadhaarNumber] = useState(prefillData?.documents?.aadhaar?.number || '');
  const [aadhaarUrl, setAadhaarUrl] = useState<any>(prefillData?.documents?.aadhaar?.url || null);
  const [panNumber, setPanNumber] = useState(prefillData?.documents?.pan?.number || '');
  const [panUrl, setPanUrl] = useState<any>(prefillData?.documents?.pan?.url || null);

  const [dlNumber, setDlNumber] = useState(prefillData?.documents?.drivingLicense?.number || '');
  const [dlType, setDlType] = useState(prefillData?.documents?.drivingLicense?.type || '');
  const [dlExpiry, setDlExpiry] = useState<Date | null>(prefillData?.documents?.drivingLicense?.expiryDate ? new Date(prefillData.documents.drivingLicense.expiryDate) : null);
  const [dlUrl, setDlUrl] = useState<any>(prefillData?.documents?.drivingLicense?.url || null);

  const [rcNumber, setRcNumber] = useState(prefillData?.documents?.vehicleRC?.number || '');
  const [rcUrl, setRcUrl] = useState<any>(prefillData?.documents?.vehicleRC?.url || null);
  const [insNumber, setInsNumber] = useState(prefillData?.documents?.insurance?.number || '');
  const [insExpiry, setInsExpiry] = useState<Date | null>(prefillData?.documents?.insurance?.expiryDate ? new Date(prefillData.documents.insurance.expiryDate) : null);
  const [insUrl, setInsUrl] = useState<any>(prefillData?.documents?.insurance?.url || null);

  // Yellow plate specific
  const [permitNumber, setPermitNumber] = useState(prefillData?.documents?.permit?.number || '');
  const [permitType, setPermitType] = useState(prefillData?.documents?.permit?.type || '');
  const [permitExpiry, setPermitExpiry] = useState<Date | null>(prefillData?.documents?.permit?.expiryDate ? new Date(prefillData.documents.permit.expiryDate) : null);
  const [permitUrl, setPermitUrl] = useState<any>(prefillData?.documents?.permit?.url || null);

  const [fcExpiry, setFcExpiry] = useState<Date | null>(prefillData?.documents?.fitnessCertificate?.expiryDate ? new Date(prefillData.documents.fitnessCertificate.expiryDate) : null);
  const [fcUrl, setFcUrl] = useState<any>(prefillData?.documents?.fitnessCertificate?.url || null);

  const [taxExpiry, setTaxExpiry] = useState<Date | null>(prefillData?.documents?.taxReceipt?.expiryDate ? new Date(prefillData.documents.taxReceipt.expiryDate) : null);
  const [taxUrl, setTaxUrl] = useState<any>(prefillData?.documents?.taxReceipt?.url || null);

  const [showPicker, setShowPicker] = useState<string | null>(null);

  const pickDocument = async (setter: any) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setter(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Doc picker err:', e);
    }
  };

  const nextStep = () => {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

    if (step === 1) {
      if (!name || !phone || !password || !selectedState || !city || !vehicleType || !vehicleMake || !vehicleModel || !vehicleColor || !plateNumber || !plateType) {
        return Alert.alert('Error', 'Please fill all mandatory fields in Step 1');
      }
      setStep(2);
    } else if (step === 2) {
      if (!aadhaarNumber || !aadhaarUrl) return Alert.alert('Error', 'Aadhaar details are mandatory');
      if (!dlNumber || !dlUrl || !dlExpiry || !dlType) return Alert.alert('Error', 'Driving License details are mandatory');
      
      const today = new Date();
      if (dlExpiry < today) {
        return Alert.alert('Invalid License', 'Your License has Expired cannot Register.');
      }
      if (gender === 'male' && dlType === 'MCW0G') {
        return Alert.alert('Not Eligible', 'You are not eligible. It should be eligible only to Females.');
      }
      if ((dlType === 'MCWG' || dlType === 'MCW0G') && vehicleType !== 'bike') {
        return Alert.alert('Not Eligible', 'You are not eligible for this Vehicle type.');
      }

      setStep(3);
    }
  };

  const submitRegistration = async () => {
    if (!rcNumber || !rcUrl) return Alert.alert('Error', 'RC Details are mandatory');
    if (!insNumber || !insExpiry || !insUrl) return Alert.alert('Error', 'Insurance Details are mandatory');
    
    if (plateType === 'yellow') {
      if (!permitNumber || !permitType || !permitExpiry || !permitUrl) return Alert.alert('Error', 'Permit details are mandatory for Yellow board');
      if (!fcExpiry || !fcUrl) return Alert.alert('Error', 'FC details are mandatory for Yellow board');
      if (!taxExpiry || !taxUrl) return Alert.alert('Error', 'Tax details are mandatory for Yellow board');
    }

    setLoading(true);

    const payload = {
      name, phone, password, gender, address: `${city}, ${selectedState}`, email,
      vehicle: {
        type: vehicleType,
        make: vehicleMake,
        model: vehicleModel,
        color: vehicleColor,
        plateNumber,
        plateType
      },
      documents: {
        aadhaar: { number: aadhaarNumber, url: aadhaarUrl },
        pan: { number: panNumber, url: panUrl },
        drivingLicense: { number: dlNumber, url: dlUrl, expiryDate: dlExpiry, type: dlType },
        vehicleRC: { number: rcNumber, url: rcUrl },
        insurance: { number: insNumber, url: insUrl, expiryDate: insExpiry },
        permit: plateType === 'yellow' ? { number: permitNumber, type: permitType, expiryDate: permitExpiry, url: permitUrl } : undefined,
        fitnessCertificate: plateType === 'yellow' ? { expiryDate: fcExpiry, url: fcUrl } : undefined,
        taxReceipt: plateType === 'yellow' ? { expiryDate: taxExpiry, url: taxUrl } : undefined,
      }
    };

    try {
      if (isCorrection) {
        await resubmitDriverProfile(payload);
        Alert.alert('Success', 'Application resubmitted successfully!');
      } else {
        await registerDriverProfile(payload);
        Alert.alert('Success', 'Applied Successfully. Verification in Process.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleTypeChange = (type: string) => {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

    setVehicleType(type);
    if (type === 'bike') {
      setPlateType(Colors.bgSecondary);
    } else if (type === 'auto') {
      setPlateType('yellow');
    }
  };

  const renderRadio = (options: string[], selected: string, setter: any) => (
    <View style={styles.radioGroup}>
      {options.map(opt => (
        <TouchableOpacity key={opt} style={[styles.radioBtn, selected === opt && styles.radioSelected]} onPress={() => setter(opt)}>
          <Text style={[styles.radioText, selected === opt && styles.radioTextSelected]}>{opt.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlateRadio = () => {
    const { isDark } = useTheme();
    const styles = getStyles(Colors);

    const options = [Colors.bgSecondary, 'yellow'];
    return (
      <View style={styles.radioGroup}>
        {options.map(opt => {
          let disabled = false;
          if (vehicleType === 'bike' && opt === 'yellow') disabled = true;
          if (vehicleType === 'auto' && opt === Colors.bgSecondary) disabled = true;
          
          return (
            <TouchableOpacity 
              key={opt} 
              style={[styles.radioBtn, plateType === opt && styles.radioSelected, disabled && { opacity: 0.3 }]} 
              onPress={() => !disabled && setPlateType(opt)}
              disabled={disabled}
            >
              <Text style={[styles.radioText, plateType === opt && styles.radioTextSelected]}>{opt.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDate = (label: string, value: Date | null, fieldKey: string, setter: any) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(fieldKey)}>
        <Text style={value ? styles.dateText : styles.dateTextEmpty}>
          {value ? value.toDateString() : 'Select Date'}
        </Text>
      </TouchableOpacity>
      {showPicker === fieldKey && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(null);
            if (selectedDate) setter(selectedDate);
          }}
        />
      )}
    </View>
  );

  const renderUpload = (label: string, value: any, setter: any) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument(setter)}>
        <Text style={styles.uploadBtnText}>{value ? 'Document Selected ✓' : 'Upload Document'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.screenContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isCorrection ? 'Correction Form' : 'New Driver Registration'}</Text>
      </View>
      
      <View style={styles.stepContainer}>
        <Text style={styles.stepTextTop}>Step {step} of 3</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.screenMainTitle}>Driver Registration</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepBlock}>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.inputText} placeholder="Name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputBox}>
                <Text style={styles.countryCode}>IN +91</Text>
                <View style={styles.divider} />
                <TextInput style={styles.inputText} placeholder="Mobile Number" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.inputText} placeholder="Password" placeholderTextColor={Colors.textMuted} secureTextEntry value={password} onChangeText={setPassword} />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address (Optional)</Text>
              <View style={styles.inputBox}>
                <TextInput style={styles.inputText} placeholder="Enter mail" placeholderTextColor={Colors.textMuted} keyboardType="email-address" value={email} onChangeText={setEmail} />
              </View>
            </View>

            <CustomDropdown 
              label="State" 
              options={['Karnataka', 'Tamil Nadu']} 
              selectedValue={selectedState} 
              onSelect={(state: string) => {
                setSelectedState(state);
                setCity(''); // Reset city when state changes
              }} 
              placeholder="Select State" 
            />

            {selectedState === 'Karnataka' && (
              <CustomDropdown 
                label="District" 
                options={KARNATAKA_DISTRICTS} 
                selectedValue={city} 
                onSelect={setCity} 
                placeholder="Select District" 
              />
            )}
            
            {selectedState === 'Tamil Nadu' && (
              <CustomDropdown 
                label="District" 
                options={TAMIL_NADU_DISTRICTS} 
                selectedValue={city} 
                onSelect={setCity} 
                placeholder="Select District" 
              />
            )}
            
            <Text style={styles.inputLabel}>Gender</Text>
            {renderRadio(['male', 'female', 'other'], gender, setGender)}

            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <Text style={styles.label}>Vehicle Type</Text>
            {renderRadio(['bike', 'auto', 'mini', 'sedan', 'suv'], vehicleType, handleVehicleTypeChange)}
            
            <TextInput style={styles.input} placeholder="Vehicle Make (e.g. Maruti)" placeholderTextColor={Colors.textSecondary} value={vehicleMake} onChangeText={setVehicleMake} />
            <TextInput style={styles.input} placeholder="Vehicle Model (e.g. Swift)" placeholderTextColor={Colors.textSecondary} value={vehicleModel} onChangeText={setVehicleModel} />
            <TextInput style={styles.input} placeholder="Vehicle Color" placeholderTextColor={Colors.textSecondary} value={vehicleColor} onChangeText={setVehicleColor} />
            <TextInput style={styles.input} placeholder="Vehicle Number (e.g. TN01XX1234)" placeholderTextColor={Colors.textSecondary} value={plateNumber} onChangeText={setPlateNumber} autoCapitalize="characters" />
            
            <Text style={styles.label}>Plate Type</Text>
            {renderPlateRadio()}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepBlock}>
            <Text style={styles.sectionTitle}>Driver Documents</Text>
            
            <TextInput style={styles.input} placeholder="Aadhaar Number *" placeholderTextColor={Colors.textSecondary} value={aadhaarNumber} onChangeText={setAadhaarNumber} />
            {renderUpload('Aadhaar Document *', aadhaarUrl, setAadhaarUrl)}

            <TextInput style={styles.input} placeholder="PAN Number (Optional)" placeholderTextColor={Colors.textSecondary} value={panNumber} onChangeText={setPanNumber} autoCapitalize="characters" />
            {renderUpload('PAN Document (Optional)', panUrl, setPanUrl)}

            <TextInput style={styles.input} placeholder="Driving License Number *" placeholderTextColor={Colors.textSecondary} value={dlNumber} onChangeText={setDlNumber} autoCapitalize="characters" />
            
            <Text style={styles.label}>License Type *</Text>
            {renderRadio(['MCWG', 'MCW0G', 'LMV & Above'], dlType, setDlType)}
            
            {renderDate('License Expiry Date *', dlExpiry, 'dlExpiry', setDlExpiry)}
            {renderUpload('Driving License Document *', dlUrl, setDlUrl)}
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepBlock}>
            <Text style={styles.sectionTitle}>Vehicle Documents</Text>
            
            <TextInput style={styles.input} placeholder="RC Number *" placeholderTextColor={Colors.textSecondary} value={rcNumber} onChangeText={setRcNumber} autoCapitalize="characters" />
            {renderUpload('RC Document *', rcUrl, setRcUrl)}

            <TextInput style={styles.input} placeholder="Insurance Number *" placeholderTextColor={Colors.textSecondary} value={insNumber} onChangeText={setInsNumber} autoCapitalize="characters" />
            {renderDate('Insurance Expiry Date *', insExpiry, 'insExpiry', setInsExpiry)}
            {renderUpload('Insurance Document *', insUrl, setInsUrl)}

            {plateType === 'yellow' && (
              <View style={styles.yellowPlateSection}>
                <Text style={styles.sectionTitle}>Commercial Documents</Text>
                
                <TextInput style={styles.input} placeholder="Permit Number *" placeholderTextColor={Colors.textSecondary} value={permitNumber} onChangeText={setPermitNumber} />
                <TextInput style={styles.input} placeholder="Permit Type *" placeholderTextColor={Colors.textSecondary} value={permitType} onChangeText={setPermitType} />
                {renderDate('Permit Expiry Date *', permitExpiry, 'permitExpiry', setPermitExpiry)}
                {renderUpload('Permit Document *', permitUrl, setPermitUrl)}

                {renderDate('FC Expiry Date *', fcExpiry, 'fcExpiry', setFcExpiry)}
                {renderUpload('FC Document *', fcUrl, setFcUrl)}

                {renderDate('Tax Receipt Expiry Date *', taxExpiry, 'taxExpiry', setTaxExpiry)}
                {renderUpload('Tax Receipt Document *', taxUrl, setTaxUrl)}
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity style={styles.navBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}
          
          {step < 3 ? (
            <TouchableOpacity style={styles.navBtnPrimary} onPress={nextStep}>
              <Text style={styles.navBtnPrimaryText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navBtnPrimary} onPress={submitRegistration} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.bgSecondary} /> : <Text style={styles.navBtnPrimaryText}>{prefillData ? 'Submit Correction' : 'Submit Application'}</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.bgPrimary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGlass
  },
  backBtn: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  stepIndicator: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  stepText: {
    color: Colors.accent,
    fontWeight: '800',
    fontSize: 14
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  stepContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20
  },
  stepTextTop: {
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#DEE0E3',
    borderRadius: 4
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#0053B3',
    borderRadius: 4
  },
  screenMainTitle: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20
  },
  stepBlock: {
    gap: 16
  },
  inputWrapper: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#DEE0E3',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgSecondary,
  },
  countryCode: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    color: Colors.textMuted,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#DEE0E3',
    marginHorizontal: 8,
  },
  inputText: {
    flex: 1,
    height: '100%',
    fontFamily: 'sans-serif',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGlass,
    paddingBottom: 8
  },
  input: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    borderRadius: 12,
    padding: 15,
    color: Colors.textPrimary,
    fontSize: 15
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  radioBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    backgroundColor: Colors.bgSecondary
  },
  radioSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent
  },
  radioText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  radioTextSelected: {
    color: Colors.bgSecondary
  },
  dateBtn: {
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.borderGlass,
    borderRadius: 12,
    padding: 15
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 15
  },
  dateTextEmpty: {
    color: Colors.textSecondary,
    fontSize: 15
  },
  uploadBtn: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center'
  },
  uploadBtnText: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 15
  },
  yellowPlateSection: {
    marginTop: 20,
    gap: 15,
    backgroundColor: 'rgba(241, 196, 15, 0.05)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(241, 196, 15, 0.2)'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    gap: 15
  },
  navBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.bgSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGlass
  },
  navBtnText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16
  },
  navBtnPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  navBtnPrimaryText: {
    color: Colors.bgSecondary,
    fontWeight: '700',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    maxHeight: '80%',
    padding: 20,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center'
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGlass
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center'
  }
});
