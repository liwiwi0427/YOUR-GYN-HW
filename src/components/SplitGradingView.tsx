import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HandoverRecord } from '../types';
import { calculateCompletionStats } from '../utils/completionTracker';
import { CircularProgress } from './CircularProgress';
import { SignatureModal } from './SignatureModal';
import { 
  GraduationCap, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  FileText, 
  Award, 
  PenTool, 
  Save, 
  Layers, 
  Check, 
  Printer, 
  User, 
  Heart, 
  Activity, 
  Baby, 
  Stethoscope, 
  ScrollText, 
  Send,
  Eye,
  ShieldCheck,
  RotateCcw,
  Download,
  FileCheck2
} from 'lucide-react';
import { logAuditEvent, UserRole } from '../utils/rbac';
import { exportSingleRecordDocx, printRecordsAsPdf } from '../utils/exportDocxPdf';
import { generateTeacherStampDataUrl } from '../utils/stampGenerator';

interface SplitGradingViewProps {
  record?: HandoverRecord;
  records: HandoverRecord[];
  currentId: string;
  onSelectRecord: (id: string) => void;
  onUpdateRecord: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
  instructorName: string;
  onClose: () => void;
  currentUserRole: UserRole;
  isOpen?: boolean;
}

// Preset clinical teacher comments library
const COMMENT_PRESETS = [
  {
    category: '產程與子宮評估',
    items: [
      '產後子宮收縮硬度與宮底高度評估正確，惡露性質量化描述詳實。',
      '第四產程生命徵象與產後大出血 (PPH) 預防觀察記錄周全。',
      '胎盤剝離方式與失血量估算記錄確實，符合產房交接標準。',
    ],
  },
  {
    category: 'REEDA 與傷口評估',
    items: [
      '會陰傷口 REEDA 五項評估客觀精確，紅腫與近似度觀察細膩。',
      '剖腹產傷口敷料與換藥衛教完整，急性疼痛護理措施切合需求。',
      '建議於傷口評估中補充分泌物性狀及個案溫水坐浴依從性。',
    ],
  },
  {
    category: 'DART 護理記錄',
    items: [
      'D-A-R-T 結構邏輯清晰，護理行動 (A) 與衛教指導 (T) 具體且針對性高，表現優良！',
      '護理焦點命名精準，主客觀資料 (D) 收集完整，成效評估 (R) 明確。',
      '衛教措施可再加強產婦親餵含乳技巧與返家防脹奶護理指導。',
    ],
  },
  {
    category: '綜合改進提醒',
    items: [
      '請補充產後第一次自解小便時間與解尿量，確認無膀胱脹滿問題。',
      '新生兒 Apgar 計分與體溫維持措施記錄完整，交班事項條理分明。',
      '本次實習個案評估表現優異，能融會貫通產科護理學理於臨床照護。',
    ],
  },
];

