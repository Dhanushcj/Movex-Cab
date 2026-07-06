const fs = require('fs');
const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\context\\\\AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. completeGoogleRegistration
content = content.replace(
  `completeGoogleRegistration: (role: string, name: string, dob: string, gender: string, phone: string, idToken: string) => Promise<boolean>;`,
  `completeGoogleRegistration: (role: string, name: string, dob: string, gender: string, phone: string, idToken: string, password?: string) => Promise<boolean>;`
);

content = content.replace(
  `const completeGoogleRegistration = async (role: string, name: string, dob: string, gender: string, phone: string, idToken: string): Promise<boolean> => {
    try {
      const response = await handleFirebaseLogin(idToken, role, true, { name, dob, gender, phone });`,
  `const completeGoogleRegistration = async (role: string, name: string, dob: string, gender: string, phone: string, idToken: string, password?: string): Promise<boolean> => {
    try {
      const response = await handleFirebaseLogin(idToken, role, true, { name, dob, gender, phone, password });`
);

// 2. registerWithEmail send email verification
const oldRegisterWithEmail = `  const registerWithEmail = async (email: string, password: string, name: string, phone: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth() as any, email, password);
      await updateProfile(userCredential.user as any, { displayName: name });
      const idToken = await userCredential.user.getIdToken();
      return await handleFirebaseLogin(idToken, role, true, { phone });`;

const newRegisterWithEmail = `  const registerWithEmail = async (email: string, password: string, name: string, phone: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth() as any, email, password);
      await updateProfile(userCredential.user as any, { displayName: name });
      await userCredential.user.sendEmailVerification();
      
      const idToken = await userCredential.user.getIdToken();
      // Inform backend, but the frontend will force them to login mode to await verification
      await handleFirebaseLogin(idToken, role, true, { phone });
      return true;`;

content = content.replace(oldRegisterWithEmail, newRegisterWithEmail);

// 3. loginWithEmail check email verification
const oldLoginWithEmail = `  const loginWithEmail = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth() as any, email, password);
      const idToken = await userCredential.user.getIdToken();`;

const newLoginWithEmail = `  const loginWithEmail = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth() as any, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('Please verify your email before logging in. Check your inbox/spam folder.');
      }
      const idToken = await userCredential.user.getIdToken();`;

content = content.replace(oldLoginWithEmail, newLoginWithEmail);

fs.writeFileSync(path, content, 'utf8');
console.log('AuthContext updated with email verification and Google password');
