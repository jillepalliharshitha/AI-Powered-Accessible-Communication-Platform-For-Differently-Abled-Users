import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
// NOTE: You need to get the correct API key from your Firebase Console
// Go to Project Settings > General > Your apps > Web API Key
const firebaseConfig = {
  apiKey: "AIzaSyA7g29oaa9yWZLx382vK2W_Mg_aF6VGFps",
  authDomain: "project-267503937574.firebaseapp.com",
  projectId: "project-267503937574",
  storageBucket: "project-267503937574.appspot.com",
  messagingSenderId: "267503937574",
  appId: "1:267503937574:web:4a6v5rbcahkq47a91i49l7k51fqes5vj"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure auth settings for local development
auth.settings = {
  ...auth.settings,
  // This helps with local development
  persistence: 'session'
};

// Configure auth for local development
if (window.location.hostname === 'localhost') {
  auth.tenantId = null; // Ensure no tenant ID for local dev
}

const googleProvider = new GoogleAuthProvider();

// Set up Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider, signInWithPopup };
