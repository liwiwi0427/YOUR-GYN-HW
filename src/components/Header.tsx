import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  Plus, 
  Copy, 
  Trash2, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  LayoutTemplate, 
  CheckCircle2, 
  Share2, 
  Calculator, 
  Timer, 
  Watch, 
  Type, 
  Wrench, 
  ChevronDown, 
  GraduationCap, 
  User, 
  Radio, 
  Lock, 
  ShieldCheck, 
  Calendar,
  Columns,
  Shield,
  LogOut,
  Syringe,
  Menu,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  Database,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { HandoverRecord } from '../types';
import { SAMPLE_CASES } from '../data/sampleCases';
import { RecordCompletionStats } from '../utils/completionTracker';
import { CircularProgress } from './CircularProgress';
import { UserRole, ROLE_DEFINITIONS, hasPermission } from '../utils/rbac';
import { SyncStatus } from '../hooks/useOfflineSync';

export type FormFontSize = 'sm' | 'md' | 'lg' | 'xl';

interface HeaderProps {
  currentRecord: HandoverRecord;
  records: HandoverRecord[];
  activeView: 'digital' | 'print';
  setActiveView: (view: 'digital' | 'print') => void;
  onSelectRecord: (id: string) => void;
  onNewRecord: () => void;
  onDuplicateRecord: () => void;
  onDeleteRecord: () => void;
  onResetRecord: () => void;
  onLoadSample: (sample: HandoverRecord) => void;
  onExportJson: () => void;
  onImportJson: (record: HandoverRecord) => void;
  onOpenToolkit: (tab?: 'calculator' | 'timer' | 'stopwatch' | 'scales' | 'isbar') => void;
  fontSize: FormFontSize;
  setFontSize: (size: FormFontSize) => void;
  isCompactMode?: boolean;
  setIsCompactMode?: (compact: boolean | ((prev: boolean) => boolean)) => void;
  completionStats?: RecordCompletionStats;
  currentUserRole?: UserRole;
  instructorName?: string;
  currentStudentName?: string;
  currentWeek?: string;
  onOpenTeacherLogin?: () => void;
  onOpenTeacherGrading?: () => void;
  onOpenSplitGrading?: () => void;
  onOpenAdminConsole?: () => void;
  onOpenStudentPortal?: () => void;
  onLogout?: () => void;
  isLiveSyncing?: boolean;
  syncStatus?: SyncStatus;
  pendingCount?: number;
  isOnline?: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRecord,
  records,
  activeView,
  setActiveView,
  onSelectRecord,
  onNewRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onResetRecord,
  onLoadSample,
  onExportJson,
  onImportJson,
  onOpenToolkit,
  fontSize,
  setFontSize,
  isCompactMode = false,
  setIsCompactMode,
  completionStats,
  currentUserRole = 'student',
  instructorName = '指導教師',
  currentStudentName,
  currentWeek,
  onOpenTeacherLogin,
  onOpenTeacherGrading,
  onOpenSplitGrading,
  onOpenAdminConsole,
  onOpenStudentPortal,
  onLogout,
  isLiveSyncing = true,
  syncStatus = 'synced',
  pendingCount = 0,
  isOnline = true,
  onManualSync,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [isSyncPopoverOpen, setIsSyncPopoverOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const manageMenuRef = useRef<HTMLDivElement>(null);
  const syncPopoverRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setIsFontDropdownOpen(false);
      }
      if (manageMenuRef.current && !manageMenuRef.current.contains(e.target as Node)) {
        setIsManageDropdownOpen(false);
      }
      if (syncPopoverRef.current && !syncPopoverRef.current.contains(e.target as Node)) {
        setIsSyncPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrint = () => {
    setActiveView('print');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.basicInfo) {
          onImportJson(parsed);
        } else {
          alert('匯入的檔案格式不符合產科交班表記錄。');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請檢查檔案內容。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fontOptions: { id: FormFontSize; label: string; desc: string }[] = [
    { id: 'sm', label: '小', desc: '適合筆電與精簡檢視' },
    { id: 'md', label: '標準', desc: '預設舒適排版' },
    { id: 'lg', label: '大', desc: '放大文字，清晰閱讀' },
    { id: 'xl', label: '特大', desc: '平板高可讀性與高對比' },
  ];

  const studentDisplay = currentStudentName || currentRecord.internship?.studentName || '實習同學';
  const weekDisplay = currentWeek || currentRecord.internship?.week || '1';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Title Info */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  產科護理學實習個案交班記錄表
                </h1>

                {/* Offline Queue & Live Realtime Sync Status Indicator */}
                <div className="relative inline-flex items-center" ref={syncPopoverRef}>
                  <button
                    type="button"
                    onClick={() => setIsSyncPopoverOpen(!isSyncPopoverOpen)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                      syncStatus === 'syncing'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : syncStatus === 'offline_queued'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                        : !isOnline
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs hover:bg-emerald-100'
                    }`}
                    title="點擊檢視 IndexedDB 離線佇列與即時同步狀態"
                  >
                    {syncStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span className="text-[11px] font-bold">同步中...</span>
                      </>
                    ) : syncStatus === 'offline_queued' || pendingCount > 0 ? (
                      <>
                        <Database className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px] font-bold">離線佇列 ({pendingCount})</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      </>
                    ) : !isOnline ? (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[11px] font-bold">離線暫存</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-bold">已即時同步</span>
                      </>
                    )}
                  </button>

                  {/* Sync Status Dropdown / Details Popover */}
                  {isSyncPopoverOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span>IndexedDB 離線佇列與同步</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isOnline ? '🟢 連線正常' : '⚪ 離線模式'}
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-600 text-[11.5px] leading-relaxed">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500">待同步佇列筆數：</span>
                            <span className={`font-bold ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {pendingCount} 筆暫存變更
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="text-slate-400">本地離線資料庫：</span>
                            <span className="font-mono text-slate-600 font-medium">IndexedDB (安全暫存)</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500">
                          {isOnline 
                            ? '所有修改已即時同步並透過廣播頻道傳遞至教師端評閱系統。' 
                            : '目前處於離線狀態，您的所有填寫與修訂皆已安全存於 IndexedDB 離線佇列中，連線恢復時將自動同步並通知教師。'}
                        </p>

                        {onManualSync && (
                          <button
                            type="button"
                            onClick={() => {
                              onManualSync();
                              setIsSyncPopoverOpen(false);
                            }}
                            disabled={syncStatus === 'syncing'}
                            className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-bold text-xs shadow-2xs transition-all"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                            <span>{syncStatus === 'syncing' ? '正在同步中...' : '立即同步並廣播給老師'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Identity Badge placed below Title with Gray background */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={onOpenStudentPortal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition-colors shadow-2xs"
                  title="管理學生姓名與每週作業"
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>護生：<strong>{studentDisplay}</strong></span>
                  <span className="bg-slate-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
                    第 {weekDisplay} 週
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Unified Management & Review Menu (All system & grading options consolidated) */}
            <div className="relative" ref={manageMenuRef}>
              {currentUserRole === 'admin' ? (
                <button
                  type="button"
                  onClick={() => setIsManageDropdownOpen(!isManageDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                  title="系統管理與評閱選單"
                >
                  <Shield className="w-4 h-4 text-purple-300" />
                  <span>黎哲瑋 (管理與評閱)</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>
              ) : currentUserRole === 'instructor' || currentUserRole === 'hn_np' ? (
                <button
                  type="button"
                  onClick={() => setIsManageDropdownOpen(!isManageDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                  title="教師評閱與教學管理選單"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-200" />
                  <span>{instructorName} 老師 (評閱管理)</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenTeacherLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all"
                  title="老師或管理員登入"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>老師 / 管理員登入</span>
                </button>
              )}

              {/* Consolidated Dropdown Menu */}
              {isManageDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span>{currentUserRole === 'admin' ? '系統管理與評閱中心' : '教師評閱與管理中心'}</span>
                    <span className="text-[10px] text-purple-700 font-bold">
                      {currentUserRole === 'admin' ? 'Super Admin' : instructorName}
                    </span>
                  </div>

                  {currentUserRole === 'admin' && onOpenAdminConsole && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAdminConsole();
                        setIsManageDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-900 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-purple-700" />
                      <div>
                        <div className="font-bold">NIS 全域管理後台</div>
                        <div className="text-[10px] text-slate-400">名冊管理、權限矩陣、稽核日誌</div>
                      </div>
                    </button>
                  )}

                  {onOpenSplitGrading && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSplitGrading();
                        setIsManageDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 transition-colors"
                    >
                      <Columns className="w-4 h-4 text-emerald-700" />
                      <div>
                        <div className="font-bold">雙欄對照批閱</div>
                        <div className="text-[10px] text-slate-400">左側作業、右側評分與電子章</div>
                      </div>
                    </button>
                  )}

                  {onOpenTeacherGrading && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenTeacherGrading();
                        setIsManageDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-teal-50 text-slate-700 hover:text-teal-900 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-teal-700" />
                      <div>
                        <div className="font-bold">全班批閱與進度中心</div>
                        <div className="text-[10px] text-slate-400">進度長條圖、批次 Word/PDF 匯出</div>
                      </div>
                    </button>
                  )}

                  {onOpenStudentPortal && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenStudentPortal();
                        setIsManageDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-700" />
                      <div>
                        <div className="font-bold">師生梯次與名冊檢視</div>
                        <div className="text-[10px] text-slate-400">切換學生與週次作業</div>
                      </div>
                    </button>
                  )}

                  {onLogout && (
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setIsManageDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-bold transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>登出目前身分</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* View Switcher (Icon-only) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="btn-view-digital"
                type="button"
                onClick={() => setActiveView('digital')}
                className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === 'digital'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="數位填寫模式"
                aria-label="數位填寫模式"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
              <button
                id="btn-view-print"
                type="button"
                onClick={() => setActiveView('print')}
                className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeView === 'print'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="A4 紙本預覽 / 列印"
                aria-label="A4 紙本預覽 / 列印"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </div>

            {/* Font Size Toggle Button for Digital Form View */}
            {activeView === 'digital' && (
              <>
                <div className="relative" ref={fontMenuRef}>
                  <button
                    id="btn-font-size-toggle"
                    type="button"
                    onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold transition-colors"
                    title="切換螢幕填寫模式字體大小"
                  >
                    <Type className="w-3.5 h-3.5 text-slate-600" />
                    <span className="font-bold">{fontOptions.find(f => f.id === fontSize)?.label || '字體'}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {isFontDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                        填寫模式字體大小
                      </div>
                      {fontOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFontSize(opt.id);
                            setIsFontDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            fontSize === opt.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{opt.label}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{opt.desc}</div>
                          </div>
                          {fontSize === opt.id && <span className="text-blue-600 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compact Mode Toggle for High-Density Tablet View */}
                {setIsCompactMode && (
                  <button
                    id="btn-compact-mode-toggle"
                    type="button"
                    onClick={() => setIsCompactMode((prev: boolean) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all border ${
                      isCompactMode
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    title={isCompactMode ? '切換為標準間距模式' : '切換為緊湊模式（縮減間距，方便平板/單頁操作）'}
                    aria-label="切換緊湊模式"
                  >
                    {isCompactMode ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>緊湊</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>標準</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Print button (Icon-only) */}
            <button
              id="btn-print-form"
              type="button"
              onClick={handlePrint}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="列印或另存為 PDF"
              aria-label="列印或另存為 PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Syringe (針頭) Icon Menu for Clinical Small Tools */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                id="btn-tools-needle-menu"
                type="button"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${
                  isToolsDropdownOpen 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="產科臨床小工具選單 (針頭圖示)"
                aria-label="產科臨床小工具選單"
              >
                <Syringe className="w-4 h-4 text-emerald-600" />
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Tools Dropdown Menu containing all mini-tools */}
              {isToolsDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
                    <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>產科臨床隨身小工具</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolkit('calculator');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-blue-50 text-slate-700 transition-colors"
                  >
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">簡易型計算機</div>
                      <div className="text-[10px] text-slate-400">含預產期與孕期BMI計算</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolkit('timer');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-amber-50 text-slate-700 transition-colors"
                  >
                    <Timer className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-semibold">臨床計時器</div>
                      <div className="text-[10px] text-slate-400">Apgar 1'/5'、NST、冰敷提醒</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolkit('stopwatch');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 text-slate-700 transition-colors"
                  >
                    <Watch className="w-4 h-4 text-rose-600" />
                    <div>
                      <div className="font-semibold">碼錶與宮縮陣痛記錄</div>
                      <div className="text-[10px] text-slate-400">精準測量與宮縮頻率計時</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolkit('scales');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-emerald-50 text-slate-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">臨床量表指引</div>
                      <div className="text-[10px] text-slate-400">REEDA、Apgar、宮底惡露</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolkit('isbar');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-indigo-50 text-slate-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold">ISBAR 口頭交班產生器</div>
                      <div className="text-[10px] text-slate-400">自動生成標準交班演練稿</div>
                    </div>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Secondary Subbar: Case Selector & Quick Actions */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          
          {/* Current Case Selector */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 whitespace-nowrap">目前個案：</span>
            <select
              id="select-case-record"
              value={currentRecord.id}
              onChange={(e) => onSelectRecord(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[220px] truncate shadow-2xs"
            >
              {records.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.basicInfo.bedNumber ? `[${rec.basicInfo.bedNumber}] ` : ''}
                  {rec.basicInfo.patientName || '未命名新個案'} (第{rec.internship?.week || '1'}週 - {rec.deliveryProcess.deliveryMode || '尚未填分娩'})
                </option>
              ))}
            </select>

            {hasPermission((currentUserRole || 'student') as UserRole, 'create_duplicate_case') ? (
              <>
                <button
                  id="btn-new-case"
                  type="button"
                  onClick={onNewRecord}
                  className="p-1 hover:bg-slate-100 text-slate-700 rounded border border-slate-200"
                  title="指派/新增空白個案"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  id="btn-duplicate-case"
                  type="button"
                  onClick={onDuplicateRecord}
                  className="p-1 hover:bg-slate-100 text-slate-700 rounded border border-slate-200"
                  title="複製目前個案"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                病人指派由指導老師管理
              </span>
            )}
            <button
              id="btn-reset-case"
              type="button"
              onClick={onResetRecord}
              className="p-1 hover:bg-amber-50 text-amber-700 rounded border border-amber-200"
              title="重置當前表單（清空填寫內容但保留表單結構）"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {records.length > 1 && (
              <button
                id="btn-delete-case"
                type="button"
                onClick={onDeleteRecord}
                className="p-1 hover:bg-rose-50 text-rose-600 rounded border border-rose-200"
                title="刪除此個案"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Import/Export */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="btn-export-json"
              type="button"
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
              title="匯出為 JSON 備份檔"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>匯出 JSON</span>
            </button>

            <button
              id="btn-import-json-trigger"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
              title="從 JSON 匯入記錄"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>匯入 JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

        </div>
      </div>
    </header>
  );
};
