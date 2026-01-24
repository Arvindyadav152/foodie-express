import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyCsUYQXgbVLEDLW1VAxLpejPILDTU0SkIc",
    authDomain: "foodies-express-7b373.firebaseapp.com",
    projectId: "foodies-express-7b373",
    storageBucket: "foodies-express-7b373.firebasestorage.app",
    messagingSenderId: "113880914808",
    appId: "1:113880914808:android:94163dee8f5e1d24e1c68d"
};

// Initialize Firebase (Modular for general use)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export default app;
