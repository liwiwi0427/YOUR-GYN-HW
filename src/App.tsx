import React, { useState, useEffect, useMemo } from 'react';
import { HandoverRecord } from './types';
import { SAMPLE_CASES, createBlankRecord, normalizeRecord } from './data/sampleCases';
import { Header, FormFontSize } from './components/Header';
import { InternshipHeader } from './components/DigitalForm/InternshipHeader';
import { BasicInfoSection } from './components/DigitalForm/BasicInfoSection';
import { DeliverySection } from './components/DigitalForm/DeliverySection';
import { BabySection } from './components/DigitalForm/BabySection';
import { MaternalSection } from './components/DigitalForm/MaternalSection';
import { WoundSection } from './components/DigitalForm/WoundSection';
import { HandoverSection } from './components/DigitalForm/HandoverSection';
import { DartSection } from './components/DigitalForm/DartSection';
import { SignatureSection } from './components/DigitalForm/SignatureSection';
import { AdmissionAssessmentSection } from './components/DigitalForm/AdmissionAssessmentSection';
import { A4PaperView } from './components/PrintForm/A4PaperView';
import { ClinicalToolkitModal } from './components/ClinicalToolkitModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { NewPatientAdmissionModal } from './components/NewPatientAdmissionModal';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { TeacherGradingModal } from './components/TeacherGradingModal';
import { StudentPortalModal } from './components/StudentPortalModal';
import { SplitGradingView } from './components/SplitGradingView';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { CircularProgress } from './components/CircularProgress';
import { FloatingClock } from './components/FloatingClock';
import { calculateCompletionStats } from './utils/completionTracker';
import { realtimeSync } from './utils/realtimeSync';
import { UserRole, recordAuditLog } from './utils/rbac';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { 
  ArrowUp, 
  Printer, 
  Share2, 
  Sparkles,
  Calculator,
  Timer,
  Watch,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListChecks,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Columns,
  Shield
} from 'lucide-react';

const STORAGE_KEY = 'maternity_handover_records_v1';
const CURRENT_ID_KEY = 'maternity_handover_current_id_v1';
const FONT_SIZE_KEY = 'maternity_handover_font_size_v1';
const COMPACT_MODE_KEY = 'maternity_compact_mode_v1';
const USER_ROLE_KEY = 'maternity_user_role_v1';
const INSTRUCTOR_NAME_KEY = 'maternity_instructor_name_v1';
const STUDENT_NAME_KEY = 'maternity_student_name_v1';
const STUDENT_ID_KEY = 'maternity_student_id_v1';

