const fs = require('fs');

const path = 'd:\\\\Cab Application\\\\customer-app\\\\src\\\\context\\\\AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update import
if (content.includes("import auth from '@react-native-firebase/auth';")) {
  content = content.replace(
    "import auth from '@react-native-firebase/auth';",
    "import auth, { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';"
  );
}

// Update loginWithEmail
content = content.replace(
  /await auth\(\)\.signInWithEmailAndPassword\(email, password\)/g,
  "await signInWithEmailAndPassword(auth(), email, password)"
);

// Update registerWithEmail
content = content.replace(
  /await auth\(\)\.createUserWithEmailAndPassword\(email, password\)/g,
  "await createUserWithEmailAndPassword(auth(), email, password)"
);

// Update loginWithGoogle
content = content.replace(
  /auth\.GoogleAuthProvider\.credential/g,
  "GoogleAuthProvider.credential"
);
content = content.replace(
  /await auth\(\)\.signInWithCredential\(googleCredential\)/g,
  "await signInWithCredential(auth(), googleCredential)"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Modular API updated.');
