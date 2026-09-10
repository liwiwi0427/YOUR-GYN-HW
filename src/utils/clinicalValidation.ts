// 臨床生命徵象與體格數值安全範圍校驗與護理觀察重點規則

export interface ValidationResult {
  isAbnormal: boolean;
  alertType?: 'high' | 'low' | 'danger' | 'warning';
  message?: string;
  nursingKeyPoints?: string;
}

// 僅保留數字與小數點
export const sanitizeDecimal = (val: string | undefined | null): string => {
  if (!val || typeof val !== 'string') return '';
  const cleaned = val.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return cleaned;
};

// 僅保留整數數字
export const sanitizeInteger = (val: string | undefined | null): string => {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/\D/g, '');
};

// ==================== 產婦評估校驗規則 ====================

// 產婦體溫 T (°C) (正常 36.0 ~ 37.5)
export const validateMaternalTemp = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num >= 38.0) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `體溫過高 (${num}°C ≥ 38.0°C)`,
      nursingKeyPoints: '發燒警示：密切評估產褥感染 (Endometritis)、乳腺炎或傷口感染；補充水分、依醫囑給予退熱劑或冰枕。',
    };
  }
  if (num > 37.5) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `體溫偏高 (${num}°C)`,
      nursingKeyPoints: '生理性微熱或脫水：產後 24 小時內常見脫水熱，鼓勵攝取水分並持續追蹤體溫。',
    };
  }
  if (num < 36.0) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `體溫偏低 (${num}°C < 36.0°C)`,
      nursingKeyPoints: '低體溫警示：注意產後保暖，提供溫毯、評估周邊循環及冷顫情形。',
    };
  }
  return { isAbnormal: false };
};

// 產婦脈搏/心跳 P (bpm) (正常 60 ~ 100)
export const validateMaternalPulse = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num > 100) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `心搏過速 (${num} bpm > 100)`,
      nursingKeyPoints: '心搏過速：需評估產後大出血 (PPH/低血容)、貧血、疼痛、發燒或焦慮，密切監測血壓與惡露量。',
    };
  }
  if (num < 60) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `心搏過緩 (${num} bpm < 60)`,
      nursingKeyPoints: '生理性心搏過緩：產後迷走神經張力增加常見 (50-60 bpm)，若無頭暈眩暈則屬良性，持續監測。',
    };
  }
  return { isAbnormal: false };
};

// 產婦呼吸 R (次/分) (正常 12 ~ 20)
export const validateMaternalRespiration = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num > 20) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `呼吸過速 (${num} 次/分 > 20)`,
      nursingKeyPoints: '呼吸過速：評估疼痛、焦慮、體溫上升或罕見肺栓塞徵象，監測 SpO2。',
    };
  }
  if (num < 12) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `呼吸抑制 (${num} 次/分 < 12)`,
      nursingKeyPoints: '呼吸抑制警示：若使用類嗎啡止痛劑 (PCA / Opioids)，需立即評估意識與呼吸深度，必要時給予 Naloxone。',
    };
  }
  return { isAbnormal: false };
};

// 產婦血壓 BP (收縮壓 SBP / 舒張壓 DBP) (正常 SBP 90~139, DBP 60~89)
export const validateMaternalBP = (sbpStr?: string | null, dbpStr?: string | null): ValidationResult => {
  const sbp = sbpStr ? parseFloat(sbpStr) : NaN;
  const dbp = dbpStr ? parseFloat(dbpStr) : NaN;
  if (isNaN(sbp) && isNaN(dbp)) {
    return { isAbnormal: false };
  }

  // 高血壓 / 子癇前症
  if (sbp >= 140 || dbp >= 90) {
    const isSevere = sbp >= 160 || dbp >= 110;
    return {
      isAbnormal: true,
      alertType: isSevere ? 'danger' : 'warning',
      message: isSevere ? `血壓重度升高 (${isNaN(sbp) ? '—' : sbp}/${isNaN(dbp) ? '—' : dbp} mmHg)` : `血壓偏高 (${isNaN(sbp) ? '—' : sbp}/${isNaN(dbp) ? '—' : dbp} mmHg)`,
      nursingKeyPoints: '子癇前症 (Pre-eclampsia) 警戒：評估有無頭痛、視力模糊、右上腹痛、全身水腫與深腱反射 (DTR)，監測尿蛋白。',
    };
  }

  // 低血壓 / 出血休克
  if ((!isNaN(sbp) && sbp < 90) || (!isNaN(dbp) && dbp < 60)) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `血壓偏低 (${isNaN(sbp) ? '—' : sbp}/${isNaN(dbp) ? '—' : dbp} mmHg)`,
      nursingKeyPoints: '休克/低血壓警訊：評估產後大出血、子宮收縮無力、臉色蒼白、冷汗及意識狀態，立即通報與輸液。',
    };
  }

  return { isAbnormal: false };
};