export default function App() {
  // Initialize records from LocalStorage or samples
  const [records, setRecords] = useState<HandoverRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => normalizeRecord(item));
        }
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    }
    return SAMPLE_CASES.map((item) => normalizeRecord(item));
  });

  const [currentId, setCurrentId] = useState<string>(() => {
    const savedId = localStorage.getItem(CURRENT_ID_KEY);
    if (savedId && records.some((r) => r.id === savedId)) {
      return savedId;
    }
    return records[0]?.id || 'sample_nsd_01';
  });

  const [activeView, setActiveView] = useState<'digital' | 'print'>('digital');
  const [fontSize, setFontSize] = useState<FormFontSize>(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY) as FormFontSize;
    return (['sm', 'md', 'lg', 'xl'].includes(saved) ? saved : 'md') as FormFontSize;
  });
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(COMPACT_MODE_KEY);
    return saved === 'true';
  });

  // User Role & Identity
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(USER_ROLE_KEY) as UserRole;
    if (saved === 'admin' || saved === 'instructor' || saved === 'student') {
      return saved;
    }
    return 'student';
  });

  const [instructorName, setInstructorName] = useState<string>(() => {
    return localStorage.getItem(INSTRUCTOR_NAME_KEY) || '指導教師';
  });

  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem(STUDENT_NAME_KEY) || '實習同學';
  });

  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem(STUDENT_ID_KEY) || '';
  });

  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('maternity_admin_name_v1') || '黎哲瑋 (系統最高管理員)';
  });

  // Modals state
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [toolkitTab, setToolkitTab] = useState<'calculator' | 'timer' | 'stopwatch' | 'scales' | 'isbar'>('calculator');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isTeacherGradingOpen, setIsTeacherGradingOpen] = useState(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);
  const [isSplitGradingOpen, setIsSplitGradingOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);

  // Find current record
  const currentRecord = records.find((r) => r.id === currentId) || records[0] || createBlankRecord();

  // Completion calculation for current record
  const completionStats = useMemo(() => {
    return calculateCompletionStats(currentRecord);
  }, [currentRecord]);

  // Initialize IndexedDB Offline Queue and Sync
  const {
    isOnline,
    syncStatus,
    pendingCount,
    recordOfflineChange,
    recordOfflineDelete,
    flushQueueNow,
    syncToastMessage,
    dismissSyncToast
  } = useOfflineSync(records, setRecords, currentId, currentUserRole);

  // Initialize Firebase Real-time Sync (Primary: 604415246583) & Hourly Consolidated Backup (Backup: 378528653721)
  const {
    firebaseStatus,
    isFirebaseConnected,
    primaryDbId,
    backupDbId,
    lastBackupTime,
    nextBackupCountdown,
    backupSnapshots,
    backupToastMessage,
    dismissBackupToast,
    triggerConsolidatedBackup,
    forceFullSync,
    syncRecord: syncRecordToFirebase,
    deleteRecord: deleteRecordFromFirebase,
  } = useFirebaseSync(records, setRecords, currentId, currentUserRole);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(CURRENT_ID_KEY, currentId);
  }, [currentId]);

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(COMPACT_MODE_KEY, String(isCompactMode));
  }, [isCompactMode]);

  useEffect(() => {
    localStorage.setItem(USER_ROLE_KEY, currentUserRole);
  }, [currentUserRole]);

  useEffect(() => {
    localStorage.setItem(INSTRUCTOR_NAME_KEY, instructorName);
  }, [instructorName]);

  useEffect(() => {
    localStorage.setItem(STUDENT_NAME_KEY, studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem(STUDENT_ID_KEY, studentId);
  }, [studentId]);

  // Subscribe to Realtime Cross-tab Sync
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((msg) => {
      if (msg.type === 'RECORDS_UPDATED' && msg.records && Array.isArray(msg.records)) {
        setRecords(msg.records.map((r) => normalizeRecord(r)));
      } else if (msg.type === 'RECORD_SAVED' && msg.record) {
        const updated = normalizeRecord(msg.record);
        setRecords((prev) => {
          const index = prev.findIndex((r) => r.id === updated.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = updated;
            return next;
          }
          return [updated, ...prev];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Update current record & broadcast realtime sync / offline queue
  const updateCurrentRecord = (updater: (prev: HandoverRecord) => HandoverRecord) => {
    setRecords((prev) => {
      let targetRecord: HandoverRecord | undefined;
      const nextRecords = prev.map((rec) => {
        if (rec.id === currentId) {
          const updated = updater(rec);
          targetRecord = {
            ...updated,
            updatedAt: new Date().toISOString(),
          };
          return targetRecord;
        }
        return rec;
      });
      
      if (targetRecord) {
        // Enqueue to IndexedDB offline queue if offline or snapshot
        recordOfflineChange(targetRecord, 'SAVE');

        // Sync to Primary Firebase Firestore (604415246583)
        syncRecordToFirebase(targetRecord);

        // Broadcast live sync to other tabs/teacher view
        realtimeSync.broadcast({
          type: 'RECORD_SAVED',
          record: targetRecord,
          currentId,
          senderRole: currentUserRole,
        });
      }
      return nextRecords;
    });
  };

  // User Role Authentication handlers
  const handleRoleLogin = (name: string, role: UserRole, account?: any) => {
    setCurrentUserRole(role);
    if (role === 'admin') {
      if (name) {
        setAdminName(name);
        try {
          localStorage.setItem('maternity_admin_name_v1', name);
        } catch (e) {
          // ignore
        }
      }
      recordAuditLog(
        name || '系統最高管理員',
        role,
        'USER_LOGIN',
        `登入身分：全域最高管理員 (${account?.username ? `帳號：${account.username}` : 'admin'})`
      );
    } else if (role === 'instructor' || role === 'hn_np') {
      setInstructorName(name || '指導教師');
      updateCurrentRecord((prev) => ({
        ...prev,
        internship: {
          ...prev.internship,
          instructor: name || prev.internship.instructor || '指導教師',
        },
      }));
      recordAuditLog(
        name || '指導教師',
        role,
        'USER_LOGIN',
        `登入身分：${role === 'hn_np' ? '護理長暨臨床專師' : '實習指導教師'} (${account?.username ? `帳號：${account.username}` : 'teacher'})`
      );
    } else if (role === 'team_leader' || role === 'student') {
      if (name) setStudentName(name);
      if (account?.employeeOrStudentId) {
        setStudentId(account.employeeOrStudentId);
      }
      updateCurrentRecord((prev) => ({
        ...prev,
        internship: {
          ...prev.internship,
          studentName: name || prev.internship.studentName,
          studentId: account?.employeeOrStudentId || prev.internship.studentId,
        },
      }));
      recordAuditLog(
        name || '實習護生',
        role,
        'USER_LOGIN',
        `登入身分：${role === 'team_leader' ? '梯次實習小組長' : '實習護理學生'} (${account?.username ? `帳號：${account.username}` : 'student'})`
      );
    }
  };

  const handleLogout = () => {
    recordAuditLog(
      currentUserRole === 'admin' ? '系統管理員' : instructorName || '使用者',
      currentUserRole,
      'USER_LOGOUT',
      '使用者登出，身分切換回護理實習學生'
    );
    setCurrentUserRole('student');
    setIsSplitGradingOpen(false);
    setIsAdminConsoleOpen(false);
  };

  // Student Identity handlers
  const handleUpdateStudentIdentity = (name: string, id: string) => {
    setStudentName(name);
    setStudentId(id);
    updateCurrentRecord((prev) => ({
      ...prev,
      internship: {
        ...prev.internship,
        studentName: name,
        studentId: id,
      },
    }));
  };

  // Add new weekly record
  const handleAddNewWeekRecord = (weekNumber: string, sName: string, sId: string) => {
    const blank = createBlankRecord();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    
    blank.id = `week_${weekNumber}_${Date.now()}`;
    blank.basicInfo.admissionDate = dateStr;
    blank.internship = {
      ...blank.internship,
      unit: '5B 婦產科病房',
      studentName: sName || studentName,
      studentId: sId || studentId,
      instructor: instructorName || '指導教師',
      week: weekNumber,
      date: dateStr,
    };

    const normalized = normalizeRecord(blank);
    const updated = [normalized, ...records];
    setRecords(updated);
    setCurrentId(normalized.id);
    setActiveView('digital');

    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId: normalized.id,
    });
  };

  // Record management actions
  const handleNewRecord = () => {
    setIsNewPatientModalOpen(true);
  };

  const handleConfirmNewRecord = (hasAdmissionAssessment: boolean) => {
    const blank = createBlankRecord();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nowStr = `${dateStr}T${timeStr}`;

    blank.basicInfo.admissionDate = dateStr;
    blank.internship.studentName = studentName;
    blank.internship.studentId = studentId;
    blank.internship.instructor = instructorName || '指導教師';

    if (hasAdmissionAssessment) {
      blank.admissionAssessment = {
        ...blank.admissionAssessment!,
        enabled: true,
        roomInDateTime: nowStr,
        assessmentDateTime: nowStr,
      };
    } else {
      blank.admissionAssessment = {
        ...blank.admissionAssessment!,
        enabled: false,
        roomInDateTime: '',
        assessmentDateTime: '',
      };
    }

    const normalized = normalizeRecord(blank);
    const updated = [normalized, ...records];
    setRecords(updated);
    setCurrentId(normalized.id);
    setIsNewPatientModalOpen(false);
    setActiveView('digital');

    // Realtime broadcast & Firebase primary sync
    syncRecordToFirebase(normalized);
    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId: normalized.id,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (hasAdmissionAssessment) {
            scrollToSection('sec-admission');
          } else {
            scrollToSection('sec-basic');
          }
        }, 120);
      });
    });
  };

  const handleDuplicateRecord = () => {
    const dup: HandoverRecord = {
      ...JSON.parse(JSON.stringify(currentRecord)),
      id: `case_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basicInfo: {
        ...currentRecord.basicInfo,
        patientName: `${currentRecord.basicInfo.patientName || '個案'} (副本)`,
      },
    };
    const updated = [dup, ...records];
    setRecords(updated);
    setCurrentId(dup.id);
    syncRecordToFirebase(dup);
    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId: dup.id,
    });
  };

  const handleDeleteRecord = () => {
    if (records.length <= 1) {
      alert('請至少保留一個個案記錄。');
      return;
    }
    if (window.confirm(`確定要刪除「${currentRecord.basicInfo.patientName || '此個案'}」嗎？`)) {
      recordOfflineDelete(currentId);
      deleteRecordFromFirebase(currentId);
      const remaining = records.filter((r) => r.id !== currentId);
      setRecords(remaining);
      setCurrentId(remaining[0].id);
      realtimeSync.broadcast({
        type: 'RECORDS_UPDATED',
        records: remaining,
        currentId: remaining[0].id,
      });
    }
  };

  const handleConfirmResetRecord = () => {
    const blank = createBlankRecord();
    const updated = records.map((rec) => {
      if (rec.id === currentId) {
        return {
          ...blank,
          id: currentId,
          createdAt: rec.createdAt,
          updatedAt: new Date().toISOString(),
          internship: {
            ...blank.internship,
            unit: rec.internship.unit || '5B 婦產科病房',
            studentName: rec.internship.studentName || studentName,
            studentId: rec.internship.studentId || studentId,
            instructor: rec.internship.instructor || instructorName || '指導教師',
            week: rec.internship.week || '1',
            date: new Date().toISOString().split('T')[0],
          },
        };
      }
      return rec;
    });

    setRecords(updated);
    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId,
    });
  };

  const handleLoadSample = (sample: HandoverRecord) => {
    const cloned: HandoverRecord = {
      ...JSON.parse(JSON.stringify(sample)),
      id: `case_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [cloned, ...records];
    setRecords(updated);
    setCurrentId(cloned.id);
    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId: cloned.id,
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const fileName = `${currentRecord.basicInfo.bedNumber || '產科'}_${currentRecord.basicInfo.patientName || '個案交班記錄'}_第${currentRecord.internship?.week || '1'}週_${new Date().toISOString().split('T')[0]}.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (imported: HandoverRecord) => {
    const newRecord: HandoverRecord = {
      ...imported,
      id: `case_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    setCurrentId(newRecord.id);
    realtimeSync.broadcast({
      type: 'RECORDS_UPDATED',
      records: updated,
      currentId: newRecord.id,
    });
  };

  const handleOpenToolkit = (tab?: 'calculator' | 'timer' | 'stopwatch' | 'scales' | 'isbar') => {
    if (tab) setToolkitTab(tab);
    setIsToolkitOpen(true);
  };

  const handleOpenSplitGrading = (targetId?: string) => {
    if (targetId) {
      setCurrentId(targetId);
    }
    setIsSplitGradingOpen(true);
  };

  // Section nav items with mapped completion keys
  const navSections: { id: string; label: string; key?: keyof typeof completionStats.sections }[] = [
    { id: 'all', label: '全部展開' },
    { id: 'sec-intern', label: '實習基本', key: 'internship' },
    { id: 'sec-basic', label: '產婦基本', key: 'basicInfo' },
    { id: 'sec-admission', label: '入院評估', key: 'admissionAssessment' },
    { id: 'sec-delivery', label: '生產過程', key: 'deliveryProcess' },
    { id: 'sec-baby', label: '寶寶狀況', key: 'babyStatus' },
    { id: 'sec-maternal', label: '產後評估', key: 'maternalStatus' },
    { id: 'sec-wound', label: '傷口評估', key: 'woundAssessment' },
    { id: 'sec-notes', label: '交班事項', key: 'handoverNotes' },
    { id: 'sec-dart', label: 'DART記錄', key: 'dartFocus' },
    { id: 'sec-signature', label: '簽章評閱', key: 'signatures' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      const headerElem = document.querySelector('header');
      const navElem = document.querySelector('.sticky');
      const headerH = headerElem ? headerElem.getBoundingClientRect().height : 70;
      const navH = navElem ? navElem.getBoundingClientRect().height : 48;
      const totalOffset = headerH + navH + 16;
      const elemTop = elem.getBoundingClientRect().top + window.pageYOffset - totalOffset;
      window.scrollTo({ top: Math.max(0, elemTop), behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        currentRecord={currentRecord}
        records={records}
        activeView={activeView}
        setActiveView={setActiveView}
        onSelectRecord={setCurrentId}
        onNewRecord={handleNewRecord}
        onDuplicateRecord={handleDuplicateRecord}
        onDeleteRecord={handleDeleteRecord}
        onResetRecord={() => setIsResetConfirmOpen(true)}
        onLoadSample={handleLoadSample}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onOpenToolkit={handleOpenToolkit}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isCompactMode={isCompactMode}
        setIsCompactMode={setIsCompactMode}
        completionStats={completionStats}
        currentUserRole={currentUserRole}
        instructorName={instructorName}
        currentStudentName={studentName}
        currentWeek={currentRecord.internship?.week || '1'}
        onOpenTeacherLogin={() => setIsTeacherLoginOpen(true)}
        onOpenTeacherGrading={() => setIsTeacherGradingOpen(true)}
        onOpenSplitGrading={() => handleOpenSplitGrading(currentId)}
        onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
        onOpenStudentPortal={() => setIsStudentPortalOpen(true)}
        onLogout={handleLogout}
        isLiveSyncing={true}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        isOnline={isOnline}
        onManualSync={flushQueueNow}
        firebaseStatus={firebaseStatus}
        isFirebaseConnected={isFirebaseConnected}
        primaryDbId={primaryDbId}
        backupDbId={backupDbId}
        nextBackupCountdown={nextBackupCountdown}
        lastBackupTime={lastBackupTime}
        onTriggerHourlyBackup={triggerConsolidatedBackup}
        onForceFullSync={forceFullSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeView === 'print' ? (
          <div>
            <div className="print:hidden bg-blue-50 border-b border-blue-200 py-3 px-4 text-center text-xs text-blue-950 font-medium">
              <span>📄 目前為 </span>
              <strong className="font-bold">A4 雙頁紙本列印預覽模式</strong>
              <span>（完全還原實習交班記錄原始表單格式）。您可以點擊右上角「列印 / 存為 PDF」或切換回「數位填寫模式」。</span>
            </div>
            <A4PaperView record={currentRecord} onUpdateRecord={updateCurrentRecord} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            
            {/* Realtime Completion Tracker Progress Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Overall Completion Progress */}
              <div className="flex items-center gap-3.5">
                <CircularProgress 
                  percentage={completionStats.totalPercentage} 
                  size={52} 
                  strokeWidth={4.5} 
                  className="shadow-inner bg-slate-50 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      第 {currentRecord.internship?.week || '1'} 週作業填寫完成度
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      completionStats.totalPercentage === 100 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : completionStats.totalPercentage >= 60 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {completionStats.totalPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已完成 <strong>{completionStats.totalFilled}</strong> / {completionStats.totalFields} 項核心欄位
                    {completionStats.totalPercentage === 100 ? (
                      <span className="text-emerald-700 font-semibold ml-2">✓ 本週作業所有必填段落已全數完成！</span>
                    ) : (
                      <span className="text-slate-400 ml-2">（各段落進度可於下方導覽列個別確認）</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right: Quick Action Controls */}
              <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                {currentUserRole === 'admin' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAdminConsoleOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <Shield className="w-4 h-4 text-purple-300" />
                      <span>NIS 後台權限管理</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSplitGrading(currentId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <Columns className="w-4 h-4" />
                      <span>雙欄對照批閱</span>
                    </button>
                  </div>
                ) : currentUserRole === 'instructor' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSplitGrading(currentId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <Columns className="w-4 h-4" />
                      <span>雙欄對照批閱</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTeacherGradingOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>批閱中心 ({records.length})</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsStudentPortalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>管理每週實習作業</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => scrollToSection('sec-signature')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ListChecks className="w-3.5 h-3.5 text-slate-500" />
                  <span>前往簽章評閱</span>
                </button>
              </div>

            </div>

            {/* Quick Section Navigation Bar with Individual Circular Progress Trackers */}
            <div className="sticky top-[96px] z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 shadow-xs mb-6 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {navSections.map((sec) => {
                  const stat = sec.key ? completionStats.sections[sec.key] : undefined;
                  const pct = stat ? stat.percentage : undefined;
                  const isActive = activeSection === sec.id;

                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      {pct !== undefined && (
                        <CircularProgress 
                          percentage={pct} 
                          size={18} 
                          strokeWidth={2.5} 
                          showText={false}
                          colorClass={
                            isActive 
                              ? 'stroke-white' 
                              : pct === 100 
                              ? 'stroke-emerald-600' 
                              : pct >= 50 
                              ? 'stroke-blue-600' 
                              : 'stroke-slate-400'
                          }
                        />
                      )}
                      <span>{sec.label}</span>
                      {pct !== undefined && (
                        <span className={`text-[10px] font-bold ${
                          isActive ? 'text-blue-100' : pct === 100 ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {pct}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Digital Form Components with dynamic font scaling & compact mode */}
            <div className={`space-y-6 form-font-${fontSize} ${isCompactMode ? 'form-compact' : ''}`}>
              
              <div id="sec-intern">
                <InternshipHeader record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-basic">
                <BasicInfoSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-admission">
                <AdmissionAssessmentSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-delivery">
                <DeliverySection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-baby">
                <BabySection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-maternal">
                <MaternalSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-wound">
                <WoundSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-notes">
                <HandoverSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-dart">
                <DartSection record={currentRecord} onChange={updateCurrentRecord} />
              </div>

              <div id="sec-signature">
                <SignatureSection 
                  record={currentRecord} 
                  onChange={updateCurrentRecord}
                  currentUserRole={currentUserRole}
                  onRequireTeacherLogin={() => setIsTeacherLoginOpen(true)}
                />
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Floating back to top button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-700 rounded-lg shadow-md border border-slate-200 print:hidden transition-all"
        title="回到頂端"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Unified Clinical Toolkit Modal */}
      <ClinicalToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        record={currentRecord}
        defaultTab={toolkitTab}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetRecord}
        caseName={currentRecord.basicInfo.patientName}
        bedNumber={currentRecord.basicInfo.bedNumber}
      />

      {/* New Patient Admission Assessment Prompt Modal */}
      <NewPatientAdmissionModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onConfirm={handleConfirmNewRecord}
      />

      {/* Teacher / Admin Login & Authentication Modal */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        isLoggedIn={currentUserRole !== 'student'}
        currentUserRole={currentUserRole}
        instructorName={instructorName}
        onLogin={handleRoleLogin}
        onLogout={handleLogout}
      />

      {/* Teacher Grading & Class Homework Review Modal */}
      <TeacherGradingModal
        isOpen={isTeacherGradingOpen}
        onClose={() => setIsTeacherGradingOpen(false)}
        records={records}
        currentId={currentId}
        onSelectRecord={(id) => setCurrentId(id)}
        onOpenSplitGrading={handleOpenSplitGrading}
        onNewPatientAssignment={handleNewRecord}
        instructorName={instructorName}
      />

      {/* Student Weekly Assignments Portal Modal */}
      <StudentPortalModal
        isOpen={isStudentPortalOpen}
        onClose={() => setIsStudentPortalOpen(false)}
        records={records}
        currentId={currentId}
        onSelectRecord={(id) => setCurrentId(id)}
        currentStudentName={studentName}
        currentStudentId={studentId}
        onUpdateStudentIdentity={handleUpdateStudentIdentity}
        onAddNewWeekRecord={handleAddNewWeekRecord}
      />

      {/* Split-Screen Dual-Column Fast Grading View */}
      {isSplitGradingOpen && (
        <SplitGradingView
          isOpen={isSplitGradingOpen}
          onClose={() => setIsSplitGradingOpen(false)}
          record={currentRecord}
          records={records}
          currentId={currentId}
          onSelectRecord={(id) => setCurrentId(id)}
          onUpdateRecord={updateCurrentRecord}
          instructorName={instructorName}
          currentUserRole={currentUserRole}
        />
      )}

      {/* NIS Admin Management & RBAC Console Modal */}
      {isAdminConsoleOpen && (
        <AdminConsoleModal
          isOpen={isAdminConsoleOpen}
          onClose={() => setIsAdminConsoleOpen(false)}
          records={records}
          onRestoreDatabase={(newRecords) => {
            setRecords(newRecords);
            if (newRecords.length > 0) {
              setCurrentId(newRecords[0].id);
            }
            forceFullSync(newRecords);
            realtimeSync.broadcast({
              type: 'RECORDS_UPDATED',
              records: newRecords,
              currentId: newRecords[0]?.id || '',
            });
          }}
          currentUserRole={currentUserRole}
          currentAdminName={adminName}
          onLogout={handleLogout}
          firebaseStatus={firebaseStatus}
          isFirebaseConnected={isFirebaseConnected}
          primaryDbId={primaryDbId}
          backupDbId={backupDbId}
          lastBackupTime={lastBackupTime}
          nextBackupCountdown={nextBackupCountdown}
          backupSnapshots={backupSnapshots}
          onTriggerHourlyBackup={triggerConsolidatedBackup}
          onForceFullSync={forceFullSync}
        />
      )}

      {/* Floating National Standard NTP Clock (Taiwan stdtime.gov.tw) */}
      <FloatingClock />

      {/* Realtime / Offline Sync Floating Toast Banner */}
      {syncToastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 text-xs animate-slide-up backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span className="font-medium text-slate-100">{syncToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={dismissSyncToast}
            className="text-slate-400 hover:text-white text-sm font-bold ml-2 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Firebase Hourly Backup Notification Toast */}
      {backupToastMessage && (
        <div className="fixed bottom-20 right-5 z-50 max-w-md bg-emerald-950/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-700 flex items-center justify-between gap-3 text-xs animate-slide-up backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-emerald-100">{backupToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={dismissBackupToast}
            className="text-emerald-300 hover:text-white font-bold ml-2 px-1 text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
