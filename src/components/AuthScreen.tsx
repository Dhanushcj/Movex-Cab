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
  Image,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

export default function AuthScreen({ onNavigateRegister }: { onNavigateRegister: (data: any) => void }) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const { loginWithEmail, registerWithEmail, loginWithGoogle, completeGoogleRegistration, loginDriver, loginAdmin, loginWithPassword, registerWithPassword, checkEmailVerification, resendVerificationEmail, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'verify_email' | 'forgot_password'>('login');
  const [role, setRole] = useState<'customer' | 'driver' | 'admin'>('customer');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Keep phone for driver reg if needed
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState(new Date());
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [gender, setGender] = useState('male'); // male | female | other
  
  const [loading, setLoading] = useState(false);
  const [isGoogleRegister, setIsGoogleRegister] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
    if (!password) {
      return Alert.alert('Required', 'Please enter a password');
    }
    if (password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
    }
    setLoading(true);
    try {
      let success = false;
      if (role === 'driver') {
        success = await loginWithPassword(email, password, 'driver');
      } else if (role === 'admin') {
        success = await loginWithPassword(email, password, 'admin');
      } else {
        success = await loginWithPassword(email, password, 'customer');
      }
      if (!success) {
        Alert.alert('Error', 'Invalid login credentials');
      }
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Login failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      return Alert.alert('Invalid Name', 'Please enter your full name');
    }
    if (!email || !email.includes('@')) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
    if (!password) {
      return Alert.alert('Required', 'Please enter a password');
    }
    if (password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    
    setLoading(true);
    try {
      let success = false;
      if (isGoogleRegister) {
        if (!phone) {
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
        success = await registerWithPassword(name, phone, email, password);
        if (success) {
          Alert.alert('Success', 'Registered successfully. Logging you in...');
        }
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || 'An unknown error occurred during registration.';
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverProceed = () => {
    if (!name.trim()) return Alert.alert('Required', 'Please enter your Full Name');
    if (!phone.trim()) return Alert.alert('Required', 'Please enter your Mobile Number');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Required', 'Please enter a valid email address');
    if (!password) return Alert.alert('Required', 'Please enter a password');
    if (password.length < 6) return Alert.alert('Required', 'Password must be at least 6 characters');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');

    onNavigateRegister({ name, phone, email, password });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(role);
      if (result && result.isNewUser) {
        setMode('register');
        setEmail(result.decodedUser?.email || '');
        setName(result.decodedUser?.name || '');
        setIsGoogleRegister(true);
        setGoogleIdToken(result.firebaseIdToken);
      } else if (result !== true) {
        Alert.alert('Error', 'Google login failed');
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background Orbs */}
      <View style={styles.backgroundOrb1} />
      <View style={styles.backgroundOrb2} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Logo Frame */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/Frame 3.png')} style={styles.logoIcon} resizeMode="contain" />
          <Image source={require('../../assets/Move X.png')} style={styles.logoTextImg} resizeMode="contain" />
        </View>

        {/* Text Headers */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create an account' : mode === 'verify_email' ? 'Verify your email' : 'Reset password'}</Text>
          <Text style={styles.subtitleText}>
            {role === 'driver' 
              ? "Sign in to continue earning with India's premium driver partner platform." 
              : role === 'admin'
              ? "Sign in to access the MoveX administrative dashboard."
              : "Sign in to experience seamless rides with MoveX."}
          </Text>
        </View>

        {/* Tabs for Login/Register */}
        {role !== 'admin' && (
          <View style={styles.authTabs}>
            <TouchableOpacity 
              style={[styles.authTab, mode === 'login' && styles.authTabActive]}
              onPress={() => {
                setMode('login');
                setIsGoogleRegister(false);
              }}
            >
              <Text style={[styles.authTabText, mode === 'login' && styles.authTabTextActive]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.authTab, mode === 'register' && styles.authTabActive]}
              onPress={() => {
                setMode('register');
                setIsGoogleRegister(false);
              }}
            >
              <Text style={[styles.authTabText, mode === 'register' && styles.authTabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          
          {mode === 'verify_email' && (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                We've sent a verification link to <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>{email}</Text>. Please check your inbox (and spam folder) and click the link to continue.
              </Text>
              
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={async () => {
                  setLoading(true);
                  try {
                    const verified = await checkEmailVerification(role);
                    if (!verified) {
                      Alert.alert('Not Verified', 'Please click the link in your email first.');
                    }
                  } catch (e: any) {
                    Alert.alert('Error', e.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={Colors.bgSecondary} /> : <Text style={styles.continueButtonText}>I have verified my email</Text>}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.continueButton, { backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: '#D1D5DB', marginTop: 15 }]}
                onPress={async () => {
                  try {
                    await resendVerificationEmail();
                    Alert.alert('Success', 'Verification email resent.');
                  } catch (e: any) {
                    Alert.alert('Error', e.message);
                  }
                }}
              >
                <Text style={[styles.continueButtonText, { color: '#374151' }]}>Resend Verification Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setMode('login')}>
                <Text style={{ color: Colors.accent, fontWeight: '600' }}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode !== 'verify_email' && (
            <>
              {mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.inputText}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputBox, isGoogleRegister && { backgroundColor: '#f0f0f0' }]}>
              <TextInput
                placeholder="Enter email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputText}
                value={email}
                onChangeText={setEmail}
                editable={!isGoogleRegister}
              />
            </View>
          </View>

          {mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter mobile number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  style={styles.inputText}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          )}

          {mode !== 'forgot_password' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  style={styles.inputText}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              {mode === 'login' && (
                <TouchableOpacity onPress={() => setMode('forgot_password')} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                  <Text style={{ color: Colors.accent, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {mode === 'register' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  style={styles.inputText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          )}

          {mode === 'register' && role === 'customer' && (
            <>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity onPress={() => setShowDobPicker(true)} style={styles.inputBox} activeOpacity={0.7}>
                  <Text style={{ flex: 1, fontFamily: 'sans-serif', fontSize: 14, color: dob ? Colors.textPrimary : Colors.textMuted }}>
                    {dob ? `${dob.split('-')[2]}-${dob.split('-')[1]}-${dob.split('-')[0]}` : "DD-MM-YYYY"}
                  </Text>
                </TouchableOpacity>
                {showDobPicker && (
                  <DateTimePicker
                    value={dobDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDobPicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setDobDate(selectedDate);
                        setDob(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>

              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map((g) => (
                  <TouchableOpacity 
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}


          {mode === 'register' && role === 'driver' && (
            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted, textAlign: 'center', marginBottom: 15, fontSize: 14 }}>
                Driver registration requires document verification.
              </Text>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleDriverProceed}
              >
                <Text style={styles.continueButtonText}>Proceed to Driver Application</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          {!(mode === 'register' && role === 'driver') && mode !== 'forgot_password' && (
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.bgSecondary} />
              ) : (
                <Text style={styles.continueButtonText}>{mode === 'login' ? 'Login' : 'Complete Registration'}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Google Auth Button */}
          {!(mode === 'register' && role === 'driver') && mode !== 'forgot_password' && (
            <TouchableOpacity 
              style={[styles.continueButton, { backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: '#D1D5DB', marginTop: 15 }]} 
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.continueButtonText, { color: '#374151' }]}>Continue with Google</Text>
            </TouchableOpacity>
          )}

          {mode === 'forgot_password' && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
                Enter your email address above and we'll send you a link to reset your password.
              </Text>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={async () => {
                  if (!email || !email.includes('@')) {
                    return Alert.alert('Error', 'Please enter a valid email address');
                  }
                  setLoading(true);
                  try {
                    await resetPassword(email);
                    Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
                    setMode('login');
                  } catch (e: any) {
                    Alert.alert('Error', e.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color={Colors.bgSecondary} /> : <Text style={styles.continueButtonText}>Send Reset Link</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setMode('login')}>
                <Text style={{ color: Colors.textMuted, fontWeight: '600' }}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.roleToggleBtn} 
          onPress={() => {
            const nextRole = role === 'customer' ? 'driver' : 'customer';
            setRole(nextRole);
          }}
        >
          <Text style={styles.roleToggleText}>
            {role === 'customer' ? 'Login/Register as Driver' : 'Login/Register as Rider'}
          </Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    position: 'relative'
  },
  backgroundOrb1: {
    position: 'absolute',
    width: 601,
    height: 743,
    left: -106,
    top: -400,
    backgroundColor: '#0053B3',
    opacity: 0.1,
    borderRadius: 300,
  },
  backgroundOrb2: {
    position: 'absolute',
    width: 601,
    height: 743,
    left: -50,
    top: -350,
    backgroundColor: '#9AC9FE',
    opacity: 0.1,
    borderRadius: 300,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logoTextImg: {
    width: 92,
    height: 19,
    marginTop: 8,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  titleText: {
    fontFamily: 'sans-serif', // 'Outfit' fallback
    fontWeight: '400',
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  authTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: Colors.borderGlass,
    borderRadius: 24,
    padding: 4,
    width: 280,
    alignSelf: 'center'
  },
  authTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  authTabActive: {
    backgroundColor: Colors.bgSecondary,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  authTabText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14
  },
  authTabTextActive: {
    color: '#0053B3'
  },
  formContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
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
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#DEE0E3',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSecondary
  },
  genderBtnActive: {
    borderColor: '#0053B3',
    backgroundColor: 'rgba(0, 83, 179, 0.05)'
  },
  genderBtnText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 14
  },
  genderBtnTextActive: {
    color: '#0053B3'
  },
  continueButton: {
    width: 280,
    height: 48,
    backgroundColor: '#0053B3',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center'
  },
  continueButtonText: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 14,
    color: '#FCFCFC',
  },
  roleToggleBtn: {
    marginTop: 10,
    marginBottom: 40,
  },
  roleToggleText: {
    color: '#0053B3',
    fontWeight: '600',
    fontSize: 14,
  },
  footerText: {
    fontFamily: 'sans-serif',
    fontWeight: '400',
    fontSize: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.7,
  }
});