// 產婦血氧 SpO2 (%) (正常 ≥ 95%)
export const validateMaternalSpO2 = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num < 95) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `血氧濃度偏低 (${num}% < 95%)`,
      nursingKeyPoints: '缺氧警訊：立即評估呼吸道通暢、給予氧氣支持，檢查胸部聽診與心肺功能。',
    };
  }
  return { isAbnormal: false };
};

// 產婦宮縮疼痛 (NRS 0-10)
export const validatePainScore = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num >= 7) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `重度疼痛 (${num}/10 分)`,
      nursingKeyPoints: '重度產後疼痛：評估產後痛、會陰血腫或傷口裂傷；依醫囑給予止痛藥物並衛教腹部深呼吸或排空膀胱。',
    };
  }
  return { isAbnormal: false };
};

// ==================== 新生兒評估校驗規則 ====================

// 新生兒體重 Weight (g) (正常 2500 ~ 4000)
export const validateBabyWeight = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num < 2500) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `低出生體重兒 (${num}g < 2500g, LBW)`,
      nursingKeyPoints: 'LBW 照護重點：加強保暖（預防冷壓力）、密切監測血糖 (防低血糖)、鼓勵少量多餐餵食與感染防護。',
    };
  }
  if (num > 4000) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `巨嬰兒 (${num}g > 4000g, LGA)`,
      nursingKeyPoints: 'LGA 照護重點：監測產後微血管血糖 (預防反應性低血糖)、檢查有無產道擠壓傷或鎖骨骨折。',
    };
  }
  return { isAbnormal: false };
};

// 新生兒 Apgar Score (正常 7 ~ 10)
export const validateApgar = (val?: string | null, minLabel?: string): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  const label = minLabel || '';
  if (num <= 3) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `Apgar ${label} 重度窘迫 (${num} 分 ≤ 3)`,
      nursingKeyPoints: '嚴重窘迫：立即啟動新生兒高級復甦術 (NRP)，正壓給氧通氣、胸外按壓與氣管插管準備。',
    };
  }
  if (num <= 6) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `Apgar ${label} 輕中度窘迫 (${num} 分)`,
      nursingKeyPoints: '輕中度窘迫：清除呼吸道分泌物、給予保暖與觸覺刺激、游離氧氣給予，持續監測心跳與膚色。',
    };
  }
  return { isAbnormal: false };
};

// 新生兒體溫 T (°C) (正常 36.5 ~ 37.5)
export const validateBabyTemp = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num < 36.5) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `新生兒低體溫 (${num}°C < 36.5°C)`,
      nursingKeyPoints: '冷壓力危險：新生兒棕色脂肪消耗增加，可能引發酸中毒與低血糖；立即給予烤燈、保溫箱或袋鼠式護理。',
    };
  }
  if (num > 37.5) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `新生兒體溫過高 (${num}°C > 37.5°C)`,
      nursingKeyPoints: '體溫過高：檢查包布/室溫是否過熱，適度調節衣物並評估脫水或感染徵象。',
    };
  }
  return { isAbnormal: false };
};

// 新生兒心率 HR (bpm) (正常 110 ~ 160)
export const validateBabyHR = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num < 100) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `心搏過緩 (${num} bpm < 100)`,
      nursingKeyPoints: '嚴重危急：新生兒心跳 <100 bpm 提示缺氧，立即通暢呼吸道並給予正壓通氣 (PPV)。',
    };
  }
  if (num > 160) {
    return {
      isAbnormal: true,
      alertType: 'warning',
      message: `心搏過速 (${num} bpm > 160)`,
      nursingKeyPoints: '心搏過速：評估哭鬧、發燒、脫水或呼吸窘迫；安撫後重測。',
    };
  }
  return { isAbnormal: false };
};

// 新生兒呼吸 RR (次/分) (正常 30 ~ 60)
export const validateBabyRR = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num > 60) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `呼吸過速 (${num} 次/分 > 60)`,
      nursingKeyPoints: '呼吸窘迫警示 (TTNB/RDS)：觀察有無鼻翼煽動 (Nasal flaring)、胸骨凹陷 (Retractions) 或呻吟聲 (Grunting)。',
    };
  }
  if (num < 30) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `呼吸過緩 (${num} 次/分 < 30)`,
      nursingKeyPoints: '呼吸暫停 (Apnea) 警示：檢查有無膚色發紺，給予足底刺激並評估中樞抑制。',
    };
  }
  return { isAbnormal: false };
};

// 新生兒血氧 SpO2 (%) (正常 ≥ 95%)
export const validateBabySpO2 = (val?: string | null): ValidationResult => {
  if (!val || typeof val !== 'string' || !val.trim()) return { isAbnormal: false };
  const num = parseFloat(val);
  if (isNaN(num)) return { isAbnormal: false };
  if (num < 95) {
    return {
      isAbnormal: true,
      alertType: 'danger',
      message: `血氧飽和度偏低 (${num}% < 95%)`,
      nursingKeyPoints: '低血氧發紺：評估肢端/軀幹膚色、給氧支持，必要時進行先天性心臟病篩檢 (CCHD)。',
    };
  }
  return { isAbnormal: false };
};