export const SplitGradingView: React.FC<SplitGradingViewProps> = ({
  record: recordProp,
  records,
  currentId,
  onSelectRecord,
  onUpdateRecord,
  instructorName = '指導教師',
  onClose,
  currentUserRole,
}) => {
  const record = recordProp || records.find((r) => r.id === currentId) || records[0];

  // Grading form states
  const [score, setScore] = useState<string>(record?.signatures?.score || '');
  const [comment, setComment] = useState<string>(record?.signatures?.instructorComment || '');
  const [instructorSig, setInstructorSig] = useState<string>(record?.signatures?.instructorSignature || '');
  const [signedAt, setSignedAt] = useState<string>(record?.signatures?.instructorSignedAt || '');
  
  // UI states
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [activeTabCategory, setActiveTabCategory] = useState<number>(0);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [activeLeftSection, setActiveLeftSection] = useState<string>('all');
  const leftContentRef = useRef<HTMLDivElement>(null);

  // Sync internal state when record changes
  useEffect(() => {
    if (record) {
      setScore(record.signatures?.score || '');
      setComment(record.signatures?.instructorComment || '');
      setInstructorSig(record.signatures?.instructorSignature || '');
      setSignedAt(record.signatures?.instructorSignedAt || '');
    }
  }, [record?.id, record?.signatures?.instructorSignature, record?.signatures?.score, record?.signatures?.instructorComment]);

  // Current record index and navigation
  const currentIndex = useMemo(() => {
    return records.findIndex((r) => r.id === currentId);
  }, [records, currentId]);

  const prevRecord = currentIndex > 0 ? records[currentIndex - 1] : null;
  const nextRecord = currentIndex < records.length - 1 ? records[currentIndex + 1] : null;

  // Completion calculation for student's work
  const completionStats = useMemo(() => {
    return calculateCompletionStats(record);
  }, [record]);

  // Handle saving evaluation
  const handleSaveGrading = (showToast = true) => {
    const nowStr = new Date().toISOString();
    const finalSignedAt = instructorSig ? (signedAt || nowStr) : '';

    const reviewerRoleLabel = currentUserRole === 'admin'
      ? '全域系統管理員'
      : (currentUserRole === 'hn_np' ? 'HN&NP 臨床督導' : '實習指導教師');

    const hashSeed = `${Date.now()}-${instructorName || '指導教師'}-${score.trim()}-${finalSignedAt}`;
    let charSum = 0;
    for (let i = 0; i < hashSeed.length; i++) charSum += hashSeed.charCodeAt(i) * (i + 1);
    const verifyTag = `NIS-SIG-${(charSum % 900000 + 100000).toString(16).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const newAuditEntry = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false }),
      instructorName: instructorName || '指導教師',
      reviewerRole: reviewerRoleLabel,
      action: score.trim() ? ('核定簽核' as const) : ('評語批註' as const),
      score: score.trim() || undefined,
      commentSummary: comment.trim() || '(無評語備註)',
      hasSignature: Boolean(instructorSig),
      verificationCode: verifyTag,
    };

    onUpdateRecord((prev) => {
      const prevSig = prev.signatures || {};
      const currentHistory = prevSig.reviewHistory || [];
      return {
        ...prev,
        signatures: {
          ...prevSig,
          score: score.trim(),
          instructorComment: comment.trim(),
          instructorSignature: instructorSig,
          instructorSignedAt: finalSignedAt,
          reviewHistory: [newAuditEntry, ...currentHistory],
        },
        internship: {
          ...prev.internship,
          instructor: instructorName || prev.internship.instructor || '指導教師',
        },
      };
    });

    logAuditEvent(
      instructorName || '指導教師',
      currentUserRole,
      '作業評閱',
      '核定實習作業成績與簽章',
      `學生：${record.internship?.studentName || '未填寫'} (週次：第${record.internship?.week || '1'}週)，成績：${score || '未給分'}`,
      'success'
    );

    if (showToast) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
    }
  };

  // Save and jump to next
  const handleSaveAndNext = () => {
    handleSaveGrading(false);
    if (nextRecord) {
      onSelectRecord(nextRecord.id);
    } else {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
    }
  };

  // Quick preset grade click
  const handleSelectPresetGrade = (presetScore: string) => {
    setScore(presetScore);
  };

  // Insert comment preset
  const handleInsertComment = (text: string) => {
    setComment((prev) => {
      if (!prev.trim()) return text;
      return `${prev}\n${text}`;
    });
  };

  // Quick official red KaiTi digital stamp for instructor
  const handleQuickTeacherStamp = () => {
    const stampBase64 = generateTeacherStampDataUrl(instructorName || '實習指導教師');
    if (stampBase64) {
      setInstructorSig(stampBase64);
      setSignedAt(new Date().toISOString());
    }
  };

  // Scroll left reader to specific section
  const scrollToLeftAnchor = (anchorId: string) => {
    setActiveLeftSection(anchorId);
    if (anchorId === 'all') {
      leftContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(`split-sec-${anchorId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const studentName = record.internship?.studentName || '未填寫姓名';
  const studentId = record.internship?.studentId || '無學號';
  const weekNumber = record.internship?.week || '1';
  const patientName = record.basicInfo?.patientName || '個案未命名';
  const bedNumber = record.basicInfo?.bedNumber || '未排床';
  const deliveryMode = record.deliveryProcess?.deliveryMode || '尚未填寫分娩方式';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Main Navigation Bar for Split Mode */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-800/60 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        
        {/* Left: Mode Title & Current Student Meta */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/90 border border-emerald-400/30 flex items-center justify-center text-white shadow-inner">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                產科實習作業「雙欄對照」批閱模式
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                {instructorName} 老師專用
              </span>
            </div>
            <p className="text-xs text-slate-300">
              左側即時審閱學生填寫內容 • 右側固定評分與簽章面板
            </p>
          </div>
        </div>

        {/* Center: Quick Pagination & Assignment Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-xl text-xs">
          <button
            type="button"
            disabled={!prevRecord}
            onClick={() => prevRecord && onSelectRecord(prevRecord.id)}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-200 transition-colors"
            title="上一份作業"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-1 font-semibold text-slate-200">
            <span>第 <strong>{currentIndex + 1}</strong> / {records.length} 份</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-300 font-bold">{studentName}</span>
            <span className="text-slate-400 text-[11px]">({studentId} - 第{weekNumber}週)</span>
          </div>

          <button
            type="button"
            disabled={!nextRecord}
            onClick={() => nextRecord && onSelectRecord(nextRecord.id)}
            className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-200 transition-colors"
            title="下一份作業"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {saveSuccessNotice && (
            <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-lg animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>批閱已儲存</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => exportSingleRecordDocx(record)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-700/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors border border-blue-500/40"
            title="匯出此份作業為 Word (.docx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">匯出 DOCX</span>
          </button>

          <button
            type="button"
            onClick={() => printRecordsAsPdf([record])}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors border border-emerald-500/40"
            title="列印或另存為 PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">列印 PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-semibold transition-colors"
          >
            <X className="w-4 h-4" />
            <span>退出對照</span>
          </button>
        </div>

      </div>

      {/* Main Dual-Column Split Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Student Case Submission Content (Scrollable, 62% width)       */}
        {/* ========================================================================= */}
        <div className="flex-1 lg:w-[62%] flex flex-col h-full border-r border-slate-300 bg-slate-50 overflow-hidden">
          
          {/* Left Subheader / Quick Anchor Navigation Bar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-max text-xs">
              <span className="text-slate-400 font-bold text-[11px] mr-1">快速導覽：</span>
              {[
                { id: 'all', label: '全部' },
                { id: 'intern', label: '實習資料' },
                { id: 'basic', label: '基本資料' },
                { id: 'admission', label: '入院評估' },
                { id: 'delivery', label: '生產過程' },
                { id: 'baby', label: '寶寶情況' },
                { id: 'maternal', label: '產後身心' },
                { id: 'wound', label: 'REEDA傷口' },
                { id: 'handover', label: '交班事項' },
                { id: 'dart', label: 'DART記錄' },
                { id: 'student-sig', label: '學生簽章' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToLeftAnchor(item.id)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeLeftSection === item.id
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Student Submission Status Badge */}
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-xs text-slate-500 font-medium">作業完成度：</span>
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                <CircularProgress percentage={completionStats.totalPercentage} size={18} strokeWidth={2.5} showText={false} />
                <span className="text-xs font-bold text-slate-800">{completionStats.totalPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Left Content Scroll Container */}
          <div ref={leftContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Header Banner for Student Case */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
                    {bedNumber ? `${bedNumber} 床` : '未填床號'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{patientName}</h3>
                  <span className="text-xs text-slate-500">（{deliveryMode}）</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                  <span>護生：<strong>{studentName}</strong> ({studentId})</span>
                  <span>單位：<strong>{record.internship?.unit || '5B 婦產科病房'}</strong></span>
                  <span>實習週次：<strong>第 {weekNumber} 週</strong></span>
                  <span>實習日期：{record.internship?.date || '-'}</span>
                </div>
              </div>

              {/* Student Signature Status Badge */}
              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="text-[11px] text-slate-400 block">學生端簽署狀態</span>
                {record.signatures?.studentSignature ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已簽章送出 ({record.signatures.studentSignedAt?.split('T')[0] || '完成'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    學生尚未簽署
                  </span>
                )}
              </div>
            </div>

            {/* Section 1: Internship & Basic Info */}
            <div id="split-sec-basic" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>一、基本資料與入院主訴</span>
                </h4>
                <span className="text-[11px] text-slate-400">Basic Demographic & Clinical Information</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-400 block">入院日期時間：</span><strong className="text-slate-800">{record.basicInfo?.admissionDate || '-'}</strong></div>
                <div><span className="text-slate-400 block">預產日 (EDC)：</span><strong className="text-slate-800">{record.basicInfo?.expectedDeliveryDate || '-'}</strong></div>
                <div><span className="text-slate-400 block">生產日：</span><strong className="text-slate-800">{record.basicInfo?.deliveryDate || '-'}</strong></div>
                <div><span className="text-slate-400 block">懷孕週數 (GA)：</span><strong className="text-slate-800">{record.basicInfo?.gestationalWeeks || '-'}</strong></div>
                <div><span className="text-slate-400 block">生產史 (G/P)：</span><strong className="text-slate-800">{record.basicInfo?.obstetricHistory || '-'}</strong></div>
                <div><span className="text-slate-400 block">主治醫師 / 主護：</span><strong className="text-slate-800">{record.basicInfo?.attendingPhysician || '-'} / {record.basicInfo?.primaryNurse || '-'}</strong></div>
              </div>

              <div className="text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-400 block">主診斷 (Primary Diagnosis)：</span>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-800 font-semibold mt-0.5">
                  {record.basicInfo?.primaryDiagnosis || '無填寫'}
                </div>
              </div>

              {record.basicInfo?.secondaryDiagnoses?.some((d) => Boolean(d)) && (
                <div className="text-xs">
                  <span className="text-slate-400 block">次診斷 (Secondary Diagnoses)：</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 mt-1 bg-slate-50 p-2 rounded-lg">
                    {record.basicInfo.secondaryDiagnoses.filter(Boolean).map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {record.basicInfo?.admissionCourse && (
                <div className="text-xs">
                  <span className="text-slate-400 block">入院經過 (Admission Course)：</span>
                  <p className="p-2 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap mt-0.5">
                    {record.basicInfo.admissionCourse}
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Admission Assessment */}
            <div id="split-sec-admission" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>入院護理評估表</span>
                </h4>
                <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                  record.admissionAssessment?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {record.admissionAssessment?.enabled ? '已填寫入院評估' : '未勾選填寫'}
                </span>
              </div>

              {record.admissionAssessment?.enabled ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                    <div><span className="text-slate-400">身高：</span> <strong>{record.admissionAssessment.height || '-'} cm</strong></div>
                    <div><span className="text-slate-400">孕前體重：</span> <strong>{record.admissionAssessment.prePregnancyWeight || '-'} kg</strong></div>
                    <div><span className="text-slate-400">目前體重：</span> <strong>{record.admissionAssessment.currentWeight || '-'} kg</strong></div>
                    <div><span className="text-slate-400">計算 BMI：</span> <strong className="text-blue-700">{record.admissionAssessment.bmi || '-'}</strong></div>
                  </div>

                  <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-1">入院生命徵象 (V/S)：</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <div><span className="text-slate-500">T:</span> <strong>{record.admissionAssessment.vitalSigns?.temperature || '-'} °C</strong></div>
                      <div><span className="text-slate-500">P:</span> <strong>{record.admissionAssessment.vitalSigns?.pulse || '-'} bpm</strong></div>
                      <div><span className="text-slate-500">R:</span> <strong>{record.admissionAssessment.vitalSigns?.respiration || '-'} bpm</strong></div>
                      <div><span className="text-slate-500">BP:</span> <strong>{record.admissionAssessment.vitalSigns?.systolicBP || '-'}/{record.admissionAssessment.vitalSigns?.diastolicBP || '-'} mmHg</strong></div>
                      <div><span className="text-slate-500">SpO2:</span> <strong>{record.admissionAssessment.vitalSigns?.spO2 || '-'}%</strong></div>
                      <div><span className="text-slate-500">血型:</span> <strong>{record.admissionAssessment.patientBloodType} {record.admissionAssessment.patientRh}</strong></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">無入院評估紀錄。</p>
              )}
            </div>

            {/* Section 3: Delivery Process */}
            <div id="split-sec-delivery" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>二、生產過程 (Delivery Process)</span>
                </h4>
                <span className="text-[11px] text-slate-400">分娩方式、產程耗時與出血量</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-slate-400 block">分娩方式：</span><strong className="text-purple-700">{record.deliveryProcess?.deliveryMode || '-'}</strong></div>
                <div><span className="text-slate-400 block">胎盤剝離方式：</span><strong className="text-slate-800">{record.deliveryProcess?.placentaExpulsionMode || '-'}</strong></div>
                <div><span className="text-slate-400 block">會陰裂傷等級：</span><strong className="text-slate-800">{record.deliveryProcess?.perinealLaceration || '-'}</strong></div>
                <div><span className="text-slate-400 block">娩出時間：</span><strong className="text-slate-800">{record.deliveryProcess?.deliveryTime || '-'}</strong></div>
                <div><span className="text-slate-400 block">失血量 (EBL)：</span><strong className="text-rose-600">{record.deliveryProcess?.bloodLoss ? `${record.deliveryProcess.bloodLoss} ml` : '-'}</strong></div>
                <div><span className="text-slate-400 block">胎盤重量：</span><strong className="text-slate-800">{record.deliveryProcess?.placentaWeight ? `${record.deliveryProcess.placentaWeight} g` : '-'}</strong></div>
              </div>

              {/* Natural Delivery Stages or Cesarean Timetable */}
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs">
                <span className="font-bold text-slate-700 block mb-1">產程時間明細：</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div><span className="text-slate-400">第一產程:</span> <strong>{record.deliveryProcess?.naturalDelivery?.stage1Time || '-'}</strong></div>
                  <div><span className="text-slate-400">第二產程:</span> <strong>{record.deliveryProcess?.naturalDelivery?.stage2Time || '-'}</strong></div>
                  <div><span className="text-slate-400">第三產程:</span> <strong>{record.deliveryProcess?.naturalDelivery?.stage3Time || '-'}</strong></div>
                  <div><span className="text-slate-400">第四產程:</span> <strong>{record.deliveryProcess?.naturalDelivery?.stage4Time || '-'}</strong></div>
                  <div><span className="text-slate-400">總耗時:</span> <strong className="text-blue-700">{record.deliveryProcess?.naturalDelivery?.totalLaborTime || '-'}</strong></div>
                </div>
              </div>
            </div>

            {/* Section 4: Baby Status */}
            <div id="split-sec-baby" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-pink-600" />
                  <span>三、寶寶情況 (Newborn Status)</span>
                </h4>
                <span className="text-[11px] text-slate-400">Apgar 計分與餵食狀況</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><span className="text-slate-400 block">出生體重：</span><strong className="text-slate-800">{record.babyStatus?.weight ? `${record.babyStatus.weight} g` : '-'}</strong></div>
                <div><span className="text-slate-400 block">出生身高：</span><strong className="text-slate-800">{record.babyStatus?.height ? `${record.babyStatus.height} cm` : '-'}</strong></div>
                <div><span className="text-slate-400 block">Apgar 1 分鐘：</span><strong className="text-blue-700">{record.babyStatus?.apgar1Min || '-'} 分</strong></div>
                <div><span className="text-slate-400 block">Apgar 5 分鐘：</span><strong className="text-emerald-700">{record.babyStatus?.apgar5Min || '-'} 分</strong></div>
                <div><span className="text-slate-400 block">寶寶位置：</span><strong className="text-slate-800">{record.babyStatus?.location || '-'}</strong></div>
                <div><span className="text-slate-400 block">哺餵方式：</span><strong className="text-slate-800">{record.babyStatus?.feedingType || '-'}</strong></div>
                <div><span className="text-slate-400 block">今日奶量：</span><strong className="text-slate-800">{record.babyStatus?.dailyIntake || '-'}</strong></div>
              </div>

              {record.babyStatus?.specialConditions && (
                <div className="text-xs p-2 bg-pink-50/60 rounded-lg text-pink-900 border border-pink-100">
                  <span className="font-bold block">出生特殊情況或照護要點：</span>
                  <p className="mt-0.5">{record.babyStatus.specialConditions}</p>
                </div>
              )}
            </div>

            {/* Section 5: Maternal Assessment & REEDA Wound */}
            <div id="split-sec-maternal" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  <span>四、產婦身心與傷口 REEDA 評估</span>
                </h4>
                <span className="text-[11px] text-slate-400">乳房、宮底高度、惡露量與傷口計分</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Breast & Uterus */}
                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <span className="font-bold text-slate-700 block border-b border-slate-200 pb-1">乳房與宮底狀況：</span>
                  <div><span className="text-slate-400">乳房質地/外觀:</span> <strong>{record.maternalAssessment?.breast?.consistency || '-'} / {record.maternalAssessment?.breast?.skinAppearance || '-'}</strong></div>
                  <div><span className="text-slate-400">乳頭形狀/完整:</span> <strong>{record.maternalAssessment?.breast?.nippleShape || '-'} / {record.maternalAssessment?.breast?.nippleIntegrity || '-'}</strong></div>
                  <div><span className="text-slate-400">宮底高度 (Fundus):</span> <strong className="text-blue-700">{record.maternalAssessment?.uterus?.fundalHeight || '-'}</strong></div>
                  <div><span className="text-slate-400">宮縮硬度/位置:</span> <strong>{record.maternalAssessment?.uterus?.contraction || '-'} / {record.maternalAssessment?.uterus?.position || '-'}</strong></div>
                  <div><span className="text-slate-400">惡露性質/顏色:</span> <strong className="text-rose-700">{record.maternalAssessment?.uterus?.lochiaType || '-'} ({record.maternalAssessment?.uterus?.lochiaColor || '-'}, {record.maternalAssessment?.uterus?.lochiaAmount || '-'})</strong></div>
                </div>

                {/* REEDA / Wound */}
                <div id="split-sec-wound" className="p-3 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2">
                  <span className="font-bold text-rose-900 block border-b border-rose-200 pb-1">傷口臨床評估 (REEDA Scale)：</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><span className="text-slate-500">Redness (紅):</span> <strong>{record.maternalAssessment?.wound?.perineal?.redness || '-'}</strong></div>
                    <div><span className="text-slate-500">Edema (腫):</span> <strong>{record.maternalAssessment?.wound?.perineal?.edema || '-'}</strong></div>
                    <div><span className="text-slate-500">Ecchymosis (瘀斑):</span> <strong>{record.maternalAssessment?.wound?.perineal?.ecchymosis || '-'}</strong></div>
                    <div><span className="text-slate-500">Discharge (分泌物):</span> <strong>{record.maternalAssessment?.wound?.perineal?.discharge || '-'}</strong></div>
                    <div><span className="text-slate-500">Approximation (近似):</span> <strong>{record.maternalAssessment?.wound?.perineal?.approximation || '-'}</strong></div>
                  </div>
                  {record.maternalAssessment?.wound?.cesarean?.pain && (
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-rose-100">
                      剖腹傷口疼痛: <strong>{record.maternalAssessment.wound.cesarean.pain}</strong> | 敷料: {record.maternalAssessment.wound.cesarean.dressing || '-'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 6: Handover Notes */}
            <div id="split-sec-handover" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <ScrollText className="w-4 h-4 text-amber-600" />
                <span>五、交班注意事項 (ISBAR Handover Notes)</span>
              </h4>
              <p className="p-3 bg-amber-50/40 rounded-lg text-xs text-slate-800 border border-amber-200/60 whitespace-pre-wrap leading-relaxed">
                {record.handoverNotes || '（尚未填寫交班注意事項）'}
              </p>
            </div>

            {/* Section 7: DART Nursing Notes */}
            <div id="split-sec-dart" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>六、護理記錄 (DART Focus Charting)</span>
                </h4>
                <span className="text-xs text-slate-500">焦點：<strong className="text-blue-700">{record.nursingRecord?.focus || '未填寫'}</strong></span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                  <span className="font-bold text-blue-900 block mb-0.5">D (Data, 主客觀資料)：</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{record.nursingRecord?.data || '-'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
                  <span className="font-bold text-emerald-900 block mb-0.5">A (Action, 護理行動措施)：</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{record.nursingRecord?.action || '-'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-purple-500">
                  <span className="font-bold text-purple-900 block mb-0.5">R (Response, 反應與成效評估)：</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{record.nursingRecord?.response || '-'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-amber-500">
                  <span className="font-bold text-amber-900 block mb-0.5">T (Teaching, 衛教指導內容)：</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{record.nursingRecord?.teaching || '-'}</p>
                </div>
              </div>
            </div>

            {/* Section 8: Student Electronic Signature Card */}
            <div id="split-sec-student-sig" className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>學生端個人數位簽署證明</span>
              </h4>
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    簽署護生：{studentName} ({studentId})
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    簽署時間戳記：{record.signatures?.studentSignedAt || '尚未完成個人簽章'}
                  </div>
                </div>

                {record.signatures?.studentSignature ? (
                  <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
                    <img
                      src={record.signatures.studentSignature}
                      alt="護生手寫簽名"
                      className="h-10 max-w-[140px] object-contain"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">尚未簽章</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Fixed Teacher Grading & Signature Panel (38% width)         */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[38%] flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto">
          
          {/* Header of Grading Panel */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base text-white">教師評閱與成績核定面板</h3>
              </div>
              <span className="bg-white/20 text-[11px] px-2 py-0.5 rounded-full font-bold border border-white/30">
                {instructorName} 老師
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              當前評閱個案：<strong>{studentName}</strong> (第{weekNumber}週 / {bedNumber}床)
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto">
            
            {/* 1. Grade Evaluation Block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>實習成績等第與分數評定</span>
                </label>
                {score && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    目前核定：{score}
                  </span>
                )}
              </div>

              {/* Quick Preset Grade Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'A+ (95分)', val: 'A+ (95分)' },
                  { label: 'A (90分)', val: 'A (90分)' },
                  { label: 'A- (85分)', val: 'A- (85分)' },
                  { label: 'B+ (80分)', val: 'B+ (80分)' },
                  { label: 'B (75分)', val: 'B (75分)' },
                  { label: 'B- (70分)', val: 'B- (70分)' },
                  { label: 'C (65分)', val: 'C (65分)' },
                  { label: '需補正重交', val: '需補正重新交班' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleSelectPresetGrade(item.val)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      score === item.val
                        ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500'
                        : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Score input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 font-medium">或自訂等第/分數：</span>
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="例如：92分 / 優等 / A+"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-slate-800"
                />
              </div>
            </div>

            {/* 2. Preset Comments Library (範本庫) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>常用產科實習指導評語庫 (點擊一鍵帶入)</span>
                </label>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {COMMENT_PRESETS.map((cat, idx) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveTabCategory(idx)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
                      activeTabCategory === idx
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Presets List in current category */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                {COMMENT_PRESETS[activeTabCategory].items.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleInsertComment(text)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border border-slate-200 transition-colors flex items-start gap-1.5"
                  >
                    <span className="text-emerald-600 font-bold mt-0.5">+</span>
                    <span className="leading-snug">{text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Instructor Comment Input Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  實習指導教師具體評語與建議 <span className="text-emerald-700 font-normal">({instructorName} 老師)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setComment('')}
                  className="text-[11px] text-slate-400 hover:text-rose-600"
                >
                  清空評語
                </button>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="請輸入對此份產科實習作業之具體指導建議、優點或待改進之處..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed text-slate-800"
              />
            </div>

            {/* 4. Instructor Signature & Stamp */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-emerald-700" />
                  <span>實習指導教師官方電子簽署 (Instructor)</span>
                </label>
                {instructorSig && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    已核章
                  </span>
                )}
              </div>

              {instructorSig ? (
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <img src={instructorSig} alt="教師簽名" className="h-12 object-contain" />
                    <div className="text-[10px] text-slate-400 mt-1">
                      簽署時間：{signedAt || '即時簽署'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                    >
                      重新手寫
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInstructorSig('');
                        setSignedAt('');
                      }}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-semibold"
                    >
                      清除簽名
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickTeacherStamp}
                    className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>一鍵蓋章 ({instructorName} 老師標楷體紅章)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    手寫簽名
                  </button>
                </div>
              )}
            </div>

            {/* 5. Action Controls Footer */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSaveGrading(true)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>儲存此份作業評閱結果</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScore('需補正重新交班');
                  const returnMsg = '【退回補正通知】請依指導評語建議修正後重新簽章送審。';
                  setComment((prev) => prev ? `${prev}\n${returnMsg}` : returnMsg);
                  setTimeout(() => handleSaveGrading(true), 50);
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                title="標註作業需補正並退回給實習學生"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>退回學生補正重新交班</span>
              </button>

              {nextRecord && (
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>儲存並批閱下一份作業</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Handwritten Signature Modal for Instructor */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={(dataUrl) => {
          setInstructorSig(dataUrl);
          setSignedAt(new Date().toISOString());
        }}
        title={`${instructorName} 老師官方手寫簽名`}
        signerRole="instructor"
        initialImage={instructorSig}
      />

    </div>
  );
};
