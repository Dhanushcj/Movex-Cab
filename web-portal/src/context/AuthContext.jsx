import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase API Key is missing. Google Sign-In and Email Verification will not work. Please check your .env file.");
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (token && role) {
        try {
          const endpoint = '/auth/me';
          const res = await API.get(endpoint);
          if (res.data.success) {
            setUser({ ...res.data.data, role });
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleFirebaseLogin = async (idToken, role, isRegistering = false, additionalData = {}) => {
    try {
      const response = await API.post('/auth/firebase-login', { 
        idToken, role, isRegistering, ...additionalData 
      });
      
      if (response.data.success) {
        if (response.data.isNewUser) {
          return response.data; // { success: true, isNewUser: true, decodedUser }
        }
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('role', role);
        setUser({ ...response.data.user, role });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Backend firebase login failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password, role) => {
    if (!auth) throw new Error("Firebase is not configured. Please add your credentials to .env");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox/spam folder.');
      }
      const idToken = await getIdToken(userCredential.user);
      return await handleFirebaseLogin(idToken, role, false, { password });
    } catch (error) {
      console.error('Firebase Email login failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, name, phone, gender, role) => {
    if (!auth) throw new Error("Firebase is not configured. Please add your credentials to .env");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      const idToken = await getIdToken(userCredential.user);
      await handleFirebaseLogin(idToken, role, true, { phone, name, gender });
      return true;
    } catch (error) {
      console.error('Firebase Email register failed:', error);
      throw error;
    }
  };

  const sendEmailVerificationLink = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
        } catch (signInError) {
           throw new Error('Email is already registered. Please login or reset your password.');
        }
      } else {
        throw error;
      }
    }
  };

  const checkEmailVerification = async (role) => {
    try {
      const currentUser = auth.currentUser;
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

  const resendVerificationEmail = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
      } else {
        throw new Error("No unverified user currently logged in.");
      }
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (role) => {
    if (!auth) throw new Error("Firebase is not configured. Please add your credentials to .env");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseIdToken = await getIdToken(userCredential.user);
      const backendResponse = await handleFirebaseLogin(firebaseIdToken, role);
      
      if (backendResponse && backendResponse.isNewUser) {
        return { ...backendResponse, firebaseIdToken };
      }
      return backendResponse;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const completeGoogleRegistration = async (role, name, dob, gender, phone, idToken, password) => {
    try {
      const response = await handleFirebaseLogin(idToken, role, true, { name, dob, gender, phone, password });
      return response === true;
    } catch (error) {
      throw error;
    }
  };

  const loginWithPassword = async (emailOrPhone, password, role = 'customer') => {
    try {
      const payload = { password, role };
      if (emailOrPhone.includes('@')) {
        payload.email = emailOrPhone;
      } else {
        payload.phone = emailOrPhone;
      }
      const response = await API.post('/auth/login', payload);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('role', role);
        setUser({ ...response.data.user, role });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const registerWithPassword = async (name, phone, email, password) => {
    try {
      const response = await API.post('/auth/register', { name, phone, email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('role', 'customer');
        setUser({ ...response.data.user, role: 'customer' });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const login = (userData, token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUser({ ...userData, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      loginWithEmail,
      registerWithEmail,
      sendEmailVerificationLink,
      loginWithGoogle,
      completeGoogleRegistration,
      loginWithPassword,
      registerWithPassword,
      checkEmailVerification,
      resendVerificationEmail,
      resetPassword
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
