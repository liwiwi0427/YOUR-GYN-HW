import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  X, 
  Layers, 
  Users, 
  Building, 
  History, 
  Database, 
  LogOut, 
  Check, 
  AlertTriangle, 
  Lock, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Settings,
  Sparkles,
  KeyRound,
  Shield,
  FileSpreadsheet,
  GraduationCap,
  Plus,
  Edit2,
  Phone,
  Mail,
  UserPlus,
  Building2,
  Stethoscope,
  Crown,
  CheckSquare,
  Clock,
  Activity,
  Radio,
  RefreshCw,
  Zap
} from 'lucide-react';
import { HandoverRecord } from '../types';
import { 
  NTP_SERVERS,
  getActiveServerIndex,
  setActiveNtpServer,
  syncStandardTime,
  testNtpServerLatency,
  getSyncStatus,
  getStandardTime
} from '../utils/timeService';
import { 
  UserRole, 
  ROLE_DEFINITIONS, 
  PERMISSION_CATEGORIES, 
  PERMISSION_LIST, 
  PermissionDefinition, 
  getSavedPermissionMatrix, 
  savePermissionMatrix, 
  getAuditLogs, 
  logAuditEvent, 
  clearAuditLogs, 
  AuditLogEntry 
} from '../utils/rbac';
import {
  ClinicalUnit,
  FacultyMember,
  StudentMember,
  getClinicalUnits,
  saveClinicalUnits,
  getFacultyRoster,
  saveFacultyRoster,
  getStudentRoster,
  saveStudentRoster,
  DEFAULT_CLINICAL_UNITS,
  DEFAULT_FACULTY_ROSTER,
  DEFAULT_STUDENT_ROSTER
} from '../utils/rosterStore';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HandoverRecord[];
  onImportAllRecords: (records: HandoverRecord[]) => void;
  onResetToSampleRecords: () => void;
  onLogout: () => void;
  currentAdminName?: string;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  records,
  onImportAllRecords,
  onResetToSampleRecords,
  onLogout,
  currentAdminName = '系統最高管理員 (Super Admin)',
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'rbac' | 'roster' | 'units' | 'ntp' | 'logs' | 'database'>('rbac');

  // NTP Server Management State
  const [selectedNtpIndex, setSelectedNtpIndex] = useState<number>(() => getActiveServerIndex());
  const [ntpTestingIndex, setNtpTestingIndex] = useState<number | null>(null);
  const [ntpLatencies, setNtpLatencies] = useState<{ [index: number]: number | null }>({});
  const [isNtpSyncing, setIsNtpSyncing] = useState(false);
  const [ntpSyncMsg, setNtpSyncMsg] = useState<string | null>(null);
  const [currentTimeSample, setCurrentTimeSample] = useState<string>(() => getStandardTime().toLocaleString('zh-TW'));
  
  // RBAC Matrix State
  const [matrix, setMatrix] = useState<Record<string, UserRole[]>>(() => getSavedPermissionMatrix());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [rbacSearch, setRbacSearch] = useState<string>('');
  const [isMatrixSaved, setIsMatrixSaved] = useState(false);

  // Dynamic Units State
  const [units, setUnits] = useState<ClinicalUnit[]>(() => getClinicalUnits());
  const [editingUnit, setEditingUnit] = useState<ClinicalUnit | null>(null);
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [unitForm, setUnitForm] = useState<Partial<ClinicalUnit>>({
    code: '',
    name: '',
    floor: '',
    bedCount: 20,
    description: '',
    isActive: true,
  });

  // Dynamic Faculty State
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => getFacultyRoster());
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [isCreatingFaculty, setIsCreatingFaculty] = useState(false);
  const [facultyForm, setFacultyForm] = useState<Partial<FacultyMember>>({
    facultyNumber: '',
    name: '',
    role: 'instructor',
    title: '',
    primaryUnit: '5B 婦產科病房',
    email: '',
    phone: '',
    isMainSupervisor: false,
  });

  // Dynamic Students State
  const [students, setStudents] = useState<StudentMember[]>(() => getStudentRoster());
  const [editingStudent, setEditingStudent] = useState<StudentMember | null>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState<Partial<StudentMember>>({
    studentId: '',
    name: '',
    cohort: '114學年第一梯次',
    assignedWeek: '1',
    assignedUnit: '5B 婦產科病房',
    assignedInstructor: '臨床實習指導教師',
    groupName: '第 1 組',
    isTeamLeader: false,
    status: 'active',
  });

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [logFilterSeverity, setLogFilterSeverity] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  // Database actions confirmation states
  const [confirmFactoryReset, setConfirmFactoryReset] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync logs when tab changes
  const handleTabChange = (tab: 'rbac' | 'roster' | 'units' | 'ntp' | 'logs' | 'database') => {
    setActiveTab(tab);
    if (tab === 'logs') {
      setLogs(getAuditLogs());
    }
    if (tab === 'ntp') {
      setSelectedNtpIndex(getActiveServerIndex());
      setCurrentTimeSample(getStandardTime().toLocaleString('zh-TW'));
    }
  };

  // Test single server latency
  const handleTestLatency = async (idx: number) => {
    setNtpTestingIndex(idx);
    const res = await testNtpServerLatency(idx);
    setNtpLatencies((prev) => ({ ...prev, [idx]: res.success ? res.latency : null }));
    setNtpTestingIndex(null);
  };

  // Test all servers latency
  const handleTestAllLatencies = async () => {
    for (let i = 0; i < NTP_SERVERS.length; i++) {
      setNtpTestingIndex(i);
      const res = await testNtpServerLatency(i);
      setNtpLatencies((prev) => ({ ...prev, [i]: res.success ? res.latency : null }));
    }
    setNtpTestingIndex(null);
  };

  // Select and save NTP Server
  const handleApplyNtpServer = async (idx: number) => {
    setIsNtpSyncing(true);
    setSelectedNtpIndex(idx);
    setActiveNtpServer(idx);
    const success = await syncStandardTime(idx);
    setIsNtpSyncing(false);
    
    setCurrentTimeSample(getStandardTime().toLocaleString('zh-TW'));
    
    if (success) {
      setNtpSyncMsg(`已成功切換並同步至 ${NTP_SERVERS[idx].name} (${NTP_SERVERS[idx].host})`);
      logAuditEvent(
        currentAdminName,
        'admin',
        '時間同步',
        `全域指定 NTP 伺服器：${NTP_SERVERS[idx].host}`,
        `管理員已將全院產科護理資訊系統校時伺服器切換為 ${NTP_SERVERS[idx].name}。所有學生端時鐘與病歷填報時間均以此基準同軸校準。`,
        'success'
      );
    } else {
      setNtpSyncMsg(`切換為 ${NTP_SERVERS[idx].name}，並使用標準時間備用源`);
    }

    setTimeout(() => setNtpSyncMsg(null), 4000);
  };

  // Toggle permission for a role
  const handleTogglePermission = (key: string, role: UserRole) => {
    // Admin always has all permissions locked
    if (role === 'admin') return;

    setMatrix((prev) => {
      const currentList = prev[key] || [];
      let updated: UserRole[];
      if (currentList.includes(role)) {
        updated = currentList.filter((r) => r !== role);
      } else {
        updated = [...currentList, role];
      }
      return {
        ...prev,
        [key]: updated,
      };
    });
    setIsMatrixSaved(false);
  };

  // Save permission matrix
  const handleSaveMatrix = () => {
    savePermissionMatrix(matrix);
    setIsMatrixSaved(true);
    logAuditEvent(
      currentAdminName,
      'admin',
      '權限管理',
      '更新全域 RBAC 權限矩陣配置',
      '已成功儲存各角色最新功能存取權限。',
      'success'
    );
    setTimeout(() => setIsMatrixSaved(false), 2500);
  };

  // Reset permission matrix to defaults
  const handleResetMatrix = () => {
    const defaults: Record<string, UserRole[]> = {};
    PERMISSION_LIST.forEach((p) => {
      defaults[p.key] = [...p.defaultRoles];
    });
    setMatrix(defaults);
    savePermissionMatrix(defaults);
    setIsMatrixSaved(true);
    logAuditEvent(
      currentAdminName,
      'admin',
      '權限管理',
      '還原 RBAC 權限矩陣為系統預設值',
      '所有角色之權限已重置為臨床標準預設配置。',
      'warning'
    );
    setTimeout(() => setIsMatrixSaved(false), 2500);
  };

  // --- Clinical Units Management Handlers ---
  const handleSaveUnit = () => {
    if (!unitForm.name || !unitForm.code) return;

    let updated: ClinicalUnit[];
    if (editingUnit) {
      updated = units.map((u) => u.id === editingUnit.id ? { ...editingUnit, ...unitForm } as ClinicalUnit : u);
      logAuditEvent(currentAdminName, 'admin', '單位設定', `更新實習單位：${unitForm.name}`, '修改病房資訊與床位配置', 'success');
    } else {
      const newUnit: ClinicalUnit = {
        id: `unit_${Date.now()}`,
        code: unitForm.code || 'UNIT',
        name: unitForm.name || '新實習單位',
        floor: unitForm.floor || '醫療大樓',
        bedCount: Number(unitForm.bedCount) || 10,
        description: unitForm.description || '',
        isActive: unitForm.isActive ?? true,
      };
      updated = [...units, newUnit];
      logAuditEvent(currentAdminName, 'admin', '單位設定', `新增實習單位：${newUnit.name}`, '建立新病房單位', 'success');
    }
    setUnits(updated);
    saveClinicalUnits(updated);
    setIsCreatingUnit(false);
    setEditingUnit(null);
    setUnitForm({ code: '', name: '', floor: '', bedCount: 20, description: '', isActive: true });
  };

  const handleDeleteUnit = (id: string, name: string) => {
    if (!window.confirm(`確定要刪除實習單位「${name}」嗎？`)) return;
    const updated = units.filter((u) => u.id !== id);
    setUnits(updated);
    saveClinicalUnits(updated);
    logAuditEvent(currentAdminName, 'admin', '單位設定', `刪除實習單位：${name}`, '已從全域病房名單移除', 'warning');
  };

  const handleResetUnits = () => {
    setUnits(DEFAULT_CLINICAL_UNITS);
    saveClinicalUnits(DEFAULT_CLINICAL_UNITS);
    logAuditEvent(currentAdminName, 'admin', '單位設定', '還原預設實習單位名單', '已重置回標準產科實習單位', 'warning');
  };

  // --- Faculty Roster Management Handlers ---
  const handleSaveFaculty = () => {
    if (!facultyForm.name) return;

    let updated: FacultyMember[];
    if (editingFaculty) {
      updated = faculty.map((f) => f.id === editingFaculty.id ? { ...editingFaculty, ...facultyForm } as FacultyMember : f);
      logAuditEvent(currentAdminName, 'admin', '名冊維護', `更新指導教師：${facultyForm.name}`, '修改教師資料與職稱', 'success');
    } else {
      const newFac: FacultyMember = {
        id: `fac_${Date.now()}`,
        facultyNumber: facultyForm.facultyNumber || `FAC-${faculty.length + 1}`,
        name: facultyForm.name || '指導教師',
        role: facultyForm.role || 'instructor',
        title: facultyForm.title || '臨床實習指導教師',
        primaryUnit: facultyForm.primaryUnit || '5B 婦產科病房',
        email: facultyForm.email || '',
        phone: facultyForm.phone || '',
        isMainSupervisor: Boolean(facultyForm.isMainSupervisor),
      };
      updated = [...faculty, newFac];
      logAuditEvent(currentAdminName, 'admin', '名冊維護', `新增指導教師：${newFac.name}`, '建立新教師名冊資料', 'success');
    }
    setFaculty(updated);
    saveFacultyRoster(updated);
    setIsCreatingFaculty(false);
    setEditingFaculty(null);
    setFacultyForm({ facultyNumber: '', name: '', role: 'instructor', title: '', primaryUnit: '5B 婦產科病房', email: '', phone: '', isMainSupervisor: false });
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (!window.confirm(`確定要刪除指導教師「${name}」嗎？`)) return;
    const updated = faculty.filter((f) => f.id !== id);
    setFaculty(updated);
    saveFacultyRoster(updated);
    logAuditEvent(currentAdminName, 'admin', '名冊維護', `刪除指導教師：${name}`, '已從教師名冊移除', 'warning');
  };

  const handleResetFaculty = () => {
    setFaculty(DEFAULT_FACULTY_ROSTER);
    saveFacultyRoster(DEFAULT_FACULTY_ROSTER);
    logAuditEvent(currentAdminName, 'admin', '名冊維護', '還原預設指導教師名單', '已重置回標準產科師資名冊', 'warning');
  };

  // --- Student Roster Management Handlers ---
  const handleSaveStudent = () => {
    if (!studentForm.name || !studentForm.studentId) return;

    let updated: StudentMember[];
    if (editingStudent) {
      updated = students.map((s) => s.id === editingStudent.id ? { ...editingStudent, ...studentForm } as StudentMember : s);
      logAuditEvent(currentAdminName, 'admin', '名冊維護', `更新護生：${studentForm.name} (${studentForm.studentId})`, '修改學生梯次與指派資訊', 'success');
    } else {
      const newStu: StudentMember = {
        id: `stu_${Date.now()}`,
        studentId: studentForm.studentId || '',
        name: studentForm.name || '實習護生',
        cohort: studentForm.cohort || '114學年第一梯次',
        assignedWeek: studentForm.assignedWeek || '1',
        assignedUnit: studentForm.assignedUnit || '5B 婦產科病房',
        assignedInstructor: studentForm.assignedInstructor || '臨床實習指導教師',
        groupName: studentForm.groupName || '第 1 組',
        isTeamLeader: Boolean(studentForm.isTeamLeader),
        status: studentForm.status || 'active',
      };
      updated = [...students, newStu];
      logAuditEvent(currentAdminName, 'admin', '名冊維護', `新增實習護生：${newStu.name}`, '建立新學生實習名冊', 'success');
    }
    setStudents(updated);
    saveStudentRoster(updated);
    setIsCreatingStudent(false);
    setEditingStudent(null);
    setStudentForm({ studentId: '', name: '', cohort: '114學年第一梯次', assignedWeek: '1', assignedUnit: '5B 婦產科病房', assignedInstructor: '臨床實習指導教師', groupName: '第 1 組', isTeamLeader: false, status: 'active' });
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (!window.confirm(`確定要刪除學生「${name}」嗎？`)) return;
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    saveStudentRoster(updated);
    logAuditEvent(currentAdminName, 'admin', '名冊維護', `刪除學生：${name}`, '已從學生名冊移除', 'warning');
  };

  const handleResetStudents = () => {
    setStudents(DEFAULT_STUDENT_ROSTER);
    saveStudentRoster(DEFAULT_STUDENT_ROSTER);
    logAuditEvent(currentAdminName, 'admin', '名冊維護', '還原預設學生名單', '已重置回標準實習梯次護生名冊', 'warning');
  };

  // --- Database Export / Import ---
  const handleExportFullDatabase = () => {
    const bundle = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      exporter: currentAdminName,
      records: records,
      rbacMatrix: matrix,
      units: units,
      faculty: faculty,
      students: students,
      auditLogs: getAuditLogs(),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Maternity_NIS_Full_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logAuditEvent(
      currentAdminName,
      'admin',
      '資料備份',
      '全系統 JSON 資料庫備份導出',
      `共導出 ${records.length} 筆交班作業、${units.length} 個單位、${faculty.length} 位教師、${students.length} 位學生。`,
      'success'
    );
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.records && Array.isArray(parsed.records)) {
          onImportAllRecords(parsed.records);
        }
        if (parsed.rbacMatrix) {
          setMatrix(parsed.rbacMatrix);
          savePermissionMatrix(parsed.rbacMatrix);
        }
        if (parsed.units && Array.isArray(parsed.units)) {
          setUnits(parsed.units);
          saveClinicalUnits(parsed.units);
        }
        if (parsed.faculty && Array.isArray(parsed.faculty)) {
          setFaculty(parsed.faculty);
          saveFacultyRoster(parsed.faculty);
        }
        if (parsed.students && Array.isArray(parsed.students)) {
          setStudents(parsed.students);
          saveStudentRoster(parsed.students);
        }
        logAuditEvent(
          currentAdminName,
          'admin',
          '資料備份',
          '全系統 JSON 檔案匯入還原成功',
          `檔案名稱：${file.name}`,
          'success'
        );
        alert('全系統資料庫與設定已成功還原！');
      } catch (err) {
        console.error('Import failed', err);
        alert('JSON 備份檔案解析失敗，請確認檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteFactoryReset = () => {
    onResetToSampleRecords();
    handleResetMatrix();
    handleResetUnits();
    handleResetFaculty();
    handleResetStudents();
    setConfirmFactoryReset(false);
    logAuditEvent(
      currentAdminName,
      'admin',
      '工廠重置',
      '執行系統出廠狀態初始化',
      '所有自訂作業、名冊、單位與權限矩陣均已重置為產科護理學標準臨床示範數據。',
      'warning'
    );
    alert('系統已成功執行工廠重置！');
  };

  const handleClearLogs = () => {
    if (window.confirm('確定要清空所有安全稽核日誌嗎？此動作將無法復原。')) {
      clearAuditLogs();
      setLogs([]);
      logAuditEvent(currentAdminName, 'admin', '稽核管理', '清空安全日誌記錄', '管理員手動清空歷史稽核軌跡', 'warning');
    }
  };

  // Group permissions for matrix rendering
  const groupedPermissions = useMemo(() => {
    return PERMISSION_CATEGORIES.map((category) => {
      const items = PERMISSION_LIST.filter((p) => {
        if (p.category !== category.code) return false;
        if (selectedCategoryFilter !== 'all' && category.code !== selectedCategoryFilter) return false;
        if (rbacSearch.trim()) {
          const q = rbacSearch.toLowerCase().trim();
          return (
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }
        return true;
      });
      return {
        category,
        items,
      };
    }).filter((g) => g.items.length > 0);
  }, [selectedCategoryFilter, rbacSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white px-6 py-4 flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-purple-300 border border-purple-400/30 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-wide">
                  產科護理資訊系統 (NIS) 全域管理後台
                </h3>
                <span className="bg-purple-500/30 text-purple-200 text-[11px] px-2 py-0.5 rounded-full font-bold border border-purple-400/30">
                  Level 3 最高全域管理員
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                登入身分：{currentAdminName} • 完整管控 5 級權限矩陣、師生自訂名冊、實習單位與資料庫
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors border border-rose-400/30 shadow-xs"
              title="安全登出管理員身分"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>管理員登出</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 px-6 flex items-center gap-2 overflow-x-auto border-b border-slate-800">
          {[
            { id: 'rbac', label: '權限管理', icon: Layers, count: PERMISSION_LIST.length },
            { id: 'roster', label: '師生管理', icon: Users, count: faculty.length + students.length },
            { id: 'units', label: '單位管理', icon: Building2, count: units.length },
            { id: 'ntp', label: 'NTP SERVER', icon: Clock, count: undefined },
            { id: 'logs', label: 'LOG', icon: History, count: logs.length },
            { id: 'database', label: 'DB', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-purple-400 text-purple-300 bg-purple-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: RBAC Permission Matrix */}
        {activeTab === 'rbac' && (
          <div className="flex-1 p-5 sm:p-6 flex flex-col overflow-hidden bg-slate-50 space-y-4">
            
            {/* Filter & Action Toolbar */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              
              {/* Simplified Category Filter Pills with CAT-* */}
              <div className="flex items-center gap-1.5 overflow-x-auto flex-1 max-w-2xl py-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  全部類別
                </button>
                {PERMISSION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1 ${
                      selectedCategoryFilter === cat.code
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold">{cat.code}</span>
                    <span>{cat.shortLabel}</span>
                  </button>
                ))}
              </div>

              {/* Search & Save Controls */}
              <div className="flex items-center gap-2">
                <div className="relative w-40 sm:w-48">
                  <input
                    type="text"
                    value={rbacSearch}
                    onChange={(e) => setRbacSearch(e.target.value)}
                    placeholder="搜尋權限名稱 / 代碼..."
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  type="button"
                  onClick={handleResetMatrix}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  title="還原為系統標準預設值"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>還原預設</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMatrix}
                  className="flex items-center gap-1 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isMatrixSaved ? '已儲存設定 ✓' : '儲存權限配置'}</span>
                </button>
              </div>

            </div>

            {/* 5-Role Structured Hierarchical Table of Permissions */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 font-bold w-20">代碼</th>
                    <th className="py-3 px-3 font-bold w-48">功能名稱與等級</th>
                    <th className="py-3 px-3 font-bold">權限作用範圍</th>
                    
                    {/* 5 Roles Columns */}
                    <th className="py-3 px-2 font-bold text-center w-20">
                      <div className="text-blue-700">護生</div>
                      <div className="text-[10px] text-slate-400 font-normal">Level 1</div>
                    </th>
                    <th className="py-3 px-2 font-bold text-center w-20">
                      <div className="text-cyan-700">小組長</div>
                      <div className="text-[10px] text-slate-400 font-normal">Level 1.5</div>
                    </th>
                    <th className="py-3 px-2 font-bold text-center w-20">
                      <div className="text-emerald-700">指導教師</div>
                      <div className="text-[10px] text-slate-400 font-normal">Level 2</div>
                    </th>
                    <th className="py-3 px-2 font-bold text-center w-24">
                      <div className="text-amber-700">HN & NP</div>
                      <div className="text-[10px] text-slate-400 font-normal">Level 2.5</div>
                    </th>
                    <th className="py-3 px-2 font-bold text-center w-20">
                      <div className="text-purple-700">管理員</div>
                      <div className="text-[10px] text-slate-400 font-normal">Level 3</div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {groupedPermissions.map((group) => (
                    <React.Fragment key={group.category.id}>
                      {/* Category Header Row (CAT-* Only) */}
                      <tr className="bg-purple-50/70 border-y border-purple-100 font-bold text-purple-950">
                        <td colSpan={8} className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-700 text-white text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">
                              {group.category.code}
                            </span>
                            <span>{group.category.name}</span>
                            <span className="text-[11px] text-purple-700 font-normal ml-2">
                              — {group.category.description}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Items under Category */}
                      {group.items.map((perm) => {
                        const currentAllowed = matrix[perm.key] || perm.defaultRoles;
                        const isStudentAllowed = currentAllowed.includes('student');
                        const isLeaderAllowed = currentAllowed.includes('team_leader');
                        const isInstructorAllowed = currentAllowed.includes('instructor');
                        const isHnNpAllowed = currentAllowed.includes('hn_np');

                        return (
                          <tr key={perm.key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-[11px]">
                              {perm.code}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{perm.name}</div>
                              <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold mt-0.5 ${
                                perm.level >= 3 
                                  ? 'bg-purple-100 text-purple-800'
                                  : perm.level >= 2.5
                                  ? 'bg-amber-100 text-amber-800'
                                  : perm.level >= 2
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : perm.level >= 1.5
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {perm.levelLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 leading-relaxed text-[11px]">
                              {perm.description}
                            </td>

                            {/* Student Toggle */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(perm.key, 'student')}
                                className={`w-8 h-5 rounded-full transition-colors relative inline-flex items-center ${
                                  isStudentAllowed ? 'bg-blue-600' : 'bg-slate-200'
                                }`}
                                title={isStudentAllowed ? '已允許護生' : '已禁止護生'}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform shadow-xs ${
                                  isStudentAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </td>

                            {/* Team Leader Toggle */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(perm.key, 'team_leader')}
                                className={`w-8 h-5 rounded-full transition-colors relative inline-flex items-center ${
                                  isLeaderAllowed ? 'bg-cyan-600' : 'bg-slate-200'
                                }`}
                                title={isLeaderAllowed ? '已允許小組長' : '已禁止小組長'}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform shadow-xs ${
                                  isLeaderAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </td>

                            {/* Instructor Toggle */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(perm.key, 'instructor')}
                                className={`w-8 h-5 rounded-full transition-colors relative inline-flex items-center ${
                                  isInstructorAllowed ? 'bg-emerald-600' : 'bg-slate-200'
                                }`}
                                title={isInstructorAllowed ? '已允許指導教師' : '已禁止指導教師'}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform shadow-xs ${
                                  isInstructorAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </td>

                            {/* HN & NP Toggle */}
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(perm.key, 'hn_np')}
                                className={`w-8 h-5 rounded-full transition-colors relative inline-flex items-center ${
                                  isHnNpAllowed ? 'bg-amber-600' : 'bg-slate-200'
                                }`}
                                title={isHnNpAllowed ? '已允許 HN&NP' : '已禁止 HN&NP'}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform shadow-xs ${
                                  isHnNpAllowed ? 'translate-x-4' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </td>

                            {/* Admin Locked Check */}
                            <td className="py-2.5 px-2 text-center">
                              <span className="inline-flex items-center gap-0.5 text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full font-bold text-[10px] border border-purple-200">
                                <Lock className="w-2.5 h-2.5 text-purple-600" />
                                必備
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: Faculty & Student Roster Management (完全自訂與編輯) */}
        {activeTab === 'roster' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-6">
            
            {/* Faculty Section with Full CRUD */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">實習指導師資名冊管理 (Faculty Roster)</h3>
                    <p className="text-[11px] text-slate-500">自訂指導教師、HN 護理長與專科護理師 (NP) 名冊</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFaculty}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    還原師資預設
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingFaculty(true);
                      setEditingFaculty(null);
                      setFacultyForm({ facultyNumber: `INS-${faculty.length + 1}`, name: '', role: 'instructor', title: '臨床實習指導教師', primaryUnit: '5B 婦產科病房', email: '', phone: '', isMainSupervisor: false });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增指導師資</span>
                  </button>
                </div>
              </div>

              {/* Faculty Inline Form */}
              {(isCreatingFaculty || editingFaculty) && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-emerald-950 flex items-center justify-between">
                    <span>{editingFaculty ? '編輯師資資料' : '新增指導師資'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingFaculty(false);
                        setEditingFaculty(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">教師姓名 *</label>
                      <input
                        type="text"
                        value={facultyForm.name || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                        placeholder="例：臨床指導教師"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">師資編號</label>
                      <input
                        type="text"
                        value={facultyForm.facultyNumber || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, facultyNumber: e.target.value })}
                        placeholder="例：INS-01"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">角色等級</label>
                      <select
                        value={facultyForm.role || 'instructor'}
                        onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="instructor">實習指導教師 (Level 2)</option>
                        <option value="hn_np">HN 護理長 / NP 專師 (Level 2.5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">專業職稱</label>
                      <input
                        type="text"
                        value={facultyForm.title || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, title: e.target.value })}
                        placeholder="例：專任產兒科指導教師"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">主要負責單位</label>
                      <input
                        type="text"
                        value={facultyForm.primaryUnit || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, primaryUnit: e.target.value })}
                        placeholder="例：5B 婦產科病房"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">公務電子信箱</label>
                      <input
                        type="email"
                        value={facultyForm.email || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                        placeholder="teacher@hospital.edu.tw"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">聯絡分機 / 電話</label>
                      <input
                        type="text"
                        value={facultyForm.phone || ''}
                        onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                        placeholder="分機 5201"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="isMainSupervisor"
                        checked={facultyForm.isMainSupervisor || false}
                        onChange={(e) => setFacultyForm({ ...facultyForm, isMainSupervisor: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="isMainSupervisor" className="text-[11px] font-bold text-slate-800">設為主要指導負責人</label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingFaculty(false);
                        setEditingFaculty(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFaculty}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {editingFaculty ? '儲存更新' : '確認新增'}
                    </button>
                  </div>
                </div>
              )}

              {/* Faculty Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {faculty.map((f) => (
                  <div key={f.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 relative group hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                          f.role === 'hn_np' ? 'bg-amber-700' : 'bg-emerald-700'
                        }`}>
                          {f.role === 'hn_np' ? '督' : '師'}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-bold block">{f.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{f.facultyNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFaculty(f);
                            setFacultyForm(f);
                            setIsCreatingFaculty(false);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded"
                          title="編輯師資"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaculty(f.id, f.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="刪除師資"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
                      <div>職稱：<span className="font-semibold text-slate-800">{f.title}</span></div>
                      <div>單位：<span className="text-slate-800">{f.primaryUnit}</span></div>
                      {f.phone && <div>分機：<span className="font-mono text-slate-700">{f.phone}</span></div>}
                    </div>

                    {f.isMainSupervisor && (
                      <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.2 rounded">
                        主要指導負責人
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Roster Section with Full CRUD */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">實習護生梯次名冊管理 (Student Roster)</h3>
                    <p className="text-[11px] text-slate-500">自訂學生學號、姓名、梯次週次與指派小組長職務</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetStudents}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    還原學生預設
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingStudent(true);
                      setEditingStudent(null);
                      setStudentForm({ studentId: `1123100${students.length + 1}`, name: '', cohort: '114學年第一梯次', assignedWeek: '1', assignedUnit: '5B 婦產科病房', assignedInstructor: '臨床實習指導教師', groupName: '第 1 組', isTeamLeader: false, status: 'active' });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>新增實習學生</span>
                  </button>
                </div>
              </div>

              {/* Student Inline Form */}
              {(isCreatingStudent || editingStudent) && (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-blue-950 flex items-center justify-between">
                    <span>{editingStudent ? '編輯學生名冊' : '新增實習護生'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingStudent(false);
                        setEditingStudent(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">學號 *</label>
                      <input
                        type="text"
                        value={studentForm.studentId || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                        placeholder="例：11231005"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">學生姓名 *</label>
                      <input
                        type="text"
                        value={studentForm.name || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        placeholder="例：實習護生"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">梯次</label>
                      <input
                        type="text"
                        value={studentForm.cohort || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, cohort: e.target.value })}
                        placeholder="114學年第一梯次"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">指派組別</label>
                      <input
                        type="text"
                        value={studentForm.groupName || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, groupName: e.target.value })}
                        placeholder="第 1 組"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">實習週次</label>
                      <select
                        value={studentForm.assignedWeek || '1'}
                        onChange={(e) => setStudentForm({ ...studentForm, assignedWeek: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="1">第 1 週</option>
                        <option value="2">第 2 週</option>
                        <option value="3">第 3 週</option>
                        <option value="4">第 4 週</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">指派實習單位</label>
                      <select
                        value={studentForm.assignedUnit || '5B 婦產科病房'}
                        onChange={(e) => setStudentForm({ ...studentForm, assignedUnit: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">指導老師</label>
                      <input
                        type="text"
                        value={studentForm.assignedInstructor || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, assignedInstructor: e.target.value })}
                        placeholder="臨床實習指導教師"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id="isTeamLeader"
                        checked={studentForm.isTeamLeader || false}
                        onChange={(e) => setStudentForm({ ...studentForm, isTeamLeader: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 rounded"
                      />
                      <label htmlFor="isTeamLeader" className="text-[11px] font-bold text-cyan-900">
                        擔任梯次小組長 (Level 1.5 權限)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingStudent(false);
                        setEditingStudent(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStudent}
                      className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {editingStudent ? '儲存更新' : '確認新增'}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">學號</th>
                      <th className="py-2.5 px-3 font-bold">護生姓名</th>
                      <th className="py-2.5 px-3 font-bold">身分職務</th>
                      <th className="py-2.5 px-3 font-bold">梯次 / 組別</th>
                      <th className="py-2.5 px-3 font-bold">實習單位</th>
                      <th className="py-2.5 px-3 font-bold">指導老師</th>
                      <th className="py-2.5 px-3 font-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{s.studentId}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2 px-3">
                          {s.isTeamLeader ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded border border-cyan-300">
                              <Crown className="w-3 h-3 text-cyan-600" />
                              梯次小組長
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">一般護生</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {s.cohort} ({s.groupName})
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{s.assignedUnit} (第{s.assignedWeek}週)</td>
                        <td className="py-2 px-3 text-slate-600">{s.assignedInstructor}</td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setStudentForm(s);
                                setIsCreatingStudent(false);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-700 rounded"
                              title="編輯學生"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(s.id, s.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="刪除學生"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Clinical Units Management (完全自訂與編輯) */}
        {activeTab === 'units' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-700" />
                    <span>產科實習病房單位設定 (Clinical Units Configuration)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">自由新增、修改與刪除實習病房、床位範圍與臨床照護定位</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetUnits}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    還原單位預設
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingUnit(true);
                      setEditingUnit(null);
                      setUnitForm({ code: '', name: '', floor: '醫療大樓 5F', bedCount: 20, description: '', isActive: true });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增實習單位</span>
                  </button>
                </div>
              </div>

              {/* Unit Inline Form */}
              {(isCreatingUnit || editingUnit) && (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-indigo-950 flex items-center justify-between">
                    <span>{editingUnit ? '編輯實習單位' : '新增實習病房單位'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingUnit(false);
                        setEditingUnit(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">單位代碼 *</label>
                      <input
                        type="text"
                        value={unitForm.code || ''}
                        onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                        placeholder="例：5B / L&D / NBC"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">單位全名 *</label>
                      <input
                        type="text"
                        value={unitForm.name || ''}
                        onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                        placeholder="例：5B 婦產科病房 (Maternity Ward)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">所在樓層 / 地點</label>
                      <input
                        type="text"
                        value={unitForm.floor || ''}
                        onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })}
                        placeholder="例：醫療大樓 5F"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">總床位數</label>
                      <input
                        type="number"
                        value={unitForm.bedCount || 0}
                        onChange={(e) => setUnitForm({ ...unitForm, bedCount: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">單位臨床實習重點與描述</label>
                      <input
                        type="text"
                        value={unitForm.description || ''}
                        onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                        placeholder="例：產後母嬰照護、高危險妊娠安胎與婦科術後病房"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingUnit(false);
                        setEditingUnit(null);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveUnit}
                      className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      {editingUnit ? '儲存更新' : '確認新增'}
                    </button>
                  </div>
                </div>
              )}

              {/* Units Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {units.map((u) => (
                  <div key={u.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">
                          {u.code}
                        </span>
                        <strong className="text-slate-900 font-bold text-sm">{u.name}</strong>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUnit(u);
                            setUnitForm(u);
                            setIsCreatingUnit(false);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-700 rounded"
                          title="編輯單位"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(u.id, u.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="刪除單位"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-600 text-[11px] space-y-0.5">
                      <div>位置樓層：<span className="font-medium text-slate-800">{u.floor}</span> • 容納床位：<span className="font-mono font-bold text-indigo-900">{u.bedCount}</span> 床</div>
                      <div className="text-slate-500 pt-1 leading-relaxed">{u.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NTP Time Server Management (由管理員後台集中管控) */}
        {activeTab === 'ntp' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>國家標準時間 NTP 伺服器全域管理</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                          後台集中管控
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        由管理員指定全院產科護理資訊系統校準之 NTP 伺服器，學生端不得任意更改，確保臨床病歷時序一致性
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAllLatencies}
                    disabled={ntpTestingIndex !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>一鍵檢測所有伺服器延遲</span>
                  </button>
                </div>
              </div>

              {/* Sync Feedback Message */}
              {ntpSyncMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ntpSyncMsg}</span>
                </div>
              )}

              {/* Current Active Server Live Status Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 text-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>目前全院生效中 NTP 伺服器</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                      <span>{NTP_SERVERS[selectedNtpIndex]?.host || 'watch.stdtime.gov.tw'}</span>
                      <span className="text-xs font-normal text-indigo-200 bg-white/10 px-2 py-0.5 rounded-full">
                        {NTP_SERVERS[selectedNtpIndex]?.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      所屬機構：{NTP_SERVERS[selectedNtpIndex]?.description}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 shrink-0 text-right space-y-0.5">
                    <div className="text-[10px] text-slate-300 font-medium">系統校準基準時間 (Live)</div>
                    <div className="font-mono text-sm sm:text-base font-bold text-emerald-300 tracking-wider">
                      {currentTimeSample}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      校準狀態：<span className="text-emerald-400 font-bold">{getSyncStatus().lastSync > 0 ? '已同軸校時' : '使用標準時間'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NTP Server List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>台灣國家標準時間 (stdtime.gov.tw) 伺服器清單：</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {NTP_SERVERS.map((server, idx) => {
                    const isCurrent = selectedNtpIndex === idx;
                    const latency = ntpLatencies[idx];
                    const isTesting = ntpTestingIndex === idx;

                    return (
                      <div
                        key={server.host}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50/70 border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                              {server.host}
                            </span>
                            <span className="text-xs font-bold text-indigo-900">
                              {server.name}
                            </span>
                            {isCurrent && (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Check className="w-3 h-3" /> 全院生效中
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {server.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                          {/* Latency badge */}
                          <div className="text-right">
                            {isTesting ? (
                              <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> 檢測中...
                              </span>
                            ) : latency !== undefined && latency !== null ? (
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                                latency < 60
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : latency < 150
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                延遲: {latency} ms
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">
                                未測延遲
                              </span>
                            )}
                          </div>

                          {/* Test button */}
                          <button
                            type="button"
                            onClick={() => handleTestLatency(idx)}
                            disabled={isTesting}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            title="測試此伺服器連線延遲"
                          >
                            測試
                          </button>

                          {/* Select button */}
                          {isCurrent ? (
                            <button
                              type="button"
                              disabled
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold opacity-90 cursor-default"
                            >
                              使用中
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyNtpServer(idx)}
                              disabled={isNtpSyncing}
                              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                            >
                              {isNtpSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                              <span>設為全院伺服器</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Policy Explanatory Note */}
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>產科護理資訊系統 (NIS) 時間校準安全規範</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1 leading-relaxed">
                  <li><strong>學生端介面隱藏</strong>：為符合真實臨床護理資訊系統規範，所有學生與實習護生端時鐘僅提供檢視與快速時間插入功能，無法自行修改 NTP 伺服器。</li>
                  <li><strong>法律效力時序</strong>：分娩記錄、剖腹產刀房進出時間、新生兒 Apgar 分數評估時間與 DART 護理記錄均同軸依據本後台指定之國家標準時間戳記。</li>
                  <li><strong>離線容錯機制</strong>：若實習院區發生暫時性外網中斷，系統將平滑使用本地高精準度時鐘作為備用，並在連線恢復後自動補償時間偏差。</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: Audit Logs Viewer */}
        {activeTab === 'logs' && (
          <div className="flex-1 p-5 sm:p-6 flex flex-col overflow-hidden bg-slate-50 space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-sm text-slate-900">NIS 系統安全與操作稽核軌跡 (Audit Trail)</h3>
                <span className="text-xs text-slate-500">（共 {logs.length} 筆紀錄）</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除日誌</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-36">時間戳記</th>
                    <th className="py-2.5 px-3 font-bold w-36">操作者 / 角色</th>
                    <th className="py-2.5 px-3 font-bold w-24">分類</th>
                    <th className="py-2.5 px-3 font-bold w-48">動作行為</th>
                    <th className="py-2.5 px-3 font-bold">詳細變更紀錄</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {log.timestamp.replace('T', ' ').split('.')[0]}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{log.userName}</div>
                        <span className="text-[10px] text-slate-400">{log.userRole}</span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{log.category}</td>
                      <td className="py-2 px-3 font-bold text-purple-900">{log.action}</td>
                      <td className="py-2 px-3 text-slate-600 leading-relaxed text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Database Maintenance & Factory Reset */}
        {activeTab === 'database' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50 space-y-6">
            
            {/* Full Export / Import */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-700" />
                <span>全域個案資料庫備份與還原</span>
              </h3>
              <p className="text-xs text-slate-600">
                可將全班所有實習作業、評分紀錄、電子簽章、自訂單位與師生名冊、RBAC 權限矩陣打包為完整 JSON 備份檔。
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportFullDatabase}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>下載全系統 JSON 備份檔案 ({records.length} 份個案)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>匯入還原全系統 JSON 檔案</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportDatabase}
                  className="hidden"
                />
              </div>
            </div>

            {/* Factory Reset Danger Zone */}
            <div className="bg-rose-50/60 rounded-xl border border-rose-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>全域資料庫初始化重置 (Factory Reset)</span>
              </div>
              <p className="text-xs text-rose-700">
                此動作將會清除所有自行建立的個案與填寫內容，並將資料庫重置為產科護理學標準臨床示範個案。
              </p>

              {confirmFactoryReset ? (
                <div className="p-3 bg-white rounded-lg border border-rose-300 space-y-2">
                  <div className="text-xs font-bold text-rose-900">
                    警告：此操作不可復原，確定要清空並初始化全系統嗎？
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExecuteFactoryReset}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      確定執行工廠重置
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmFactoryReset(false)}
                      className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmFactoryReset(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  重置回標準示範個案資料庫
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
