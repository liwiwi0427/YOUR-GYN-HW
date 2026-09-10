import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { HandoverRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: HandoverRecord;
}

export const IsbarModal: React.FC<Props> = ({ isOpen, onClose, record }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isNsd = !record.deliveryProcess.deliveryMode.includes('剖腹') && !record.deliveryProcess.deliveryMode.includes('C/S');

  // Construct ISBAR Script
  const introText = `【I - Introduction 介紹】\n學姐好，我是實習學生 ${record.internship.studentName || '陳同學'}，向您交班 ${record.basicInfo.bedNumber || '502-1'} 床 ${record.basicInfo.patientName || '產婦'}。`;

  const situationText = `【S - Situation 現況】\n個案診斷為 ${record.basicInfo.diagnosis || 'Term Pregnancy with NSD'}，於 ${record.basicInfo.deliveryDate || '昨日'} 經 ${record.deliveryProcess.deliveryMode || '自然產'} 娩出一 ${record.babyStatus.weight ? `${record.babyStatus.weight}g` : '3180g'} 嬰兒。目前為產後休養中，生命徵象穩定。`;

  const backgroundText = `【B - Background 背景】\n產科史為 ${record.basicInfo.obstetricHistory || 'G1P1'}，懷孕週數 ${record.basicInfo.gestationalWeeks || '39+3 週'}。${record.basicInfo.chronicDiseases ? `過去病史：${record.basicInfo.chronicDiseases}。` : '無特殊慢性病史。'}生產失血量約 ${record.deliveryProcess.bloodLoss || '250'} ml，胎盤重 ${record.deliveryProcess.placentaWeight || '550'} g。`;

  const assessmentText = `【A - Assessment 評估】\n1. 產婦評估：\n   - 子宮：宮底位置 ${record.maternalAssessment.uterus.fundalHeight || 'U-1'}，宮縮質地 ${record.maternalAssessment.uterus.contraction || '硬'}，位置偏 ${record.maternalAssessment.uterus.position || '中'}，宮縮痛 NRS ${record.maternalAssessment.uterus.painScore || '2'} 分。\n   - 惡露：量 ${record.maternalAssessment.uterus.lochiaAmount || '少'}，呈 ${record.maternalAssessment.uterus.lochiaColor || '暗紅'} ${record.maternalAssessment.uterus.lochiaType || '紅惡露'}，${record.maternalAssessment.uterus.bloodClots === '有' ? '有血塊' : '無血塊'}。\n   - 乳房：皮膚 ${record.maternalAssessment.breast.skinAppearance || '正常'}，質地 ${record.maternalAssessment.breast.consistency || '充盈'}，乳頭 ${record.maternalAssessment.breast.nippleShape || '凸'} 且 ${record.maternalAssessment.breast.nippleIntegrity || '完整'}，分泌初乳約 ${record.maternalAssessment.breast.lactationRightAmount || '5'}ml。\n   - 傷口：${isNsd ? `會陰傷口 (REEDA: R:${record.maternalAssessment.wound.perineal.redness || '0'}, E:${record.maternalAssessment.wound.perineal.edema || '0'}, E:${record.maternalAssessment.wound.perineal.ecchymosis || '0'}, D:${record.maternalAssessment.wound.perineal.discharge || '0'}, A:${record.maternalAssessment.wound.perineal.approximation || '0'}) 癒合良好。` : `剖腹傷口敷料乾淨乾燥，${record.maternalAssessment.wound.cesarean.pain || '活動時輕度牽拉痛'}。`}\n2. 寶寶評估：\n   - 位於 ${record.babyStatus.location || '母嬰同室'}，哺乳方式採 ${record.babyStatus.feedingType || '完全母乳'}，Apgar 評分為 ${record.babyStatus.apgar1Min || '9'} / ${record.babyStatus.apgar5Min || '10'} 分，活力吸吮良好。`;

  const recommendationText = `【R - Recommendation 建議與交班事項】\n${record.handoverNotes ? record.handoverNotes : '1. 持續追蹤自解小便與子宮收縮、惡露量。\n2. 協助親餵技巧與含乳指導。\n3. 指導傷口自我照護與舒適臥位。'}\n\n焦點護理記錄 (DART)：\n焦點：${record.nursingRecord.focus || '產後照護指導'}\n${record.nursingRecord.data ? `D: ${record.nursingRecord.data.slice(0, 80)}...` : ''}`;

  const fullIsbar = `${introText}\n\n${situationText}\n\n${backgroundText}\n\n${assessmentText}\n\n${recommendationText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullIsbar);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ISBAR 標準化臨床交班稿產生器</h3>
              <p className="text-xs text-slate-500 font-medium">根據目前表單內容自動統整產科標準交班話術</p>
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
        <div className="p-6 space-y-4 text-xs">
          
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4.5 text-slate-800 leading-relaxed font-mono whitespace-pre-wrap text-xs selection:bg-blue-100">
            {fullIsbar}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            可用於實習臨床交班演練、床邊交班或交班報告
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已複製交班稿！' : '複製交班文字'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
            >
              關閉
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
