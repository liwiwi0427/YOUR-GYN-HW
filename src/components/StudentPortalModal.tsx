import React, { useState, useMemo } from 'react';
import { HandoverRecord } from '../types';
import { calculateCompletionStats } from '../utils/completionTracker';
import { CircularProgress } from './CircularProgress';
import { 
  User, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight, 
  FileText, 
  X, 
  BookOpen,
  Sparkles,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HandoverRecord[];
  currentId: string;
  onSelectRecord: (id: string) => void;
  currentStudentName: string;
  currentStudentId: string;
  onUpdateStudentIdentity: (name: string, id: string) => void;
  onAddNewWeekRecord: (weekNumber: string, studentName: string, studentId: string) => void;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  records,
  currentId,
  onSelectRecord,
  currentStudentName,
  currentStudentId,
  onUpdateStudentIdentity,
  onAddNewWeekRecord,
}) => {
  const [studentNameInput, setStudentNameInput] = useState(currentStudentName || '');
  const [studentIdInput, setStudentIdInput] = useState(currentStudentId || '');
  const [newWeekNumber, setNewWeekNumber] = useState('2');

  // Filter records belonging to current student name (or matching loosely)
  const studentRecords = useMemo(() => {
    const targetName = studentNameInput.trim().toLowerCase();
    if (!targetName) return records;
    return records.filter((r) => {
      const recName = (r.internship?.studentName || '').toLowerCase();
      return recName === targetName || recName.includes(targetName);
    });
  }, [records, studentNameInput]);

  // Next suggested week number
  const nextSuggestedWeek = useMemo(() => {
    const existingWeeks = studentRecords.map((r) => parseInt(r.internship?.week || '1', 10));
    const max = existingWeeks.length > 0 ? Math.max(...existingWeeks) : 1;
    return (max + 1).toString();
  }, [studentRecords]);

  if (!isOpen) return null;

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudentIdentity(studentNameInput.trim(), studentIdInput.trim());
  };

  const handleCreateWeek = (week: string) => {
    onAddNewWeekRecord(week, studentNameInput.trim() || '實習護生', studentIdInput.trim() || '11231001');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">實習護生每週作業管理中心</h3>
              <p className="text-xs text-blue-100/90 font-medium">
                輸入護生姓名與學號，檢視並編輯所有實習週次作業
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Identity Form Box */}
        <div className="p-4 sm:p-5 bg-blue-50/70 border-b border-blue-100">
          <form onSubmit={handleSaveIdentity} className="flex flex-col sm:flex-row items-end gap-3 text-xs">
            <div className="flex-1 w-full sm:w-auto space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                實習護生姓名
              </label>
              <input
                type="text"
                value={studentNameInput}
                onChange={(e) => setStudentNameInput(e.target.value)}
                placeholder="請輸入護生姓名"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex-1 w-full sm:w-auto space-y-1">
              <label className="font-bold text-slate-700">護生學號</label>
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="請輸入護生學號"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors whitespace-nowrap"
            >
              更新護生資料
            </button>
          </form>
        </div>

        {/* Weekly Assignments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/70">
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>【{studentNameInput || '護生'}】的實習週次作業清單</span>
                <span className="text-xs text-slate-500 font-normal">({studentRecords.length} 份)</span>
              </h4>
              <p className="text-xs text-slate-500">每一週次為一份獨立作業，點選可直接載入編輯</p>
            </div>

            {/* Quick Add Next Week Button */}
            <button
              type="button"
              onClick={() => handleCreateWeek(nextSuggestedWeek)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新增第 {nextSuggestedWeek} 週作業</span>
            </button>
          </div>

          {studentRecords.length === 0 ? (
            <div className="p-10 bg-white rounded-xl border border-slate-200 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto opacity-30 stroke-1" />
              <p className="text-xs font-semibold text-slate-600">目前尚無「{studentNameInput}」的專屬作業記錄</p>
              <button
                type="button"
                onClick={() => handleCreateWeek('1')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                立即建立第 1 週實習作業
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {studentRecords.map((rec) => {
                const comp = calculateCompletionStats(rec);
                const isSelected = rec.id === currentId;
                const isGraded = Boolean(rec.signatures?.instructorSignature || rec.signatures?.score);
                const hasStudentSigned = Boolean(rec.signatures?.studentSignature);

                return (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onSelectRecord(rec.id);
                      onClose();
                    }}
                    className={`bg-white rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md hover:border-blue-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="pt-0.5">
                        <CircularProgress percentage={comp.totalPercentage} size={42} strokeWidth={4} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                            第 {rec.internship?.week || '1'} 週作業
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            【{rec.basicInfo?.bedNumber || '未填床號'}】{rec.basicInfo?.patientName || '個案姓名'}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                              正在編輯
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                          <span className="text-slate-500">{rec.basicInfo?.primaryDiagnosis || '產科主診斷'}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">實習單位：{rec.internship?.unit || '產科病房'}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">日期：{rec.internship?.date || '未填'}</span>
                        </div>

                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <span className="text-slate-500">
                            完成度：<strong>{comp.totalPercentage}%</strong> ({comp.totalFilled}/{comp.totalFields} 項)
                          </span>
                          {hasStudentSigned ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              護生已簽章
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              護生未簽章
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {isGraded ? (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-xs">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>老師已批閱 {rec.signatures?.score ? `(${rec.signatures.score})` : ''}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                          <span>待老師批閱</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-blue-700 font-bold">
                        <span>開啟編輯</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>點擊任一週次作業即可載入編輯，或直接新增下一週實習個案。</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
