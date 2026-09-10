import React from 'react';
import { HandoverRecord } from '../../types';

interface Props {
  record: HandoverRecord;
  printTheme: 'classic' | 'modern';
  printTimestamp?: string;
}

export const AdmissionAssessmentPrintPage: React.FC<Props> = ({ record, printTheme, printTimestamp }) => {
  const adm = record.admissionAssessment;
  const basic = record.basicInfo;
  const intern = record.internship;

  if (!adm) return null;

  const currentFormattedTime = printTimestamp || (() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  })();

  const renderCheckGroup = (options: string[], currentVal: string | string[] | undefined) => {
    return (
      <div className="inline-flex items-center flex-wrap gap-1.5 py-0.5">
        {options.map((opt, i) => {
          let isSelected = false;
          if (Array.isArray(currentVal)) {
            isSelected = currentVal.includes(opt);
          } else if (typeof currentVal === 'string') {
            isSelected = currentVal === opt || currentVal.includes(opt);
          }

          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-1 py-0.2 rounded text-[10.5px] leading-tight ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold print:bg-black print:text-white'
                  : 'bg-slate-50 text-slate-700 border border-slate-300 print:bg-white print:text-black print:border-slate-300'
              }`}
            >
              <span className="text-[8.5px] font-mono">{isSelected ? '■' : '□'}</span>
              <span>{opt}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{ pageBreakAfter: 'always', breakAfter: 'page' }}
      className={`a4-page a4-page-break bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl print:shadow-none print:w-full print:min-h-0 print:p-0 mb-6 print:mb-0 print:break-after-page text-slate-900 font-sans text-[11px] leading-tight border border-slate-300 print:border-none flex flex-col justify-between ${
        printTheme === 'modern' ? 'report-modern' : 'report-classic'
      }`}
    >
      <div className="space-y-3.5 flex-1">
        {/* Header Title */}
        <div className="text-center border-b-2 border-slate-900 pb-2">
          <div className="text-[12px] text-slate-600 font-bold tracking-wider print:text-black">
            {intern.hospital ? `${intern.hospital} · ` : ''}{intern.unit || '產科護理病房'}
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-950 mt-0.5 print:text-black">
            （{intern.unit || '實習單位'}） 入院評估表單
          </h1>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5 print:text-slate-600">
            Obstetric Admission Nursing Assessment Record
          </div>
        </div>

        {/* Top Demographics Bar */}
        <div className="grid grid-cols-6 border border-slate-900 divide-x divide-slate-900 bg-slate-50 print:bg-white text-[11px]">
          <div className="p-1.5 col-span-1 print:bg-white">
            <span className="font-bold text-slate-700 print:text-black">床號：</span>
            <span className="font-black text-slate-950 ml-1 print:text-black">{basic.bedNumber || '-'}</span>
          </div>
          <div className="p-1.5 col-span-1 print:bg-white">
            <span className="font-bold text-slate-700 print:text-black">姓名：</span>
            <span className="font-bold text-slate-950 ml-1 print:text-black">{basic.patientName || '-'}</span>
          </div>
          <div className="p-1.5 col-span-1 print:bg-white">
            <span className="font-bold text-slate-700 print:text-black">年齡：</span>
            <span className="font-semibold text-slate-950 ml-1 print:text-black">{basic.age ? `${basic.age} 歲` : '-'}</span>
          </div>
          <div className="p-1.5 col-span-1 print:bg-white">
            <span className="font-bold text-slate-700 print:text-black">病歷號：</span>
            <span className="font-semibold text-slate-950 ml-1 print:text-black">{basic.chartNumber || '-'}</span>
          </div>
          <div className="p-1.5 col-span-2 print:bg-white">
            <span className="font-bold text-slate-700 print:text-black">孕產史：</span>
            <span className="font-bold text-slate-950 ml-1 print:text-black">
              {basic.gravidaPara || `G${basic.gravida || '-'}P${basic.para || '-'}`} / GA: {basic.gestationalAge || '-'}
            </span>
          </div>
        </div>

        {/* Section 1: 入院基本途徑與評估時間 */}
        <div className="border border-slate-900 rounded-xs overflow-hidden print:bg-white">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[11px] flex justify-between print:bg-black print:text-white">
            <span>一、入院途徑與評估時間 (Admission Route & Timing)</span>
            <span className="text-[10px] font-normal opacity-90">Page 1 of 1 (評估表)</span>
          </div>
          <div className="p-2.5 grid grid-cols-2 gap-y-2 gap-x-4 print:bg-white">
            <div>
              <span className="font-bold text-slate-800 print:text-black">入病房時間：</span>
              <span className="font-semibold text-slate-950 ml-1 print:text-black">
                {adm.roomInDateTime ? adm.roomInDateTime.replace('T', ' ') : '—'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800 print:text-black">評估時間：</span>
              <span className="font-semibold text-slate-950 ml-1 print:text-black">
                {adm.assessmentDateTime ? adm.assessmentDateTime.replace('T', ' ') : '—'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800 print:text-black">入院方式：</span>
              <span className="ml-1">
                {renderCheckGroup(['步行', '輪椅', '推床', '其他'], adm.admissionMode)}
                {adm.admissionMode === '其他' && adm.admissionModeOther && (
                  <span className="font-semibold ml-1">({adm.admissionModeOther})</span>
                )}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-800 print:text-black">入院來源：</span>
              <span className="ml-1">
                {renderCheckGroup(['OPD', 'ER', 'Refer', '其他'], adm.admissionSource)}
                {adm.admissionSource === '其他' && adm.admissionSourceOther && (
                  <span className="font-semibold ml-1">({adm.admissionSourceOther})</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: BMI 與體格發育指標 */}
        <div className="border border-slate-900 rounded-xs overflow-hidden print:bg-white">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[11px] print:bg-black print:text-white">
            二、身高、體重與孕期 BMI 評估 (Anthropometrics & BMI)
          </div>
          <div className="grid grid-cols-6 divide-x divide-slate-400 border-b border-slate-400 text-center text-[10.5px]">
            <div className="bg-slate-100 print:bg-white p-1 font-bold">身高 (cm)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">孕前體重 (kg)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">目前體重 (kg)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">孕期理想體重</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">體重增加 (kg)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">計算 BMI</div>
          </div>
          <div className="grid grid-cols-6 divide-x divide-slate-400 text-center font-bold text-[11px] py-1.5 bg-white print:bg-white">
            <div>{adm.height ? `${adm.height} cm` : '—'}</div>
            <div>{adm.prePregnancyWeight ? `${adm.prePregnancyWeight} kg` : '—'}</div>
            <div>{adm.currentWeight ? `${adm.currentWeight} kg` : '—'}</div>
            <div>{adm.idealWeight ? `${adm.idealWeight} kg` : '—'}</div>
            <div className="text-blue-900 print:text-black">
              {adm.weightGain ? `+${adm.weightGain} kg` : '—'}
            </div>
            <div className="text-blue-950 print:text-black">{adm.bmi || '—'}</div>
          </div>
        </div>

        {/* Section 3: 入院生命徵象 (Vital Signs) */}
        <div className="border border-slate-900 rounded-xs overflow-hidden print:bg-white">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[11px] print:bg-black print:text-white">
            三、入院生命徵象 (Admission Vital Signs)
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-400 border-b border-slate-400 text-center text-[10.5px]">
            <div className="bg-slate-100 print:bg-white p-1 font-bold">體溫 T (°C)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">脈搏 P (bpm)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">呼吸 R (次/分)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">血壓 BP (mmHg)</div>
            <div className="bg-slate-100 print:bg-white p-1 font-bold">血氧 SpO2 (%)</div>
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-400 text-center font-bold text-[11px] py-1.5 bg-white print:bg-white">
            <div>{adm.vitalSigns?.temperature ? `${adm.vitalSigns.temperature} °C` : '—'}</div>
            <div>{adm.vitalSigns?.pulse ? `${adm.vitalSigns.pulse} bpm` : '—'}</div>
            <div>{adm.vitalSigns?.respiration ? `${adm.vitalSigns.respiration} 次/分` : '—'}</div>
            <div>
              {adm.vitalSigns?.systolicBP && adm.vitalSigns?.diastolicBP
                ? `${adm.vitalSigns.systolicBP} / ${adm.vitalSigns.diastolicBP} mmHg`
                : '—'}
            </div>
            <div>{adm.vitalSigns?.spO2 ? `${adm.vitalSigns.spO2} %` : '—'}</div>
          </div>
        </div>

        {/* Section 4: 個人社會心理背景 (教育、職業、宗教、禁忌、語言) */}
        <div className="border border-slate-900 rounded-xs overflow-hidden print:bg-white">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[11px] print:bg-black print:text-white">
            四、個人社會心理與文化背景 (Psychosocial & Cultural Background)
          </div>
          <div className="p-2.5 space-y-2 text-[10.5px] print:bg-white">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-800 print:text-black">教育程度：</span>
                <span className="ml-1">
                  {renderCheckGroup(
                    ['不識字', '國小', '國中', '高中', '專科', '大學', '研究所（以上）', '其他'],
                    adm.education
                  )}
                  {adm.education === '其他' && adm.educationOther && ` (${adm.educationOther})`}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">職業別：</span>
                <span className="font-semibold text-slate-950 ml-1 print:text-black">{adm.occupation || '無特別說明'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-1.5">
              <div>
                <span className="font-bold text-slate-800 print:text-black">宗教信仰：</span>
                <span className="ml-1">
                  {renderCheckGroup(
                    ['無', '佛教', '道教', '基督教', '天主教', '一貫道', '回教', '其他'],
                    adm.religion
                  )}
                  {adm.religion === '其他' && adm.religionOther && ` (${adm.religionOther})`}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">特殊禁忌：</span>
                <span className="ml-1">
                  {renderCheckGroup(['無', '不輸血', '食物禁忌', '其他'], adm.taboos)}
                  {adm.foodTabooDetails && <span className="ml-1 font-semibold">[{adm.foodTabooDetails}]</span>}
                  {adm.tabooOther && <span className="ml-1 font-semibold">[{adm.tabooOther}]</span>}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-1.5">
              <span className="font-bold text-slate-800 print:text-black">溝通語言：</span>
              <span className="ml-1">
                {renderCheckGroup(
                  ['中文', '英文', '台語', '客語', '印尼語', '越南語', '菲律賓語', '日語', '其他'],
                  adm.languages
                )}
                {adm.languageOther && <span className="ml-1 font-semibold">({adm.languageOther})</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: 血型、輸血史、婦科與過敏紀錄 */}
        <div className="border border-slate-900 rounded-xs overflow-hidden print:bg-white">
          <div className="bg-slate-900 text-white px-2 py-1 font-bold text-[11px] print:bg-black print:text-white">
            五、血型、輸血史、婦產科病史與過敏反應 (Clinical History & Allergies)
          </div>
          <div className="p-2.5 space-y-2 text-[10.5px] print:bg-white">
            {/* 血型 & 輸血 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-800 print:text-black">病人血型：</span>
                <span className="font-black text-slate-950 ml-1 print:text-black">
                  {adm.patientBloodType} 型 (RH {adm.patientRh})
                </span>
                <span className="font-bold text-slate-800 ml-4 print:text-black">配偶血型：</span>
                <span className="font-black text-slate-950 ml-1 print:text-black">
                  {adm.spouseBloodType} 型 (RH {adm.spouseRh})
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">輸血經驗：</span>
                <span className="ml-1">{renderCheckGroup(['有', '無'], adm.bloodTransfusionHistory)}</span>
                <span className="font-bold text-slate-800 ml-3 print:text-black">反應：</span>
                <span className="ml-1">{renderCheckGroup(['有', '無'], adm.bloodTransfusionReaction)}</span>
                {adm.bloodTransfusionReactionDetails && (
                  <span className="font-semibold ml-1">({adm.bloodTransfusionReactionDetails})</span>
                )}
              </div>
            </div>

            {/* 月經、LMP、EDC、抹片 */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-1.5">
              <div>
                <span className="font-bold text-slate-800 print:text-black">月經狀況：</span>
                <span className="ml-1">{renderCheckGroup(['規則', '不規則', '已停經'], adm.menstrualStatus)}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">LMP：</span>
                <span className="font-semibold text-slate-950 ml-1 print:text-black">{adm.lmp || '—'}</span>
                <span className="font-bold text-slate-800 ml-2 print:text-black">EDC：</span>
                <span className="font-semibold text-slate-950 ml-1 print:text-black">{adm.edc || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">抹片檢查：</span>
                <span className="ml-1">{renderCheckGroup(['有（定期）', '有（不定期）', '無'], adm.papSmear)}</span>
              </div>
            </div>

            {/* 過敏史、乳房檢查、菸酒 */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-1.5">
              <div>
                <span className="font-bold text-slate-800 print:text-black">藥物過敏：</span>
                <span className="ml-1">{renderCheckGroup(['有', '無'], adm.drugAllergy)}</span>
                {adm.drugAllergy === '有' && adm.drugAllergyDetails && (
                  <span className="font-bold text-red-700 print:text-black ml-1">
                    [{adm.drugAllergyDetails}]
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">食物過敏：</span>
                <span className="ml-1">{renderCheckGroup(['有', '無'], adm.foodAllergy)}</span>
                {adm.foodAllergy === '有' && adm.foodAllergyDetails && (
                  <span className="font-bold text-amber-800 print:text-black ml-1">
                    [{adm.foodAllergyDetails}]
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-1.5">
              <div className="col-span-1">
                <span className="font-bold text-slate-800 print:text-black">乳房自我檢查：</span>
                <span className="ml-1">
                  {renderCheckGroup(['無', '有（正常）', '有（有硬塊）', '有（有分泌物）'], adm.breastSelfExam)}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">抽菸史：</span>
                <span className="font-semibold text-slate-950 ml-1 print:text-black">{adm.smoking || '無'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 print:text-black">飲酒史：</span>
                <span className="font-semibold text-slate-950 ml-1 print:text-black">{adm.alcohol || '無'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures & Print Date/Time */}
      <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between text-[10.5px]">
        <div>
          <span className="font-bold text-slate-700 print:text-black">評估護理師 / 實習護生簽章：</span>
          <span className="font-bold text-slate-950 ml-2 border-b border-slate-500 pb-0.5 inline-block min-w-[120px] print:text-black">
            {intern.studentName || '護理實習生'}
          </span>
        </div>
        <div>
          <span className="font-bold text-slate-700 print:text-black">臨床實習指導教師 / 護理長簽核：</span>
          <span className="font-bold text-slate-950 ml-2 border-b border-slate-500 pb-0.5 inline-block min-w-[120px] print:text-black">
            {intern.instructor || '臨床教師'}
          </span>
        </div>
        <div className="text-right text-slate-600 print:text-black text-[9.5px] font-medium">
          入院評估表 · 列印時間：{currentFormattedTime}
        </div>
      </div>
    </div>
  );
};
