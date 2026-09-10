import { 
  primaryDb, 
  backupDb, 
  PRIMARY_DB_ID, 
  BACKUP_DB_ID, 
  syncAllRecordsToFirestore,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { HandoverRecord } from '../types';
import { 
  getFacultyRoster, 
  getStudentRoster, 
  getClinicalUnits, 
  FacultyMember, 
  StudentMember, 
  ClinicalUnit 
} from './rosterStore';
import { 
  recordAuditLog, 
  AuditLogEntry 
} from './rbac';

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  sourceDatabase: string;
  targetDatabase: string;
  recordsCount: number;
  facultyCount: number;
  studentsCount: number;
  unitsCount: number;
  checksum: string;
  status: 'success' | 'failed';
  summary: string;
  payload?: {
    records: HandoverRecord[];
    faculty: FacultyMember[];
    students: StudentMember[];
    units: ClinicalUnit[];
  };
}

const BACKUP_STORAGE_KEY = 'maternity_hourly_backup_snapshots_v1';
const LAST_BACKUP_TIME_KEY = 'maternity_last_hourly_backup_time_v1';
const ONE_HOUR_MS = 60 * 60 * 1000;

// Simple deterministic hash for checksum
function computeChecksum(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'CHK-' + Math.abs(hash).toString(16).toUpperCase();
}

/**
 * Retrieves all saved hourly backup snapshots
 */
export function getSavedBackupSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves backup snapshot to local archive
 */
function saveBackupSnapshotLocally(snapshot: BackupSnapshot): void {
  try {
    const existing = getSavedBackupSnapshots();
    const updated = [snapshot, ...existing.filter(s => s.id !== snapshot.id)].slice(0, 50); // keep last 50
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save backup snapshot locally:', err);
  }
}

/**
 * Executes a full consolidated backup from Primary (604415246583) to Backup (378528653721)
 */
export async function performHourlyBackup(
  currentRecords?: HandoverRecord[]
): Promise<BackupSnapshot> {
  const timestamp = new Date().toISOString();
  const backupId = `bk_${Date.now()}`;

  // Gather current system data
  let records: HandoverRecord[] = [];
  if (currentRecords && currentRecords.length > 0) {
    records = currentRecords;
  } else {
    try {
      const raw = localStorage.getItem('maternity_handover_records_v1');
      records = raw ? JSON.parse(raw) : [];
    } catch {
      records = [];
    }
  }

  const faculty = getFacultyRoster();
  const students = getStudentRoster();
  const units = getClinicalUnits();
  const checksum = computeChecksum({ records, faculty, students, units });

  const snapshot: BackupSnapshot = {
    id: backupId,
    timestamp,
    sourceDatabase: PRIMARY_DB_ID,
    targetDatabase: BACKUP_DB_ID,
    recordsCount: records.length,
    facultyCount: faculty.length,
    studentsCount: students.length,
    unitsCount: units.length,
    checksum,
    status: 'success',
    summary: `每小時定時交互備份（${records.length} 筆個案、${students.length} 名實習生、${faculty.length} 名導師、${units.length} 個單位）`,
    payload: {
      records,
      faculty,
      students,
      units
    }
  };

  try {
    // 1. Write backup metadata document to primary Firestore
    try {
      const primaryDoc = doc(primaryDb, 'backups', backupId);
      await setDoc(primaryDoc, {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
        sourceDatabase: snapshot.sourceDatabase,
        targetDatabase: snapshot.targetDatabase,
        recordsCount: snapshot.recordsCount,
        facultyCount: snapshot.facultyCount,
        studentsCount: snapshot.studentsCount,
        unitsCount: snapshot.unitsCount,
        checksum: snapshot.checksum,
        status: snapshot.status,
        summary: snapshot.summary,
      });
    } catch (e) {
      console.warn('Primary backup doc write skipped or failed:', e);
    }

    // 2. Write backup metadata document to backup Firestore (378528653721)
    try {
      const backupDoc = doc(backupDb, 'backups', backupId);
      await setDoc(backupDoc, {
        id: snapshot.id,
        timestamp: snapshot.timestamp,
        sourceDatabase: snapshot.sourceDatabase,
        targetDatabase: snapshot.targetDatabase,
        recordsCount: snapshot.recordsCount,
        facultyCount: snapshot.facultyCount,
        studentsCount: snapshot.studentsCount,
        unitsCount: snapshot.unitsCount,
        checksum: snapshot.checksum,
        status: snapshot.status,
        summary: snapshot.summary,
      });
    } catch (e) {
      console.warn('Backup db snapshot write skipped or failed:', e);
    }

    // 3. Replicate all current records to the backup database
    await syncAllRecordsToFirestore(records, backupDb);

    // 4. Save locally and update timestamp
    saveBackupSnapshotLocally(snapshot);
    localStorage.setItem(LAST_BACKUP_TIME_KEY, timestamp);

    // 5. Append audit log
    recordAuditLog(
      '系統自動排程 (Hourly Backup Service)',
      'admin',
      '資料庫備份',
      'FIREBASE_HOURLY_BACKUP',
      `成功自主資料庫 (${PRIMARY_DB_ID}) 交互備份至備份資料庫 (${BACKUP_DB_ID})：共 ${records.length} 筆個案，校驗碼 ${checksum}`,
      'success'
    );

    return snapshot;
  } catch (error) {
    const failedSnapshot: BackupSnapshot = {
      ...snapshot,
      status: 'failed',
      summary: `備份作業異常：${error instanceof Error ? error.message : String(error)}`
    };
    saveBackupSnapshotLocally(failedSnapshot);
    recordAuditLog(
      '系統自動排程 (Hourly Backup Service)',
      'admin',
      '資料庫備份',
      'FIREBASE_HOURLY_BACKUP_ERROR',
      `備份至備份資料庫 (${BACKUP_DB_ID}) 失敗：${error instanceof Error ? error.message : String(error)}`,
      'danger'
    );
    throw error;
  }
}

/**
 * Gets the last backup timestamp
 */
export function getLastBackupTime(): string | null {
  return localStorage.getItem(LAST_BACKUP_TIME_KEY);
}

/**
 * Downloads a backup snapshot as a JSON file
 */
export function downloadBackupSnapshotJson(snapshot: BackupSnapshot): void {
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Obstetric_Handover_Backup_${snapshot.targetDatabase}_${new Date(snapshot.timestamp).toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
