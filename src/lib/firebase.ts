import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  (firebaseConfig as any).firestoreDatabaseId,
);
export const auth = getAuth();

// CRITICAL CONSTRAINT: Test the connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn(
        "Firestore appears offline initialization check:",
        error.message,
      );
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/gmail.send");
googleProvider.addScope("https://www.googleapis.com/auth/chat.spaces.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/chat.messages.create");
googleProvider.addScope("https://www.googleapis.com/auth/contacts.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/tasks.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.addons.student");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.addons.teacher");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.announcements");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.announcements.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.students");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courseworkmaterials");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.students");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.profile.emails");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.profile.photos");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.push-notifications");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.rosters");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.rosters.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.me.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.student-submissions.students.readonly");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.topics");
googleProvider.addScope("https://www.googleapis.com/auth/classroom.topics.readonly");


export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export let cachedAccessToken: string | null = null;
export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}
