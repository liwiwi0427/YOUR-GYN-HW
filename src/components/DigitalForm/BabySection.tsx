import React from 'react';
import { HandoverRecord } from '../../types';
import { Baby, AlertTriangle, Activity, HeartPulse } from 'lucide-react';
import {
  validateBabyWeight,
  validateApgar,
} from '../../utils/clinicalValidation';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const BabySection: React.FC<Props> = ({ record, onChange }) => {
  const updateField = (field: keyof HandoverRecord['babyStatus'], value: string) => {
    onChange((prev) => ({
      ...prev,
      babyStatus: {
        ...prev.babyStatus,
        [field]: value,
      },
    }));
  };

  const locations = ['嬰兒室', '母嬰同室', '病嬰室'];
  const feedingTypes = ['完全母乳', '混和奶', '配方奶'];

  // Clinical boundary validations
  const weightVal = validateBabyWeight(record.babyStatus?.weight);
  const apgar1Val = validateApgar(record.babyStatus?.apgar1Min, "1'");
  const apgar5Val = validateApgar(record.babyStatus?.apgar5Min, "5'");

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <Baby className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">寶寶情況</h3>
            <p className="text-[11px] text-slate-500 font-medium">新生兒體格指數、Apgar 評分、照護位置與餵食狀況（具備邊界安全校驗）</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        
        {/* 身高 / 體重 */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              新生兒身高
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-babyHeight"
                type="number"
                min="0"
                max="100"
                step="0.1"
                inputMode="decimal"
                placeholder="例：49.5"
                value={record.babyStatus.height}
                onChange={(e) => updateField('height', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
              />
              <span className="text-slate-500 font-medium shrink-0">cm</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              新生兒體重
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-babyWeight"
                type="number"
                min="0"
                max="10000"
                step="1"
                inputMode="numeric"
                placeholder="例：3180"
                value={record.babyStatus.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                className={`w-full px-3 py-2 rounded-md border font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  weightVal.isAbnormal
                    ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-slate-500 font-medium shrink-0">g</span>
            </div>
          </div>
        </div>

        {/* 阿帕嘉計分第一分鐘 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            阿帕嘉計分第 1 分鐘
          </label>
          <div className="flex items-center gap-1.5">
            <select
              id="select-apgar1Min"
              value={record.babyStatus.apgar1Min}
              onChange={(e) => updateField('apgar1Min', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                apgar1Val.isAbnormal
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- 分數 --</option>
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
                <option key={num} value={num.toString()}>{num} 分</option>
              ))}
            </select>
            <span className="text-slate-500 font-medium">分</span>
          </div>
        </div>

        {/* 阿帕嘉計分第五分鐘 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            阿帕嘉計分第 5 分鐘
          </label>
          <div className="flex items-center gap-1.5">
            <select
              id="select-apgar5Min"
              value={record.babyStatus.apgar5Min}
              onChange={(e) => updateField('apgar5Min', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                apgar5Val.isAbnormal
                  ? 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-300'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- 分數 --</option>
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((num) => (
                <option key={num} value={num.toString()}>{num} 分</option>
              ))}
            </select>
            <span className="text-slate-500 font-medium">分</span>
          </div>
        </div>

        {/* 寶寶在哪裡 */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            寶寶在哪裡
          </label>
          <div className="flex gap-2">
            {locations.map((loc) => (
              <label
                key={loc}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border cursor-pointer font-semibold transition-all ${
                  record.babyStatus.location === loc
                    ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="babyLocation"
                  value={loc}
                  checked={record.babyStatus.location === loc}
                  onChange={() => updateField('location', loc)}
                  className="accent-blue-600"
                />
                <span>{loc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 出生時特殊情況 */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            出生時特殊情況
          </label>
          <input
            id="input-specialConditions"
            type="text"
            placeholder="例：哭聲宏亮、無臍帶繞頸、活力佳 / 曾抽吸口鼻分泌物"
            value={record.babyStatus.specialConditions}
            onChange={(e) => updateField('specialConditions', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 哺乳方式 */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            哺乳方式
          </label>
          <div className="flex gap-2">
            {feedingTypes.map((feed) => (
              <label
                key={feed}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border cursor-pointer font-semibold transition-all ${
                  record.babyStatus.feedingType === feed
                    ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="babyFeedingType"
                  value={feed}
                  checked={record.babyStatus.feedingType === feed}
                  onChange={() => updateField('feedingType', feed)}
                  className="accent-blue-600"
                />
                <span>{feed}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 奶粉 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            奶粉品牌
          </label>
          <input
            id="input-formulaBrand"
            type="text"
            placeholder="例：能恩水解 1 號 / 無"
            value={record.babyStatus.formulaBrand}
            onChange={(e) => updateField('formulaBrand', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        {/* 今日奶量 */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            今日奶量
          </label>
          <input
            id="input-dailyIntake"
            type="text"
            placeholder="例：親餵依需求 / 每3hr 40ml"
            value={record.babyStatus.dailyIntake}
            onChange={(e) => updateField('dailyIntake', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

      </div>

      {/* Abnormal Alert Banner for Baby Status */}
      {(weightVal.isAbnormal || apgar1Val.isAbnormal || apgar5Val.isAbnormal) && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>新生兒臨床指標超出常態範圍，請掌握以下護理重點：</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-rose-800 pl-1 font-medium">
            {weightVal.isAbnormal && (
              <li><strong>{weightVal.message}</strong>：{weightVal.nursingKeyPoints}</li>
            )}
            {apgar1Val.isAbnormal && (
              <li><strong>{apgar1Val.message}</strong>：{apgar1Val.nursingKeyPoints}</li>
            )}
            {apgar5Val.isAbnormal && (
              <li><strong>{apgar5Val.message}</strong>：{apgar5Val.nursingKeyPoints}</li>
            )}
          </ul>
        </div>
      )}

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="baby"
        sectionTitle="寶寶情況"
        record={record}
        onChange={onChange}
        quickTags={['📌 體溫監測與保暖', '💡 吸吮力與排泄次數', '⚠️ 黃疸生理/病理性進程', '🔄 親餵含乳技巧評估']}
      />
    </section>
  );
};
