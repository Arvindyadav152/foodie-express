import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not found in env. Backend auth verification will fail.');
    }
} catch (error) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
}

export default admin;
