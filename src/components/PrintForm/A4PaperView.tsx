import React, { useState, useEffect } from 'react';
import { HandoverRecord } from '../../types';
import { 
  Printer, 
  CheckCircle2, 
  Baby, 
  Stethoscope, 
  PenTool, 
  Award, 
  ZoomIn, 
  ZoomOut,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { SignatureModal } from '../SignatureModal';
import { AdmissionAssessmentPrintPage } from './AdmissionAssessmentPrintPage';

interface Props {
  record: HandoverRecord;
  onUpdateRecord?: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const A4PaperView: React.FC<Props> = ({ record, onUpdateRecord }) => {
  const [printTheme, setPrintTheme] = useState<'classic' | 'modern'>('classic');
  const [printScale, setPrintScale] = useState<number>(100); // 100%, 95%, 90%, 85%
  const [includeAdmission, setIncludeAdmission] = useState<boolean>(() => record.admissionAssessment?.enabled ?? true);
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    role: 'student' | 'instructor';
  }>({
    isOpen: false,
    role: 'student',
  });

  const getFormattedPrintTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const [printTimestamp, setPrintTimestamp] = useState<string>(getFormattedPrintTime);

  useEffect(() => {
    const updateTime = () => setPrintTimestamp(getFormattedPrintTime());
    window.addEventListener('beforeprint', updateTime);
    return () => window.removeEventListener('beforeprint', updateTime);
  }, []);

  const signatures = record?.signatures || {};

  // Helper to render multiple choice items cleanly
  const renderOptionGroup = (options: string[], currentVal: string) => {
    return (
      <div className="inline-flex items-center flex-wrap gap-1 py-0.2">
        {options.map((opt, i) => {
          const isSelected = currentVal && (currentVal.includes(opt) || currentVal === opt);
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10.5px] leading-tight ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold print:bg-black print:text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-300 print:bg-white print:text-black print:border-slate-300'
              }`}
            >
              <span className="text-[8px]">{isSelected ? '■' : '□'}</span>
              <span>{opt}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const handleTriggerPrint = () => {
    setPrintTimestamp(getFormattedPrintTime());
    window.print();
  };

  const handleSaveSignature = (data: {
    signatureDataUrl: string;
    signedAt: string;
    comment?: string;
    score?: string;
  }) => {
    if (!onUpdateRecord) return;
    onUpdateRecord((prev) => {
      const prevSig = prev?.signatures || {};
      if (signatureModal.role === 'student') {
        return {
          ...prev,
          signatures: {
            ...prevSig,
            studentSignature: data.signatureDataUrl,
            studentSignedAt: data.signedAt,
          },
        };
      } else {
        return {
          ...prev,
          signatures: {
            ...prevSig,
            instructorSignature: data.signatureDataUrl,
            instructorSignedAt: data.signedAt,
            instructorComment: data.comment || prevSig.instructorComment || '',
            score: data.score || prevSig.score || '',
          },
        };
      }
    });
  };

  return (
    <div className="bg-slate-300/80 py-6 print:py-0 min-h-screen flex flex-col items-center">
      
      {/* Top Toolbar in Screen Mode */}
      <div className="max-w-[210mm] w-full mb-3 px-2 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-700">
          <span className="px-2.5 py-1 rounded bg-white shadow-2xs border border-slate-300">
            A4 雙頁排版（297mm × 210mm）
          </span>

          {/* Theme Switcher */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setPrintTheme('classic')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                printTheme === 'classic' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              標準黑白
            </button>
            <button
              type="button"
              onClick={() => setPrintTheme('modern')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                printTheme === 'modern' ? 'bg-blue-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              高對比色塊
            </button>
          </div>

          {/* Print Scale Selector */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs text-xs">
            <span className="px-2 text-slate-500 font-semibold">縮放:</span>
            {[100, 95, 90].map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => setPrintScale(scale)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  printScale === scale ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {scale}%
              </button>
            ))}
          </div>

          {/* Include Admission Assessment Checkbox Toggle */}
          <label className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border shadow-2xs text-xs font-semibold cursor-pointer transition-all ${
            includeAdmission 
              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' 
              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}>
            <input
              id="checkbox-include-admission"
              type="checkbox"
              checked={includeAdmission}
              onChange={(e) => setIncludeAdmission(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <ClipboardList className={`w-3.5 h-3.5 ${includeAdmission ? 'text-blue-600' : 'text-slate-400'}`} />
              包含入院評估（獨立第 1 頁）
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleTriggerPrint}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>立即列印 / 另存 PDF</span>
        </button>
      </div>

      <div style={{ transform: printScale !== 100 ? `scale(${printScale / 100})` : 'none', transformOrigin: 'top center' }} className="flex flex-col items-center">

        {/* ==================== OPTIONAL ADMISSION ASSESSMENT PAGE ==================== */}
        {includeAdmission && (
          <AdmissionAssessmentPrintPage 
            record={record.admissionAssessment ? record : {
              ...record,
              admissionAssessment: {
                enabled: true,
                roomInDateTime: '',
                assessmentDateTime: '',
                admissionMode: '步行',
                admissionSource: 'OPD',
                height: '',
                prePregnancyWeight: '',
                currentWeight: '',
                vitalSigns: { temperature: '', pulse: '', respiration: '', bpSystolic: '', bpDiastolic: '', spo2: '' },
                education: '大學',
                occupation: '',
                religion: '無',
                taboos: ['無'],
                languages: ['中文'],
                patientBloodType: 'O',
                patientRh: '+',
                spouseBloodType: 'O',
                spouseRh: '+',
                bloodTransfusionHistory: '無',
                bloodTransfusionReaction: '無',
                menstrualStatus: '規則',
                papSmear: '無',
                drugAllergy: '無',
                foodAllergy: '無',
                breastSelfExam: '無',
                smoking: '無',
                alcohol: '無',
              }
            }} 
            printTheme={printTheme} 
            printTimestamp={printTimestamp}
          />
        )}

        {/* ==================== PAGE 1 ==================== */}
        <div 
          style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
          className={`a4-page a4-page-break bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl print:shadow-none print:w-full print:min-h-0 print:p-0 mb-6 print:mb-0 print:break-after-page text-slate-900 font-sans text-[11.5px] leading-tight border border-slate-300 print:border-none flex flex-col justify-between ${
            printTheme === 'modern' ? 'report-modern' : 'report-classic'
          }`}
        >
          
          <div className="space-y-1.5">
            {/* Header Banner */}
            <div className="border-b-2 border-slate-900 pb-1.5 mb-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs print:bg-black">
                    產
                  </div>
                  <div>
                    <h2 className="text-[12px] font-bold tracking-wider text-slate-700 print:text-black">
                      新生學校財團法人新生醫護管理專科學校
                    </h2>
                    <h1 className="text-[16px] font-black tracking-tight text-slate-950 print:text-black">
                      五專產科護理學實習個案交班過程記錄
                    </h1>
                  </div>
                </div>

                <div className="text-right text-[10.5px] font-medium text-slate-600 print:text-black">
                  <div className="px-2 py-0.5 rounded border border-rose-300 bg-rose-50 text-rose-800 font-bold print:bg-white print:border-slate-400 print:text-black">
                    紋菱老師訂製版
                  </div>
                </div>
              </div>

              {/* Internship Meta Grid */}
              <div className="mt-1.5 grid grid-cols-6 gap-x-2 gap-y-0.5 bg-slate-100/90 print:bg-white p-1.5 rounded border border-slate-300 text-[11px]">
                <div>
                  <span className="font-bold text-slate-600 print:text-black">實習單位：</span>
                  <span className="font-bold text-slate-900 print:text-black">{record.internship.unit || '產科病房'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 print:text-black">學生姓名：</span>
                  <span className="font-bold text-slate-900 print:text-black">{record.internship.studentName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 print:text-black">學號：</span>
                  <span className="font-bold text-slate-900 print:text-black">{record.internship.studentId || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 print:text-black">指導教師：</span>
                  <span className="font-bold text-slate-900 print:text-black">{record.internship.instructor || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 print:text-black">實習週次：</span>
                  <span className="font-bold text-slate-900 print:text-black">第 {record.internship.week || '1'} 週</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600 print:text-black">記錄日期：</span>
                  <span className="font-bold text-slate-900 print:text-black">{record.internship.date || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section: 基本資料 */}
            <div className="border border-slate-900 mb-1 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>基本資料 (Basic Patient Information)</span>
                <span className="text-[10.5px] font-normal opacity-90">床號：{record.basicInfo.bedNumber || '—'}</span>
              </div>

              <div className="p-1.5 space-y-1 text-[11px] print:bg-white">
                {/* Row 1: Bed, Name, Admission Date, EDC */}
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">床號：</span>
                    <strong className="font-bold text-slate-950">{record.basicInfo.bedNumber || '—'}</strong>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">產婦姓名：</span>
                    <strong className="font-bold text-slate-950">{record.basicInfo.patientName || '—'}</strong>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">入院日期：</span>
                    <span className="font-medium">{record.basicInfo.admissionDate || '—'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">預產期(EDC)：</span>
                    <span className="font-medium">{record.basicInfo.expectedDeliveryDate || '—'}</span>
                  </div>
                </div>

                {/* Row 2: Diagnoses */}
                <div className="bg-slate-50 print:bg-white p-1.5 rounded border border-slate-200 space-y-0.5">
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-slate-900 whitespace-nowrap bg-blue-100 text-blue-900 px-1 py-0.2 rounded text-[10.5px] print:bg-white print:border print:border-black print:text-black">
                      主診斷 (Primary)
                    </span>
                    <span className="font-bold text-slate-950 pl-1 leading-tight">
                      {record.basicInfo.primaryDiagnosis || record.basicInfo.diagnosis || '未填寫主診斷'}
                    </span>
                  </div>

                  <div className="flex items-start gap-1 pt-0.5 border-t border-slate-200">
                    <span className="font-bold text-slate-700 whitespace-nowrap bg-slate-200 text-slate-800 px-1 py-0.2 rounded text-[10.5px] print:bg-white print:border print:border-slate-400 print:text-black">
                      次診斷 (Secondary)
                    </span>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 pl-1">
                      {record.basicInfo.secondaryDiagnoses && record.basicInfo.secondaryDiagnoses.filter(Boolean).length > 0 ? (
                        record.basicInfo.secondaryDiagnoses.map((sec, idx) => sec ? (
                          <span key={idx} className="inline-flex items-center text-[10.5px]">
                            <span className="font-bold text-slate-500 mr-0.5">[{idx + 1}]</span>
                            <span className="font-medium text-slate-900">{sec}</span>
                          </span>
                        ) : null)
                      ) : (
                        <span className="text-slate-400">無特殊次診斷</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Obstetric history, GA, Delivery Date, Chronic */}
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">生產日期：</span>
                    <span className="font-medium">{record.basicInfo.deliveryDate || '—'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">妊娠週數(GA)：</span>
                    <span className="font-medium">{record.basicInfo.gestationalWeeks || '—'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">生產史(G/P)：</span>
                    <span className="font-medium">{record.basicInfo.obstetricHistory || '—'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">慢性病史：</span>
                    <span className="font-medium">{record.basicInfo.chronicDiseases || '無'}</span>
                  </div>
                </div>

                {/* Row 4: Marital, Physician, Nurse */}
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">婚姻狀況：</span>
                    <span className="font-medium">{record.basicInfo.maritalStatus || '已婚'}</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">主治醫師：</span>
                    <span className="font-medium">{record.basicInfo.attendingPhysician || '—'}</span>
                  </div>
                  <div className="col-span-5">
                    <span className="text-slate-500 font-bold">主護護理師：</span>
                    <span className="font-medium">{record.basicInfo.primaryNurse || '—'}</span>
                  </div>
                </div>

                {/* Row 5: Course */}
                <div className="text-[10.5px]">
                  <span className="text-slate-600 font-bold">入院經過簡述：</span>
                  <span className="text-slate-900 leading-snug font-normal">
                    {record.basicInfo.admissionCourse || '產婦因陣痛/落紅/破水/排程入院，生命徵象穩定，胎心音正常。'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: 生產過程 */}
            <div className="border border-slate-900 mb-1 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>生產過程記錄 (Labor & Delivery Process)</span>
                <span className="text-[10.5px] font-normal opacity-90">分娩方式：{record.deliveryProcess.deliveryMode || '—'}</span>
              </div>

              <div className="p-1.5 space-y-1 text-[11px] print:bg-white">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">分娩方式：</span>
                    <strong className="font-bold text-slate-950">{record.deliveryProcess.deliveryMode || '—'}</strong>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">胎盤剝離：</span>
                    <span className="font-medium">{record.deliveryProcess.placentaExpulsionMode || 'Duncan/Schultze'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">會陰裂傷：</span>
                    <span className="font-medium">{record.deliveryProcess.perinealLaceration || '—'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">娩出時間：</span>
                    <span className="font-medium">{record.deliveryProcess.deliveryTime || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">失血量 (EBL)：</span>
                    <strong className="font-bold text-slate-900">{record.deliveryProcess.bloodLoss ? `${record.deliveryProcess.bloodLoss} ml` : '—'}</strong>
                  </div>
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">胎盤重量：</span>
                    <strong className="font-bold text-slate-900">{record.deliveryProcess.placentaWeight ? `${record.deliveryProcess.placentaWeight} g` : '—'}</strong>
                  </div>
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">傷口長度：</span>
                    <strong className="font-bold text-slate-900">{record.deliveryProcess.woundSize ? `${record.deliveryProcess.woundSize} cm` : '—'}</strong>
                  </div>
                </div>

                {/* Stage Table */}
                <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 print:bg-white text-slate-900 font-bold border-b border-slate-300">
                      <th className="w-1/2 border-r border-slate-300 py-0.5 px-2 text-left">自然產產程記錄 (NSD Stages)</th>
                      <th className="w-1/2 py-0.5 px-2 text-left">剖腹產手術記錄 (C/S Timing)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:bg-white">
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between">
                        <span className="text-slate-600">第一產程 (潛伏/活動期)：</span>
                        <span className="font-bold">{record.deliveryProcess.naturalDelivery.stage1Time || '—'}</span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">進入手術室時間：</span>
                          <span className="font-bold">{record.deliveryProcess.cesareanDelivery.enterOrTime || '—'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between">
                        <span className="text-slate-600">第二產程 (胎兒娩出)：</span>
                        <span className="font-bold">{record.deliveryProcess.naturalDelivery.stage2Time || '—'}</span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">麻醉方式與開始：</span>
                          <span className="font-bold">
                            {record.deliveryProcess.cesareanDelivery.anesthesiaMode ? `${record.deliveryProcess.cesareanDelivery.anesthesiaMode} (${record.deliveryProcess.cesareanDelivery.anesthesiaStartTime || '—'})` : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between">
                        <span className="text-slate-600">第三產程 (胎盤娩出)：</span>
                        <span className="font-bold">{record.deliveryProcess.naturalDelivery.stage3Time || '—'}</span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">手術劃刀開始：</span>
                          <span className="font-bold">{record.deliveryProcess.cesareanDelivery.surgeryStartTime || '—'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between">
                        <span className="text-slate-600">第四產程 (產後觀察)：</span>
                        <span className="font-bold">{record.deliveryProcess.naturalDelivery.stage4Time || '—'}</span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">手術結束時間：</span>
                          <span className="font-bold">{record.deliveryProcess.cesareanDelivery.surgeryEndTime || '—'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold print:bg-white">
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between text-blue-900 print:text-black">
                        <span>總產程耗費時間：</span>
                        <span>{record.deliveryProcess.naturalDelivery.totalLaborTime || '—'}</span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between text-blue-900 print:text-black">
                          <span>手術歷時：</span>
                          <span>{record.deliveryProcess.cesareanDelivery.surgeryEndTime && record.deliveryProcess.cesareanDelivery.surgeryStartTime ? '約 1 小時' : '—'}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: 寶寶情況 */}
            <div className="border border-slate-900 mb-1 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>新生兒評估情況 (Newborn Status)</span>
                <span className="text-[10.5px] font-normal opacity-90">
                  Apgar: 1' [{record.babyStatus.apgar1Min || '—'}] / 5' [{record.babyStatus.apgar5Min || '—'}]
                </span>
              </div>

              <div className="p-1.5 space-y-1 text-[11px] print:bg-white">
                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">出生體格：</span>
                    <span className="font-bold">身長 {record.babyStatus.height || '—'} cm</span> ／ <span className="font-bold">體重 {record.babyStatus.weight || '—'} g</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">Apgar 評分：</span>
                    <span className="font-bold text-blue-900 print:text-black">1分: {record.babyStatus.apgar1Min || '—'}</span> ｜ <span className="font-bold text-blue-900 print:text-black">5分: {record.babyStatus.apgar5Min || '—'}</span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-slate-500 font-bold">位置：</span>
                    {renderOptionGroup(['嬰兒室', '母嬰同室', '病嬰室'], record.babyStatus.location)}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-0.5">
                  <div className="col-span-6">
                    <span className="text-slate-500 font-bold">餵食方式：</span>
                    {renderOptionGroup(['完全母乳', '混和奶', '配方奶'], record.babyStatus.feedingType)}
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">奶粉品牌：</span>
                    <span className="font-medium">{record.babyStatus.formulaBrand || '母乳親餵'}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 font-bold">今日奶量：</span>
                    <span className="font-medium">{record.babyStatus.dailyIntake || '親餵'}</span>
                  </div>
                </div>

                <div className="text-[10.5px]">
                  <span className="text-slate-500 font-bold">特殊情況與處置：</span>
                  <span className="font-medium">{record.babyStatus.specialConditions || '哭聲宏亮、皮膚粉紅、無產瘤、無胎便吸入，生命徵象良好。'}</span>
                </div>
              </div>
            </div>

            {/* Section: 產婦身心評估 (乳房與子宮) */}
            <div className="border border-slate-900 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>產婦身心評估 (Maternal Physical Assessment)</span>
                <span className="text-[10.5px] font-normal opacity-90">乳房與宮底復舊評估</span>
              </div>

              <div className="p-1.5 space-y-1 text-[11px] print:bg-white">
                {/* Breast Assessment */}
                <div className="bg-slate-50 print:bg-white p-1 rounded border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-0.5">
                    <span>乳房評估 (Breast Assessment)</span>
                    <span className="text-[10.5px] font-normal text-slate-600">評估時間：{record.maternalAssessment.breast.assessmentDate || '—'}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 text-[10.5px]">
                    <div className="col-span-4">
                      <span className="text-slate-500 font-bold">外觀：</span>
                      {renderOptionGroup(['正常', '發紅', '腫脹'], record.maternalAssessment.breast.skinAppearance)}
                    </div>
                    <div className="col-span-4">
                      <span className="text-slate-500 font-bold">觸感：</span>
                      {renderOptionGroup(['軟', '充盈', '硬'], record.maternalAssessment.breast.consistency)}
                    </div>
                    <div className="col-span-4">
                      <span className="text-slate-500 font-bold">乳頭：</span>
                      {renderOptionGroup(['凸', '平', '凹'], record.maternalAssessment.breast.nippleShape)}
                    </div>
                    <div className="col-span-6 pt-0.5">
                      <span className="text-slate-500 font-bold">右側泌乳：</span>
                      {renderOptionGroup(['無', '微', '少', '多'], record.maternalAssessment.breast.lactationRight)}
                      <span className="font-bold ml-1">{record.maternalAssessment.breast.lactationRightAmount || '0'} ml</span>
                    </div>
                    <div className="col-span-6 pt-0.5">
                      <span className="text-slate-500 font-bold">左側泌乳：</span>
                      {renderOptionGroup(['無', '微', '少', '多'], record.maternalAssessment.breast.lactationLeft)}
                      <span className="font-bold ml-1">{record.maternalAssessment.breast.lactationLeftAmount || '0'} ml</span>
                    </div>
                  </div>
                </div>

                {/* Uterus & Lochia Assessment */}
                <div className="bg-slate-50 print:bg-white p-1 rounded border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200 pb-0.5 mb-0.5">
                    <span>子宮與惡露評估 (Uterus & Lochia Assessment)</span>
                    <span className="text-[10.5px] font-normal text-slate-600">評估時間：{record.maternalAssessment.uterus.assessmentDate || '—'}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 text-[10.5px]">
                    <div className="col-span-3">
                      <span className="text-slate-500 font-bold">宮底高度：</span>
                      <strong className="text-slate-900">{record.maternalAssessment.uterus.fundalHeight || 'U/U'}</strong>
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-500 font-bold">宮縮強度：</span>
                      {renderOptionGroup(['硬', '中', '軟'], record.maternalAssessment.uterus.contraction)}
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-500 font-bold">位置：</span>
                      {renderOptionGroup(['左', '中', '右'], record.maternalAssessment.uterus.position)}
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-500 font-bold">疼痛(NRS)：</span>
                      <strong className="text-rose-700 print:text-black">{record.maternalAssessment.uterus.painScore || '0'}/10 分</strong>
                    </div>

                    <div className="col-span-12 pt-0.5 border-t border-slate-200 flex items-center gap-1.5">
                      <span className="text-slate-500 font-bold">子宮按摩：</span>
                      {renderOptionGroup(['有', '無'], record.maternalAssessment.uterus.massage)}
                      <span className="text-slate-400">➔</span>
                      <span className="text-slate-500 font-bold">按摩後宮縮：</span>
                      {renderOptionGroup(['硬', '中', '軟'], record.maternalAssessment.uterus.postMassageContraction)}
                    </div>

                    <div className="col-span-12 pt-0.5 border-t border-slate-200 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <div>
                        <span className="text-slate-500 font-bold">惡露量：</span>
                        <strong className="text-slate-900">{record.maternalAssessment.uterus.lochiaAmount || '中等'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">顏色：</span>
                        <strong className="text-slate-900">{record.maternalAssessment.uterus.lochiaColor || '暗紅'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">性質：</span>
                        {renderOptionGroup(['紅惡露', '漿惡露', '白惡露'], record.maternalAssessment.uterus.lochiaType)}
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">血塊：</span>
                        {renderOptionGroup(['有', '無'], record.maternalAssessment.uterus.bloodClots)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-1.5 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 print:text-black">
            <span>新生醫護管理專科學校 • 產科護理學實習交班記錄</span>
            <span className="font-bold">第 1 頁 / 共 2 頁</span>
            <span className="text-right flex items-center gap-2">
              <span>個案：{record.basicInfo.bedNumber || '無床號'} {record.basicInfo.patientName || '個案'}</span>
              <span className="font-medium text-slate-700 print:text-black">｜ 列印時間：{printTimestamp}</span>
            </span>
          </div>
        </div>

        {/* ==================== PAGE 2 ==================== */}
        <div className={`a4-page bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl print:shadow-none print:w-full print:min-h-0 print:p-0 text-slate-900 font-sans text-[11.5px] leading-tight border border-slate-300 print:border-none flex flex-col justify-between ${
          printTheme === 'modern' ? 'report-modern' : 'report-classic'
        }`}>
          
          <div className="space-y-1.5">
            {/* Page 2 Slim Header */}
            <div className="border-b border-slate-900 pb-1 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">產科護理實習交班記錄 (紋菱老師訂製版)</span>
                <span className="text-slate-400">|</span>
                <span className="font-medium text-slate-700">床號：<strong>{record.basicInfo.bedNumber || '—'}</strong> ({record.basicInfo.patientName || '—'})</span>
              </div>
              <div className="text-slate-600 font-medium">
                實習生：<strong>{record.internship.studentName || '—'}</strong> ({record.internship.studentId || '—'})
              </div>
            </div>

            {/* Section: 傷口評估 (REEDA vs C/S) */}
            <div className="border border-slate-900 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>傷口臨床評估 (Wound Assessment)</span>
                <span className="text-[10.5px] font-normal opacity-90">評估時間：{record.maternalAssessment.wound.assessmentTime || '—'}</span>
              </div>

              <div className="p-1 print:bg-white">
                <table className="w-full border-collapse border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 print:bg-white text-slate-900 font-bold border-b border-slate-300">
                      <th className="w-1/2 border-r border-slate-300 py-0.5 px-2 text-left">
                        會陰傷口 (REEDA Scale 評估)
                      </th>
                      <th className="w-1/2 py-0.5 px-2 text-left">
                        剖腹產傷口 (Cesarean Wound)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:bg-white">
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">R - Redness (發紅)：</span>
                        <span className="font-bold bg-slate-100 print:bg-white px-1.5 py-0.2 rounded border border-slate-200 print:border-slate-300">
                          {record.maternalAssessment.wound.perineal.redness || '0 (無)'}
                        </span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">傷口外觀顏色：</span>
                          <span className="font-bold">{record.maternalAssessment.wound.cesarean.color || '淡粉紅 / 無紅腫'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">E - Edema (水腫)：</span>
                        <span className="font-bold bg-slate-100 print:bg-white px-1.5 py-0.2 rounded border border-slate-200 print:border-slate-300">
                          {record.maternalAssessment.wound.perineal.edema || '0 (無)'}
                        </span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">局部腫脹情形：</span>
                          <span className="font-bold">{record.maternalAssessment.wound.cesarean.swelling || '平整 / 無腫脹'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">E - Ecchymosis (瘀斑)：</span>
                        <span className="font-bold bg-slate-100 print:bg-white px-1.5 py-0.2 rounded border border-slate-200 print:border-slate-300">
                          {record.maternalAssessment.wound.perineal.ecchymosis || '0 (無)'}
                        </span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">傷口疼痛程度：</span>
                          <span className="font-bold">{record.maternalAssessment.wound.cesarean.pain || '輕微牽拉痛'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">D - Discharge (分泌物)：</span>
                        <span className="font-bold bg-slate-100 print:bg-white px-1.5 py-0.2 rounded border border-slate-200 print:border-slate-300">
                          {record.maternalAssessment.wound.perineal.discharge || '0 (無)'}
                        </span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">敷料與引流狀況：</span>
                          <span className="font-bold">{record.maternalAssessment.wound.cesarean.dressing || '敷料乾淨乾燥固定良好'}</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-300 py-0.5 px-2 flex justify-between items-center">
                        <span className="font-semibold text-slate-700">A - Approximation (癒合度)：</span>
                        <span className="font-bold bg-slate-100 print:bg-white px-1.5 py-0.2 rounded border border-slate-200 print:border-slate-300">
                          {record.maternalAssessment.wound.perineal.approximation || '0 (良好)'}
                        </span>
                      </td>
                      <td className="py-0.5 px-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">換藥日期與紀錄：</span>
                          <span className="font-bold">{record.maternalAssessment.wound.cesarean.dressingChangeDate || '產後常規照護'}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: 交班注意事項 */}
            <div className="border border-slate-900 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>交班重點注意事項 (Handover & Clinical Notes)</span>
                <span className="text-[10.5px] font-normal opacity-90">口頭交班與待追蹤要點</span>
              </div>

              <div className="p-2 min-h-[26mm] bg-slate-50/50 print:bg-white">
                <div className="text-[11px] text-slate-900 whitespace-pre-wrap leading-relaxed font-sans">
                  {record.handoverNotes || '1. 產後排尿通暢，已自解小便 350ml，膀胱無脹滿。\n2. 子宮底硬，按壓無大量血塊，持續衛教環形子宮按摩。\n3. 親餵衛教中，指導含乳姿勢與防跌倒安全。'}
                </div>
              </div>
            </div>

            {/* Section: DART 焦點護理記錄 (Ordered: D - A - R - T) */}
            <div className="border border-slate-900 rounded-sm overflow-hidden print:bg-white">
              <div className="bg-slate-900 text-white font-bold text-[11.5px] px-2 py-0.5 flex items-center justify-between print:bg-black">
                <span>DART 焦點護理記錄 (Focus Nursing Documentation: D-A-R-T)</span>
                <span className="text-[10.5px] font-normal opacity-90">時間：{record.nursingRecord.time || '—'}</span>
              </div>

              <div className="p-1.5 space-y-1 text-[11px] print:bg-white">
                {/* Focus Bar */}
                <div className="bg-slate-100 print:bg-white p-1 rounded border border-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 mr-2">焦點問題 (Focus)：</span>
                    <strong className="text-blue-900 print:text-black text-[12px]">{record.nursingRecord.focus || '產後會陰傷口疼痛 / 哺餵母乳知識缺失'}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 mr-1">記錄時間：</span>
                    <span className="font-semibold">{record.nursingRecord.time || '—'}</span>
                  </div>
                </div>

                {/* D-A-R-T Structured Rows in Strict Sequence */}
                <div className="space-y-1 text-[10.5px]">
                  
                  {/* 1. D - Data */}
                  <div className="border border-slate-200 print:border-slate-300 rounded p-1 bg-white print:bg-white">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                      <span className="w-4 h-4 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-[10px] print:bg-black">
                        D
                      </span>
                      <span>Data (主客觀評估資料)</span>
                    </div>
                    <div className="pl-5 text-slate-800 whitespace-pre-wrap leading-snug">
                      {record.nursingRecord.data || 'S: 產婦表示「傷口有一點痛，下床走路時比較明顯」。\nO: 會陰傷口縫合整齊無紅腫分泌物，REEDA評估0分，宮底U/U硬，惡露暗紅量中等。'}
                    </div>
                  </div>

                  {/* 2. A - Action */}
                  <div className="border border-slate-200 print:border-slate-300 rounded p-1 bg-white print:bg-white">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                      <span className="w-4 h-4 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] print:bg-black">
                        A
                      </span>
                      <span>Action (護理處置行動)</span>
                    </div>
                    <div className="pl-5 text-slate-800 whitespace-pre-wrap leading-snug">
                      {record.nursingRecord.action || '1. 依醫囑給予口服止痛藥物 Acetaminophen。\n2. 指導沖洗瓶清潔會陰傷口方法（由前往後沖洗並以乾淨毛巾拍乾）。'}
                    </div>
                  </div>

                  {/* 3. R - Response (Placed before Teaching) */}
                  <div className="border border-slate-200 print:border-slate-300 rounded p-1 bg-white print:bg-white">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                      <span className="w-4 h-4 rounded bg-purple-700 text-white flex items-center justify-center font-bold text-[10px] print:bg-black">
                        R
                      </span>
                      <span>Response (病患反應與評估)</span>
                    </div>
                    <div className="pl-5 text-slate-800 whitespace-pre-wrap leading-snug">
                      {record.nursingRecord.response || '產婦表示服藥後疼痛指數降至 1 分，能正確複述會陰沖洗與坐浴步驟，主動表示感到舒適安心。'}
                    </div>
                  </div>

                  {/* 4. T - Teaching */}
                  <div className="border border-slate-200 print:border-slate-300 rounded p-1 bg-white print:bg-white">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-0.5">
                      <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] print:bg-black">
                        T
                      </span>
                      <span>Teaching (衛生教育與指導)</span>
                    </div>
                    <div className="pl-5 text-slate-800 whitespace-pre-wrap leading-snug">
                      {record.nursingRecord.teaching || '1. 衛教產後 24 小時後可進行溫水坐浴（40-43℃，每次15-20分鐘，每日3-4次）。\n2. 衛教持續由前往後沖洗會陰，避免感染。'}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Academic Sign-off and Digital Signature Box */}
            <div className="border border-slate-900 rounded-sm p-1.5 bg-slate-50/70 print:bg-white text-[10.5px]">
              <div className="grid grid-cols-12 gap-2 items-stretch">
                
                {/* Student Signature Box */}
                <div className="col-span-5 border-r border-slate-300 pr-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-bold">實習護生簽章 (Student)：</span>
                    {signatures.studentSignedAt && (
                      <span className="text-[9.5px] text-slate-500">{signatures.studentSignedAt}</span>
                    )}
                  </div>
                  
                  <div 
                    onClick={() => {
                      if (onUpdateRecord) setSignatureModal({ isOpen: true, role: 'student' });
                    }}
                    className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors my-0.5 overflow-hidden"
                    title="點擊進行電子簽名"
                  >
                    {signatures.studentSignature ? (
                      <img
                        src={signatures.studentSignature}
                        alt="Student Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <PenTool className="w-3 h-3 print:hidden" />
                        <span>{record.internship.studentName || '實習同學'} (點擊手寫簽章)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>姓名：{record.internship.studentName || '—'}</span>
                    <span>學號：{record.internship.studentId || '—'}</span>
                  </div>
                </div>

                {/* Instructor Signature Box */}
                <div className="col-span-5 border-r border-slate-300 pr-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-bold">實習指導教師評閱與簽章：</span>
                    {signatures.instructorSignedAt && (
                      <span className="text-[9.5px] text-slate-500">{signatures.instructorSignedAt}</span>
                    )}
                  </div>

                  <div 
                    onClick={() => {
                      if (onUpdateRecord) setSignatureModal({ isOpen: true, role: 'instructor' });
                    }}
                    className="h-12 border-b border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors my-0.5 overflow-hidden"
                    title="點擊進行指導老師簽核"
                  >
                    {signatures.instructorSignature ? (
                      <img
                        src={signatures.instructorSignature}
                        alt="Instructor Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <PenTool className="w-3 h-3 print:hidden" />
                        <span>{record.internship.instructor ? `${record.internship.instructor} 老師` : '指導教師 (點擊簽核)'}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 truncate">
                    {signatures.instructorComment ? (
                      <span><strong>評語：</strong>{signatures.instructorComment}</span>
                    ) : (
                      <span>教師：{record.internship.instructor || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Evaluation Grade Box */}
                <div className="col-span-2 text-center flex flex-col justify-between">
                  <span className="text-slate-700 font-bold">成績 / 評核</span>
                  <div className="h-12 flex items-center justify-center font-bold text-slate-900 text-xs">
                    {signatures.score ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 print:border-black print:text-black">
                        {signatures.score}
                      </span>
                    ) : (
                      <span className="text-slate-400">[ 評定 ]</span>
                    )}
                  </div>
                  <span className="text-[9.5px] text-slate-400">核章存查</span>
                </div>

              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-1.5 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 print:text-black">
            <span>新生醫護管理專科學校 • 產科護理學實習交班記錄</span>
            <span className="font-bold">第 2 頁 / 共 2 頁</span>
            <span className="text-right flex items-center gap-2">
              <span>評核核章存查聯</span>
              <span className="font-medium text-slate-700 print:text-black">｜ 列印時間：{printTimestamp}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Signature Modal for Direct Signature in Print View */}
      {onUpdateRecord && (
        <SignatureModal
          isOpen={signatureModal.isOpen}
          onClose={() => setSignatureModal((prev) => ({ ...prev, isOpen: false }))}
          title={signatureModal.role === 'student' ? '實習護生手寫電子簽章' : '實習指導教師評閱與簽核'}
          role={signatureModal.role}
          signerName={
            signatureModal.role === 'student'
              ? record.internship.studentName || '實習同學'
              : record.internship.instructor || '指導教師'
          }
          currentSignature={
            signatureModal.role === 'student'
              ? signatures.studentSignature
              : signatures.instructorSignature
          }
          currentSignedAt={
            signatureModal.role === 'student'
              ? signatures.studentSignedAt
              : signatures.instructorSignedAt
          }
          currentComment={signatures.instructorComment}
          currentScore={signatures.score}
          onSave={handleSaveSignature}
        />
      )}

    </div>
  );
};
