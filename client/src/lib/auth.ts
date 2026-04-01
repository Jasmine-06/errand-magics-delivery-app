import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "./firebase";
import { createDeliveryPartner, createUserRecord } from "./firestore";

export interface AuthError {
  code: string;
  message: string;
}

export interface SignupData {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  password: string;
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

export const signUp = async (data: SignupData): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Create both the delivery partner record and a general user record for consistency
    await createDeliveryPartner(user.uid, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
    });

    await createUserRecord(user.uid, {
      name: data.name,
      email: data.email,
      phone: data.phone
    });
    
    return user;
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this phone number.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid phone number format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'Sign in failed. Please try again.';
  }
};
