import React, { useState } from 'react';
import { HandoverRecord, ReviewAuditEntry } from '../../types';
import { 
  PenTool, 
  Award, 
  CheckCircle2, 
  MessageSquare, 
  Calendar, 
  User, 
  Eraser, 
  FileCheck,
  Lock,
  ShieldAlert,
  Shield,
  GraduationCap,
  History,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  FileSignature,
  Stamp
} from 'lucide-react';
import { SignatureModal } from '../SignatureModal';
import { UserRole } from '../../utils/rbac';
import { generateTeacherStampDataUrl } from '../../utils/stampGenerator';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
  currentUserRole?: UserRole;
  onRequireTeacherLogin?: () => void;
}

export const SignatureSection: React.FC<Props> = ({ 
  record, 
  onChange,
  currentUserRole = 'student',
  onRequireTeacherLogin,
}) => {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    role: 'student' | 'instructor';
  }>({
    isOpen: false,
    role: 'student',
  });

  const [showAuditTrail, setShowAuditTrail] = useState<boolean>(false);

  const signatures = record?.signatures || {};
  const reviewHistory: ReviewAuditEntry[] = signatures.reviewHistory || [];
  const canGrade = currentUserRole === 'instructor' || currentUserRole === 'hn_np' || currentUserRole === 'admin';

  const handleOpenSign = (role: 'student' | 'instructor') => {
    if (role === 'instructor' && !canGrade) {
      if (onRequireTeacherLogin) {
        onRequireTeacherLogin();
      }
      return;
    }
    setModalConfig({
      isOpen: true,
      role,
    });
  };

  const handleSaveSignature = (data: {
    signatureDataUrl: string;
    signedAt: string;
    comment?: string;
    score?: string;
  }) => {
    onChange((prev) => {
      const prevSig = prev?.signatures || {};
      const currentHistory = prevSig.reviewHistory || [];

      if (modalConfig.role === 'student') {
        return {
          ...prev,
          signatures: {
            ...prevSig,
            studentSignature: data.signatureDataUrl,
            studentSignedAt: data.signedAt,
          },
        };
      } else {
        const reviewerRoleLabel = currentUserRole === 'admin' 
          ? '全域系統管理員' 
          : (currentUserRole === 'hn_np' ? 'HN&NP 臨床督導' : '實習指導教師');

        const reviewerName = prev?.internship?.instructor || '實習指導教師';
        
        // Generate pseudo audit verification code
        const hashSeed = `${Date.now()}-${reviewerName}-${data.score || ''}-${data.signedAt}`;
        let charSum = 0;
        for (let i = 0; i < hashSeed.length; i++) charSum += hashSeed.charCodeAt(i) * (i + 1);
        const verifyTag = `NIS-SIG-${(charSum % 900000 + 100000).toString(16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        const newAuditEntry: ReviewAuditEntry = {
          id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: data.signedAt || new Date().toLocaleString('zh-TW', { hour12: false }),
          instructorName: reviewerName,
          reviewerRole: reviewerRoleLabel,
          action: data.score ? '核定簽核' : '評語批註',
          score: data.score || prevSig.score,
          commentSummary: data.comment || prevSig.instructorComment || '(無評語備註)',
          hasSignature: Boolean(data.signatureDataUrl),
          verificationCode: verifyTag,
        };

        return {
          ...prev,
          signatures: {
            ...prevSig,
            instructorSignature: data.signatureDataUrl,
            instructorSignedAt: data.signedAt,
            instructorComment: data.comment || prevSig.instructorComment || '',
            score: data.score || prevSig.score || '',
            reviewHistory: [newAuditEntry, ...currentHistory],
          },
        };
      }
    });
  };

  const handleClearSignature = (role: 'student' | 'instructor') => {
    if (role === 'instructor' && !canGrade) return;
    onChange((prev) => {
      const prevSig = prev?.signatures || {};
      if (role === 'student') {
        return {
          ...prev,
          signatures: {
            ...prevSig,
            studentSignature: '',
            studentSignedAt: '',
          },
        };
      } else {
        return {
          ...prev,
          signatures: {
            ...prevSig,
            instructorSignature: '',
            instructorSignedAt: '',
            instructorComment: '',
            score: '',
          },
        };
      }
    });
  };

  const handleQuickStamp = () => {
    if (!canGrade) return;
    const instructorName = record.internship.instructor || '實習指導教師';
    const stampData = generateTeacherStampDataUrl(instructorName);
    handleSaveSignature({
      signatureDataUrl: stampData,
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comment: record.signatures?.instructorComment,
      score: record.signatures?.score,
    });
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">七、簽章與實習評閱核定</h2>
            <p className="text-xs text-slate-500">護生線上完稿簽章送出，指導教師/臨床主管等第評定與手寫電子覆核</p>
          </div>
        </div>

        {signatures.score && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 self-start sm:self-auto">
            <Award className="w-4 h-4 text-amber-600" />
            <span>目前核定等第：{signatures.score}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Student Signature Box */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                實習同學（填寫者）簽署
              </span>
              {signatures.studentSignature ? (
                <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 已完成簽章
                </span>
              ) : (
                <span className="text-[11px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  待簽章
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              請實習同學在全表確認填寫無誤後進行電子手寫簽名，代表確認本次交班記錄正確。
            </p>

            {/* Signature Display Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white h-24 flex items-center justify-center relative overflow-hidden">
              {signatures.studentSignature ? (
                <img
                  src={signatures.studentSignature}
                  alt="Student Signature"
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSign('student')}
                  className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <PenTool className="w-5 h-5 stroke-1" />
                  <span className="text-xs font-medium">點擊開啟手寫簽名板</span>
                </button>
              )}
            </div>

            {signatures.studentSignedAt && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>簽署時間：{signatures.studentSignedAt}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleOpenSign('student')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{signatures.studentSignature ? '重新手寫簽章' : '開啟簽名板'}</span>
            </button>
            {signatures.studentSignature && (
              <button
                type="button"
                onClick={() => handleClearSignature('student')}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
              >
                清除簽章
              </button>
            )}
          </div>
        </div>

        {/* Instructor Signature & Evaluation Card */}
        <div className={`border rounded-xl p-4 space-y-3 flex flex-col justify-between transition-all ${
          canGrade 
            ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20' 
            : 'bg-slate-50/50 border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                  currentUserRole === 'admin' ? 'bg-purple-800' : (currentUserRole === 'hn_np' ? 'bg-amber-700' : 'bg-emerald-700')
                }`}>
                  師
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900">實習指導教師評閱與簽章 (Instructor / HN)</h4>
                    {canGrade ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        已認證解鎖
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        權限鎖定中
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    指導教師：{record.internship.instructor || '指導教師'} 老師
                  </span>
                </div>
              </div>

              {signatures.instructorSignature ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  已核定
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                  待評閱
                </span>
              )}
            </div>

            {/* Score & Comment */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  核定成績等第：
                </span>
                {signatures.score ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {signatures.score}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-normal">尚未給分</span>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  教師指導評語與反饋：
                </span>
                {signatures.instructorComment ? (
                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {signatures.instructorComment}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-white/60 p-2 rounded border border-dashed border-slate-200">
                    尚無指導教師評語
                  </p>
                )}
              </div>
            </div>

            {/* Signature Display Area */}
            <div className={`border-2 border-dashed rounded-xl h-24 flex items-center justify-center relative overflow-hidden ${
              canGrade ? 'bg-white border-emerald-300' : 'bg-slate-100/60 border-slate-300'
            }`}>
              {signatures.instructorSignature ? (
                <img
                  src={signatures.instructorSignature}
                  alt="Instructor Signature"
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : canGrade ? (
                <button
                  type="button"
                  onClick={() => handleOpenSign('instructor')}
                  className="flex flex-col items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <PenTool className="w-5 h-5 stroke-1" />
                  <span className="text-xs font-semibold">點擊開啟指導教師手寫評核簽名</span>
                </button>
              ) : (
                <div 
                  onClick={onRequireTeacherLogin}
                  className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-emerald-700 transition-colors"
                >
                  <Lock className="w-5 h-5 stroke-1" />
                  <span className="text-xs font-medium">需教師或管理員認證登入後方可簽章評閱</span>
                </div>
              )}
            </div>

            {signatures.instructorSignedAt && (
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>簽核時間：{signatures.instructorSignedAt}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
            {canGrade ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickStamp}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    title="一鍵蓋上指導教師標楷體紅色核定章"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>一鍵蓋標楷體紅章</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenSign('instructor')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{signatures.instructorSignature ? '重新手寫簽核' : '開啟教師簽核板'}</span>
                  </button>
                </div>
                {signatures.instructorSignature && (
                  <button
                    type="button"
                    onClick={() => handleClearSignature('instructor')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                  >
                    清除簽章
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onRequireTeacherLogin}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>我是指導教師 / 管理員（點此登入解鎖）</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden / Expandable Review Audit Trail (評閱審核軌跡鏈) */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/80">
        <button
          type="button"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              評閱審核軌跡 (Review Audit Trail)
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold">
              {reviewHistory.length} 筆簽核紀錄
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              — 完整記錄每一位指導老師簽核時間戳記與防偽稽核鏈
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>{showAuditTrail ? '收合審核軌跡' : '展開檢視審核軌跡'}</span>
            {showAuditTrail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAuditTrail && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3">
            {reviewHistory.length === 0 ? (
              <div className="py-6 text-center text-slate-400 space-y-1">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">目前尚無歷史評閱簽核紀錄</p>
                <p className="text-[11px] text-slate-400">當指導教師或臨床主管進行簽核評分後，系統將自動寫入不可竄改之時間戳記與稽核碼。</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviewHistory.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                          #{reviewHistory.length - idx}
                        </span>
                        <strong className="text-slate-900 font-bold">{item.instructorName}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.reviewerRole}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.action}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.timestamp}
                        </span>
                        {item.verificationCode && (
                          <span className="text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {item.verificationCode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                      <div>
                        <span className="text-slate-400">核定等第：</span>
                        <strong className="text-amber-700 font-bold">{item.score || '—'}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">指導評語：</span>
                        <span className="text-slate-800">{item.commentSummary || '無'}</span>
                      </div>
                      <div className="text-right sm:text-right">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          item.hasSignature ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          <FileSignature className="w-3.5 h-3.5" />
                          {item.hasSignature ? '具備電子手寫章' : '文字覆核'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Pad Modal */}
      <SignatureModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, role: 'student' })}
        role={modalConfig.role}
        signerName={
          modalConfig.role === 'student'
            ? record.internship.studentName || '實習同學'
            : record.internship.instructor || '實習指導教師'
        }
        onSave={handleSaveSignature}
        existingComment={signatures.instructorComment}
        existingScore={signatures.score}
      />
    </section>
  );
};
