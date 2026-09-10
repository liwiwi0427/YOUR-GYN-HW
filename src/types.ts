// 入院護理評估表 (Admission Nursing Assessment)
export interface AdmissionAssessment {
  enabled: boolean;                  // 是否已進行/啟用入院評估
  roomInDateTime: string;            // 入病房時間 (YYYY-MM-DD HH:mm)
  assessmentDateTime: string;        // 評估時間 (YYYY-MM-DD HH:mm)
  admissionMode: string;             // 入院方式: 步行 / 輪椅 / 推床 / 其他
  admissionModeOther: string;        // 入院方式其他填寫
  admissionSource: string;           // 入院來源: OPD / ER / Refer / 其他
  admissionSourceOther: string;      // 入院來源其他填寫
  // BMI & 體重 (僅能輸入數字)
  height: string;                    // 身高 (cm)
  prePregnancyWeight: string;        // 孕前體重 (kg)
  currentWeight: string;             // 目前體重 (kg)
  idealWeight: string;               // 孕期理想體重 (kg)
  weightGain: string;                // 現在體重增加 (kg)
  bmi: string;                       // 計算出的 BMI
  // Vital Sign (僅能輸入數字)
  vitalSigns: {
    temperature: string;             // T (°C)
    pulse: string;                   // P (bpm)
    respiration: string;             // R (次/分)
    systolicBP: string;              // 收縮壓 (mmHg)
    diastolicBP: string;             // 舒張壓 (mmHg)
    spO2: string;                    // SpO2 (%)
  };
  // 個人與社會文化背景
  education: string;                 // 教育程度: 不識字 / 國小 / 國中 / 高中 / 專科 / 大學 / 研究所（以上） / 其他
  educationOther: string;            // 教育程度其他填寫
  occupation: string;                // 職業別
  religion: string;                  // 宗教: 無 / 佛教 / 道教 / 基督教 / 天主教 / 一貫道 / 回教 / 印度教 / 其他
  religionOther: string;             // 宗教其他填寫
  taboos: string[];                  // 禁忌: 無 / 不輸血 / 食物禁忌 / 其他
  foodTabooDetails: string;          // 食物禁忌填寫
  tabooOther: string;                // 其他禁忌填寫
  languages: string[];               // 語言: 中文 / 英文 / 台語 / 客語 / 印尼語 / 越南語 / 菲律賓語 / 日語 / 韓語 / 其他
  languageOther: string;             // 語言其他填寫
  patientBloodType: string;          // 病人血型: A / B / AB / O
  patientRh: string;                 // 病人 RH: (+) / (-) / 未知
  spouseBloodType: string;           // 配偶血型: A / B / AB / O
  spouseRh: string;                  // 配偶 RH: (+) / (-) / 未知
  bloodTransfusionHistory: string;   // 輸血經驗: 有 / 無
  bloodTransfusionReaction: string;  // 輸血反應: 有 / 無
  bloodTransfusionReactionDetails: string; // 輸血反應說明
  menstrualStatus: string;           // 月經狀況: 規則 / 不規則 / 已停經
  lmp: string;                       // LMP (YYYY-MM-DD)
  edc: string;                       // EDC (YYYY-MM-DD)
  papSmear: string;                  // 抹片檢查: 有（定期） / 有（不定期） / 無
  drugAllergy: string;               // 藥物過敏史: 有 / 無
  drugAllergyDetails: string;        // 藥物過敏說明
  foodAllergy: string;               // 食物過敏史: 有 / 無
  foodAllergyDetails: string;        // 食物過敏說明
  breastSelfExam: string;            // 乳房自我檢查: 無 / 有（正常） / 有（有硬塊） / 有（有分泌物） / 有（皮膚缺損）
  smoking: string;                   // 抽菸
  alcohol: string;                   // 飲酒
}

export interface HandoverRecord {
  id: string;
  updatedAt: string;
  createdAt: string;

