import { HandoverRecord } from '../types';

export interface OfflineQueueItem {
  id?: number;
  recordId: string;
  action: 'SAVE' | 'CREATE' | 'DELETE' | 'BULK_UPDATE';
  record?: HandoverRecord;
  queuedAt: string;
  synced: boolean;
}

const DB_NAME = 'ObstetricHandoverOfflineDB_v1';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_queue';
const SNAPSHOTS_STORE = 'offline_snapshots';

/**
 * Opens or upgrades the IndexedDB database instance safely.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store for offline pending sync actions
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('recordId', 'recordId', { unique: false });
        queueStore.createIndex('synced', 'synced', { unique: false });
        queueStore.createIndex('queuedAt', 'queuedAt', { unique: false });
      }

      // Store for local offline full data snapshots
      if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
        const snapshotStore = db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
        snapshotStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Adds an offline record change to the IndexedDB queue and saves a snapshot.
 */
export async function enqueueOfflineRecord(
  record: HandoverRecord,
  action: 'SAVE' | 'CREATE' = 'SAVE'
): Promise<number> {
  try {
    const db = await openDB();
    
    // Save to snapshots store for instant offline persistence
    await saveOfflineSnapshot(record);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);

      const queueItem: OfflineQueueItem = {
        recordId: record.id,
        action,
        record,
        queuedAt: new Date().toISOString(),
        synced: false,
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to enqueue to IndexedDB', err);
    return 0;
  }
}

/**
 * Adds a delete operation to the offline sync queue.
 */
export async function enqueueOfflineDelete(recordId: string): Promise<number> {
  try {
    const db = await openDB();
    await deleteOfflineSnapshot(recordId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);

      const queueItem: OfflineQueueItem = {
        recordId,
        action: 'DELETE',
        queuedAt: new Date().toISOString(),
        synced: false,
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to enqueue delete to IndexedDB', err);
    return 0;
  }
}

/**
 * Returns the count of pending (unsynced) items in the offline queue.
 */
export async function getPendingQueueCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([QUEUE_STORE], 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result || 0);
      countReq.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * Retrieves all pending offline queue items.
 */
export async function getPendingQueueItems(): Promise<OfflineQueueItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Clears all pending queue items after successful synchronization.
 */
export async function clearPendingQueue(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB queue', err);
  }
}

/**
 * Saves or updates a single record snapshot in IndexedDB for local offline retrieval.
 */
export async function saveOfflineSnapshot(record: HandoverRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SNAPSHOTS_STORE], 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save snapshot to IndexedDB', err);
  }
}

/**
 * Saves all current records to IndexedDB as resilient snapshots.
 */
export async function saveAllOfflineSnapshots(records: HandoverRecord[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SNAPSHOTS_STORE], 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      records.forEach((rec) => store.put(rec));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save all snapshots to IndexedDB', err);
  }
}

/**
 * Deletes a snapshot record from IndexedDB.
 */
export async function deleteOfflineSnapshot(recordId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SNAPSHOTS_STORE], 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      const request = store.delete(recordId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to delete snapshot from IndexedDB', err);
  }
}

/**
 * Retrieves all offline saved record snapshots from IndexedDB.
 */
export async function getOfflineSnapshots(): Promise<HandoverRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SNAPSHOTS_STORE], 'readonly');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}
