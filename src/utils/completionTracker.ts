import { HandoverRecord } from '../types';

export interface SectionProgress {
  id: string;
  label: string;
  filled: number;
  total: number;
  percentage: number;
  isComplete: boolean;
  missingItems: string[];
}

export interface RecordCompletionStats {
  totalPercentage: number;
  totalFilled: number;
  totalFields: number;
  isAllComplete: boolean;
  sections: Record<string, SectionProgress>;
}

export function calculateCompletionStats(record?: HandoverRecord | null): RecordCompletionStats {
  if (!record) {
    return {
      totalPercentage: 0,
      totalFilled: 0,
      totalFields: 0,
      isAllComplete: false,
      sections: {},
    };
  }

  const sections: Record<string, SectionProgress> = {};

  // 1. 實習資料 (Internship Header)
  const internMissing: string[] = [];
  let internFilled = 0;
  const internTotal = 5;

  if (record.internship?.unit) internFilled++; else internMissing.push('實習單位');
  if (record.internship?.studentName) internFilled++; else internMissing.push('護生姓名');
  if (record.internship?.studentId) internFilled++; else internMissing.push('護生學號');
  if (record.internship?.instructor) internFilled++; else internMissing.push('指導教師');
  if (record.internship?.week) internFilled++; else internMissing.push('實習週次');

  sections['sec-intern'] = {
    id: 'sec-intern',
    label: '實習資料',
    filled: internFilled,
    total: internTotal,
    percentage: Math.round((internFilled / internTotal) * 100),
    isComplete: internFilled === internTotal,
    missingItems: internMissing,
  };

  // 2. 基本資料 (Basic Info)
  const basicMissing: string[] = [];
  let basicFilled = 0;
  const basicTotal = 7;

  if (record.basicInfo?.bedNumber) basicFilled++; else basicMissing.push('床號');
  if (record.basicInfo?.patientName) basicFilled++; else basicMissing.push('姓名');
  if (record.basicInfo?.admissionDate) basicFilled++; else basicMissing.push('入院日期');
  if (record.basicInfo?.expectedDeliveryDate) basicFilled++; else basicMissing.push('預產日 (EDC)');
  if (record.basicInfo?.primaryDiagnosis) basicFilled++; else basicMissing.push('主診斷');
  if (record.basicInfo?.gestationalWeeks) basicFilled++; else basicMissing.push('懷孕週數');
  if (record.basicInfo?.obstetricHistory) basicFilled++; else basicMissing.push('生產史 (G/P)');

  sections['sec-basic'] = {
    id: 'sec-basic',
    label: '基本資料',
    filled: basicFilled,
    total: basicTotal,
    percentage: Math.round((basicFilled / basicTotal) * 100),
    isComplete: basicFilled === basicTotal,
    missingItems: basicMissing,
  };

  // 3. 入院評估 (Admission Assessment)
  const admMissing: string[] = [];
  let admFilled = 0;
  const admTotal = 6;
  const adm = record.admissionAssessment;

  if (adm?.enabled) {
    if (adm.roomInDateTime) admFilled++; else admMissing.push('入病房時間');
    if (adm.height) admFilled++; else admMissing.push('身高');
    if (adm.currentWeight) admFilled++; else admMissing.push('目前體重');
    if (adm.vitalSigns?.temperature && adm.vitalSigns?.pulse) admFilled++; else admMissing.push('生命徵象 (T/P/R/BP)');
    if (adm.admissionMode) admFilled++; else admMissing.push('入院方式');
    if (adm.patientBloodType) admFilled++; else admMissing.push('血型');
  } else {
    // If not enabled, treated as optional / 100% or standard
    admFilled = admTotal;
  }

  sections['sec-admission'] = {
    id: 'sec-admission',
    label: '入院評估',
    filled: admFilled,
    total: admTotal,
    percentage: Math.round((admFilled / admTotal) * 100),
    isComplete: admFilled === admTotal,
    missingItems: admMissing,
  };

  // 4. 生產過程 (Delivery Process)
  const delMissing: string[] = [];
  let delFilled = 0;
  const delTotal = 5;

  if (record.deliveryProcess?.deliveryMode) delFilled++; else delMissing.push('分娩方式');
  if (record.deliveryProcess?.deliveryTime) delFilled++; else delMissing.push('娩出時間');
  if (record.deliveryProcess?.bloodLoss) delFilled++; else delMissing.push('失血量');
  if (record.deliveryProcess?.placentaWeight) delFilled++; else delMissing.push('胎盤重量');
  if (record.deliveryProcess?.perinealLaceration || record.deliveryProcess?.cesareanDelivery?.anesthesiaMode) {
    delFilled++;
  } else {
    delMissing.push('會陰裂傷或剖腹麻醉記錄');
  }

  sections['sec-delivery'] = {
    id: 'sec-delivery',
    label: '生產過程',
    filled: delFilled,
    total: delTotal,
    percentage: Math.round((delFilled / delTotal) * 100),
    isComplete: delFilled === delTotal,
    missingItems: delMissing,
  };

  // 5. 寶寶情況 (Baby Status)
  const babyMissing: string[] = [];
  let babyFilled = 0;
  const babyTotal = 5;

  if (record.babyStatus?.weight) babyFilled++; else babyMissing.push('出生體重');
  if (record.babyStatus?.height) babyFilled++; else babyMissing.push('出生身長');
  if (record.babyStatus?.apgar1Min && record.babyStatus?.apgar5Min) babyFilled++; else babyMissing.push('Apgar Score (1分/5分)');
  if (record.babyStatus?.location) babyFilled++; else babyMissing.push('寶寶位置');
  if (record.babyStatus?.feedingType) babyFilled++; else babyMissing.push('餵食方式');

  sections['sec-baby'] = {
    id: 'sec-baby',
    label: '寶寶情況',
    filled: babyFilled,
    total: babyTotal,
    percentage: Math.round((babyFilled / babyTotal) * 100),
    isComplete: babyFilled === babyTotal,
    missingItems: babyMissing,
  };

  // 6. 產婦身心評估 (Maternal Assessment)
  const matMissing: string[] = [];
  let matFilled = 0;
  const matTotal = 4;

  if (record.maternalAssessment?.breast?.consistency) matFilled++; else matMissing.push('乳房軟硬度');
  if (record.maternalAssessment?.uterus?.fundalHeight) matFilled++; else matMissing.push('宮底高度');
  if (record.maternalAssessment?.uterus?.contraction) matFilled++; else matMissing.push('子宮收縮狀況');
  if (record.maternalAssessment?.uterus?.lochiaAmount) matFilled++; else matMissing.push('惡露量/顏色');

  sections['sec-maternal'] = {
    id: 'sec-maternal',
    label: '產婦評估',
    filled: matFilled,
    total: matTotal,
    percentage: Math.round((matFilled / matTotal) * 100),
    isComplete: matFilled === matTotal,
    missingItems: matMissing,
  };

  // 7. 傷口臨床評估 (Wound Assessment)
  const woundMissing: string[] = [];
  let woundFilled = 0;
  const woundTotal = 2;

  if (record.maternalAssessment?.wound?.assessmentTime) woundFilled++; else woundMissing.push('傷口評估時間');
  if (
    record.maternalAssessment?.wound?.perineal?.redness !== undefined ||
    record.maternalAssessment?.wound?.cesarean?.color
  ) {
    woundFilled++;
  } else {
    woundMissing.push('REEDA評估或剖腹傷口');
  }

  sections['sec-wound'] = {
    id: 'sec-wound',
    label: '傷口評估',
    filled: woundFilled,
    total: woundTotal,
    percentage: Math.round((woundFilled / woundTotal) * 100),
    isComplete: woundFilled === woundTotal,
    missingItems: woundMissing,
  };

  // 8. 交班事項 (Handover Notes)
  const notesMissing: string[] = [];
  let notesFilled = 0;
  const notesTotal = 1;

  if (record.handoverNotes && record.handoverNotes.trim().length > 5) {
    notesFilled++;
  } else {
    notesMissing.push('重點交班注意事項');
  }

  sections['sec-notes'] = {
    id: 'sec-notes',
    label: '交班事項',
    filled: notesFilled,
    total: notesTotal,
    percentage: Math.round((notesFilled / notesTotal) * 100),
    isComplete: notesFilled === notesTotal,
    missingItems: notesMissing,
  };

  // 9. DART記錄 (DART Nursing Record)
  const dartMissing: string[] = [];
  let dartFilled = 0;
  const dartTotal = 5;

  if (record.nursingRecord?.focus) dartFilled++; else dartMissing.push('焦點問題 (Focus)');
  if (record.nursingRecord?.data) dartFilled++; else dartMissing.push('D (Data資料)');
  if (record.nursingRecord?.action) dartFilled++; else dartMissing.push('A (Action處置)');
  if (record.nursingRecord?.response) dartFilled++; else dartMissing.push('R (Response反應)');
  if (record.nursingRecord?.teaching) dartFilled++; else dartMissing.push('T (Teaching指導)');

  sections['sec-dart'] = {
    id: 'sec-dart',
    label: 'DART記錄',
    filled: dartFilled,
    total: dartTotal,
    percentage: Math.round((dartFilled / dartTotal) * 100),
    isComplete: dartFilled === dartTotal,
    missingItems: dartMissing,
  };

  // 10. 實習簽章 (Signature Section)
  const sigMissing: string[] = [];
  let sigFilled = 0;
  const sigTotal = 2;

  if (record.signatures?.studentSignature) sigFilled++; else sigMissing.push('實習護生手寫簽名');
  if (record.signatures?.instructorSignature) sigFilled++; else sigMissing.push('指導教師評閱簽章');

  sections['sec-signature'] = {
    id: 'sec-signature',
    label: '實習簽章',
    filled: sigFilled,
    total: sigTotal,
    percentage: Math.round((sigFilled / sigTotal) * 100),
    isComplete: sigFilled === sigTotal,
    missingItems: sigMissing,
  };

  // Calculate Overall
  let totalFilled = 0;
  let totalFields = 0;
  Object.values(sections).forEach((sec) => {
    totalFilled += sec.filled;
    totalFields += sec.total;
  });

  const totalPercentage = Math.round((totalFilled / totalFields) * 100);

  return {
    totalPercentage,
    totalFilled,
    totalFields,
    isAllComplete: totalFilled === totalFields,
    sections,
  };
}
