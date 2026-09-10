import React from 'react';
import { HandoverRecord } from '../../types';
import { FileText } from 'lucide-react';
import { ClockButton } from '../ClockButton';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const DartSection: React.FC<Props> = ({ record, onChange }) => {
  const updateNursingRecord = (field: keyof HandoverRecord['nursingRecord'], value: string) => {
    onChange((prev) => ({
      ...prev,
      nursingRecord: {
        ...prev.nursingRecord,
        [field]: value,
      },
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">護理記錄</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              焦點記錄法 (D-A-R-T)：D (資料 Data) • A (行動 Action) • R (反應 Response) • T (指導 Teaching)
            </p>
          </div>
        </div>
      </div>

      {/* Header Info: 時間 & 焦點 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">
              記錄時間 <span className="text-rose-500">*</span>
            </label>
            <ClockButton
              id="btn-clock-dart-time"
              format="datetime"
              onInsert={(val) => updateNursingRecord('time', val)}
            />
          </div>
          <input
            id="input-dart-time"
            type="text"
            placeholder="YYYY-MM-DD HH:mm"
            value={record.nursingRecord.time}
            onChange={(e) => updateNursingRecord('time', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1.5">
            護理焦點 <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-dart-focus"
            type="text"
            placeholder="例：母乳哺餵指導與技巧建立"
            value={record.nursingRecord.focus}
            onChange={(e) => updateNursingRecord('focus', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 bg-white"
          />
        </div>
      </div>

      {/* D-A-R-T 4 Structured Textareas */}
      <div className="space-y-4 pt-2">
        
        {/* 1. D (Data) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
              D
            </span>
            <span className="font-bold text-xs text-slate-900">
              Data 資料：
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              包括主觀（病人描述）與客觀（生命徵象、檢查結果、護理觀察）資料，用以支持該焦點問題。
            </span>
          </div>
          <textarea
            id="textarea-dart-data"
            rows={3}
            placeholder="S (主觀): 個案主訴...&#10;O (客觀): 生命徵象、子宮/傷口/乳房評估客觀數據..."
            value={record.nursingRecord.data}
            onChange={(e) => updateNursingRecord('data', e.target.value)}
            className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 resize-y bg-white"
          />
        </div>

        {/* 2. A (Action) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              A
            </span>
            <span className="font-bold text-xs text-slate-900">
              Action 護理行動：
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              護理人員為處理該焦點問題所採取的立即或持續的措施，如給藥、通知醫師、翻身等。
            </span>
          </div>
          <textarea
            id="textarea-dart-action"
            rows={3}
            placeholder="1. 評估...&#10;2. 協助體位調整或處置...&#10;3. 依醫囑給予處置..."
            value={record.nursingRecord.action}
            onChange={(e) => updateNursingRecord('action', e.target.value)}
            className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 resize-y bg-white"
          />
        </div>

        {/* 3. R (Response) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              R
            </span>
            <span className="font-bold text-xs text-slate-900">
              Response 反應：
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              病人對護理行動後的反應、病情評估結果。
            </span>
          </div>
          <textarea
            id="textarea-dart-response"
            rows={3}
            placeholder="1. 處置後病人主訴改善情形、疼痛指數變化...&#10;2. 病人/家屬能正確複述或示範衛生教育內容..."
            value={record.nursingRecord.response}
            onChange={(e) => updateNursingRecord('response', e.target.value)}
            className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 resize-y bg-white"
          />
        </div>

        {/* 4. T (Teaching) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              T
            </span>
            <span className="font-bold text-xs text-slate-900">
              Teaching 指導：
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              對病人或家屬所進行的衛生教育及相關指導。
            </span>
          </div>
          <textarea
            id="textarea-dart-teaching"
            rows={3}
            placeholder="1. 衛教母乳哺餵技巧/會陰清潔/束腹帶使用/痛感緩解...&#10;2. 衛教返家照護與警訊徵象..."
            value={record.nursingRecord.teaching}
            onChange={(e) => updateNursingRecord('teaching', e.target.value)}
            className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 resize-y bg-white"
          />
        </div>

      </div>

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="dart"
        sectionTitle="護理記錄"
        record={record}
        onChange={onChange}
        quickTags={['📌 焦點(Focus)明確性', '💡 Data 主客觀數據佐證', '⚠️ Action 處置具體時間點', '🔄 Teaching 衛教成效評值']}
      />
    </section>
  );
};
