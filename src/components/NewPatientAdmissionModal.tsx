import React from 'react';
import { ClipboardCheck, UserPlus, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hasAdmissionAssessment: boolean) => void;
}

export const NewPatientAdmissionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">新增個案 / 床位</h3>
              <p className="text-xs text-blue-100 mt-0.5">入院護理評估確認流程</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-900">
            <ClipboardCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm mb-1 text-blue-950">是否已進行「入院護理評估」？</p>
              <p className="text-blue-800">
                若該產婦為剛辦理入院之新個案，系統可自動為您啟用完整的<strong>「產科入院護理評估表」</strong>（包含入院來源、BMI、生命徵象、過敏史、血型與產前檢查紀錄等）。
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {/* Option: Yes, with admission assessment */}
            <button
              id="btn-confirm-with-admission"
              type="button"
              onClick={() => onConfirm(true)}
              className="w-full group flex items-center justify-between p-3.5 rounded-xl border-2 border-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white text-slate-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white group-hover:bg-white group-hover:text-blue-600 flex items-center justify-center font-bold text-xs transition-colors shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs group-hover:text-white text-blue-950">是，已進行（啟用入院評估表）</div>
                  <div className="text-[11px] text-slate-500 group-hover:text-blue-100">新增個案並立即進入「入院護理評估」填寫</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:text-white pl-2">選擇 &rarr;</span>
            </button>

            {/* Option: No, basic handover only */}
            <button
              id="btn-confirm-without-admission"
              type="button"
              onClick={() => onConfirm(false)}
              className="w-full group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 group-hover:bg-slate-300 flex items-center justify-center font-bold text-xs transition-colors shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">否，暫無（直接新增一般病歷）</div>
                  <div className="text-[11px] text-slate-500">僅建立標準產科交班記錄表（可隨時手動補填）</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-700 pl-2">選擇 &rarr;</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
