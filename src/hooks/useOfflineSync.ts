import { useState, useEffect, useCallback } from 'react';
import { HandoverRecord } from '../types';
import { 
  getPendingQueueCount, 
  getPendingQueueItems, 
  clearPendingQueue, 
  enqueueOfflineRecord, 
  enqueueOfflineDelete,
  saveOfflineSnapshot,
  saveAllOfflineSnapshots
} from '../utils/indexedDbQueue';
import { realtimeSync } from '../utils/realtimeSync';
import { normalizeRecord } from '../data/sampleCases';

export type SyncStatus = 'synced' | 'offline_queued' | 'syncing' | 'offline';

export function useOfflineSync(
  records: HandoverRecord[],
  setRecords: (updater: HandoverRecord[] | ((prev: HandoverRecord[]) => HandoverRecord[])) => void,
  currentId?: string,
  currentUserRole?: string
) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Refresh pending count from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingQueueCount();
      setPendingCount(count);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus(count > 0 ? 'offline_queued' : 'offline');
      } else if (count > 0) {
        setSyncStatus('offline_queued');
      } else {
        setSyncStatus('synced');
      }
    } catch (e) {
      console.warn('Failed to get pending queue count', e);
    }
  }, []);

  // Flush and synchronize all pending IndexedDB queue items to storage and broadcast channel
  const syncOfflineQueue = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const items = await getPendingQueueItems();
      
      if (items.length > 0) {
        // Collect latest records map from queue
        let currentRecords = [...records];

        for (const item of items) {
          if (item.action === 'DELETE') {
            currentRecords = currentRecords.filter((r) => r.id !== item.recordId);
          } else if (item.record) {
            const normalized = normalizeRecord(item.record);
            const idx = currentRecords.findIndex((r) => r.id === normalized.id);
            if (idx >= 0) {
              currentRecords[idx] = normalized;
            } else {
              currentRecords.unshift(normalized);
            }
          }
        }

        // Update state
        setRecords(currentRecords);
        
        // Save latest state to local storage
        localStorage.setItem('maternity_handover_records_v1', JSON.stringify(currentRecords));
        await saveAllOfflineSnapshots(currentRecords);

        // Broadcast to teacher and all other open tabs
        realtimeSync.broadcast({
          type: 'RECORDS_UPDATED',
          records: currentRecords,
          currentId: currentId || (currentRecords[0] ? currentRecords[0].id : ''),
          senderRole: (currentUserRole as any) || 'student',
          senderName: 'IndexedDB 離線佇列自動同步',
        });

        // Clear the synced queue from IndexedDB
        await clearPendingQueue();
        setSyncToastMessage(`已成功將離線暫存的 ${items.length} 筆修訂自動同步並廣播至教師端！`);
        setTimeout(() => setSyncToastMessage(null), 4000);
      }

      setPendingCount(0);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Failed to sync offline queue', err);
      setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    }
  }, [records, setRecords, currentId, currentUserRole]);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncToastMessage('偵測到網路已連線，正在自動同步 IndexedDB 離線佇列...');
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      setSyncToastMessage('目前已進入離線模式，所有修改將自動暫存至 IndexedDB 佇列');
      setTimeout(() => setSyncToastMessage(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue, refreshPendingCount]);

  // Queue record change when modifying in offline mode or online
  const recordOfflineChange = useCallback(
    async (record: HandoverRecord, action: 'SAVE' | 'CREATE' = 'SAVE') => {
      // Save local snapshot to IndexedDB regardless
      await saveOfflineSnapshot(record);

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Enqueue into IndexedDB
        await enqueueOfflineRecord(record, action);
        const count = await getPendingQueueCount();
        setPendingCount(count);
        setSyncStatus('offline_queued');
      } else {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      }
    },
    []
  );

  const recordOfflineDelete = useCallback(
    async (recordId: string) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await enqueueOfflineDelete(recordId);
        const count = await getPendingQueueCount();
        setPendingCount(count);
        setSyncStatus('offline_queued');
      }
    },
    []
  );

  return {
    isOnline,
    pendingCount,
    syncStatus,
    lastSyncedAt,
    syncToastMessage,
    dismissSyncToast: () => setSyncToastMessage(null),
    syncOfflineQueue,
    flushQueueNow: syncOfflineQueue,
    recordOfflineChange,
    recordOfflineDelete,
    refreshPendingCount,
  };
}
