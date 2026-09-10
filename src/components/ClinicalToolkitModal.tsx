import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calculator, 
  Timer, 
  Watch, 
  Clock,
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Flame, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles,
  Info,
  Calendar,
  Scale
} from 'lucide-react';
import { HandoverRecord } from '../types';
import { CLINICAL_TERMS } from '../data/clinicalTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: HandoverRecord;
  defaultTab?: 'calculator' | 'timer' | 'stopwatch' | 'scales' | 'isbar';
}

export const ClinicalToolkitModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  record,
  defaultTab = 'calculator'
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'timer' | 'stopwatch' | 'scales' | 'isbar'>(defaultTab);

  // Sync default tab when modal opens
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  /* ================= CALCULATOR STATE ================= */
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');
  const [calcClearNext, setCalcClearNext] = useState(false);

  // EDD Calculator State
  const [lmpDate, setLmpDate] = useState('');
  const [calculatedEdd, setCalculatedEdd] = useState<string | null>(null);
  const [calculatedGa, setCalculatedGa] = useState<string | null>(null);

  // BMI Calculator State
  const [maternalHeight, setMaternalHeight] = useState('');
  const [prePregWeight, setPrePregWeight] = useState('');
  const [calculatedBmi, setCalculatedBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string | null>(null);

  /* ================= TIMER STATE ================= */
  const [timerInitial, setTimerInitial] = useState(60); // in seconds
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerCustomMin, setTimerCustomMin] = useState('1');
  const [timerCustomSec, setTimerCustomSec] = useState('00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= STOPWATCH STATE ================= */
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // Contraction Tracker State
  interface ContractionLog {
    id: number;
    startTime: string;
    duration: number; // in seconds
    interval?: number; // in minutes from previous start
  }
  const [isContracting, setIsContracting] = useState(false);
  const [contractionStartTime, setContractionStartTime] = useState<number | null>(null);
  const [contractionDuration, setContractionDuration] = useState(0);
  const [contractionLogs, setContractionLogs] = useState<ContractionLog[]>([]);
  const contractionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= ISBAR STATE ================= */
  const [isbarCopied, setIsbarCopied] = useState(false);

  // Beep sound generator using Web Audio API
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  };

  /* Timer logic */
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            playAlertSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleSetTimer = (secs: number) => {
    setTimerRunning(false);
    setTimerInitial(secs);
    setTimerRemaining(secs);
  };

  const handleCustomTimerApply = () => {
    const m = parseInt(timerCustomMin, 10) || 0;
    const s = parseInt(timerCustomSec, 10) || 0;
    const total = m * 60 + s;
    if (total > 0) {
      handleSetTimer(total);
    }
  };

  /* Stopwatch logic */
  useEffect(() => {
    if (stopwatchRunning) {
      const start = Date.now() - stopwatchTime;
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - start);
      }, 30);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchRunning]);

  /* Contraction live timer logic */
  useEffect(() => {
    if (isContracting && contractionStartTime) {
      contractionIntervalRef.current = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - contractionStartTime) / 1000);
        setContractionDuration(elapsedSec);
      }, 500);
    } else {
      if (contractionIntervalRef.current) clearInterval(contractionIntervalRef.current);
    }
    return () => {
      if (contractionIntervalRef.current) clearInterval(contractionIntervalRef.current);
    };
  }, [isContracting, contractionStartTime]);

  const handleToggleContraction = () => {
    const now = Date.now();
    if (!isContracting) {
      // Start contraction
      setIsContracting(true);
      setContractionStartTime(now);
      setContractionDuration(0);
    } else {
      // Stop contraction and record
      setIsContracting(false);
      const dur = Math.max(1, contractionDuration);
      let intervalMin: number | undefined = undefined;

      if (contractionLogs.length > 0 && contractionStartTime) {
        const lastLogTime = new Date(contractionLogs[0].startTime).getTime();
        intervalMin = Math.round(((now - lastLogTime) / 60000) * 10) / 10;
      }

      const newLog: ContractionLog = {
        id: Date.now(),
        startTime: new Date(contractionStartTime || now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        duration: dur,
        interval: intervalMin,
      };

      setContractionLogs([newLog, ...contractionLogs]);
      setContractionStartTime(null);
      setContractionDuration(0);
    }
  };

  /* Calculator button click handler */
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcFormula('');
      setCalcClearNext(false);
      return;
    }
    if (val === 'DEL') {
      if (calcDisplay.length > 1) {
        setCalcDisplay(calcDisplay.slice(0, -1));
      } else {
        setCalcDisplay('0');
      }
      return;
    }
    if (val === '=') {
      try {
        const sanitized = (calcFormula + calcDisplay)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        const rounded = Math.round(result * 10000) / 10000;
        setCalcDisplay(String(rounded));
        setCalcFormula('');
        setCalcClearNext(true);
      } catch (err) {
        setCalcDisplay('Error');
        setCalcFormula('');
        setCalcClearNext(true);
      }
      return;
    }
    if (['+', '-', '×', '÷'].includes(val)) {
      setCalcFormula(calcFormula + calcDisplay + ' ' + val + ' ');
      setCalcClearNext(true);
      return;
    }
    if (val === '±') {
      if (calcDisplay !== '0') {
        if (calcDisplay.startsWith('-')) {
          setCalcDisplay(calcDisplay.substring(1));
        } else {
          setCalcDisplay('-' + calcDisplay);
        }
      }
      return;
    }
    // Numbers and decimal
    if (calcClearNext) {
      setCalcDisplay(val === '.' ? '0.' : val);
      setCalcClearNext(false);
    } else {
      if (val === '.' && calcDisplay.includes('.')) return;
      setCalcDisplay(calcDisplay === '0' && val !== '.' ? val : calcDisplay + val);
    }
  };

  /* EDD Calculator (Naegele's Rule) */
  const calculateNaegeles = (lmp: string) => {
    setLmpDate(lmp);
    if (!lmp) {
      setCalculatedEdd(null);
      setCalculatedGa(null);
      return;
    }
    try {
      const d = new Date(lmp);
      if (isNaN(d.getTime())) return;
      // Naegele: +1 year - 3 months + 7 days
      const edd = new Date(d);
      edd.setMonth(edd.getMonth() + 9);
      edd.setDate(edd.getDate() + 7);
      const eddStr = edd.toISOString().split('T')[0];
      setCalculatedEdd(eddStr);

      // Current Gestational Age
      const today = new Date();
      const diffMs = today.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;
        setCalculatedGa(`${weeks}+${days} 週`);
      } else {
        setCalculatedGa('尚未滿 1 週');
      }
    } catch (e) {
      setCalculatedEdd(null);
    }
  };

  /* BMI Calculator */
  const calculateBmi = (h: string, w: string) => {
    const heightCm = parseFloat(h);
    const weightKg = parseFloat(w);
    if (heightCm > 50 && weightKg > 20) {
      const heightM = heightCm / 100;
      const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
      setCalculatedBmi(bmi);
      if (bmi < 18.5) {
        setBmiCategory('過輕 (Underweight，孕期建議增重 12.5-18 kg)');
      } else if (bmi < 24.9) {
        setBmiCategory('正常 (Normal，孕期建議增重 11.5-16 kg)');
      } else if (bmi < 29.9) {
        setBmiCategory('過重 (Overweight，孕期建議增重 7-11.5 kg)');
      } else {
        setBmiCategory('肥胖 (Obese，孕期建議增重 5-9 kg)');
      }
    } else {
      setCalculatedBmi(null);
      setBmiCategory(null);
    }
  };

  /* ISBAR Text Generator */
  const isNsd = !record.deliveryProcess.deliveryMode.includes('剖腹') && !record.deliveryProcess.deliveryMode.includes('C/S');
  const mainDiag = record.basicInfo.primaryDiagnosis || record.basicInfo.diagnosis || 'Term Pregnancy with NSD';
  const secDiags = record.basicInfo.secondaryDiagnoses && record.basicInfo.secondaryDiagnoses.filter(Boolean).length > 0
    ? `\n   次診斷：${record.basicInfo.secondaryDiagnoses.filter(Boolean).join('、')}`
    : '';

  const introText = `【I - Introduction 介紹】\n學姐好，我是實習學生 ${record.internship.studentName || '同學'}，向您交班 ${record.basicInfo.bedNumber || '502-1'} 床 ${record.basicInfo.patientName || '個案'}。`;

  const situationText = `【S - Situation 現況】\n個案主診斷：${mainDiag}${secDiags}\n於 ${record.basicInfo.deliveryDate || '昨日'} 經 ${record.deliveryProcess.deliveryMode || '自然產'} 娩出一 ${record.babyStatus.weight ? `${record.babyStatus.weight}g` : '3180g'} 嬰兒。目前生命徵象穩定，產後休養中。`;

  const backgroundText = `【B - Background 背景】\n產科史為 ${record.basicInfo.obstetricHistory || 'G1P1'}，懷孕週數 ${record.basicInfo.gestationalWeeks || '39+3 週'}。${record.basicInfo.chronicDiseases ? `過去病史：${record.basicInfo.chronicDiseases}。` : '無特殊慢性病史。'}生產失血量約 ${record.deliveryProcess.bloodLoss || '250'} ml，胎盤重量 ${record.deliveryProcess.placentaWeight || '550'} g。`;

  const assessmentText = `【A - Assessment 評估】\n1. 產婦評估：\n   - 子宮：宮底位置 ${record.maternalAssessment.uterus.fundalHeight || 'U-1'}，質地 ${record.maternalAssessment.uterus.contraction || '硬'}，位置偏 ${record.maternalAssessment.uterus.position || '中'}，宮縮痛 NRS ${record.maternalAssessment.uterus.painScore || '2'} 分。\n   - 惡露：量 ${record.maternalAssessment.uterus.lochiaAmount || '少'}，呈 ${record.maternalAssessment.uterus.lochiaColor || '暗紅'} ${record.maternalAssessment.uterus.lochiaType || '紅惡露'}，${record.maternalAssessment.uterus.bloodClots === '有' ? '有血塊' : '無血塊'}。\n   - 乳房：皮膚 ${record.maternalAssessment.breast.skinAppearance || '正常'}，質地 ${record.maternalAssessment.breast.consistency || '充盈'}，乳頭 ${record.maternalAssessment.breast.nippleShape || '凸'} ${record.maternalAssessment.breast.nippleIntegrity || '完整'}，分泌初乳約 ${record.maternalAssessment.breast.lactationRightAmount || '5'}ml。\n   - 傷口：${isNsd ? `會陰傷口 (REEDA: R:${record.maternalAssessment.wound.perineal.redness || '0'}, E:${record.maternalAssessment.wound.perineal.edema || '0'}, E:${record.maternalAssessment.wound.perineal.ecchymosis || '0'}, D:${record.maternalAssessment.wound.perineal.discharge || '0'}, A:${record.maternalAssessment.wound.perineal.approximation || '0'}) 癒合良好。` : `剖腹傷口敷料乾淨乾燥，${record.maternalAssessment.wound.cesarean.pain || '活動時輕度牽拉痛'}。`}\n2. 寶寶評估：\n   - 位於 ${record.babyStatus.location || '母嬰同室'}，採 ${record.babyStatus.feedingType || '完全母乳'} 哺餵，Apgar 評分為 ${record.babyStatus.apgar1Min || '9'} / ${record.babyStatus.apgar5Min || '10'} 分，活力良好。`;

  const recommendationText = `【R - Recommendation 建議與交班事項】\n${record.handoverNotes ? record.handoverNotes : '1. 持續追蹤自解小便、宮縮質地與惡露量。\n2. 協助親餵指導與含乳技巧。\n3. 指導會陰/剖腹傷口自我照護。'}\n\n焦點護理記錄 (DART)：\n焦點：${record.nursingRecord.focus || '產後照護'}\n${record.nursingRecord.data ? `D: ${record.nursingRecord.data.slice(0, 75)}...` : ''}`;

  const fullIsbar = `${introText}\n\n${situationText}\n\n${backgroundText}\n\n${assessmentText}\n\n${recommendationText}`;

  const handleCopyIsbar = () => {
    navigator.clipboard.writeText(fullIsbar);
    setIsbarCopied(true);
    setTimeout(() => setIsbarCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Format Timer mm:ss
  const timerMins = Math.floor(timerRemaining / 60);
  const timerSecs = timerRemaining % 60;
  const timerFormatted = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;
  const timerPercent = timerInitial > 0 ? (timerRemaining / timerInitial) * 100 : 0;

  // Format Stopwatch mm:ss.ms
  const swMin = Math.floor(stopwatchTime / 60000);
  const swSec = Math.floor((stopwatchTime % 60000) / 1000);
  const swMs = Math.floor((stopwatchTime % 1000) / 10);
  const stopwatchFormatted = `${String(swMin).padStart(2, '0')}:${String(swSec).padStart(2, '0')}.${String(swMs).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-white px-5 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">產科臨床工具箱 (Clinical Toolkit)</h3>
              <p className="text-xs text-slate-500 font-medium">整合計算機、計時器、碼錶、量表手冊與 ISBAR 交班產生器</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="關閉工具箱"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolkit Tab Navigation Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { id: 'calculator', label: '簡易計算機', icon: Calculator },
            { id: 'timer', label: '計時器', icon: Timer },
            { id: 'stopwatch', label: '碼錶 & 宮縮記錄', icon: Watch },
            { id: 'scales', label: '臨床量表指引', icon: BookOpen },
            { id: 'isbar', label: 'ISBAR 交班稿', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-5">
          
          {/* ================= TAB 1: CALCULATOR ================= */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              
              {/* Standard Calculator & Clinical Calculators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Left: Standard Calculator */}
                <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-4 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 text-right h-5 font-mono">
                      {calcFormula}
                    </div>
                    <div className="text-2xl font-bold font-mono text-right py-2 px-1 tracking-wider text-emerald-400 overflow-x-auto">
                      {calcDisplay}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-sm font-semibold">
                    <button onClick={() => handleCalcBtn('C')} className="p-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white">C</button>
                    <button onClick={() => handleCalcBtn('DEL')} className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200">⌫</button>
                    <button onClick={() => handleCalcBtn('±')} className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200">±</button>
                    <button onClick={() => handleCalcBtn('÷')} className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">÷</button>

                    <button onClick={() => handleCalcBtn('7')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">7</button>
                    <button onClick={() => handleCalcBtn('8')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">8</button>
                    <button onClick={() => handleCalcBtn('9')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">9</button>
                    <button onClick={() => handleCalcBtn('×')} className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">×</button>

                    <button onClick={() => handleCalcBtn('4')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">4</button>
                    <button onClick={() => handleCalcBtn('5')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">5</button>
                    <button onClick={() => handleCalcBtn('6')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">6</button>
                    <button onClick={() => handleCalcBtn('-')} className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">-</button>

                    <button onClick={() => handleCalcBtn('1')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">1</button>
                    <button onClick={() => handleCalcBtn('2')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">2</button>
                    <button onClick={() => handleCalcBtn('3')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">3</button>
                    <button onClick={() => handleCalcBtn('+')} className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">+</button>

                    <button onClick={() => handleCalcBtn('0')} className="col-span-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">0</button>
                    <button onClick={() => handleCalcBtn('.')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100">.</button>
                    <button onClick={() => handleCalcBtn('=')} className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold">=</button>
                  </div>
                </div>

                {/* Right: Quick Clinical Calculations */}
                <div className="md:col-span-6 space-y-4">
                  
                  {/* Naegele's Rule: EDD & GA */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>預產期 (EDC) 與目前週數計算器</span>
                    </div>
                    <p className="text-[11px] text-slate-500">依據 Naegele's Rule (LMP 月份 +9 或 -3，日期 +7)</p>
                    
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-slate-700 whitespace-nowrap">LMP 日期：</label>
                      <input
                        type="date"
                        value={lmpDate}
                        onChange={(e) => calculateNaegeles(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium"
                      />
                    </div>

                    {calculatedEdd && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 space-y-1">
                        <div>📅 <span className="font-semibold">推算預產期 (EDC)：</span><strong className="text-blue-700">{calculatedEdd}</strong></div>
                        <div>⏱️ <span className="font-semibold">今日推算妊娠週數：</span><strong className="text-blue-700">{calculatedGa}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Maternal Pre-pregnancy BMI */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Scale className="w-4 h-4 text-blue-600" />
                      <span>孕前 BMI 與孕期體重增加指引</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">身高 (cm)</label>
                        <input
                          type="number"
                          placeholder="例：162"
                          value={maternalHeight}
                          onChange={(e) => {
                            setMaternalHeight(e.target.value);
                            calculateBmi(e.target.value, prePregWeight);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">孕前體重 (kg)</label>
                        <input
                          type="number"
                          placeholder="例：54"
                          value={prePregWeight}
                          onChange={(e) => {
                            setPrePregWeight(e.target.value);
                            calculateBmi(maternalHeight, e.target.value);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    </div>

                    {calculatedBmi !== null && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 space-y-1">
                        <div>⚖️ <span className="font-semibold">孕前 BMI：</span><strong className="text-emerald-700">{calculatedBmi}</strong></div>
                        <div className="text-[11px] font-medium">{bmiCategory}</div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 2: TIMER ================= */}
          {activeTab === 'timer' && (
            <div className="max-w-md mx-auto space-y-5 text-center">
              
              {/* Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "1 分鐘 (Apgar 1')", sec: 60 },
                  { label: "5 分鐘 (Apgar 5')", sec: 300 },
                  { label: "15 分鐘 (NST/評估)", sec: 900 },
                  { label: "30 分鐘 (冰敷/坐浴)", sec: 1800 },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    onClick={() => handleSetTimer(item.sec)}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                      timerInitial === item.sec && !timerRunning
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Countdown Display Card */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/70 shadow-xs space-y-4">
                
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>

                {/* Big digits */}
                <div className={`font-mono text-5xl sm:text-6xl font-extrabold tracking-widest ${
                  timerRemaining === 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                }`}>
                  {timerFormatted}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-xs transition-all ${
                      timerRunning
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{timerRunning ? '暫停計時' : '開始倒數'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetTimer(timerInitial)}
                    className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                    title="重置"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Custom Input */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <span>自訂時間：</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={timerCustomMin}
                  onChange={(e) => setTimerCustomMin(e.target.value)}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center bg-white"
                />
                <span>分</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerCustomSec}
                  onChange={(e) => setTimerCustomSec(e.target.value)}
                  className="w-14 px-2 py-1 border border-slate-300 rounded text-center bg-white"
                />
                <span>秒</span>
                <button
                  type="button"
                  onClick={handleCustomTimerApply}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold ml-1"
                >
                  設定
                </button>
              </div>

            </div>
          )}

          {/* ================= TAB 3: STOPWATCH & CONTRACTION TRACKER ================= */}
          {activeTab === 'stopwatch' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Standard Stopwatch */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 text-center space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1.5">
                    <Watch className="w-4 h-4 text-blue-600" />
                    臨床標準碼錶 (Stopwatch)
                  </h4>

                  <div className="font-mono text-4xl font-extrabold text-slate-900 tracking-wider py-3 bg-white border border-slate-200 rounded-xl">
                    {stopwatchFormatted}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStopwatchRunning(!stopwatchRunning)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-white shadow-2xs ${
                        stopwatchRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {stopwatchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{stopwatchRunning ? '暫停' : '啟動'}</span>
                    </button>

                    {stopwatchRunning && (
                      <button
                        type="button"
                        onClick={() => setLaps([stopwatchTime, ...laps])}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                      >
                        計次 (Lap)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setStopwatchRunning(false);
                        setStopwatchTime(0);
                        setLaps([]);
                      }}
                      className="p-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="重設"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Laps List */}
                  {laps.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border-t border-slate-200 pt-2 space-y-1 text-[11px] text-left">
                      {laps.map((lap, i) => {
                        const m = Math.floor(lap / 60000);
                        const s = Math.floor((lap % 60000) / 1000);
                        const ms = Math.floor((lap % 1000) / 10);
                        return (
                          <div key={i} className="flex justify-between px-2 py-0.5 bg-white rounded border border-slate-100">
                            <span className="font-semibold text-slate-600">Lap {laps.length - i}</span>
                            <span className="font-mono">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}.{String(ms).padStart(2, '0')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Contraction Tracker */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-600" />
                      產科宮縮陣痛記錄器 (Labor Contractions)
                    </h4>
                    {contractionLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setContractionLogs([])}
                        className="text-[11px] text-slate-400 hover:text-rose-600"
                      >
                        清空記錄
                      </button>
                    )}
                  </div>

                  {/* Big Contraction Button */}
                  <button
                    type="button"
                    onClick={handleToggleContraction}
                    className={`w-full py-4 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                      isContracting
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Flame className="w-5 h-5" />
                    <span>{isContracting ? `宮縮中！點擊結束 (${contractionDuration} 秒)` : '點擊記錄：宮縮開始'}</span>
                  </button>

                  <div className="text-[11px] text-slate-500">
                    💡 臨床參考：活躍期宮縮間隔約 2-3 分鐘，每次持續約 40-60 秒。
                  </div>

                  {/* Recorded Contractions Table */}
                  {contractionLogs.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="p-1.5">時間</th>
                            <th className="p-1.5">持續時間</th>
                            <th className="p-1.5">間隔頻率</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {contractionLogs.map((log, idx) => (
                            <tr key={log.id}>
                              <td className="p-1.5 font-medium">{log.startTime}</td>
                              <td className="p-1.5 font-bold text-rose-700">{log.duration} 秒</td>
                              <td className="p-1.5 text-slate-600">{log.interval !== undefined ? `每 ${log.interval} 分鐘` : '第一筆記錄'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ================= TAB 4: CLINICAL SCALES ================= */}
          {activeTab === 'scales' && (
            <div className="space-y-5">
              
              {/* REEDA */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 space-y-2.5">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  會陰傷口 REEDA 評估量表 (0 - 15 分)
                </h4>
                <p className="text-slate-600 text-xs">
                  每項評分 0 ~ 3 分，總分愈高代表會陰傷口發炎感染或癒合不良程度愈嚴重。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">R - Redness (發紅)：</span>
                    <div className="text-slate-600 mt-0.5">0分:無 / 1分:&lt;0.25cm / 2分:&gt;0.25cm / 3分:廣泛發紅</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">E - Edema (水腫)：</span>
                    <div className="text-slate-600 mt-0.5">0分:無 / 1分:&lt;1cm / 2分:1~2cm / 3分:&gt;2cm或擴及陰唇</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">E - Ecchymosis (瘀斑)：</span>
                    <div className="text-slate-600 mt-0.5">0分:無 / 1分:兩側&lt;0.25cm / 2分:0.25~1cm / 3分:&gt;1cm</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">D - Discharge (分泌物)：</span>
                    <div className="text-slate-600 mt-0.5">0分:無 / 1分:血清樣 / 2分:漿液血性 / 3分:化膿惡臭</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 sm:col-span-2">
                    <span className="font-bold text-slate-900">A - Approximation (邊緣密合度)：</span>
                    <div className="text-slate-600 mt-0.5">0分:緊密密合 / 1分:皮膚分離≤3mm / 2分:皮膚皮下分離 / 3分:筋膜深層裂開</div>
                  </div>
                </div>
              </div>

              {/* Apgar */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60 space-y-2.5">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  新生兒阿帕嘉評分表 (Apgar Score: 0 - 10 分)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                        <th className="p-2">評估項目</th>
                        <th className="p-2">0 分</th>
                        <th className="p-2">1 分</th>
                        <th className="p-2">2 分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2 font-semibold">心跳 (Heart Rate)</td>
                        <td className="p-2">無心跳</td>
                        <td className="p-2">&lt; 100 次/分</td>
                        <td className="p-2">&ge; 100 次/分</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">呼吸 (Respiratory)</td>
                        <td className="p-2">無呼吸</td>
                        <td className="p-2">微弱、不規則哭聲</td>
                        <td className="p-2">呼吸順暢、哭聲宏亮</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">肌肉張力 (Tone)</td>
                        <td className="p-2">軟弱鬆弛</td>
                        <td className="p-2">四肢微屈</td>
                        <td className="p-2">活動良好、屈曲有力</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">反射反應 (Reflex)</td>
                        <td className="p-2">刺激無反應</td>
                        <td className="p-2">微弱皺眉</td>
                        <td className="p-2">咳嗽、打噴嚏、用力哭泣</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">膚色 (Color)</td>
                        <td className="p-2">全身發紺或蒼白</td>
                        <td className="p-2">身體粉紅、四肢發紺</td>
                        <td className="p-2">全身粉紅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fundal Height & Lochia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-1.5">
                  <h5 className="font-bold text-slate-900">子宮底高度復舊 (Fundal Involution)</h5>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    <li><span className="font-semibold text-slate-800">分娩當日：</span>平臍 (U/U) 或臍下一指 (U-1)</li>
                    <li><span className="font-semibold text-slate-800">產後第 1-9 天：</span>每日約下降 1 橫指 (~1cm)</li>
                    <li><span className="font-semibold text-slate-800">產後第 10-14 天：</span>降入骨盆腔內已摸不到</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-1.5">
                  <h5 className="font-bold text-slate-900">惡露性質分期 (Lochia Stages)</h5>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    <li><span className="font-semibold text-slate-800">紅惡露 (Rubra)：</span>產後 1-3 天，暗紅或鮮紅</li>
                    <li><span className="font-semibold text-slate-800">漿惡露 (Serosa)：</span>產後 4-10 天，淡粉或褐色</li>
                    <li><span className="font-semibold text-slate-800">白惡露 (Alba)：</span>產後 10-14 天至數週，淡黃乳白</li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 5: ISBAR GENERATOR ================= */}
          {activeTab === 'isbar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">ISBAR 標準化臨床口頭交班稿</h4>
                  <p className="text-[11px] text-slate-500">自動根據當前個案資料統整交班演練話術，可直接複製或分段演練</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyIsbar}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
                  >
                    {isbarCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isbarCopied ? '已複製全部交班稿！' : '一鍵複製全文'}</span>
                  </button>
                </div>
              </div>

              {/* Styled ISBAR Visual Cards */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {/* I */}
                <div className="border border-blue-200 rounded-xl p-3 bg-blue-50/40 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                    <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                      I
                    </span>
                    <span>Introduction (身分介紹)</span>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap pl-7 leading-relaxed font-sans">
                    學姐好，我是實習學生 <strong className="font-bold text-slate-900">{record.internship.studentName || '同學'}</strong>，向您交班 <strong className="font-bold text-blue-700">{record.basicInfo.bedNumber || '502-1'} 床</strong> 產婦 <strong className="font-bold text-slate-900">{record.basicInfo.patientName || '個案'}</strong>。
                  </div>
                </div>

                {/* S */}
                <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50/40 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-900">
                    <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                      S
                    </span>
                    <span>Situation (目前現況)</span>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap pl-7 leading-relaxed font-sans">
                    • 主診斷：<strong className="text-slate-900">{mainDiag}</strong>
                    {secDiags ? `\n• ${secDiags.trim()}` : ''}
                    {`\n• 生產概況：於 ${record.basicInfo.deliveryDate || '昨日'} 經 ${record.deliveryProcess.deliveryMode || '自然產'} 娩出一 ${record.babyStatus.weight ? `${record.babyStatus.weight}g` : '3180g'} 嬰兒。目前產婦生命徵象穩定，產後休養中。`}
                  </div>
                </div>

                {/* B */}
                <div className="border border-emerald-200 rounded-xl p-3 bg-emerald-50/40 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                    <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                      B
                    </span>
                    <span>Background (臨床背景)</span>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap pl-7 leading-relaxed font-sans">
                    • 產科史：{record.basicInfo.obstetricHistory || 'G1P1'}，懷孕週數 {record.basicInfo.gestationalWeeks || '39+3 週'}。
                    {record.basicInfo.chronicDiseases ? `\n• 過去病史：${record.basicInfo.chronicDiseases}。` : '\n• 過去病史：無特殊慢性病史。'}
                    {`\n• 產程數據：失血量 (EBL) 約 ${record.deliveryProcess.bloodLoss || '250'} ml，胎盤重量 ${record.deliveryProcess.placentaWeight || '550'} g。`}
                  </div>
                </div>

                {/* A */}
                <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <span className="w-5 h-5 rounded bg-amber-600 text-white flex items-center justify-center font-bold text-[11px]">
                      A
                    </span>
                    <span>Assessment (身心評估)</span>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap pl-7 leading-relaxed font-sans space-y-1">
                    <div>
                      <strong className="text-slate-900 font-bold">1. 產婦身心評估：</strong>
                      <div className="pl-2 space-y-0.5 text-slate-700">
                        <div>- 子宮：宮底位置 <span className="font-bold text-slate-900">{record.maternalAssessment.uterus.fundalHeight || 'U/U'}</span>，質地 <span className="font-bold">{record.maternalAssessment.uterus.contraction || '硬'}</span>，宮縮疼痛 NRS <span className="font-bold text-rose-700">{record.maternalAssessment.uterus.painScore || '2'}</span> 分。</div>
                        <div>- 惡露：量 <span className="font-bold">{record.maternalAssessment.uterus.lochiaAmount || '少'}</span>，呈 <span className="font-bold">{record.maternalAssessment.uterus.lochiaColor || '暗紅'}</span> {record.maternalAssessment.uterus.lochiaType || '紅惡露'}，{record.maternalAssessment.uterus.bloodClots === '有' ? '有小血塊' : '無異常血塊'}。</div>
                        <div>- 乳房：皮膚 {record.maternalAssessment.breast.skinAppearance || '正常'}，質地 {record.maternalAssessment.breast.consistency || '充盈'}，初乳分泌量約 {record.maternalAssessment.breast.lactationRightAmount || '5'}ml。</div>
                        <div>- 傷口：{isNsd ? `會陰傷口 (REEDA: R:${record.maternalAssessment.wound.perineal.redness || '0'}, E:${record.maternalAssessment.wound.perineal.edema || '0'}, E:${record.maternalAssessment.wound.perineal.ecchymosis || '0'}, D:${record.maternalAssessment.wound.perineal.discharge || '0'}, A:${record.maternalAssessment.wound.perineal.approximation || '0'}) 癒合良好。` : `剖腹傷口敷料乾淨乾燥，${record.maternalAssessment.wound.cesarean.pain || '活動時輕度牽拉痛'}。`}</div>
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-900 font-bold">2. 新生兒評估：</strong>
                      <div className="pl-2 text-slate-700">
                        位於 {record.babyStatus.location || '母嬰同室'}，採 {record.babyStatus.feedingType || '完全母乳'} 哺餵，Apgar Score：1分 [{record.babyStatus.apgar1Min || '9'}] / 5分 [{record.babyStatus.apgar5Min || '10'}]，活動力與膚色良好。
                      </div>
                    </div>
                  </div>
                </div>

                {/* R */}
                <div className="border border-purple-200 rounded-xl p-3 bg-purple-50/40 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-900">
                    <span className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                      R
                    </span>
                    <span>Recommendation (交班事項與建議)</span>
                  </div>
                  <div className="text-xs text-slate-800 whitespace-pre-wrap pl-7 leading-relaxed font-sans">
                    {record.handoverNotes ? record.handoverNotes : '1. 持續評估自解小便、子宮底硬度與惡露量。\n2. 協助母乳親餵與含乳衛教。\n3. 指導會陰/剖腹傷口照護及安全防跌。'}
                  </div>
                </div>
              </div>

              {/* Raw Plain Text Section (Expandable/Copyable) */}
              <div className="pt-2 border-t border-slate-200">
                <details className="text-xs text-slate-600 cursor-pointer">
                  <summary className="font-semibold text-slate-700 hover:text-blue-600">檢視純文字交班稿 (Plaintext)</summary>
                  <div className="mt-2 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {fullIsbar}
                  </div>
                </details>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            五專產科護理學實習專用輔助小工具
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
          >
            關閉
          </button>
        </div>

      </div>
    </div>
  );
};
