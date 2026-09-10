import React from 'react';
import { X, BookOpen, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { CLINICAL_TERMS } from '../data/clinicalTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalToolsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">產科護理臨床評估量表與指引手冊</h3>
              <p className="text-xs text-slate-500 font-medium">五專產科實習常用評估標準與臨床依據</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          
          {/* 1. REEDA Scale */}
          <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60">
            <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              會陰傷口 REEDA 評估量表 (0 - 15 分)
            </h4>
            <p className="text-slate-600 mb-3 font-medium">
              每一項評分為 0 ~ 3 分，總分愈高代表傷口發炎感染或癒合不良程度愈高。
            </p>

            <div className="space-y-2">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">R - Redness (發紅)：</span>
                <span className="text-slate-600 font-medium"> 0分:無 / 1分:傷口兩側小於0.25cm / 2分:兩側大於0.25cm / 3分:廣泛發紅</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">E - Edema (水腫)：</span>
                <span className="text-slate-600 font-medium"> 0分:無 / 1分:小於1cm / 2分:1~2cm / 3分:大於2cm或擴及陰唇</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">E - Ecchymosis (瘀斑)：</span>
                <span className="text-slate-600 font-medium"> 0分:無 / 1分:兩側&lt;0.25cm或單側&lt;0.5cm / 2分:兩側0.25~1cm / 3分:兩側&gt;1cm</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">D - Discharge (分泌物)：</span>
                <span className="text-slate-600 font-medium"> 0分:無 / 1分:血清樣 / 2分:漿液血性 / 3分:化膿性惡臭分泌物</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900">A - Approximation (傷口癒合密合度)：</span>
                <span className="text-slate-600 font-medium"> 0分:密合緊密 / 1分:皮膚分離≤3mm / 2分:皮膚及皮下分離 / 3分:筋膜深層裂開</span>
              </div>
            </div>
          </div>

          {/* 2. Apgar Score */}
          <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60">
            <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-blue-600" />
              新生兒阿帕嘉評分表 (Apgar Score: 0 - 10 分)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                    <th className="p-2.5">評估項目</th>
                    <th className="p-2.5">0 分</th>
                    <th className="p-2.5">1 分</th>
                    <th className="p-2.5">2 分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">心跳 (Heart Rate)</td>
                    <td className="p-2.5">無心跳</td>
                    <td className="p-2.5">&lt; 100 次/分</td>
                    <td className="p-2.5">&ge; 100 次/分</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">呼吸 (Respiratory)</td>
                    <td className="p-2.5">無呼吸</td>
                    <td className="p-2.5">緩慢、不規則、微弱哭聲</td>
                    <td className="p-2.5">呼吸良好、哭聲宏亮</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">肌肉張力 (Muscle Tone)</td>
                    <td className="p-2.5">四肢鬆弛軟弱</td>
                    <td className="p-2.5">四肢微屈</td>
                    <td className="p-2.5">四肢活動良好、屈曲有力</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">反射反應 (Reflex)</td>
                    <td className="p-2.5">刺激無反應</td>
                    <td className="p-2.5">皺眉、微弱動作</td>
                    <td className="p-2.5">打噴嚏、咳嗽、用力哭泣</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">皮膚顏色 (Color)</td>
                    <td className="p-2.5">全身發紺或蒼白</td>
                    <td className="p-2.5">身體粉紅、四肢發紺</td>
                    <td className="p-2.5">全身粉紅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Postpartum Lochia & Fundal Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60">
              <h5 className="font-bold text-slate-900 mb-2">子宮底高度復舊進度 (Fundal Involution)</h5>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside font-medium">
                <li><span className="font-semibold text-slate-800">分娩當日：</span>平臍 (U/U) 或臍下一指 (U-1)</li>
                <li><span className="font-semibold text-slate-800">產後第 1-9 天：</span>每日約下降 1 橫指 (約 1 cm)</li>
                <li><span className="font-semibold text-slate-800">產後第 10-14 天：</span>降入骨盆腔內，腹部已觸摸不到</li>
                <li><span className="font-semibold text-slate-800">產後 6 週：</span>恢復至未懷孕大小 (約 50-60g)</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/60">
              <h5 className="font-bold text-slate-900 mb-2">惡露性質分期 (Lochia Stages)</h5>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside font-medium">
                <li><span className="font-semibold text-slate-800">紅惡露 (Rubra)：</span>產後 1-3 天，暗紅或鮮紅，含血液、蛻膜碎片</li>
                <li><span className="font-semibold text-slate-800">漿惡露 (Serosa)：</span>產後 4-10 天，淡粉紅或褐色，含漿液、紅血球、白血球</li>
                <li><span className="font-semibold text-slate-800">白惡露 (Alba)：</span>產後 10-14 天至數週，淡黃或乳白色，主要為白血球、上皮細胞</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            關閉視窗
          </button>
        </div>

      </div>
    </div>
  );
};
