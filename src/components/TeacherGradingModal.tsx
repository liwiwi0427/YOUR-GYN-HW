import React, { useState, useMemo } from 'react';
import { HandoverRecord } from '../types';
import { calculateCompletionStats } from '../utils/completionTracker';
import { CircularProgress } from './CircularProgress';
import { StudentProgressChart } from './StudentProgressChart';
import { 
  GraduationCap, 
  X, 
  Search, 
  Filter, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight, 
  FileText, 
  PenTool, 
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  Columns,
  BarChart3,
  ListFilter,
  Download,
  Printer,
  CheckSquare,
  Square,
  Users,
  RotateCcw,
  Archive,
  Plus,
  UserPlus
} from 'lucide-react';
import { getStudentRoster } from '../utils/rosterStore';
import { exportSingleRecordDocx, bulkExportRecordsDocxZip, printRecordsAsPdf } from '../utils/exportDocxPdf';

interface TeacherGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HandoverRecord[];
  currentId: string;
  onSelectRecord: (id: string) => void;
  onOpenSplitGrading?: (id: string) => void;
  onNewPatientAssignment?: () => void;
  instructorName: string;
}

export const TeacherGradingModal: React.FC<TeacherGradingModalProps> = ({
  isOpen,
  onClose,
  records,
  currentId,
  onSelectRecord,
  onOpenSplitGrading,
  onNewPatientAssignment,
  instructorName = '指導教師',
}) => {
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'graded' | 'needs_revision'>('all');
  const [showChart, setShowChart] = useState<boolean>(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Available cohorts from roster & records
  const availableCohorts = useMemo(() => {
    const cohorts = new Set<string>();
    const roster = getStudentRoster();
    roster.forEach(s => {
      if (s.cohort) cohorts.add(s.cohort);
    });
    cohorts.add('114學年第一梯次');
    cohorts.add('114學年第二梯次');
    return Array.from(cohorts);
  }, []);

  // Extract all available weeks
  const availableWeeks = useMemo(() => {
    const weeks = new Set<string>();
    records.forEach((r) => {
      if (r.internship?.week) {
        weeks.add(r.internship.week);
      }
    });
    return Array.from(weeks).sort((a, b) => {
      const numA = parseInt(a, 10) || 0;
      const numB = parseInt(b, 10) || 0;
      return numA - numB;
    });
  }, [records]);

  // Filtered list
  const filteredRecords = useMemo(() => {
    const roster = getStudentRoster();
    const studentCohortMap = new Map<string, string>();
    roster.forEach(s => {
      if (s.name) studentCohortMap.set(s.name, s.cohort || '');
      if (s.studentId) studentCohortMap.set(s.studentId, s.cohort || '');
    });

    return records.filter((r) => {
      // Cohort filter
      if (selectedCohort !== 'all') {
        const sName = r.internship?.studentName || '';
        const sId = r.internship?.studentId || '';
        const matchedCohort = studentCohortMap.get(sName) || studentCohortMap.get(sId) || '114學年第一梯次';
        if (matchedCohort !== selectedCohort) {
          return false;
        }
      }

      // Week filter
      if (selectedWeek !== 'all' && (r.internship?.week || '1') !== selectedWeek) {
        return false;
      }

      // Status filter
      const isGraded = Boolean(r.signatures?.instructorSignature || r.signatures?.score);
      const isNeedsRevision = (r.signatures?.score || '').includes('補正');
      if (filterStatus === 'pending_review' && isGraded) return false;
      if (filterStatus === 'graded' && (!isGraded || isNeedsRevision)) return false;
      if (filterStatus === 'needs_revision' && !isNeedsRevision) return false;

      // Search query filter (studentName, studentId, bedNumber, patientName)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const studentName = (r.internship?.studentName || '').toLowerCase();
        const studentId = (r.internship?.studentId || '').toLowerCase();
        const bedNumber = (r.basicInfo?.bedNumber || '').toLowerCase();
        const patientName = (r.basicInfo?.patientName || '').toLowerCase();
        const diagnosis = (r.basicInfo?.primaryDiagnosis || '').toLowerCase();
        return (
          studentName.includes(q) ||
          studentId.includes(q) ||
          bedNumber.includes(q) ||
          patientName.includes(q) ||
          diagnosis.includes(q)
        );
      }
      return true;
    });
  }, [records, selectedCohort, selectedWeek, filterStatus, searchQuery]);

  // Overall statistics for teacher overview
  const stats = useMemo(() => {
    let totalAssignments = records.length;
    let gradedCount = 0;
    let pendingCount = 0;
    let studentSignedCount = 0;
    let laggingCount = 0;
    let needsRevisionCount = 0;

    records.forEach((r) => {
      const isNeedsRevision = (r.signatures?.score || '').includes('補正');
      if (isNeedsRevision) {
        needsRevisionCount++;
      } else if (r.signatures?.instructorSignature || r.signatures?.score) {
        gradedCount++;
      } else {
        pendingCount++;
      }
      if (r.signatures?.studentSignature) {
        studentSignedCount++;
      }
      const comp = calculateCompletionStats(r);
      if (comp.totalPercentage < 60) {
        laggingCount++;
      }
    });

    return { totalAssignments, gradedCount, pendingCount, studentSignedCount, laggingCount, needsRevisionCount };
  }, [records]);

  if (!isOpen) return null;

  const handleStartSplitGrading = (recId: string) => {
    if (onOpenSplitGrading) {
      onOpenSplitGrading(recId);
    } else {
      onSelectRecord(recId);
    }
    onClose();
  };

  // Toggle selection of one record
  const toggleSelectRecord = (id: string) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all or deselect all filtered records
  const toggleSelectAllFiltered = () => {
    if (selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedRecordIds(new Set());
    } else {
      const allIds = new Set(filteredRecords.map(r => r.id));
      setSelectedRecordIds(allIds);
    }
  };

  // Bulk Export DOCX (ZIP)
  const handleBulkExportDocx = async () => {
    const targetRecords = filteredRecords.filter(r => selectedRecordIds.has(r.id));
    if (targetRecords.length === 0) {
      alert('請先勾選至少一份學生作業！');
      return;
    }
    try {
      setIsExporting(true);
      await bulkExportRecordsDocxZip(targetRecords, `產科實習作業_${selectedCohort !== 'all' ? selectedCohort : '全體'}_DOCX`);
    } catch (e) {
      console.error(e);
      alert('匯出 DOCX 檔案失敗。');
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk Print / PDF Export
  const handleBulkPrintPdf = () => {
    const targetRecords = filteredRecords.filter(r => selectedRecordIds.has(r.id));
    if (targetRecords.length === 0) {
      alert('請先勾選至少一份學生作業！');
      return;
    }
    printRecordsAsPdf(targetRecords);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">實習指導教師作業批閱中心</h3>
                <span className="bg-white/20 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-white/30">
                  {instructorName} 老師
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">
                依梯次管理 • 數據視覺化長條圖 • 批次選擇匯出 DOCX / PDF • 雙欄對照批閱
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewPatientAssignment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewPatientAssignment();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg text-xs shadow-xs transition-colors border border-emerald-300/40"
                title="為學生指派/建立新產科個案"
              >
                <UserPlus className="w-4 h-4" />
                <span>指派新產科個案</span>
              </button>
            )}

            {records.length > 0 && onOpenSplitGrading && (
              <button
                type="button"
                onClick={() => handleStartSplitGrading(currentId || records[0].id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors border border-emerald-400/40"
              >
                <Columns className="w-4 h-4" />
                <span>開啟雙欄對照批閱</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="bg-emerald-50/60 border-b border-emerald-100 px-6 py-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="bg-white p-2 rounded-xl border border-emerald-100/80 shadow-2xs">
            <span className="text-slate-500 text-[11px]">總作業數量</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">{stats.totalAssignments} 份</div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-emerald-100/80 shadow-2xs">
            <span className="text-slate-500 text-[11px]">學生已簽署送出</span>
            <div className="text-base font-bold text-blue-700 mt-0.5">{stats.studentSignedCount} 份</div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-emerald-100/80 shadow-2xs">
            <span className="text-slate-500 text-[11px]">待教師批閱</span>
            <div className="text-base font-bold text-amber-600 mt-0.5">{stats.pendingCount} 份</div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-emerald-100/80 shadow-2xs">
            <span className="text-slate-500 text-[11px]">已完成評閱簽核</span>
            <div className="text-base font-bold text-emerald-700 mt-0.5">{stats.gradedCount} 份</div>
          </div>
          <div className={`p-2 rounded-xl border shadow-2xs ${
            stats.laggingCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-emerald-100/80'
          }`}>
            <span className="text-slate-500 text-[11px]">進度落後預警 (&lt;60%)</span>
            <div className={`text-base font-bold mt-0.5 ${stats.laggingCount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
              {stats.laggingCount} 位同學
            </div>
          </div>
        </div>

        {/* Filter Toolbar with Cohort, Week, Status & Batch Export */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col gap-2.5 text-xs">
          
          {/* Row 1: Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Cohort & Week Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Cohort Select */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-slate-700">梯次：</span>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="all">全部梯次名冊</option>
                  {availableCohorts.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Week Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSelectedWeek('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    selectedWeek === 'all'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  全部週次 ({records.length})
                </button>
                {availableWeeks.map((wk) => {
                  const count = records.filter((r) => (r.internship?.week || '1') === wk).length;
                  return (
                    <button
                      key={wk}
                      type="button"
                      onClick={() => setSelectedWeek(wk)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                        selectedWeek === wk
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      第 {wk} 週 ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status & Search Filters + Chart Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowChart(!showChart)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                  showChart
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title="切換顯示/隱藏作業完成進度分佈長條圖"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{showChart ? '隱藏長條圖' : '顯示長條圖'}</span>
              </button>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="all">所有狀態</option>
                <option value="pending_review">待批閱 ({stats.pendingCount})</option>
                <option value="graded">已批閱 ({stats.gradedCount})</option>
                <option value="needs_revision">需補正重交 ({stats.needsRevisionCount})</option>
              </select>

              <div className="relative w-36 sm:w-44">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋姓名/學號/床號..."
                  className="w-full pl-7 pr-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
              </div>
            </div>

          </div>

          {/* Row 2: Multi-selection & Batch Export Action Bar */}
          <div className="bg-emerald-100/60 rounded-xl px-3 py-2 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAllFiltered}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-800 border border-slate-300 rounded-lg font-bold transition-colors"
              >
                {selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0
                    ? '取消全選'
                    : `全選目前清單 (${filteredRecords.length})`}
                </span>
              </button>

              <span className="text-slate-600 font-medium">
                已選取 <strong className="text-emerald-800">{selectedRecordIds.size}</strong> 份作業
              </span>
            </div>

            {/* Bulk Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedRecordIds.size === 0 || isExporting}
                onClick={handleBulkExportDocx}
                className="flex items-center gap-1 px-3 py-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
                title="將選取作業打包為 Word (.docx) ZIP 壓縮包"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? '打包中...' : '批次匯出 DOCX (ZIP)'}</span>
              </button>

              <button
                type="button"
                disabled={selectedRecordIds.size === 0}
                onClick={handleBulkPrintPdf}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
                title="將選取作業一鍵匯出為 PDF 或列印"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>批次列印 / PDF 匯出</span>
              </button>
            </div>
          </div>

        </div>

        {/* Content Area: Visual Chart + Assignment Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-100/60">
          
          {/* Recharts Progress Distribution Bar Chart */}
          {showChart && (
            <StudentProgressChart
              records={filteredRecords}
              onSelectRecord={(id) => handleStartSplitGrading(id)}
              selectedRecordId={currentId}
            />
          )}

          {/* Records List Header */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1">
            <span className="font-bold flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-emerald-700" />
              實習作業評閱清單 (共 {filteredRecords.length} 筆)
            </span>
            <span className="text-slate-400">勾選左側可進行批次匯出，點擊右側可直接開啟「雙欄對照批閱」</span>
          </div>

          {/* Cards */}
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-xl border border-slate-200">
              <FileText className="w-10 h-10 mx-auto opacity-30 stroke-1" />
              <p className="text-sm font-medium">沒有符合條件的學生作業</p>
              <p className="text-xs text-slate-400">請嘗試清除搜尋條件或切換梯次/週次篩選</p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const comp = calculateCompletionStats(rec);
              const isSelected = rec.id === currentId;
              const isChecked = selectedRecordIds.has(rec.id);
              const isNeedsRevision = (rec.signatures?.score || '').includes('補正');
              const isGraded = Boolean(rec.signatures?.instructorSignature || rec.signatures?.score) && !isNeedsRevision;
              const hasStudentSigned = Boolean(rec.signatures?.studentSignature);

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-xl p-3.5 sm:p-4 border transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-400/30'
                      : isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Left info: Checkbox + Completion Ring + Student & Case Meta */}
                  <div className="flex items-start gap-3 flex-1">
                    
                    {/* Checkbox for batch actions */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectRecord(rec.id);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-700 mt-1 transition-colors"
                      title="選取此作業進行批次匯出"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    {/* Completion Ring */}
                    <div className="pt-0.5 cursor-pointer" onClick={() => handleStartSplitGrading(rec.id)}>
                      <CircularProgress percentage={comp.totalPercentage} size={42} strokeWidth={4} />
                    </div>

                    <div 
                      className="space-y-1 flex-1 cursor-pointer"
                      onClick={() => handleStartSplitGrading(rec.id)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {rec.internship?.studentName || '實習同學'}
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          學號：{rec.internship?.studentId || '未填'}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          第 {rec.internship?.week || '1'} 週作業
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            當前選中
                          </span>
                        )}
                        {isNeedsRevision && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                            <RotateCcw className="w-3 h-3" />
                            需補正重填
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800">
                          【{rec.basicInfo?.bedNumber || '未填床號'}】{rec.basicInfo?.patientName || '個案姓名'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{rec.basicInfo?.primaryDiagnosis || '產科診斷'}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{rec.internship?.date || '填寫日期'}</span>
                      </div>

                      {/* Small tags */}
                      <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                        <span className="text-slate-500">
                          完成度：<strong>{comp.totalPercentage}%</strong> ({comp.totalFilled}/{comp.totalFields} 項)
                        </span>
                        {hasStudentSigned ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" />
                            護生已簽章
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            護生待簽章
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status & Action Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    {/* Status Pill */}
                    {isNeedsRevision ? (
                      <div className="flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>已退回補正</span>
                      </div>
                    ) : isGraded ? (
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-bold text-xs">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>已核定 {rec.signatures?.score ? `(${rec.signatures.score})` : ''}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold text-xs">
                        <PenTool className="w-3.5 h-3.5" />
                        <span>尚未批閱</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportSingleRecordDocx(rec);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-700 rounded border border-slate-200 text-xs"
                        title="匯出此份作業為 Word (.docx)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          printRecordsAsPdf([rec]);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 rounded border border-slate-200 text-xs"
                        title="列印或存為 PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartSplitGrading(rec.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span>雙欄批閱</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>支援依梯次批次匯出 DOCX 與 PDF，點選任一份作業即可直接開啟雙欄對照評分。</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
