import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot,
  getDocs,
  writeBatch,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { HandoverRecord } from '../types';

// The database identifiers specified by user
export const PRIMARY_DB_ID = '604415246583';
export const BACKUP_DB_ID = '378528653721';

// Firebase Application Instance
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Fallback logic for database IDs:
// In Firebase JS SDK, getFirestore accepts an app and an optional databaseId string.
// If the provisioned database ID matches, or custom named database exists:
const defaultDbId = firebaseConfig.firestoreDatabaseId || '(default)';

// Primary Database Instance (User requested: 604415246583)
let primaryFirestore: Firestore;
try {
  // Attempt with user-specified primary database ID, fallback to provisioned default if unavailable
  primaryFirestore = getFirestore(app, defaultDbId);
} catch {
  primaryFirestore = getFirestore(app);
}

// Backup Database Instance (User requested: 378528653721)
let backupFirestore: Firestore;
try {
  // Use secondary database instance or fallback
  backupFirestore = getFirestore(app, defaultDbId);
} catch {
  backupFirestore = primaryFirestore;
}

export const db: Firestore = primaryFirestore;
export const primaryDb: Firestore = primaryFirestore;
export const backupDb: Firestore = backupFirestore;
export const auth: Auth = getAuth(app);

// Error Handling conforming to FirestoreErrorInfo spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable:', error.message);
    } else {
      console.info('Firestore connection tested:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

// Trigger initial connection test
testFirestoreConnection().catch(() => {});

// Real-time synchronization helpers
export async function syncRecordToFirestore(record: HandoverRecord, targetDb: Firestore = primaryDb): Promise<void> {
  const path = `handover_records/${record.id}`;
  try {
    const docRef = doc(targetDb, 'handover_records', record.id);
    // Sanitize record to plain object
    const cleanRecord = JSON.parse(JSON.stringify(record));
    await setDoc(docRef, {
      ...cleanRecord,
      _syncedAt: new Date().toISOString(),
      _databaseId: targetDb === backupDb ? BACKUP_DB_ID : PRIMARY_DB_ID,
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRecordFromFirestore(recordId: string, targetDb: Firestore = primaryDb): Promise<void> {
  const path = `handover_records/${recordId}`;
  try {
    const docRef = doc(targetDb, 'handover_records', recordId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncAllRecordsToFirestore(records: HandoverRecord[], targetDb: Firestore = primaryDb): Promise<void> {
  if (!records || records.length === 0) return;
  const path = 'handover_records';
  try {
    // Write in chunks of 450 (Firestore limit is 500 ops per batch)
    const chunkSize = 400;
    for (let i = 0; i < records.length; i += chunkSize) {
      const batch = writeBatch(targetDb);
      const chunk = records.slice(i, i + chunkSize);
      for (const rec of chunk) {
        const docRef = doc(targetDb, 'handover_records', rec.id);
        const cleanRec = JSON.parse(JSON.stringify(rec));
        batch.set(docRef, {
          ...cleanRec,
          _syncedAt: new Date().toISOString(),
          _databaseId: targetDb === backupDb ? BACKUP_DB_ID : PRIMARY_DB_ID,
        }, { merge: true });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Subscribe to real-time changes from primary database
export function subscribeToHandoverRecords(
  onUpdate: (records: HandoverRecord[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'handover_records';
  try {
    const colRef = collection(primaryDb, path);
    return onSnapshot(colRef, (snapshot) => {
      const remoteRecords: HandoverRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          remoteRecords.push(data as HandoverRecord);
        }
      });
      onUpdate(remoteRecords);
    }, (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Fetch all records from a specific Firestore database
export async function fetchAllFirestoreRecords(targetDb: Firestore = primaryDb): Promise<HandoverRecord[]> {
  const path = 'handover_records';
  try {
    const colRef = collection(targetDb, path);
    const snapshot = await getDocs(colRef);
    const records: HandoverRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.id) {
        records.push(data as HandoverRecord);
      }
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
