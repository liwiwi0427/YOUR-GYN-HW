import React, { useState } from 'react';
import { HandoverRecord, AdmissionAssessment } from '../../types';
import { 
  ClipboardList, 
  Clock, 
  Calendar, 
  HeartPulse, 
  Scale, 
  UserCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Languages, 
  Droplet, 
  Info,
  CalendarCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';
import {
  sanitizeDecimal,
  validateMaternalTemp,
  validateMaternalPulse,
  validateMaternalRespiration,
  validateMaternalBP,
  validateMaternalSpO2,
} from '../../utils/clinicalValidation';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

const DEFAULT_ADMISSION: AdmissionAssessment = {
  enabled: true,
  roomInDateTime: '',
  assessmentDateTime: '',
  admissionMode: '步行',
  admissionModeOther: '',
  admissionSource: 'OPD',
  admissionSourceOther: '',
  height: '',
  prePregnancyWeight: '',
  currentWeight: '',
  idealWeight: '',
  weightGain: '',
  bmi: '',
  vitalSigns: {
    temperature: '',
    pulse: '',
    respiration: '',
    systolicBP: '',
    diastolicBP: '',
    spO2: '',
  },
  education: '大學',
  educationOther: '',
  occupation: '',
  religion: '無',
  religionOther: '',
  taboos: ['無'],
  foodTabooDetails: '',
  tabooOther: '',
  languages: ['中文', '台語'],
  languageOther: '',
  patientBloodType: 'O',
  patientRh: '+',
  spouseBloodType: 'O',
  spouseRh: '+',
  bloodTransfusionHistory: '無',
  bloodTransfusionReaction: '無',
  bloodTransfusionReactionDetails: '',
  menstrualStatus: '規則',
  lmp: '',
  edc: '',
  papSmear: '無',
  drugAllergy: '無',
  drugAllergyDetails: '',
  foodAllergy: '無',
  foodAllergyDetails: '',
  breastSelfExam: '無',
  smoking: '無',
  alcohol: '無',
};

export const AdmissionAssessmentSection: React.FC<Props> = ({ record, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const admission: AdmissionAssessment = {
    ...DEFAULT_ADMISSION,
    ...(record.admissionAssessment || {}),
    vitalSigns: {
      ...DEFAULT_ADMISSION.vitalSigns,
      ...(record.admissionAssessment?.vitalSigns || {}),
    },
    taboos: Array.isArray(record.admissionAssessment?.taboos)
      ? record.admissionAssessment.taboos
      : DEFAULT_ADMISSION.taboos,
    languages: Array.isArray(record.admissionAssessment?.languages)
      ? record.admissionAssessment.languages
      : DEFAULT_ADMISSION.languages,
  };

  const updateAdmission = (updater: (prev: AdmissionAssessment) => AdmissionAssessment) => {
    onChange((prev) => {
      const current: AdmissionAssessment = {
        ...DEFAULT_ADMISSION,
        ...(prev.admissionAssessment || {}),
        vitalSigns: {
          ...DEFAULT_ADMISSION.vitalSigns,
          ...(prev.admissionAssessment?.vitalSigns || {}),
        },
        taboos: Array.isArray(prev.admissionAssessment?.taboos)
          ? prev.admissionAssessment.taboos
          : DEFAULT_ADMISSION.taboos,
        languages: Array.isArray(prev.admissionAssessment?.languages)
          ? prev.admissionAssessment.languages
          : DEFAULT_ADMISSION.languages,
        enabled: true,
      };
      const updated = updater(current);
      return {
        ...prev,
        admissionAssessment: updated,
      };
    });
  };

  const updateField = <K extends keyof AdmissionAssessment>(field: K, value: AdmissionAssessment[K]) => {
    updateAdmission((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateVitalSign = (field: keyof AdmissionAssessment['vitalSigns'], rawValue: string) => {
    const sanitized = sanitizeDecimal(rawValue);
    updateAdmission((prev) => ({
      ...prev,
      vitalSigns: {
        ...(prev.vitalSigns || DEFAULT_ADMISSION.vitalSigns),
        [field]: sanitized,
      },
    }));
  };

  // Helper for numeric inputs in BMI
  const handleNumericInput = (
    field: 'height' | 'prePregnancyWeight' | 'currentWeight' | 'idealWeight' | 'weightGain',
    rawValue: string
  ) => {
    const sanitized = sanitizeDecimal(rawValue);
    updateAdmission((prev) => {
      const nextState = { ...prev, [field]: sanitized };
      
      const curW = parseFloat(field === 'currentWeight' ? sanitized : (prev.currentWeight || ''));
      const preW = parseFloat(field === 'prePregnancyWeight' ? sanitized : (prev.prePregnancyWeight || ''));
      if (!isNaN(curW) && !isNaN(preW) && curW > 0 && preW > 0) {
        const gain = (curW - preW).toFixed(1);
        nextState.weightGain = gain;
      }

      const h = parseFloat(field === 'height' ? sanitized : (prev.height || ''));
      const weightForBmi = !isNaN(curW) && curW > 0 ? curW : preW;
      if (!isNaN(h) && h > 50 && !isNaN(weightForBmi) && weightForBmi > 20) {
        const heightM = h / 100;
        const calculatedBmi = (weightForBmi / (heightM * heightM)).toFixed(1);
        nextState.bmi = calculatedBmi;
      }

      return nextState;
    });
  };

  // Toggle multi-select array (for taboos or languages)
  const toggleArrayItem = (field: 'taboos' | 'languages', item: string) => {
    updateAdmission((prev) => {
      const currentList = prev[field] || [];
      if (item === '無') {
        return { ...prev, [field]: ['無'] };
      }
      const filtered = currentList.filter((i) => i !== '無');
      const exists = filtered.includes(item);
      const updated = exists ? filtered.filter((i) => i !== item) : [...filtered, item];
      return {
        ...prev,
        [field]: updated.length === 0 ? ['無'] : updated,
      };
    });
  };

  // Validation results
  const tempVal = validateMaternalTemp(admission.vitalSigns?.temperature);
  const pulseVal = validateMaternalPulse(admission.vitalSigns?.pulse);
  const respVal = validateMaternalRespiration(admission.vitalSigns?.respiration);
  const bpVal = validateMaternalBP(admission.vitalSigns?.systolicBP, admission.vitalSigns?.diastolicBP);
  const spo2Val = validateMaternalSpO2(admission.vitalSigns?.spO2);

  // If not enabled, show a clean banner with an enable button
  if (!admission.enabled) {
    return (
      <section className="bg-white rounded-xl border border-dashed border-slate-300 p-5 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">入院護理評估表</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                  未啟用
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                此個案目前未填記入院評估（含入院來源、BMI、過敏史、血型、產前檢查等）
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const pad = (n: number) => n.toString().padStart(2, '0');
              const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
              updateAdmission((prev) => ({
                ...prev,
                enabled: true,
                roomInDateTime: prev.roomInDateTime || nowStr,
                assessmentDateTime: prev.assessmentDateTime || nowStr,
              }));
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            啟用並填記入院評估表
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border-2 border-blue-200 p-5 sm:p-6 shadow-xs space-y-6 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                產科入院護理評估表
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
                已啟用
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              入室時間、來源、身體評估、生命徵象安全邊界檢核、過敏史與產前檢查紀錄
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> 收合評估表
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> 展開評估表
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要關閉此個案的入院評估表嗎？（填寫之資料仍會保留在系統備份中）')) {
                updateField('enabled', false);
              }
            }}
            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            停用
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Section 1: 入病房時間與評估時間、入院方式與來源 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 入病房時間 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  入病房時間
                </label>
                <ClockButton
                  id="btn-clock-room-in-time"
                  format="datetime-local"
                  onInsert={(val) => updateField('roomInDateTime', val)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="input-roomInDateTime"
                  type="datetime-local"
                  value={admission.roomInDateTime}
                  onChange={(e) => updateField('roomInDateTime', e.target.value)}
                  className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 評估時間 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  評估時間
                </label>
                <ClockButton
                  id="btn-clock-assessment-time"
                  format="datetime-local"
                  onInsert={(val) => updateField('assessmentDateTime', val)}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  id="input-assessmentDateTime"
                  type="datetime-local"
                  value={admission.assessmentDateTime}
                  onChange={(e) => updateField('assessmentDateTime', e.target.value)}
                  className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 入院方式 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                入院方式
              </label>
              <select
                id="select-admissionMode"
                value={['步行', '輪椅', '推床'].includes(admission.admissionMode) ? admission.admissionMode : '其他'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '其他') {
                    updateField('admissionMode', '其他');
                  } else {
                    updateField('admissionMode', val);
                    updateField('admissionModeOther', '');
                  }
                }}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 mb-1.5"
              >
                <option value="步行">步行</option>
                <option value="輪椅">輪椅</option>
                <option value="推床">推床</option>
                <option value="其他">其他</option>
              </select>
              {admission.admissionMode === '其他' && (
                <input
                  type="text"
                  placeholder="請填寫其他入院方式"
                  value={admission.admissionModeOther}
                  onChange={(e) => updateField('admissionModeOther', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-[11px]"
                />
              )}
            </div>

            {/* 入院來源 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                入院來源
              </label>
              <select
                id="select-admissionSource"
                value={['OPD', 'ER', 'Refer'].includes(admission.admissionSource) ? admission.admissionSource : '其他'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '其他') {
                    updateField('admissionSource', '其他');
                  } else {
                    updateField('admissionSource', val);
                    updateField('admissionSourceOther', '');
                  }
                }}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 mb-1.5"
              >
                <option value="OPD">門診入院 OPD</option>
                <option value="ER">急診入院 ER</option>
                <option value="Refer">外院轉診 Refer</option>
                <option value="其他">其他</option>
              </select>
              {admission.admissionSource === '其他' && (
                <input
                  type="text"
                  placeholder="請填寫其他入院來源"
                  value={admission.admissionSourceOther}
                  onChange={(e) => updateField('admissionSourceOther', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-[11px]"
                />
              )}
            </div>
          </div>

          {/* Section 2: BMI & 體重指標 */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>BMI 與體格指標</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">自動換算孕期體重增加與 BMI 指數</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              {/* 身高 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  身高
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-height"
                    type="text"
                    inputMode="decimal"
                    placeholder="160"
                    value={admission.height}
                    onChange={(e) => handleNumericInput('height', e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 font-medium">cm</span>
                </div>
              </div>

              {/* 孕前體重 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  孕前體重
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-prePregnancyWeight"
                    type="text"
                    inputMode="decimal"
                    placeholder="52"
                    value={admission.prePregnancyWeight}
                    onChange={(e) => handleNumericInput('prePregnancyWeight', e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 font-medium">kg</span>
                </div>
              </div>

              {/* 目前體重 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  目前體重
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-currentWeight"
                    type="text"
                    inputMode="decimal"
                    placeholder="64"
                    value={admission.currentWeight}
                    onChange={(e) => handleNumericInput('currentWeight', e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 font-medium">kg</span>
                </div>
              </div>

              {/* 孕期理想體重 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  孕期理想體重
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-idealWeight"
                    type="text"
                    inputMode="decimal"
                    placeholder="62~65"
                    value={admission.idealWeight}
                    onChange={(e) => handleNumericInput('idealWeight', e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 font-medium">kg</span>
                </div>
              </div>

              {/* 現在體重增加 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  現在體重增加
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-weightGain"
                    type="text"
                    inputMode="decimal"
                    placeholder="+12"
                    value={admission.weightGain}
                    onChange={(e) => handleNumericInput('weightGain', e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-bold text-blue-700 text-center focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500 font-medium">kg</span>
                </div>
              </div>

              {/* 計算 BMI */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  計算 BMI
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-bmi"
                    type="text"
                    inputMode="decimal"
                    placeholder="25.0"
                    value={admission.bmi}
                    onChange={(e) => handleNumericInput('bmi' as any, e.target.value)}
                    className="w-full bg-blue-50/60 px-2.5 py-1.5 rounded-md border border-blue-200 text-xs font-bold text-blue-900 text-center focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 入院生命徵象 Vital Signs */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>入院生命徵象</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">超出臨床安全邊界自動淡紅高亮並提示護理觀察重點</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {/* T (體溫) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  體溫 T
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-temp"
                    type="text"
                    inputMode="decimal"
                    placeholder="36.8"
                    value={admission.vitalSigns.temperature}
                    onChange={(e) => updateVitalSign('temperature', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                      tempVal.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <span className="text-slate-500 font-medium">°C</span>
                </div>
              </div>

              {/* P (心率) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  脈搏 P
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-pulse"
                    type="text"
                    inputMode="numeric"
                    placeholder="78"
                    value={admission.vitalSigns.pulse}
                    onChange={(e) => updateVitalSign('pulse', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                      pulseVal.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <span className="text-slate-500 font-medium">bpm</span>
                </div>
              </div>

              {/* R (呼吸) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  呼吸 R
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-resp"
                    type="text"
                    inputMode="numeric"
                    placeholder="18"
                    value={admission.vitalSigns.respiration}
                    onChange={(e) => updateVitalSign('respiration', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                      respVal.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <span className="text-slate-500 font-medium">次/分</span>
                </div>
              </div>

              {/* BP (血壓 SBP / DBP) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  血壓 BP 收縮/舒張
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-sbp"
                    type="text"
                    inputMode="numeric"
                    placeholder="118"
                    value={admission.vitalSigns.systolicBP}
                    onChange={(e) => updateVitalSign('systolicBP', e.target.value)}
                    className={`w-1/2 px-1.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 ${
                      bpVal.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    id="input-admission-dbp"
                    type="text"
                    inputMode="numeric"
                    placeholder="76"
                    value={admission.vitalSigns.diastolicBP}
                    onChange={(e) => updateVitalSign('diastolicBP', e.target.value)}
                    className={`w-1/2 px-1.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 ${
                      bpVal.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* SpO2 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  血氧 SpO2
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="input-admission-spo2"
                    type="text"
                    inputMode="numeric"
                    placeholder="99"
                    value={admission.vitalSigns.spO2}
                    onChange={(e) => updateVitalSign('spO2', e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                      spo2Val.isAbnormal
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  />
                  <span className="text-slate-500 font-medium">%</span>
                </div>
              </div>
            </div>

            {/* Abnormal Warnings Banner */}
            {(tempVal.isAbnormal || pulseVal.isAbnormal || respVal.isAbnormal || bpVal.isAbnormal || spo2Val.isAbnormal) && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>臨床生命徵象超出安全範圍，請注意以下護理觀察重點：</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-rose-800 pl-1 font-medium">
                  {tempVal.isAbnormal && (
                    <li><strong>{tempVal.message}</strong>：{tempVal.nursingKeyPoints}</li>
                  )}
                  {pulseVal.isAbnormal && (
                    <li><strong>{pulseVal.message}</strong>：{pulseVal.nursingKeyPoints}</li>
                  )}
                  {respVal.isAbnormal && (
                    <li><strong>{respVal.message}</strong>：{respVal.nursingKeyPoints}</li>
                  )}
                  {bpVal.isAbnormal && (
                    <li><strong>{bpVal.message}</strong>：{bpVal.nursingKeyPoints}</li>
                  )}
                  {spo2Val.isAbnormal && (
                    <li><strong>{spo2Val.message}</strong>：{spo2Val.nursingKeyPoints}</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Section 4: 個人社會文化背景 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* 教育程度 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                教育程度
              </label>
              <select
                id="select-education"
                value={['不識字', '國小', '國中', '高中', '專科', '大學', '研究所以上'].includes(admission.education) ? admission.education : '其他'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '其他') {
                    updateField('education', '其他');
                  } else {
                    updateField('education', val);
                    updateField('educationOther', '');
                  }
                }}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 mb-1.5"
              >
                <option value="不識字">不識字</option>
                <option value="國小">國小</option>
                <option value="國中">國中</option>
                <option value="高中">高中</option>
                <option value="專科">專科</option>
                <option value="大學">大學</option>
                <option value="研究所以上">研究所以上</option>
                <option value="其他">其他</option>
              </select>
              {admission.education === '其他' && (
                <input
                  type="text"
                  placeholder="請填寫其他教育程度"
                  value={admission.educationOther}
                  onChange={(e) => updateField('educationOther', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-[11px]"
                />
              )}
            </div>

            {/* 職業別 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                職業別
              </label>
              <input
                id="input-occupation"
                type="text"
                placeholder="例：工程師、自由業、家管、商業等"
                value={admission.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            {/* 宗教 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                宗教
              </label>
              <select
                id="select-religion"
                value={['無', '佛教', '道教', '基督教', '天主教', '一貫道', '回教', '印度教'].includes(admission.religion) ? admission.religion : '其他'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '其他') {
                    updateField('religion', '其他');
                  } else {
                    updateField('religion', val);
                    updateField('religionOther', '');
                  }
                }}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 mb-1.5"
              >
                <option value="無">無</option>
                <option value="佛教">佛教</option>
                <option value="道教">道教</option>
                <option value="基督教">基督教</option>
                <option value="天主教">天主教</option>
                <option value="一貫道">一貫道</option>
                <option value="回教">回教</option>
                <option value="印度教">印度教</option>
                <option value="其他">其他</option>
              </select>
              {admission.religion === '其他' && (
                <input
                  type="text"
                  placeholder="請填寫其他宗教"
                  value={admission.religionOther}
                  onChange={(e) => updateField('religionOther', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-slate-300 text-[11px]"
                />
              )}
            </div>

            {/* 禁忌 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1.5">
                禁忌
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {['無', '不輸血', '食物禁忌', '其他'].map((t) => {
                  const isSelected = (admission.taboos || []).includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArrayItem('taboos', t)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(admission.taboos || []).includes('食物禁忌') && (
                  <input
                    type="text"
                    placeholder="請填寫食物禁忌（例：不吃牛、全素、生冷不食）"
                    value={admission.foodTabooDetails}
                    onChange={(e) => updateField('foodTabooDetails', e.target.value)}
                    className="w-full bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                  />
                )}
                {(admission.taboos || []).includes('其他') && (
                  <input
                    type="text"
                    placeholder="請填寫其他特殊禁忌"
                    value={admission.tabooOther}
                    onChange={(e) => updateField('tabooOther', e.target.value)}
                    className="w-full bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                  />
                )}
              </div>
            </div>

            {/* 常用語言 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 md:col-span-3">
              <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                常用語言
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {['中文', '英文', '台語', '客語', '印尼語', '越南語', '菲律賓語', '日語', '韓語', '其他'].map((lang) => {
                  const isSelected = (admission.languages || []).includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem('languages', lang)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
              {(admission.languages || []).includes('其他') && (
                <input
                  type="text"
                  placeholder="請填寫其他語言/方言"
                  value={admission.languageOther}
                  onChange={(e) => updateField('languageOther', e.target.value)}
                  className="w-full max-w-sm bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px]"
                />
              )}
            </div>
          </div>

          {/* Section 5: 血型、RH、輸血經驗與反應 */}
          <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              <Droplet className="w-4 h-4 text-rose-600" />
              <span>血型與輸血評估</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* 病人血型 & RH */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  病人血型 / RH
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    id="select-patientBloodType"
                    value={admission.patientBloodType}
                    onChange={(e) => updateField('patientBloodType', e.target.value)}
                    className="w-1/2 bg-slate-50 px-2 py-1.5 rounded border border-slate-300 font-bold text-slate-800"
                  >
                    {['A', 'B', 'AB', 'O'].map((b) => (
                      <option key={b} value={b}>{b} 型</option>
                    ))}
                  </select>
                  <select
                    id="select-patientRh"
                    value={admission.patientRh}
                    onChange={(e) => updateField('patientRh', e.target.value)}
                    className="w-1/2 bg-slate-50 px-2 py-1.5 rounded border border-slate-300 font-bold text-slate-800"
                  >
                    {['+', '-', '未知'].map((r) => (
                      <option key={r} value={r}>RH {r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 配偶血型 & RH */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  配偶血型 / RH
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    id="select-spouseBloodType"
                    value={admission.spouseBloodType}
                    onChange={(e) => updateField('spouseBloodType', e.target.value)}
                    className="w-1/2 bg-slate-50 px-2 py-1.5 rounded border border-slate-300 font-bold text-slate-800"
                  >
                    {['A', 'B', 'AB', 'O'].map((b) => (
                      <option key={b} value={b}>{b} 型</option>
                    ))}
                  </select>
                  <select
                    id="select-spouseRh"
                    value={admission.spouseRh}
                    onChange={(e) => updateField('spouseRh', e.target.value)}
                    className="w-1/2 bg-slate-50 px-2 py-1.5 rounded border border-slate-300 font-bold text-slate-800"
                  >
                    {['+', '-', '未知'].map((r) => (
                      <option key={r} value={r}>RH {r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 輸血經驗 */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  輸血經驗
                </label>
                <div className="flex gap-1.5">
                  {['有', '無'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('bloodTransfusionHistory', opt)}
                      className={`flex-1 py-1 px-2 rounded font-bold border text-center transition-all ${
                        admission.bloodTransfusionHistory === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 輸血反應 */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">
                  輸血反應
                </label>
                <div className="flex gap-1.5 mb-1">
                  {['有', '無'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('bloodTransfusionReaction', opt)}
                      className={`flex-1 py-1 px-2 rounded font-bold border text-center transition-all ${
                        admission.bloodTransfusionReaction === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {admission.bloodTransfusionReaction === '有' && (
                  <input
                    type="text"
                    placeholder="請填寫反應（例：發冷、蕁麻疹）"
                    value={admission.bloodTransfusionReactionDetails}
                    onChange={(e) => updateField('bloodTransfusionReactionDetails', e.target.value)}
                    className="w-full bg-slate-50 px-2 py-1 rounded border border-slate-300 text-[11px]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 6: 月經狀況、LMP/EDC、抹片、過敏史、乳房自檢、菸酒 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* 月經狀況 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                月經狀況
              </label>
              <select
                id="select-menstrualStatus"
                value={admission.menstrualStatus}
                onChange={(e) => updateField('menstrualStatus', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="規則">規則</option>
                <option value="不規則">不規則</option>
                <option value="已停經">已停經</option>
              </select>
            </div>

            {/* LMP */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                  最後月經 LMP
                </label>
                <ClockButton
                  id="btn-clock-lmp-date"
                  format="date"
                  onInsert={(val) => updateField('lmp', val)}
                />
              </div>
              <input
                id="input-admission-lmp"
                type="date"
                value={admission.lmp}
                onChange={(e) => updateField('lmp', e.target.value)}
                className="w-full bg-white px-2 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* EDC */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                  預產期 EDC
                </label>
                <ClockButton
                  id="btn-clock-admission-edc"
                  format="date"
                  onInsert={(val) => updateField('edc', val)}
                />
              </div>
              <input
                id="input-admission-edc"
                type="date"
                value={admission.edc}
                onChange={(e) => updateField('edc', e.target.value)}
                className="w-full bg-white px-2 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 子宮頸抹片檢查 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                抹片檢查
              </label>
              <select
                id="select-papSmear"
                value={admission.papSmear}
                onChange={(e) => updateField('papSmear', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="有（定期）">有（定期）</option>
                <option value="有（不定期）">有（不定期）</option>
                <option value="無">無</option>
              </select>
            </div>

            {/* 藥物過敏史 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                藥物過敏史
              </label>
              <div className="flex gap-1.5 mb-1.5">
                {['有', '無'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('drugAllergy', opt)}
                    className={`flex-1 py-1 px-2 rounded font-bold border text-center transition-all ${
                      admission.drugAllergy === opt
                        ? opt === '有' ? 'bg-rose-600 text-white border-rose-600' : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {admission.drugAllergy === '有' && (
                <input
                  type="text"
                  placeholder="請填寫過敏藥物（例：Penicillin、NSAID）"
                  value={admission.drugAllergyDetails}
                  onChange={(e) => updateField('drugAllergyDetails', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-rose-300 text-[11px] text-rose-900 font-semibold"
                />
              )}
            </div>

            {/* 食物過敏史 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1.5">
                食物過敏史
              </label>
              <div className="flex gap-1.5 mb-1.5">
                {['有', '無'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateField('foodAllergy', opt)}
                    className={`flex-1 py-1 px-2 rounded font-bold border text-center transition-all ${
                      admission.foodAllergy === opt
                        ? opt === '有' ? 'bg-amber-600 text-white border-amber-600' : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {admission.foodAllergy === '有' && (
                <input
                  type="text"
                  placeholder="請填寫過敏食物（例：海鮮、花生、芒果）"
                  value={admission.foodAllergyDetails}
                  onChange={(e) => updateField('foodAllergyDetails', e.target.value)}
                  className="w-full bg-white px-2 py-1 rounded border border-amber-300 text-[11px] text-amber-900 font-semibold"
                />
              )}
            </div>

            {/* 乳房自我檢查 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1.5">
                乳房自我檢查
              </label>
              <select
                id="select-breastSelfExam"
                value={admission.breastSelfExam}
                onChange={(e) => updateField('breastSelfExam', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="無">無</option>
                <option value="有（正常）">有（正常）</option>
                <option value="有（有硬塊）">有（有硬塊）</option>
                <option value="有（有分泌物）">有（有分泌物）</option>
                <option value="有（皮膚缺損）">有（皮膚缺損）</option>
              </select>
            </div>

            {/* 抽菸 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1.5">
                抽菸
              </label>
              <input
                id="input-smoking"
                type="text"
                placeholder="例：無、或 0.5包/天 (已戒5年)"
                value={admission.smoking}
                onChange={(e) => updateField('smoking', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>

            {/* 飲酒 */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1.5">
                飲酒
              </label>
              <input
                id="input-alcohol"
                type="text"
                placeholder="例：無、或 偶爾社交少許飲酒"
                value={admission.alcohol}
                onChange={(e) => updateField('alcohol', e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="admission"
        sectionTitle="入院護理評估"
        record={record}
        onChange={onChange}
        quickTags={['📌 藥物與食物過敏史', '💡 宗教飲食與輸血禁忌', '⚠️ 孕期體重增加異常', '🔄 語言溝通與主要照顧者']}
      />
    </section>
  );
};
