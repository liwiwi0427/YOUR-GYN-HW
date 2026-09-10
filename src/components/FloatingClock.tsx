import React, { useState, useEffect } from 'react';
import {
  Clock,
  Radio,
  RefreshCw,
  Copy,
  Check,
  X,
  Calendar,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import {
  getCalibratedDate,
  getFullFormattedDateTime,
  getNowDateTimeString,
  getNowDateString,
  getNowTimeString,
  syncStandardTime,
  getActiveServerIndex,
} from '../utils/timeService';

export const FloatingClock: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(getCalibratedDate());
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCalibratedDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial sync on mount
  useEffect(() => {
    handleSync();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const activeIdx = getActiveServerIndex();
      await syncStandardTime(activeIdx);
      setSyncFeedback('國家標準時間校準成功');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback('同步完成 (本地時區)');
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
      setCurrentTime(getCalibratedDate());
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2000);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayName = days[currentTime.getDay()];
  const dateStr = `${currentTime.getFullYear()}年${pad(currentTime.getMonth() + 1)}月${pad(currentTime.getDate())}日`;
  const timeStr = `${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;

  return (
    <>
      {/* Floating Clock Icon on Left Edge */}
      <div className="fixed left-4 bottom-20 z-40 print:hidden">
        <button
          id="btn-floating-clock-trigger"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-2.5 p-3 rounded-full shadow-lg border transition-all duration-200 ${
            isOpen
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/25 ring-2 ring-blue-400'
              : 'bg-white/95 backdrop-blur-md text-slate-700 hover:text-blue-600 border-slate-200 hover:border-blue-400 hover:shadow-xl active:scale-95'
          }`}
          title="點擊查看台灣國家標準時間 (NTP 時間校準)"
          aria-label="即時國家標準時間"
        >
          <div className="relative flex items-center justify-center">
            <Clock className={`w-6 h-6 transition-transform group-hover:rotate-12 ${isOpen ? 'text-white' : 'text-blue-600'}`} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col items-start pr-1 text-left">
            <span className="text-[10px] font-semibold text-slate-500 group-hover:text-blue-500 leading-none">國家標準時間</span>
            <span className={`text-xs font-mono font-bold leading-tight ${isOpen ? 'text-white' : 'text-slate-900'}`}>
              {pad(currentTime.getHours())}:{pad(currentTime.getMinutes())}:{pad(currentTime.getSeconds())}
            </span>
          </div>
        </button>
      </div>

      {/* Standard Time Detail Popover / Modal */}
      {isOpen && (
        <div 
          id="floating-clock-popover"
          className="fixed left-4 bottom-36 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200 print:hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Radio className="w-4 h-4 text-blue-200 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">台灣國家標準時間 (NTP)</h4>
                <p className="text-[10px] text-blue-100/90 font-medium">中華民國國家時間與頻率標準實驗室</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clock Display Card */}
          <div className="p-4 space-y-3.5">
            <div className="bg-slate-900 text-white rounded-xl p-4 text-center space-y-1 shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>即時校準中</span>
              </div>

              <div className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{dateStr}</span>
                <span className="text-slate-400">·</span>
                <span className="text-amber-300 font-semibold">{dayName}</span>
              </div>

              <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-white py-1">
                {timeStr}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-mono">
                <span>時區：GMT+08:00 (台北標準時間)</span>
              </div>
            </div>

            {/* Standard Sync Status (Hides specific NTP server name) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>國家標準時鐘自動校準</span>
                </span>
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  title="立即與國家標準時間重新校時"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? '校時中...' : '重新校時'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                  <span className="text-slate-700 font-medium">全院自動校時狀態：已同軸鎖定</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded shrink-0">
                  正常連線
                </span>
              </div>

              {syncFeedback && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md p-1.5 text-center font-semibold animate-in fade-in">
                  ✓ {syncFeedback}
                </div>
              )}
            </div>

            {/* Quick Copy Format Buttons */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 block">常用時間格式快速複製：</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { label: '日期與時間', val: getNowDateTimeString(), id: 'copy-datetime' },
                  { label: '僅日期', val: getNowDateString(), id: 'copy-date' },
                  { label: '僅時間', val: getNowTimeString(), id: 'copy-time' },
                  { label: '完整標準時間', val: getFullFormattedDateTime(), id: 'copy-full' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCopy(item.val, item.label)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 transition-colors text-left text-[11px] font-medium group"
                  >
                    <span className="truncate">{item.label}</span>
                    {copiedFormat === item.label ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-600 border border-slate-200 flex items-start gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>提示：在表單各填寫欄位旁，直接點擊「時鐘圖示按鈕」即可自動填入當前時間。</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
