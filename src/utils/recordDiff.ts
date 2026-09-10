import { HandoverRecord } from '../types';

export interface FieldDiff {
  fieldKey: string;
  section: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
  isChanged: boolean;
}

export interface RecordDiffResult {
  hasDiff: boolean;
  totalChanges: number;
  changedKeys: Set<string>;
  diffMap: Record<string, FieldDiff>;
  diffList: FieldDiff[];
}

/**
 * Compare two handover records and identify modified/differing fields
 */
export function compareHandoverRecords(
  current: HandoverRecord | null | undefined,
  baseline: HandoverRecord | null | undefined
): RecordDiffResult {
  if (!current || !baseline || current.id === baseline.id) {
    return {
      hasDiff: false,
      totalChanges: 0,
      changedKeys: new Set(),
      diffMap: {},
      diffList: [],
    };
  }

  const diffList: FieldDiff[] = [];
  const changedKeys = new Set<string>();
  const diffMap: Record<string, FieldDiff> = {};

  function checkField(
    fieldKey: string,
    section: string,
    fieldLabel: string,
    curVal: any,
    baseVal: any
  ) {
    const curStr = curVal !== undefined && curVal !== null ? String(curVal).trim() : '';
    const baseStr = baseVal !== undefined && baseVal !== null ? String(baseVal).trim() : '';

    if (curStr !== baseStr) {
      const diff: FieldDiff = {
        fieldKey,
        section,
        fieldLabel,
        oldValue: baseStr,
        newValue: curStr,
        isChanged: true,
      };
      diffList.push(diff);
      changedKeys.add(fieldKey);
      diffMap[fieldKey] = diff;
    }
  }

  // 1. Internship Info
  checkField('internship.unit', '實習資訊', '實習單位', current.internship?.unit, baseline.internship?.unit);
  checkField('internship.week', '實習資訊', '實習週次', current.internship?.week, baseline.internship?.week);
  checkField('internship.date', '實習資訊', '實習日期', current.internship?.date, baseline.internship?.date);

  // 2. Basic Info
  checkField('basicInfo.bedNumber', '基本資料', '床號', current.basicInfo?.bedNumber, baseline.basicInfo?.bedNumber);
  checkField('basicInfo.patientName', '基本資料', '病患姓名', current.basicInfo?.patientName, baseline.basicInfo?.patientName);
  checkField('basicInfo.admissionDate', '基本資料', '入院日期時間', current.basicInfo?.admissionDate, baseline.basicInfo?.admissionDate);
  checkField('basicInfo.expectedDeliveryDate', '基本資料', '預產日 (EDC)', current.basicInfo?.expectedDeliveryDate, baseline.basicInfo?.expectedDeliveryDate);
  checkField('basicInfo.deliveryDate', '基本資料', '生產日期時間', current.basicInfo?.deliveryDate, baseline.basicInfo?.deliveryDate);
  checkField('basicInfo.gestationalWeeks', '基本資料', '懷孕週數 (GA)', current.basicInfo?.gestationalWeeks, baseline.basicInfo?.gestationalWeeks);
  checkField('basicInfo.obstetricHistory', '基本資料', '生產史 (G/P)', current.basicInfo?.obstetricHistory, baseline.basicInfo?.obstetricHistory);
  checkField('basicInfo.primaryDiagnosis', '基本資料', '主診斷', current.basicInfo?.primaryDiagnosis, baseline.basicInfo?.primaryDiagnosis);
  
  // Secondary diagnoses
  const curSec = (current.basicInfo?.secondaryDiagnoses || []).filter(Boolean).join(', ');
  const baseSec = (baseline.basicInfo?.secondaryDiagnoses || []).filter(Boolean).join(', ');
  checkField('basicInfo.secondaryDiagnoses', '基本資料', '次診斷', curSec, baseSec);

  checkField('basicInfo.attendingPhysician', '基本資料', '主治醫師', current.basicInfo?.attendingPhysician, baseline.basicInfo?.attendingPhysician);
  checkField('basicInfo.primaryNurse', '基本資料', '主護護理師', current.basicInfo?.primaryNurse, baseline.basicInfo?.primaryNurse);
  checkField('basicInfo.admissionCourse', '基本資料', '入院經過', current.basicInfo?.admissionCourse, baseline.basicInfo?.admissionCourse);

  // 3. Admission Assessment (if enabled)
  if (current.admissionAssessment?.enabled || baseline.admissionAssessment?.enabled) {
    checkField('admissionAssessment.height', '入院評估', '身高 (cm)', current.admissionAssessment?.height, baseline.admissionAssessment?.height);
    checkField('admissionAssessment.prePregnancyWeight', '入院評估', '孕前體重 (kg)', current.admissionAssessment?.prePregnancyWeight, baseline.admissionAssessment?.prePregnancyWeight);
    checkField('admissionAssessment.currentWeight', '入院評估', '目前體重 (kg)', current.admissionAssessment?.currentWeight, baseline.admissionAssessment?.currentWeight);
    checkField('admissionAssessment.bmi', '入院評估', 'BMI', current.admissionAssessment?.bmi, baseline.admissionAssessment?.bmi);
    
    // Vital signs
    checkField('admissionAssessment.vitalSigns.temperature', '入院評估', '體溫 (°C)', current.admissionAssessment?.vitalSigns?.temperature, baseline.admissionAssessment?.vitalSigns?.temperature);
    checkField('admissionAssessment.vitalSigns.pulse', '入院評估', '脈搏 (bpm)', current.admissionAssessment?.vitalSigns?.pulse, baseline.admissionAssessment?.vitalSigns?.pulse);
    checkField('admissionAssessment.vitalSigns.respiration', '入院評估', '呼吸 (次/分)', current.admissionAssessment?.vitalSigns?.respiration, baseline.admissionAssessment?.vitalSigns?.respiration);
    checkField('admissionAssessment.vitalSigns.bp', '入院評估', '血壓 (BP)', 
      `${current.admissionAssessment?.vitalSigns?.systolicBP || ''}/${current.admissionAssessment?.vitalSigns?.diastolicBP || ''}`,
      `${baseline.admissionAssessment?.vitalSigns?.systolicBP || ''}/${baseline.admissionAssessment?.vitalSigns?.diastolicBP || ''}`
    );
    checkField('admissionAssessment.vitalSigns.spO2', '入院評估', 'SpO2 (%)', current.admissionAssessment?.vitalSigns?.spO2, baseline.admissionAssessment?.vitalSigns?.spO2);
    checkField('admissionAssessment.bloodType', '入院評估', '血型/Rh', 
      `${current.admissionAssessment?.patientBloodType || ''} ${current.admissionAssessment?.patientRh || ''}`,
      `${baseline.admissionAssessment?.patientBloodType || ''} ${baseline.admissionAssessment?.patientRh || ''}`
    );
  }

  // 4. Delivery Process
  checkField('deliveryProcess.deliveryMode', '生產過程', '分娩方式', current.deliveryProcess?.deliveryMode, baseline.deliveryProcess?.deliveryMode);
  checkField('deliveryProcess.placentaExpulsionMode', '生產過程', '胎盤剝離方式', current.deliveryProcess?.placentaExpulsionMode, baseline.deliveryProcess?.placentaExpulsionMode);
  checkField('deliveryProcess.perinealLaceration', '生產過程', '會陰裂傷程度', current.deliveryProcess?.perinealLaceration, baseline.deliveryProcess?.perinealLaceration);
  checkField('deliveryProcess.deliveryTime', '生產過程', '娩出時間', current.deliveryProcess?.deliveryTime, baseline.deliveryProcess?.deliveryTime);
  checkField('deliveryProcess.bloodLoss', '生產過程', '失血量 (EBL)', current.deliveryProcess?.bloodLoss, baseline.deliveryProcess?.bloodLoss);
  checkField('deliveryProcess.placentaWeight', '生產過程', '胎盤重量', current.deliveryProcess?.placentaWeight, baseline.deliveryProcess?.placentaWeight);

  // Natural Delivery stages
  checkField('deliveryProcess.naturalDelivery.stage1Time', '生產過程', '第一產程時間', current.deliveryProcess?.naturalDelivery?.stage1Time, baseline.deliveryProcess?.naturalDelivery?.stage1Time);
  checkField('deliveryProcess.naturalDelivery.stage2Time', '生產過程', '第二產程時間', current.deliveryProcess?.naturalDelivery?.stage2Time, baseline.deliveryProcess?.naturalDelivery?.stage2Time);
  checkField('deliveryProcess.naturalDelivery.stage3Time', '生產過程', '第三產程時間', current.deliveryProcess?.naturalDelivery?.stage3Time, baseline.deliveryProcess?.naturalDelivery?.stage3Time);
  checkField('deliveryProcess.naturalDelivery.stage4Time', '生產過程', '第四產程時間', current.deliveryProcess?.naturalDelivery?.stage4Time, baseline.deliveryProcess?.naturalDelivery?.stage4Time);
  checkField('deliveryProcess.naturalDelivery.totalLaborTime', '生產過程', '總產程時間', current.deliveryProcess?.naturalDelivery?.totalLaborTime, baseline.deliveryProcess?.naturalDelivery?.totalLaborTime);

  // 5. Baby Status
  checkField('babyStatus.weight', '寶寶情況', '出生體重 (g)', current.babyStatus?.weight, baseline.babyStatus?.weight);
  checkField('babyStatus.height', '寶寶情況', '出生身高 (cm)', current.babyStatus?.height, baseline.babyStatus?.height);
  checkField('babyStatus.apgar1Min', '寶寶情況', 'Apgar 1分鐘', current.babyStatus?.apgar1Min, baseline.babyStatus?.apgar1Min);
  checkField('babyStatus.apgar5Min', '寶寶情況', 'Apgar 5分鐘', current.babyStatus?.apgar5Min, baseline.babyStatus?.apgar5Min);
  checkField('babyStatus.location', '寶寶情況', '寶寶位置', current.babyStatus?.location, baseline.babyStatus?.location);
  checkField('babyStatus.feedingType', '寶寶情況', '哺餵方式', current.babyStatus?.feedingType, baseline.babyStatus?.feedingType);
  checkField('babyStatus.dailyIntake', '寶寶情況', '今日奶量', current.babyStatus?.dailyIntake, baseline.babyStatus?.dailyIntake);
  checkField('babyStatus.specialConditions', '寶寶情況', '特殊情況與照護要點', current.babyStatus?.specialConditions, baseline.babyStatus?.specialConditions);

  // 6. Maternal Assessment
  checkField('maternalAssessment.breast.consistency', '產後身心', '乳房質地', current.maternalAssessment?.breast?.consistency, baseline.maternalAssessment?.breast?.consistency);
  checkField('maternalAssessment.breast.skinAppearance', '產後身心', '乳房外觀', current.maternalAssessment?.breast?.skinAppearance, baseline.maternalAssessment?.breast?.skinAppearance);
  checkField('maternalAssessment.breast.nippleShape', '產後身心', '乳頭形狀', current.maternalAssessment?.breast?.nippleShape, baseline.maternalAssessment?.breast?.nippleShape);
  checkField('maternalAssessment.breast.nippleIntegrity', '產後身心', '乳頭完整性', current.maternalAssessment?.breast?.nippleIntegrity, baseline.maternalAssessment?.breast?.nippleIntegrity);
  
  checkField('maternalAssessment.uterus.fundalHeight', '產後身心', '宮底高度 (Fundal Height)', current.maternalAssessment?.uterus?.fundalHeight, baseline.maternalAssessment?.uterus?.fundalHeight);
  checkField('maternalAssessment.uterus.contraction', '產後身心', '宮縮硬度', current.maternalAssessment?.uterus?.contraction, baseline.maternalAssessment?.uterus?.contraction);
  checkField('maternalAssessment.uterus.position', '產後身心', '子宮位置', current.maternalAssessment?.uterus?.position, baseline.maternalAssessment?.uterus?.position);
  checkField('maternalAssessment.uterus.lochia', '產後身心', '惡露評估 (性質/顏色/量)', 
    `${current.maternalAssessment?.uterus?.lochiaType || ''} (${current.maternalAssessment?.uterus?.lochiaColor || ''}, ${current.maternalAssessment?.uterus?.lochiaAmount || ''})`,
    `${baseline.maternalAssessment?.uterus?.lochiaType || ''} (${baseline.maternalAssessment?.uterus?.lochiaColor || ''}, ${baseline.maternalAssessment?.uterus?.lochiaAmount || ''})`
  );

  // Wound REEDA
  checkField('maternalAssessment.wound.perineal.redness', '傷口REEDA', '紅 (Redness)', current.maternalAssessment?.wound?.perineal?.redness, baseline.maternalAssessment?.wound?.perineal?.redness);
  checkField('maternalAssessment.wound.perineal.edema', '傷口REEDA', '腫 (Edema)', current.maternalAssessment?.wound?.perineal?.edema, baseline.maternalAssessment?.wound?.perineal?.edema);
  checkField('maternalAssessment.wound.perineal.ecchymosis', '傷口REEDA', '瘀斑 (Ecchymosis)', current.maternalAssessment?.wound?.perineal?.ecchymosis, baseline.maternalAssessment?.wound?.perineal?.ecchymosis);
  checkField('maternalAssessment.wound.perineal.discharge', '傷口REEDA', '分泌物 (Discharge)', current.maternalAssessment?.wound?.perineal?.discharge, baseline.maternalAssessment?.wound?.perineal?.discharge);
  checkField('maternalAssessment.wound.perineal.approximation', '傷口REEDA', '近似度 (Approximation)', current.maternalAssessment?.wound?.perineal?.approximation, baseline.maternalAssessment?.wound?.perineal?.approximation);
  
  if (current.maternalAssessment?.wound?.cesarean?.pain || baseline.maternalAssessment?.wound?.cesarean?.pain) {
    checkField('maternalAssessment.wound.cesarean.pain', '傷口REEDA', '剖腹傷口疼痛', current.maternalAssessment?.wound?.cesarean?.pain, baseline.maternalAssessment?.wound?.cesarean?.pain);
    checkField('maternalAssessment.wound.cesarean.dressing', '傷口REEDA', '剖腹傷口敷料', current.maternalAssessment?.wound?.cesarean?.dressing, baseline.maternalAssessment?.wound?.cesarean?.dressing);
  }

  // 7. Handover Notes
  checkField('handoverNotes', '交班事項', '交班注意事項 (ISBAR)', current.handoverNotes, baseline.handoverNotes);

  // 8. DART Nursing Notes
  checkField('nursingRecord.focus', 'DART護理記錄', '護理焦點 (Focus)', current.nursingRecord?.focus, baseline.nursingRecord?.focus);
  checkField('nursingRecord.data', 'DART護理記錄', 'D (Data 主客觀資料)', current.nursingRecord?.data, baseline.nursingRecord?.data);
  checkField('nursingRecord.action', 'DART護理記錄', 'A (Action 護理行動)', current.nursingRecord?.action, baseline.nursingRecord?.action);
  checkField('nursingRecord.response', 'DART護理記錄', 'R (Response 成效評估)', current.nursingRecord?.response, baseline.nursingRecord?.response);
  checkField('nursingRecord.teaching', 'DART護理記錄', 'T (Teaching 衛教指導)', current.nursingRecord?.teaching, baseline.nursingRecord?.teaching);

  return {
    hasDiff: diffList.length > 0,
    totalChanges: diffList.length,
    changedKeys,
    diffMap,
    diffList,
  };
}
