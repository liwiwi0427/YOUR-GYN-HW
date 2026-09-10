/**
 * 國家標準時間伺服器 (NTP) 同步與時間格式化服務
 * 支援台灣國家時間與頻率標準實驗室 (stdtime.gov.tw) 伺服器群：
 * - watch.stdtime.gov.tw
 * - time.stdtime.gov.tw
 * - clock.stdtime.gov.tw
 * - tick.stdtime.gov.tw
 */

export interface NtpServerInfo {
  host: string;
  name: string;
  description: string;
  status: 'synced' | 'connecting' | 'fallback' | 'ready';
  lastLatencyMs?: number;
}

export const NTP_SERVERS: NtpServerInfo[] = [
  { host: 'watch.stdtime.gov.tw', name: '國家標準時間伺服器 1 (watch)', description: '中華民國國家時間與頻率標準實驗室 (主伺服器群 1)', status: 'ready' },
  { host: 'time.stdtime.gov.tw', name: '國家標準時間伺服器 2 (time)', description: '中華民國國家時間與頻率標準實驗室 (備援伺服器群 2)', status: 'ready' },
  { host: 'clock.stdtime.gov.tw', name: '國家標準時間伺服器 3 (clock)', description: '中華民國國家時間與頻率標準實驗室 (備援伺服器群 3)', status: 'ready' },
  { host: 'tick.stdtime.gov.tw', name: '國家標準時間伺服器 4 (tick)', description: '中華民國國家時間與頻率標準實驗室 (備援伺服器群 4)', status: 'ready' },
];

const NTP_STORAGE_KEY = 'maternity_ntp_server_index';

function getStoredNtpServerIndex(): number {
  try {
    const val = localStorage.getItem(NTP_STORAGE_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (parsed >= 0 && parsed < NTP_SERVERS.length) return parsed;
    }
  } catch {}
  return 0;
}

let activeServerIndex = getStoredNtpServerIndex();
let timeOffsetMs = 0;
let lastSyncTimestamp = 0;
let isSyncing = false;

/**
 * 雙位數補零
 */
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * 取得校準後的 Date 物件
 */
export function getCalibratedDate(): Date {
  const nowMs = Date.now() + timeOffsetMs;
  return new Date(nowMs);
}

/**
 * 取得校準後的 Date 物件（別名）
 */
export function getStandardTime(): Date {
  return getCalibratedDate();
}

/**
 * 取得 YYYY-MM-DDTHH:mm 格式（適用於 datetime-local 輸入框）
 */
export function getNowDateTimeLocal(): string {
  const d = getCalibratedDate();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 取得 YYYY-MM-DD HH:mm 格式（適用於標準臨床文字輸入欄位）
 */
export function getNowDateTimeString(): string {
  const d = getCalibratedDate();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 取得 YYYY-MM-DD 格式（適用於日期輸入欄位）
 */
export function getNowDateString(): string {
  const d = getCalibratedDate();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 取得 HH:mm 格式（適用於純時間輸入欄位）
 */
export function getNowTimeString(): string {
  const d = getCalibratedDate();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 取得 HH:mm:ss 格式
 */
export function getNowTimeWithSecondsString(): string {
  const d = getCalibratedDate();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 取得完整中文標準時間字串（例如：2026年08月26日 星期三 11:35:20）
 */
export function getFullFormattedDateTime(): string {
  const d = getCalibratedDate();
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayName = days[d.getDay()];
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${dayName} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 取得目前作用中的 NTP 伺服器索引
 */
export function getActiveServerIndex(): number {
  return activeServerIndex;
}

/**
 * 取得目前作用中的 NTP 伺服器名稱
 */
export function getActiveNtpServer(): NtpServerInfo {
  return NTP_SERVERS[activeServerIndex];
}

/**
 * 取得所有 NTP 伺服器清單與狀態
 */
export function getAllNtpServers(): NtpServerInfo[] {
  return [...NTP_SERVERS];
}

/**
 * 設定切換作用中的 NTP 伺服器（由管理員控制）
 */
export function setActiveNtpServer(index: number): void {
  if (index >= 0 && index < NTP_SERVERS.length) {
    activeServerIndex = index;
    try {
      localStorage.setItem(NTP_STORAGE_KEY, index.toString());
    } catch {}
  }
}

/**
 * 測試指定 NTP 伺服器的連線延遲 (ms)
 */
export async function testNtpServerLatency(index: number): Promise<{ success: boolean; latency: number }> {
  if (index < 0 || index >= NTP_SERVERS.length) {
    return { success: false, latency: -1 };
  }
  const srv = NTP_SERVERS[index];
  const start = Date.now();
  try {
    const res = await fetch(`/api/time?server=${encodeURIComponent(srv.host)}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });
    const latency = Date.now() - start;
    if (res.ok) {
      srv.lastLatencyMs = latency;
      return { success: true, latency };
    }
  } catch {}

  try {
    const startPing = Date.now();
    const headRes = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const latency = Date.now() - startPing;
    if (headRes.ok) {
      srv.lastLatencyMs = latency;
      return { success: true, latency };
    }
  } catch {}

  return { success: false, latency: -1 };
}

/**
 * 取得目前的網路校時位移（毫秒）與上次校時時間
 */
export function getSyncStatus(): { offsetMs: number; lastSync: number; isSyncing: boolean } {
  return {
    offsetMs: timeOffsetMs,
    lastSync: lastSyncTimestamp,
    isSyncing,
  };
}

/**
 * 向伺服器 API 同步國家標準時間
 */
export async function syncStandardTime(targetServerIndex?: number): Promise<{ success: boolean; server: string; offsetMs: number }> {
  if (targetServerIndex !== undefined && targetServerIndex >= 0 && targetServerIndex < NTP_SERVERS.length) {
    activeServerIndex = targetServerIndex;
  }

  const currentServer = NTP_SERVERS[activeServerIndex];
  isSyncing = true;
  currentServer.status = 'connecting';

  const startTime = Date.now();

  try {
    const res = await fetch(`/api/time?server=${encodeURIComponent(currentServer.host)}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (res.ok) {
      const data = await res.json();
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      if (typeof data.timestamp === 'number') {
        // 計算網路延遲校正
        const estimatedServerNow = data.timestamp + Math.floor(latency / 2);
        timeOffsetMs = estimatedServerNow - endTime;
        lastSyncTimestamp = endTime;
        currentServer.status = 'synced';
        currentServer.lastLatencyMs = latency;
        isSyncing = false;
        return { success: true, server: currentServer.host, offsetMs: timeOffsetMs };
      }
    }
  } catch {
    // 若後端 API 暫不可用或在純前端環境，使用 HTTP Date 標頭或系統時間進行校時
  }

  try {
    // 備用：利用 HTTP Date 標頭
    const pingStart = Date.now();
    const headRes = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
    const pingEnd = Date.now();
    const serverDateHeader = headRes.headers.get('date');
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      const latency = pingEnd - pingStart;
      timeOffsetMs = (serverTime + latency / 2) - pingEnd;
      lastSyncTimestamp = Date.now();
      currentServer.status = 'synced';
      currentServer.lastLatencyMs = latency;
      isSyncing = false;
      return { success: true, server: `${currentServer.host} (HTTP)`, offsetMs: timeOffsetMs };
    }
  } catch {
    // Fallback to local clock
  }

  timeOffsetMs = 0;
  lastSyncTimestamp = Date.now();
  currentServer.status = 'fallback';
  currentServer.lastLatencyMs = 0;
  isSyncing = false;
  return { success: true, server: `${currentServer.host} (本機標準時區)`, offsetMs: 0 };
}
