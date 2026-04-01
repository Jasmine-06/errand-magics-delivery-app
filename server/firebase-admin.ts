import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully");
    } else {
      console.warn("Firebase Admin credentials missing, falling back to local/default if available");
      // Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS is set
      admin.initializeApp();
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminMessaging = admin.messaging();

export default admin;
