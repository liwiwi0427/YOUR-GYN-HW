import React from 'react';
import { AlertTriangle, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  caseName?: string;
  bedNumber?: string;
}

export const ResetConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  caseName,
  bedNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Warning Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/70 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                二次確認：重置當前表單？
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                此操作將清空目前個案所有填寫欄位
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-500">目前重置目標：</span>
            <strong className="text-slate-900 font-bold ml-1">
              {bedNumber ? `[${bedNumber} 床] ` : ''}{caseName || '未命名個案'}
            </strong>
          </div>

          <p>
            執行重置後，系統將<strong>清除基本資料、生產記錄、新生兒狀況、身心評估、DART 焦點記錄及手寫簽章</strong>，並還原為全新空白表單結構。
          </p>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 text-[11.5px]">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>若需保留現有填寫內容，建議您先點擊「複製個案」或「匯出 JSON 備份」。</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            取消保留
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>確定清空並重置表單</span>
          </button>
        </div>

      </div>
    </div>
  );
};
