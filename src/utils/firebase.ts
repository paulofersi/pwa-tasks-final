import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDocs,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";
import type { Task } from "../types";

const TASKS_COLLECTION = "tasks";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export const analytics: Analytics | null =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function addTaskToFirebase(task: Task): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("User must be authenticated to sync tasks to Firestore");
  }

  const ref = doc(db, TASKS_COLLECTION, task.id);
  await setDoc(ref, task);
}

export async function getTasksFromFirebase(): Promise<Task[]> {
  const ref = collection(db, TASKS_COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Task));
}
