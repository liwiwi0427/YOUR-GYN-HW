import React from 'react';
import { HandoverRecord } from '../../types';
import { CLINICAL_TERMS } from '../../data/clinicalTerms';
import { Heart, Activity, AlertTriangle, HeartPulse } from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';
import {
  sanitizeDecimal,
  validateMaternalTemp,
  validateMaternalPulse,
  validateMaternalRespiration,
  validateMaternalBP,
  validateMaternalSpO2,
  validatePainScore,
} from '../../utils/clinicalValidation';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const MaternalSection: React.FC<Props> = ({ record, onChange }) => {
  const updateBreast = (field: keyof HandoverRecord['maternalAssessment']['breast'], value: string) => {
    onChange((prev) => ({
      ...prev,
      maternalAssessment: {
        ...prev.maternalAssessment,
        breast: {
          ...prev.maternalAssessment.breast,
          [field]: value,
        },
      },
    }));
  };

  const updateUterus = (field: keyof HandoverRecord['maternalAssessment']['uterus'], value: string) => {
    onChange((prev) => ({
      ...prev,
      maternalAssessment: {
        ...prev.maternalAssessment,
        uterus: {
          ...prev.maternalAssessment.uterus,
          [field]: value,
        },
      },
    }));
  };

  // Optional sync with admission vital signs if present
  const admission = record.admissionAssessment;
  const updateAdmissionVital = (field: 'temperature' | 'pulse' | 'respiration' | 'systolicBP' | 'diastolicBP' | 'spO2', val: string) => {
    const sanitized = sanitizeDecimal(val);
    onChange((prev) => {
      const currentAdm = prev.admissionAssessment || {
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
        vitalSigns: { temperature: '', pulse: '', respiration: '', systolicBP: '', diastolicBP: '', spO2: '' },
        education: '大學',
        educationOther: '',
        occupation: '',
        religion: '無',
        religionOther: '',
        taboos: ['無'],
        foodTabooDetails: '',
        tabooOther: '',
        languages: ['中文'],
        languageOther: '',
        patientBloodType: 'O',
        patientRh: '(+)',
        spouseBloodType: 'O',
        spouseRh: '(+)',
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

      const currentVitals = currentAdm.vitalSigns || {
        temperature: '',
        pulse: '',
        respiration: '',
        systolicBP: '',
        diastolicBP: '',
        spO2: '',
      };

      return {
        ...prev,
        admissionAssessment: {
          ...currentAdm,
          vitalSigns: {
            ...currentVitals,
            [field]: sanitized,
          },
        },
      };
    });
  };

  // Validation
  const painVal = validatePainScore(record.maternalAssessment?.uterus?.painScore);
  const tempVal = validateMaternalTemp(admission?.vitalSigns?.temperature);
  const pulseVal = validateMaternalPulse(admission?.vitalSigns?.pulse);
  const respVal = validateMaternalRespiration(admission?.vitalSigns?.respiration);
  const bpVal = validateMaternalBP(admission?.vitalSigns?.systolicBP, admission?.vitalSigns?.diastolicBP);
  const spo2Val = validateMaternalSpO2(admission?.vitalSigns?.spO2);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">產婦身心評估</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              乳房泌乳情形、宮底復舊高度、宮縮痛感與惡露性狀評估（含臨床安全邊界校驗）
            </p>
          </div>
        </div>
      </div>

      {/* 產婦生命徵象評估列 */}
      <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>產婦生命徵象安全監測</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">若異常自動以淡紅高亮並提示護理觀察重點</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* T */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">體溫 T (°C)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-maternal-t"
                type="text"
                inputMode="decimal"
                placeholder="36.8"
                value={admission?.vitalSigns?.temperature || ''}
                onChange={(e) => updateAdmissionVital('temperature', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                  tempVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-500 font-medium">°C</span>
            </div>
          </div>

          {/* P */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">脈搏 P (bpm)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-maternal-p"
                type="text"
                inputMode="numeric"
                placeholder="76"
                value={admission?.vitalSigns?.pulse || ''}
                onChange={(e) => updateAdmissionVital('pulse', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                  pulseVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-500 font-medium">bpm</span>
            </div>
          </div>

          {/* R */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">呼吸 R (次/分)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-maternal-r"
                type="text"
                inputMode="numeric"
                placeholder="18"
                value={admission?.vitalSigns?.respiration || ''}
                onChange={(e) => updateAdmissionVital('respiration', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 transition-colors ${
                  respVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-500 font-medium">次</span>
            </div>
          </div>

          {/* BP */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">血壓 BP (收縮/舒張)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-maternal-sbp"
                type="text"
                inputMode="numeric"
                placeholder="116"
                value={admission?.vitalSigns?.systolicBP || ''}
                onChange={(e) => updateAdmissionVital('systolicBP', e.target.value)}
                className={`w-1/2 px-1.5 py-1.5 rounded-md border text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 ${
                  bpVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-400">/</span>
              <input
                id="input-maternal-dbp"
                type="text"
                inputMode="numeric"
                placeholder="74"
                value={admission?.vitalSigns?.diastolicBP || ''}
                onChange={(e) => updateAdmissionVital('diastolicBP', e.target.value)}
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
            <label className="block font-semibold text-slate-700 mb-1">血氧 SpO2 (%)</label>
            <div className="flex items-center gap-1">
              <input
                id="input-maternal-spo2"
                type="text"
                inputMode="numeric"
                placeholder="99"
                value={admission?.vitalSigns?.spO2 || ''}
                onChange={(e) => updateAdmissionVital('spO2', e.target.value)}
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

        {/* Abnormal Warnings Banner for Vital Signs */}
        {(tempVal.isAbnormal || pulseVal.isAbnormal || respVal.isAbnormal || bpVal.isAbnormal || spo2Val.isAbnormal) && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>生命徵象超出安全範圍，護理評估重點：</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-rose-800 pl-1 font-medium text-[11px]">
              {tempVal.isAbnormal && <li><strong>{tempVal.message}</strong>：{tempVal.nursingKeyPoints}</li>}
              {pulseVal.isAbnormal && <li><strong>{pulseVal.message}</strong>：{pulseVal.nursingKeyPoints}</li>}
              {respVal.isAbnormal && <li><strong>{respVal.message}</strong>：{respVal.nursingKeyPoints}</li>}
              {bpVal.isAbnormal && <li><strong>{bpVal.message}</strong>：{bpVal.nursingKeyPoints}</li>}
              {spo2Val.isAbnormal && <li><strong>{spo2Val.message}</strong>：{spo2Val.nursingKeyPoints}</li>}
            </ul>
          </div>
        )}
      </div>

      {/* 乳房評估 */}
      <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Heart className="w-4 h-4 text-blue-600" />
            <span>乳房評估</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">評估時間：</span>
            <div className="flex items-center gap-1.5">
              <input
                id="input-breastAssessmentDate"
                type="text"
                placeholder="YYYY-MM-DD HH:mm"
                value={record.maternalAssessment.breast.assessmentDate}
                onChange={(e) => updateBreast('assessmentDate', e.target.value)}
                className="bg-white px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
              <ClockButton
                id="btn-clock-breast-assess"
                format="datetime"
                onInsert={(val) => updateBreast('assessmentDate', val)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          {/* 乳房皮膚外觀 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              乳房皮膚外觀
            </label>
            <div className="flex gap-1.5">
              {['正常', '發紅'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateBreast('skinAppearance', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.breast.skinAppearance === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 乳房質地 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              乳房質地
            </label>
            <div className="flex gap-1.5">
              {['軟', '充盈', '硬'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateBreast('consistency', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.breast.consistency === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 乳頭形狀 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              乳頭形狀
            </label>
            <div className="flex gap-1.5">
              {['凸', '平', '凹'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateBreast('nippleShape', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.breast.nippleShape === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 乳頭狀況 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              乳頭完整度
            </label>
            <div className="flex gap-1.5">
              {['完整', '破損'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateBreast('nippleIntegrity', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.breast.nippleIntegrity === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 泌乳情形 - 右側 */}
          <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-700 mb-2">泌乳情形－右側</div>
            <div className="flex flex-wrap items-center gap-2">
              {['無', '微', '少', '多'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateBreast('lactationRight', lvl)}
                  className={`px-3 py-1 rounded-md border font-semibold text-xs transition-colors ${
                    record.maternalAssessment.breast.lactationRight === lvl
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  id="input-lactationRightAmount"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="5"
                  value={record.maternalAssessment.breast.lactationRightAmount}
                  onChange={(e) => updateBreast('lactationRightAmount', e.target.value)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs text-center focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <span className="text-slate-500 font-medium">ml</span>
              </div>
            </div>
          </div>

          {/* 泌乳情形 - 左側 */}
          <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-700 mb-2">泌乳情形－左側</div>
            <div className="flex flex-wrap items-center gap-2">
              {['無', '微', '少', '多'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => updateBreast('lactationLeft', lvl)}
                  className={`px-3 py-1 rounded-md border font-semibold text-xs transition-colors ${
                    record.maternalAssessment.breast.lactationLeft === lvl
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  id="input-lactationLeftAmount"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="5"
                  value={record.maternalAssessment.breast.lactationLeftAmount}
                  onChange={(e) => updateBreast('lactationLeftAmount', e.target.value)}
                  className="w-16 px-2 py-1 border border-slate-300 rounded-md text-xs text-center focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <span className="text-slate-500 font-medium">ml</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 子宮評估 */}
      <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>子宮與惡露評估</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">評估時間：</span>
            <div className="flex items-center gap-1.5">
              <input
                id="input-uterusAssessmentDate"
                type="text"
                placeholder="YYYY-MM-DD HH:mm"
                value={record.maternalAssessment.uterus.assessmentDate}
                onChange={(e) => updateUterus('assessmentDate', e.target.value)}
                className="bg-white px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
              <ClockButton
                id="btn-clock-uterus-assess"
                format="datetime"
                onInsert={(val) => updateUterus('assessmentDate', val)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          {/* 宮底高度 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              宮底高度
            </label>
            <select
              id="select-fundalHeight"
              value={record.maternalAssessment.uterus.fundalHeight}
              onChange={(e) => updateUterus('fundalHeight', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            >
              <option value="">-- 選擇宮底位置 --</option>
              {CLINICAL_TERMS.fundalHeights.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* 宮縮質地 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              宮縮
            </label>
            <div className="flex gap-1.5">
              {['硬', '中', '軟'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateUterus('contraction', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.uterus.contraction === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 位置 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              位置
            </label>
            <div className="flex gap-1.5">
              {['左', '中', '右'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateUterus('position', opt)}
                  className={`flex-1 py-1.5 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.uterus.position === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 宮縮疼痛指數 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              宮縮疼痛指數
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-painScore"
                type="number"
                min="0"
                max="10"
                placeholder="0"
                value={record.maternalAssessment.uterus.painScore}
                onChange={(e) => updateUterus('painScore', e.target.value)}
                className={`w-20 px-3 py-2 rounded-md border text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  painVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-500 font-medium">/ 10 分</span>
            </div>
          </div>

          {/* 子宮按摩與按摩後宮縮 */}
          <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">子宮按摩：</span>
              {['有', '無'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateUterus('massage', opt)}
                  className={`px-3 py-1 rounded-md border font-semibold text-xs transition-colors ${
                    record.maternalAssessment.uterus.massage === opt
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">→ 按摩後宮縮：</span>
              {['硬', '中', '軟'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateUterus('postMassageContraction', opt)}
                  className={`px-2.5 py-1 rounded-md border font-semibold text-xs transition-colors ${
                    record.maternalAssessment.uterus.postMassageContraction === opt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 惡露量 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              惡露量
            </label>
            <input
              id="input-lochiaAmount"
              type="text"
              placeholder="例：少 / 2.5-10cm"
              value={record.maternalAssessment.uterus.lochiaAmount}
              onChange={(e) => updateUterus('lochiaAmount', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
          </div>

          {/* 惡露顏色 */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              惡露顏色
            </label>
            <input
              id="input-lochiaColor"
              type="text"
              placeholder="例：暗紅 / 鮮紅 / 褐色"
              value={record.maternalAssessment.uterus.lochiaColor}
              onChange={(e) => updateUterus('lochiaColor', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
            />
          </div>

          {/* 惡露性質 */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1.5">
              惡露性質
            </label>
            <div className="flex gap-2">
              {[
                { type: '紅惡露', desc: '產後1-3天' },
                { type: '漿惡露', desc: '產後4-10天' },
                { type: '白惡露', desc: '產後10-14天+' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateUterus('lochiaType', item.type)}
                  className={`flex-1 py-2 px-2 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.uterus.lochiaType === item.type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">{item.type}</div>
                  <div className="text-[10px] opacity-80 font-normal">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 血塊 */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1.5">
              血塊
            </label>
            <div className="flex gap-2">
              {['無', '有'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateUterus('bloodClots', opt)}
                  className={`flex-1 py-2 px-4 rounded-md font-semibold border text-center transition-all ${
                    record.maternalAssessment.uterus.bloodClots === opt
                      ? opt === '有' ? 'bg-amber-600 text-white border-amber-600 shadow-2xs' : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Pain Alert Banner if Severe */}
      {painVal.isAbnormal && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{painVal.message}</span>
          </div>
          <p className="text-rose-800 font-medium pl-5">{painVal.nursingKeyPoints}</p>
        </div>
      )}

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="maternal"
        sectionTitle="產婦身心評估"
        record={record}
        onChange={onChange}
        quickTags={['📌 宮縮硬度與宮底位置', '💡 乳房充盈與乳頭破皮', '⚠️ 惡露量異常過多或血塊', '🔄 產後解尿與膀胱排空']}
      />
    </section>
  );
};
