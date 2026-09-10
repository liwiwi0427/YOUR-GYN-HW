import React from 'react';
import { HandoverRecord } from '../../types';
import { CLINICAL_TERMS } from '../../data/clinicalTerms';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const WoundSection: React.FC<Props> = ({ record, onChange }) => {
  const updateAssessmentTime = (value: string) => {
    onChange((prev) => ({
      ...prev,
      maternalAssessment: {
        ...prev.maternalAssessment,
        wound: {
          ...prev.maternalAssessment.wound,
          assessmentTime: value,
        },
      },
    }));
  };

  const updatePerineal = (field: keyof HandoverRecord['maternalAssessment']['wound']['perineal'], value: string) => {
    onChange((prev) => ({
      ...prev,
      maternalAssessment: {
        ...prev.maternalAssessment,
        wound: {
          ...prev.maternalAssessment.wound,
          perineal: {
            ...prev.maternalAssessment.wound.perineal,
            [field]: value,
          },
        },
      },
    }));
  };

  const updateCesarean = (field: keyof HandoverRecord['maternalAssessment']['wound']['cesarean'], value: string) => {
    onChange((prev) => ({
      ...prev,
      maternalAssessment: {
        ...prev.maternalAssessment,
        wound: {
          ...prev.maternalAssessment.wound,
          cesarean: {
            ...prev.maternalAssessment.wound.cesarean,
            [field]: value,
          },
        },
      },
    }));
  };

  // Calculate REEDA Total Score
  const getScoreNum = (val: string) => {
    const match = val.match(/^(\d)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const perineal = record.maternalAssessment.wound.perineal;
  const reedaTotal = 
    getScoreNum(perineal.redness) +
    getScoreNum(perineal.edema) +
    getScoreNum(perineal.ecchymosis) +
    getScoreNum(perineal.discharge) +
    getScoreNum(perineal.approximation);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">傷口臨床評估</h3>
            <p className="text-[11px] text-slate-500 font-medium">REEDA 會陰傷口評估量表與剖腹產手術傷口狀況</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">評估時間：</span>
          <div className="flex items-center gap-1.5">
            <input
              id="input-woundAssessmentTime"
              type="text"
              placeholder="YYYY-MM-DD HH:mm"
              value={record.maternalAssessment.wound.assessmentTime}
              onChange={(e) => updateAssessmentTime(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
            <ClockButton
              id="btn-clock-wound-assess"
              format="datetime"
              onInsert={(val) => updateAssessmentTime(val)}
            />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* 會陰傷口 */}
          <div className="p-4.5 bg-slate-50/40">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                會陰傷口 REEDA 量表
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                reedaTotal === 0 ? 'bg-emerald-100 text-emerald-800' :
                reedaTotal <= 3 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
              }`}>
                REEDA 總分：{reedaTotal} / 15 分
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Redness */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  發紅 Redness
                </label>
                <select
                  id="select-reeda-redness"
                  value={perineal.redness}
                  onChange={(e) => updatePerineal('redness', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                >
                  <option value="">-- 請評分 --</option>
                  {CLINICAL_TERMS.reedaCriteria.redness.map((item) => (
                    <option key={item.score} value={`${item.score} (${item.label.split('：')[1]})`}>
                      {item.label}
                    </option>
                  ))}
                  <option value="-">- (無評估/剖腹產)</option>
                </select>
              </div>

              {/* Edema */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  水腫 Edema
                </label>
                <select
                  id="select-reeda-edema"
                  value={perineal.edema}
                  onChange={(e) => updatePerineal('edema', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                >
                  <option value="">-- 請評分 --</option>
                  {CLINICAL_TERMS.reedaCriteria.edema.map((item) => (
                    <option key={item.score} value={`${item.score} (${item.label.split('：')[1]})`}>
                      {item.label}
                    </option>
                  ))}
                  <option value="-">- (無評估/剖腹產)</option>
                </select>
              </div>

              {/* Ecchymosis */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  瘀斑 Ecchymosis
                </label>
                <select
                  id="select-reeda-ecchymosis"
                  value={perineal.ecchymosis}
                  onChange={(e) => updatePerineal('ecchymosis', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                >
                  <option value="">-- 請評分 --</option>
                  {CLINICAL_TERMS.reedaCriteria.ecchymosis.map((item) => (
                    <option key={item.score} value={`${item.score} (${item.label.split('：')[1]})`}>
                      {item.label}
                    </option>
                  ))}
                  <option value="-">- (無評估/剖腹產)</option>
                </select>
              </div>

              {/* Discharge */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  分泌物 Discharge
                </label>
                <select
                  id="select-reeda-discharge"
                  value={perineal.discharge}
                  onChange={(e) => updatePerineal('discharge', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                >
                  <option value="">-- 請評分 --</option>
                  {CLINICAL_TERMS.reedaCriteria.discharge.map((item) => (
                    <option key={item.score} value={`${item.score} (${item.label.split('：')[1]})`}>
                      {item.label}
                    </option>
                  ))}
                  <option value="-">- (無評估/剖腹產)</option>
                </select>
              </div>

              {/* Approximation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  傷口邊緣密合度 Approximation
                </label>
                <select
                  id="select-reeda-approximation"
                  value={perineal.approximation}
                  onChange={(e) => updatePerineal('approximation', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                >
                  <option value="">-- 請評分 --</option>
                  {CLINICAL_TERMS.reedaCriteria.approximation.map((item) => (
                    <option key={item.score} value={`${item.score} (${item.label.split('：')[1]})`}>
                      {item.label}
                    </option>
                  ))}
                  <option value="-">- (無評估/剖腹產)</option>
                </select>
              </div>

            </div>
          </div>

          {/* 剖腹傷口 */}
          <div className="p-4.5 bg-slate-50/40">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">剖腹傷口狀況</span>
              <span className="text-[11px] text-slate-500 font-medium">術後傷口狀況</span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* 傷口顏色 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  傷口顏色
                </label>
                <input
                  id="input-cs-color"
                  type="text"
                  placeholder="例：粉紅無紅腫 / 淡粉 / 紅"
                  value={record.maternalAssessment.wound.cesarean.color}
                  onChange={(e) => updateCesarean('color', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                />
              </div>

              {/* 腫脹情形 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  腫脹情形
                </label>
                <input
                  id="input-cs-swelling"
                  type="text"
                  placeholder="例：無腫脹 / 邊緣輕度浮腫"
                  value={record.maternalAssessment.wound.cesarean.swelling}
                  onChange={(e) => updateCesarean('swelling', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                />
              </div>

              {/* 疼痛情形 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  疼痛情形
                </label>
                <input
                  id="input-cs-pain"
                  type="text"
                  placeholder="例：翻身牽拉痛 NRS 3-4分，PCA使用中"
                  value={record.maternalAssessment.wound.cesarean.pain}
                  onChange={(e) => updateCesarean('pain', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                />
              </div>

              {/* 敷料狀況 */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  敷料狀況
                </label>
                <input
                  id="input-cs-dressing"
                  type="text"
                  placeholder="例：赫麗敷防水貼片固定完整，乾淨無滲液"
                  value={record.maternalAssessment.wound.cesarean.dressing}
                  onChange={(e) => updateCesarean('dressing', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                />
              </div>

              {/* 換藥日期 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    換藥日期
                  </label>
                  <ClockButton
                    id="btn-clock-dressing-change"
                    format="date"
                    onInsert={(val) => updateCesarean('dressingChangeDate', val)}
                  />
                </div>
                <input
                  id="input-cs-dressingChangeDate"
                  type="text"
                  placeholder="例：2026-08-17 (手術當日)"
                  value={record.maternalAssessment.wound.cesarean.dressingChangeDate}
                  onChange={(e) => updateCesarean('dressingChangeDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-800"
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="wound"
        sectionTitle="傷口臨床評估"
        record={record}
        onChange={onChange}
        quickTags={['📌 REEDA 會陰紅腫滲液', '💡 剖腹產敷料滲血乾燥', '⚠️ 傷口周圍劇烈血腫', '🔄 溫水坐浴與沖洗衛教']}
      />
    </section>
  );
};
