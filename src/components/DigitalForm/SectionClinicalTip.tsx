import React, { useState } from 'react';
import { HandoverRecord } from '../../types';
import { Lightbulb, Sparkles, ChevronDown, ChevronUp, Check, Info, Eraser } from 'lucide-react';

interface Props {
  sectionKey: string;
  sectionTitle: string;
  record: HandoverRecord;
  onChange: (updater: (prev: HandoverRecord) => HandoverRecord) => void;
  placeholder?: string;
  quickTags?: string[];
}

const DEFAULT_QUICK_TAGS = [
  '📌 護理觀察重點',
  '💡 個案特殊護理提醒',
  '⚠️ 臨床警示與異常追蹤',
  '🔄 次班交接重點',
  '🎯 衛教與指導反思',
];

export const SectionClinicalTip: React.FC<Props> = ({
  sectionKey,
  sectionTitle,
  record,
  onChange,
  placeholder,
  quickTags = DEFAULT_QUICK_TAGS,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const currentValue = record.clinicalTips?.[sectionKey] || '';

  const handleUpdateTip = (val: string) => {
    onChange((prev) => ({
      ...prev,
      clinicalTips: {
        ...(prev.clinicalTips || {}),
        [sectionKey]: val,
      },
    }));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleInsertTag = (tag: string) => {
    const prefix = currentValue ? (currentValue.endsWith('\n') ? `${tag}：` : `\n${tag}：`) : `${tag}：`;
    handleUpdateTip(currentValue + prefix);
  };

  const handleClear = () => {
    if (!currentValue) return;
    if (window.confirm(`確定要清除【${sectionTitle}】的臨床小叮嚀筆記嗎？`)) {
      handleUpdateTip('');
    }
  };

  const defaultPlaceholder = `在此記錄本個案在【${sectionTitle}】之臨床重點叮嚀、護理觀察、指導老師提醒或實習反思...（此欄位僅於數位版顯示，不影響正式 A4 列印格式）`;

  return (
    <div 
      id={`clinical-tip-box-${sectionKey}`}
      className="mt-5 pt-4 border-t border-amber-200/60 print:hidden"
    >
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 rounded-xl border border-amber-200/90 p-3.5 sm:p-4 shadow-2xs transition-all duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-amber-200/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-amber-950">
                臨床小叮嚀 ({sectionTitle})
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/90 text-amber-800 border border-amber-200">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                數位版專屬 · 不影響 A4 列印
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {currentValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors inline-flex items-center gap-1"
                title="清除此區叮嚀"
              >
                <Eraser className="w-3 h-3" />
                <span className="hidden sm:inline">清除</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-amber-800 hover:text-amber-950 p-1 rounded-md hover:bg-amber-200/50 transition-colors"
              title={isExpanded ? '收合筆記' : '展開筆記'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed summary indicator */}
        {!isExpanded && currentValue && (
          <div 
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer text-xs text-amber-900 bg-amber-100/50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200/70 truncate flex items-center justify-between"
          >
            <span className="truncate font-medium">{currentValue}</span>
            <span className="text-[10px] text-amber-700 font-semibold shrink-0 ml-2">點擊展開</span>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-2.5">
            {/* Quick Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-amber-900/80 mr-0.5">快速範本：</span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-white/90 hover:bg-amber-100 text-amber-900 border border-amber-200 hover:border-amber-300 font-medium transition-colors shadow-2xs active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Note Textarea */}
            <div className="relative">
              <textarea
                id={`textarea-clinical-tip-${sectionKey}`}
                rows={2}
                value={currentValue}
                onChange={(e) => handleUpdateTip(e.target.value)}
                placeholder={placeholder || defaultPlaceholder}
                className="w-full bg-white/95 text-slate-800 text-xs sm:text-[13px] rounded-lg p-2.5 border border-amber-300/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/40 focus:outline-none placeholder:text-slate-400 font-normal leading-relaxed transition-all resize-y min-h-[64px]"
              />
            </div>

            {/* Footer Bar */}
            <div className="flex items-center justify-between text-[11px] text-amber-800/80">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px]">
                <Info className="w-3 h-3 text-amber-600 shrink-0" />
                <span>學生可在此記錄學習反思、指導老師點評或交接重點，列印時將自動隱藏。</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {justSaved && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 animate-fade-in text-[10px]">
                    <Check className="w-3 h-3 text-emerald-600" /> 已暫存
                  </span>
                )}
                <span className="text-[10px] font-mono text-amber-900/60 font-medium">
                  {currentValue.length} 字
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