  // 入院護理評估 (Admission Assessment)
  admissionAssessment?: AdmissionAssessment;

  // 實習基本資訊
  internship: {
    unit: string;           // 實習單位
    studentName: string;    // 姓名
    studentId: string;      // 學號
    instructor: string;     // 實習指導教師
    date: string;           // 日期
    week: string;           // 第幾週
  };

  // 一、基本資料
  basicInfo: {
    bedNumber: string;        // 床號
    patientName: string;      // 姓名
    admissionDate: string;    // 入院日期
    expectedDeliveryDate: string; // 預產日 (EDC)
    primaryDiagnosis: string; // 主診斷 (Primary Diagnosis)
    secondaryDiagnoses: string[]; // 次診斷 (Secondary Diagnoses 1~5, 長度為 5)
    diagnosis?: string;       // 舊版相容欄位
    deliveryDate: string;     // 生產日
    gestationalWeeks: string; // 懷孕週數 (e.g. 39+2)
    obstetricHistory: string; // 生產史 (e.g. G1P1, G2P1AA0SA0)
    chronicDiseases: string;  // 慢性病史
    maritalStatus: string;    // 婚姻狀況
    attendingPhysician: string; // 主治醫師
    primaryNurse: string;     // 主護
    admissionCourse: string;  // 入院經過
  };

  // 二、生產過程
  deliveryProcess: {
    deliveryMode: string;         // 分娩方式 (自然產 / 剖腹產 / 真空吸引等)
    placentaExpulsionMode: string;// 胎盤剝離方式 (Schultze / Duncan 等)
    perinealLaceration: string;   // 會陰裂傷程度 (1度 / 2度 / 3度 / 4度 / Episiotomy)
    deliveryTime: string;         // 娩出時間
    bloodLoss: string;            // 失血量 (ml)
    placentaWeight: string;       // 胎盤重量 (g)
    woundSize: string;            // 會陰／腹部傷口大小 (cm)
    // 自然產產程時間
    naturalDelivery: {
      stage1Time: string;         // 第一產程時間
      stage2Time: string;         // 第二產程時間
      stage3Time: string;         // 第三產程時間
      stage4Time: string;         // 第四產程時間
      totalLaborTime: string;     // 總產程耗費時間
    };
    // 剖腹產時間
    cesareanDelivery: {
      enterOrTime: string;        // 進入手術室
      anesthesiaStartTime: string;// 麻醉開始
      anesthesiaMode: string;     // 麻醉方式 (SA / EA / CSEA / GA)
      surgeryStartTime: string;   // 手術開始
      surgeryEndTime: string;     // 手術結束時間
    };
  };

  // 三、寶寶情況
  babyStatus: {
    height: string;             // 身高 (cm)
    weight: string;             // 體重 (g)
    apgar1Min: string;          // 阿帕嘉計分第一分鐘
    apgar5Min: string;          // 第五分鐘
    location: string;           // 寶寶在哪裡: 嬰兒室 / 母嬰同室 / 病嬰室
    specialConditions: string;  // 出生時特殊情況
    feedingType: string;        // 哺乳: 完全母乳 / 混和奶 / 配方奶
    formulaBrand: string;       // 奶粉品牌
    dailyIntake: string;        // 今日奶量
  };

