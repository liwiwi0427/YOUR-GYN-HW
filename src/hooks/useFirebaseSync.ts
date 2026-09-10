import { useState, useEffect, useCallback, useRef } from 'react';
import { HandoverRecord } from '../types';
import { 
  PRIMARY_DB_ID, 
  BACKUP_DB_ID, 
  syncRecordToFirestore, 
  deleteRecordFromFirestore, 
  syncAllRecordsToFirestore, 
  subscribeToHandoverRecords, 
  testFirestoreConnection 
} from '../utils/firebase';
import { 
  performHourlyBackup, 
  getLastBackupTime, 
  getSavedBackupSnapshots, 
  BackupSnapshot 
} from '../utils/firebaseBackupService';
import { normalizeRecord } from '../data/sampleCases';

export type FirebaseSyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

const ONE_HOUR_SECONDS = 3600;

export function useFirebaseSync(
  records: HandoverRecord[],
  setRecords: (updater: HandoverRecord[] | ((prev: HandoverRecord[]) => HandoverRecord[])) => void,
  currentId?: string,
  currentUserRole?: string
) {
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseSyncStatus>('connecting' as FirebaseSyncStatus);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  // Hourly Backup States
  const [backupStatus, setBackupStatus] = useState<'idle' | 'in_progress' | 'success' | 'error'>('idle');
  const [lastBackupTime, setLastBackupTimeState] = useState<string | null>(() => getLastBackupTime());
  const [nextBackupCountdown, setNextBackupCountdown] = useState<string>('59:59');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(ONE_HOUR_SECONDS);
  const [backupSnapshots, setBackupSnapshots] = useState<BackupSnapshot[]>(() => getSavedBackupSnapshots());
  const [backupToastMessage, setBackupToastMessage] = useState<string | null>(null);

  // Keep ref to latest records for listeners and timers without stale closures
  const recordsRef = useRef<HandoverRecord[]>(records);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  // Initial connection test
  useEffect(() => {
    let mounted = true;
    testFirestoreConnection().then((connected) => {
      if (mounted) {
        setIsFirebaseConnected(connected);
        setFirebaseStatus(connected ? 'connected' : 'offline');
        if (connected) {
          setLastSyncedAt(new Date());
          // Sync current initial records to primary Firestore to ensure seed
          if (recordsRef.current.length > 0) {
            syncAllRecordsToFirestore(recordsRef.current).catch((err) => {
              console.warn('Initial seed to Firestore skipped or failed:', err);
            });
          }
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Real-time listener from Primary Firestore (604415246583)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToHandoverRecords(
        (remoteRecords) => {
          if (!remoteRecords || remoteRecords.length === 0) return;
          setIsFirebaseConnected(true);
          setFirebaseStatus('connected');
          setLastSyncedAt(new Date());
          setSyncedCount(remoteRecords.length);

          setRecords((prev) => {
            // Merge remote records with local state
            let changed = false;
            const updated = [...prev];

            for (const rRec of remoteRecords) {
              const localIdx = updated.findIndex((r) => r.id === rRec.id);
              if (localIdx === -1) {
                updated.unshift(normalizeRecord(rRec));
                changed = true;
              } else {
                // Check if remote has newer data
                const localRec = updated[localIdx];
                const remoteTime = (rRec as any)._syncedAt || (rRec as any).updatedAt || '';
                const localTime = (localRec as any)._syncedAt || (localRec as any).updatedAt || '';
                if (remoteTime && localTime && remoteTime > localTime) {
                  updated[localIdx] = normalizeRecord(rRec);
                  changed = true;
                }
              }
            }

            return changed ? updated : prev;
          });
        },
        (err) => {
          console.warn('Firebase realtime subscription warning:', err);
          setFirebaseStatus('offline');
        }
      );
    } catch (err) {
      console.warn('Failed to subscribe to Firebase:', err);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setRecords]);

  // Hourly Backup Routine & Countdown Timer
  useEffect(() => {
    // Calculate initial remaining seconds based on lastBackupTime
    const computeRemaining = () => {
      const lastTimeStr = getLastBackupTime();
      if (!lastTimeStr) return ONE_HOUR_SECONDS;
      const lastMs = new Date(lastTimeStr).getTime();
      const nowMs = Date.now();
      const elapsedSec = Math.floor((nowMs - lastMs) / 1000);
      const rem = ONE_HOUR_SECONDS - (elapsedSec % ONE_HOUR_SECONDS);
      return rem > 0 ? rem : ONE_HOUR_SECONDS;
    };

    setSecondsRemaining(computeRemaining());

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger hourly backup!
          triggerConsolidatedBackup();
          return ONE_HOUR_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to MM:SS
  useEffect(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    setNextBackupCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }, [secondsRemaining]);

  // Execute hourly backup (auto or manual)
  const triggerConsolidatedBackup = useCallback(async () => {
    setBackupStatus('in_progress');
    try {
      const snapshot = await performHourlyBackup(recordsRef.current);
      setBackupStatus('success');
      setLastBackupTimeState(snapshot.timestamp);
      setBackupSnapshots(getSavedBackupSnapshots());
      setBackupToastMessage(`已完成每小時定時整理！成功備份至 Firebase 備份資料庫 (${BACKUP_DB_ID})`);
      setTimeout(() => setBackupToastMessage(null), 5000);
      return snapshot;
    } catch (err) {
      setBackupStatus('error');
      setBackupToastMessage(`每小時備份至備份資料庫 (${BACKUP_DB_ID}) 發生異常`);
      setTimeout(() => setBackupToastMessage(null), 5000);
      throw err;
    }
  }, []);

  // Sync a single record when modified
  const syncRecord = useCallback(async (record: HandoverRecord) => {
    try {
      setFirebaseStatus('syncing');
      await syncRecordToFirestore(record);
      setFirebaseStatus('connected');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Failed to sync record to Firebase:', err);
      setFirebaseStatus('offline');
    }
  }, []);

  // Delete a record from Firestore
  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      setFirebaseStatus('syncing');
      await deleteRecordFromFirestore(recordId);
      setFirebaseStatus('connected');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('Failed to delete record from Firebase:', err);
    }
  }, []);

  // Manual trigger for immediate full sync
  const forceFullSync = useCallback(async () => {
    setFirebaseStatus('syncing');
    try {
      await syncAllRecordsToFirestore(recordsRef.current);
      setFirebaseStatus('connected');
      setLastSyncedAt(new Date());
      setSyncedCount(recordsRef.current.length);
      setBackupToastMessage(`全量 ${recordsRef.current.length} 筆個案已成功手動即時同步至主資料庫 (${PRIMARY_DB_ID})`);
      setTimeout(() => setBackupToastMessage(null), 4000);
    } catch (err) {
      setFirebaseStatus('error');
      setBackupToastMessage(`同步至主資料庫 (${PRIMARY_DB_ID}) 失敗`);
      setTimeout(() => setBackupToastMessage(null), 4000);
    }
  }, []);

  return {
    firebaseStatus,
    isFirebaseConnected,
    primaryDbId: PRIMARY_DB_ID,
    backupDbId: BACKUP_DB_ID,
    lastSyncedAt,
    syncedCount,
    backupStatus,
    lastBackupTime,
    nextBackupCountdown,
    backupSnapshots,
    backupToastMessage,
    dismissBackupToast: () => setBackupToastMessage(null),
    triggerConsolidatedBackup,
    forceFullSync,
    syncRecord,
    deleteRecord,
  };
}
