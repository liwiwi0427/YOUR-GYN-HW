import React from 'react';
import { HandoverRecord } from '../../types';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { SectionClinicalTip } from './SectionClinicalTip';

interface Props {
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
}

export const HandoverSection: React.FC<Props> = ({ record, onChange }) => {
  const updateHandoverNotes = (value: string) => {
    onChange((prev) => ({
      ...prev,
      handoverNotes: value,
    }));
  };

  const quickPhrases = [
    '生命徵象穩定，自解小便順暢無餘尿感。',
    '母嬰同室親餵中，含乳良好，定時指導換邊。',
    '指導會陰沖洗瓶 (溫開水由前向後) 與保持乾燥。',
    '今日開始溫水坐浴 (Sitz bath) 每日 3-4 次。',
    '留置導尿管已拔除，注意 6 小時內自解小便時間。',
    '束腹帶使用中，下床活動時注意預防跌倒。',
    '排氣後已試水，採清淡低渣飲食。',
    '新生兒黃疸照光治療中，定時監測經皮黃疸指數 (TcB)。',
  ];

  const handleAppendPhrase = (phrase: string) => {
    const current = record.handoverNotes.trim();
    if (!current) {
      updateHandoverNotes(`1. ${phrase}`);
    } else {
      const lines = current.split('\n');
      const nextNum = lines.length + 1;
      updateHandoverNotes(`${current}\n${nextNum}. ${phrase}`);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shadow-2xs">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">交班重點注意事項</h3>
            <p className="text-[11px] text-slate-500 font-medium">記錄交班重點事項、管路、藥物與特殊照護追蹤</p>
          </div>
        </div>
      </div>

      {/* Quick Insert Phrases */}
      <div className="mb-3.5 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-2">
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>常用交班重點快速插入：</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAppendPhrase(phrase)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors text-left shadow-2xs font-medium"
            >
              + {phrase}
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          id="textarea-handoverNotes"
          rows={6}
          placeholder="填寫產婦與新生兒今日生命徵象、特殊管路 (IV/Foley)、飲食進展、排泄與自解小便、用藥追蹤、特需照護交班事項..."
          value={record.handoverNotes}
          onChange={(e) => updateHandoverNotes(e.target.value)}
          className="w-full p-3.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 leading-relaxed resize-y bg-white"
        />
      </div>

      {/* 臨床小叮嚀 (數位版專屬) */}
      <SectionClinicalTip
        sectionKey="handover"
        sectionTitle="交班重點"
        record={record}
        onChange={onChange}
        quickTags={['📌 ISBAR 重點掌握', '💡 待追蹤抽血與檢查', '⚠️ 醫師醫囑更新', '🔄 出院衛教進度']}
      />
    </section>
  );
};