  // 四、產婦評估
  maternalAssessment: {
    // (一) 乳房
    breast: {
      assessmentDate: string;   // 評估日期
      skinAppearance: string;   // 正常 / 發紅
      consistency: string;      // 軟 / 充盈 / 硬
      nippleShape: string;      // 凸 / 平 / 凹
      nippleIntegrity: string;  // 完整 / 破損
      lactationRight: string;   // 無 / 微 / 少 / 多
      lactationRightAmount: string; // ml
      lactationLeft: string;    // 無 / 微 / 少 / 多
      lactationLeftAmount: string;  // ml
    };
    // (二) 子宮
    uterus: {
      assessmentDate: string;   // 評估日期
      fundalHeight: string;     // 宮底高度 (e.g. U/U, U-1, U-2)
      contraction: string;      // 硬 / 中 / 軟
      position: string;         // 左 / 中 / 右
      painScore: string;        // 宮縮疼痛指數 (0-10)
      massage: string;          // 有 / 無
      postMassageContraction: string; // 硬 / 中 / 軟
      lochiaAmount: string;     // 惡露量
      lochiaColor: string;      // 顏色
      lochiaType: string;       // 紅惡露 / 漿惡露 / 白惡露
      bloodClots: string;       // 血塊: 有 / 無
    };
    // (三) 會陰傷口／剖腹產傷口
    wound: {
      assessmentTime: string;   // 評估時間
      // 會陰傷口 (REEDA Scale)
      perineal: {
        redness: string;        // Redness (0-3)
        edema: string;          // Edema (0-3)
        ecchymosis: string;     // Ecchymosis (0-3)
        discharge: string;      // Discharge (0-3)
        approximation: string;  // Approximation (0-3)
      };
      // 剖腹傷口
      cesarean: {
        color: string;          // 傷口顏色
        swelling: string;       // 腫脹情形
        pain: string;           // 疼痛情形
        dressing: string;       // 敷料狀況
        dressingChangeDate: string; // 換藥日期
      };
    };
  };

  // 五、交班注意事項
  handoverNotes: string;

  // 六、護理記錄 (DART Format: D-A-R-T)
  nursingRecord: {
    time: string;               // 時間
    focus: string;              // 焦點
    data: string;               // D (Data, 資料)
    action: string;             // A (Action, 護理行動)
    response: string;           // R (Response, 反應)
    teaching: string;           // T (Teaching, 指導)
  };

  // 數位版專屬臨床小叮嚀 (僅數位表單顯示，不影響 A4 列印格式)
  clinicalTips?: {
    admission?: string;      // 入院護理評估小叮嚀
    basicInfo?: string;      // 基本資料小叮嚀
    delivery?: string;       // 生產過程小叮嚀
    baby?: string;           // 寶寶情況小叮嚀
    maternal?: string;       // 產婦身心評估小叮嚀
    wound?: string;          // 傷口評估小叮嚀
    handover?: string;       // 交班注意事項小叮嚀
    dart?: string;           // 護理記錄小叮嚀
    [sectionKey: string]: string | undefined;
  };

  // 七、簽章與評核 (Signatures & Academic Evaluation)
  signatures?: {
    studentSignature?: string;     // 護生電子簽名 (Base64 PNG)
    studentSignedAt?: string;      // 學生簽署時間
    instructorSignature?: string;  // 教師電子簽名 (Base64 PNG)
    instructorSignedAt?: string;   // 教師簽署時間
    instructorComment?: string;    // 教師評語 / 批註
    score?: string;                // 成績等第 (e.g. 95分 / A+ / 通過)
    reviewHistory?: ReviewAuditEntry[]; // 評閱審核軌跡 (審核稽核鏈)
  };
}

// 評閱審核軌跡 (Review Audit Trail Record)
export interface ReviewAuditEntry {
  id: string;
  timestamp: string;               // 簽核/評閱時間戳記 (ISO string)
  instructorName: string;          // 評閱教師/審核人員姓名
  reviewerRole: string;            // 角色職稱 (例如: 實習指導教師 / 護理長 / 專科護理師)
  action: '核定簽核' | '等第評分' | '評語批註' | '補正退回' | '初審確認' | '更動評核'; // 操作類別
  score?: string;                  // 核定成績等第
  commentSummary?: string;         // 評語重點摘要
  hasSignature: boolean;           // 是否附帶數位簽名章
  verificationCode?: string;       // 稽核雜湊特徵碼 (Audit Integrity Tag)
}
