import { HandoverRecord } from '../types';

export interface SyncMessage {
  type: 'RECORD_SAVED' | 'RECORDS_UPDATED' | 'REQUEST_SYNC' | 'PING';
  records?: HandoverRecord[];
  record?: HandoverRecord;
  currentId?: string;
  senderRole?: 'student' | 'instructor';
  senderName?: string;
  timestamp: string;
}

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((message: SyncMessage) => void)[] = [];
  private isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;

  constructor() {
    if (this.isSupported) {
      try {
        this.channel = new BroadcastChannel('maternity_handover_live_channel_v1');
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization fallback', err);
      }
    }

    // Fallback to storage events for cross-tab updates
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'maternity_handover_records_v1' && e.newValue) {
          try {
            const records = JSON.parse(e.newValue);
            this.notifyListeners({
              type: 'RECORDS_UPDATED',
              records,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Storage sync parse error', error);
          }
        }
      });
    }
  }

  public subscribe(callback: (message: SyncMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Error notifying sync listener', err);
      }
    });
  }

  public broadcast(message: Omit<SyncMessage, 'timestamp'>) {
    const fullMsg: SyncMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };
    if (this.channel) {
      try {
        this.channel.postMessage(fullMsg);
      } catch (err) {
        console.warn('Failed to broadcast message', err);
      }
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
