import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import API from '../services/api';
import auth, { getAuth, getIdToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, updateProfile, sendPasswordResetEmail, sendEmailVerification } from '@react-native-firebase/auth';
import { getMessaging, requestPermission, getToken, AuthorizationStatus } from '@react-native-firebase/messaging';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string, role: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string, phone: string, role: string) => Promise<boolean>;
  loginWithGoogle: (role: string) => Promise<any>;
  completeGoogleRegistration: (role: string, name: string, dob: string, gender: string, phone: string, idToken: string, password?: string) => Promise<boolean>;
  loginWithPassword: (phone: string, password: string, role?: string) => Promise<boolean>;
  sendOTPCode: (phone: string) => Promise<string | null>;
  verifyOTPCode: (phone: string, otp: string, name?: string) => Promise<boolean>;
  registerUser: (name: string, phone: string, password: string, dob: string, gender: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserWallet: (amount: number) => Promise<number>;
  loginDriver: (phone: string, password: string) => Promise<boolean>;
  loginAdmin: (phone: string, password: string) => Promise<boolean>;
  registerDriverProfile: (params: any) => Promise<boolean>;
  resubmitDriverProfile: (params: any) => Promise<boolean>;
  updateOnlineStatus: (status: boolean) => Promise<boolean>;
  updateProfile: (data: any) => Promise<boolean>;
  checkEmailVerification: (role: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

GoogleSignin.configure({
  webClientId: '444707951530-nfu2nm21lq5f6lldbmqbtqvqas2uvvjr.apps.googleusercontent.com',
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const response = await API.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            await SecureStore.deleteItemAsync('userToken');
          }
        }
      } catch (e) {
        console.warn('Failed to restore token from storage:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  
  const handleFirebaseLogin = async (idToken: string, role: string, isRegistering = false, additionalData = {}): Promise<any> => {
    try {
      let fcmToken = null;
      try {
        const getFcmData = async () => {
          const messaging = getMessaging();
          const authStatus = await requestPermission(messaging);
          const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;
          
          if (enabled) {
            return await getToken(messaging);
          }
          return null;
        };

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FCM completely timed out')), 4000)
        );

        fcmToken = await Promise.race([getFcmData(), timeoutPromise]);
      } catch(e) {
        console.warn('Failed to get FCM token', e);
      }
      
      const response = await API.post('/auth/firebase-login', { 
        idToken, role, fcmToken, isRegistering, ...additionalData 
      });
      
      if (response.data.success) {
        if (response.data.isNewUser) {
          return response.data; // Return { success: true, isNewUser: true, decodedUser }
        }
        await SecureStore.setItemAsync('userToken', response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Backend firebase login failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth() as any, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox/spam folder.');
      }
      const idToken = await getIdToken(userCredential.user);
      return await handleFirebaseLogin(idToken, role);
    } catch (error) {
      console.error('Firebase Email login failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, phone: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth() as any, email, password);
      await (userCredential.user as any).updateProfile({ displayName: name });
      await sendEmailVerification(userCredential.user as any);
      
      const idToken = await getIdToken(userCredential.user);
      // Inform backend, but the frontend will force them to login mode to await verification
      await handleFirebaseLogin(idToken, role, true, { phone });
      return true;
    } catch (error) {
      console.error('Firebase Email register failed:', error);
      throw error;
    }
  };

  const checkEmailVerification = async (role: string): Promise<boolean> => {
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          const idToken = await getIdToken(currentUser);
          await handleFirebaseLogin(idToken, role);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Check email verification failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async (): Promise<void> => {
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser as any);
      } else {
        throw new Error("No unverified user currently logged in.");
      }
    } catch (error) {
      console.error('Resend verification email failed:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(getAuth() as any, email);
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (role: string): Promise<any> => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      try {
        await GoogleSignin.signOut();
      } catch (e) {} // ignore sign out errors if not logged in
      const response = await GoogleSignin.signIn();
      
      // Handle both v16 { data: { idToken } } and older { idToken } shapes
      let idToken = null;
      if (response.data && response.data.idToken) {
        idToken = response.data.idToken;
      } else if ((response as any).idToken) {
        idToken = (response as any).idToken;
      }
      
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('No valid ID token found in Google SignIn response: ' + JSON.stringify(response));
      }
      
      // Create a Google credential with the token.
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // HACK for React Native New Architecture (Expo 54): 
      // undefined might serialize as empty string "" which causes Java crash "accessToken cannot be empty".
      // We explicitly set it to null.
      if (!googleCredential.secret) {
        (googleCredential as any).secret = null;
      }
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(getAuth() as any, googleCredential);
      const firebaseIdToken = await getIdToken(userCredential.user);
      
      const backendResponse = await handleFirebaseLogin(firebaseIdToken, role);
      if (backendResponse && backendResponse.isNewUser) {
        // Return this back to the UI so it can navigate to registration
        return { ...backendResponse, firebaseIdToken };
      }
      return backendResponse;
    } catch (error: any) {
      console.error('Google Sign-In failed:', error?.response?.data || error);
      throw error;
    }
  };

  const completeGoogleRegistration = async (role: string, name: string, dob: string, gender: string, phone: string, idToken: string, password?: string): Promise<boolean> => {
    try {
      const response = await handleFirebaseLogin(idToken, role, true, { name, dob, gender, phone, password });
      return response === true;
    } catch (error) {
      console.error('Complete Google Registration failed:', error);
      throw error;
    }
  };

  const loginWithPassword = async (phone: string, password: string, role: string = 'customer'): Promise<boolean> => {
    try {
      const response = await API.post('/auth/login', { phone, password, role });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Password login failed:', error);
      throw error;
    }
  };

  const sendOTPCode = async (phone: string): Promise<string | null> => {
    try {
      const response = await API.post('/auth/send-otp', { phone, role: 'customer' });
      if (response.data.success) {
        return response.data.otp || '1234'; // returns dummy code in dev env
      }
      return null;
    } catch (error) {
      console.error('OTP sending failed:', error);
      throw error;
    }
  };

  const verifyOTPCode = async (phone: string, otp: string, name?: string): Promise<boolean> => {
    try {
      const response = await API.post('/auth/verify-otp', { phone, otp, role: 'customer', name });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };

  const registerUser = async (name: string, phone: string, password: string, dob: string, gender: string): Promise<boolean> => {
    try {
      const response = await API.post('/auth/register', { 
        name, 
        phone, 
        password, 
        dob: dob || undefined, 
        gender: gender || 'prefer_not_to_say' 
      });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Customer registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
  };

  
  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      const endpoint = user?.role === 'driver' ? '/drivers/profile' : '/users/me';
      const response = await API.put(endpoint, data);
      if (response.data.success) {
        setUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const updateUserWallet = async (amount: number): Promise<number> => {
    try {
      const response = await API.post('/payments/wallet/add', { amount });
      if (response.data.success) {
        setUser((prev: any) => ({
          ...prev,
          wallet: { ...prev.wallet, balance: response.data.balance }
        }));
        return response.data.balance;
      }
      return user?.wallet?.balance || 0;
    } catch (error) {
      console.error('Wallet topup failed:', error);
      throw error;
    }
  };

  const loginDriver = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await API.post('/auth/login', { phone, password, role: 'driver' });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
        }
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Driver login failed:', error);
      throw error;
    }
  };

  const loginAdmin = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await API.post('/auth/login', { phone, password, role: 'admin' });
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  const registerDriverProfile = async (params: any): Promise<boolean> => {
    try {
      const response = await API.post('/auth/driver/register', params);
      if (response.data.success) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Driver register failed:', error);
      throw error;
    }
  };

  const resubmitDriverProfile = async (params: any): Promise<boolean> => {
    try {
      const response = await API.post('/auth/driver/resubmit', params);
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Driver resubmit failed:', error);
      throw error;
    }
  };

  const updateOnlineStatus = async (status: boolean): Promise<boolean> => {
    try {
      const response = await API.put('/drivers/status', { isOnline: status });
      if (response.data.success) {
        setUser((prev: any) => ({ ...prev, isOnline: status }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Status toggle failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      completeGoogleRegistration,
      loginWithPassword,
      sendOTPCode,
      verifyOTPCode,
      registerUser,
      logout,
      updateUserWallet,
      loginDriver,
      loginAdmin,
      registerDriverProfile,
      resubmitDriverProfile,
      updateOnlineStatus,
      updateProfile,
      checkEmailVerification,
      resendVerificationEmail,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
