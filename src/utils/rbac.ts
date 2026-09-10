export type UserRole = 'student' | 'team_leader' | 'instructor' | 'hn_np' | 'admin';

export interface RoleInfo {
  role: UserRole;
  title: string;
  shortTitle: string;
  level: number;
  levelLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  colorHex: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  student: {
    role: 'student',
    title: '實習護生 (Nursing Intern)',
    shortTitle: '實習護生',
    level: 1,
    levelLabel: 'Level 1 基礎臨床填寫',
    description: '負責產科臨床實習個案評估、交班記錄、DART 護理焦點記錄填寫與個人數位簽章。',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    colorHex: '#2563eb',
  },
  team_leader: {
    role: 'team_leader',
    title: '梯次小組長 (Team Leader)',
    shortTitle: '梯次小組長',
    level: 1.5,
    levelLabel: 'Level 1.5 小組協作與初審',
    description: '負責實習小組之作業催繳統計、同儕互審初核、小組交班彙整與臨床計算工具協作。',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-200',
    colorHex: '#0891b2',
  },
  instructor: {
    role: 'instructor',
    title: '實習指導教師 (Clinical Instructor)',
    shortTitle: '實習指導教師',
    level: 2,
    levelLabel: 'Level 2 教學評閱與核定',
    description: '具備實習作業批閱、雙欄對照批閱視窗、成績等第核定、指導評語與教師官方電子簽章權限。',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    colorHex: '#047857',
  },
  hn_np: {
    role: 'hn_np',
    title: '護理長與專科護理師 (HN & NP)',
    shortTitle: 'HN & NP 臨床督導',
    level: 2.5,
    levelLabel: 'Level 2.5 臨床督導與審核',
    description: '具備病房臨床品質把關、高危個案覆核、指導評語查核與臨床評閱稽核軌跡調閱權限。',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    colorHex: '#d97706',
  },
  admin: {
    role: 'admin',
    title: '全域系統管理員 (Super Admin / NIS Director)',
    shortTitle: '全域管理員',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '具備全域系統控制、RBAC 權限矩陣配置、實習單位與師生名冊管理、全域資料庫備份還原與 NIS 稽核日誌調閱最高權限。',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    colorHex: '#7e22ce',
  },
};

export type PermissionCategoryCode = 
  | 'CAT-AUTH'
  | 'CAT-BASE'
  | 'CAT-LND'
  | 'CAT-POST'
  | 'CAT-DART'
  | 'CAT-GRADE'
  | 'CAT-ROSTER'
  | 'CAT-SYS'
  | 'CAT-AUDIT';

export interface CategoryMeta {
  code: PermissionCategoryCode;
  shortLabel: string;
  name: string;
  description: string;
  order: number;
}

export const PERMISSION_CATEGORIES: CategoryMeta[] = [
  {
    code: 'CAT-AUTH',
    shortLabel: '帳號安全',
    name: 'CAT-AUTH 帳號與安全認證',
    description: '包含指導教師、HN/NP 督導與管理員之加密帳號驗證、密碼安全與身分切換。',
    order: 1,
  },
  {
    code: 'CAT-BASE',
    shortLabel: '個案基本',
    name: 'CAT-BASE 實習與個案基本資料',
    description: '包含實習護生身分識別、病房床號、診斷、主治醫師、孕期病史與入院經過管理。',
    order: 2,
  },
  {
    code: 'CAT-LND',
    shortLabel: '產程入院',
    name: 'CAT-LND 產程與入院評估',
    description: '包含入院護理評估、生命徵象、BMI 變化、分娩過程時間與新生兒 Apgar 評估。',
    order: 3,
  },
  {
    code: 'CAT-POST',
    shortLabel: '產後傷口',
    name: 'CAT-POST 產後評估與傷口量表',
    description: '包含產婦乳房乳汁分泌、子宮復舊惡露、REEDA 會陰傷口評估與剖腹產傷口照護。',
    order: 4,
  },
  {
    code: 'CAT-DART',
    shortLabel: 'DART紀錄',
    name: 'CAT-DART ISBAR與焦點護理記錄',
    description: '包含臨床 ISBAR 交班重點備忘與結構化 D-A-R-T 產科焦點護理記錄撰寫。',
    order: 5,
  },
  {
    code: 'CAT-GRADE',
    shortLabel: '評閱簽核',
    name: 'CAT-GRADE 實習評閱與簽核核定',
    description: '包含全班作業批閱中心、雙欄對照批閱、等第評定、指導評語與數位印章核定。',
    order: 6,
  },
  {
    code: 'CAT-ROSTER',
    shortLabel: '名冊單位',
    name: 'CAT-ROSTER 師生名冊與實習單位',
    description: '包含實習病房單位維護、臨床指導教師名冊管理與實習護生梯次名冊自訂編輯。',
    order: 7,
  },
  {
    code: 'CAT-SYS',
    shortLabel: '系統維護',
    name: 'CAT-SYS 系統維護與資料備份',
    description: '包含臨床計算工具、個案副本新增、JSON 資料備份匯出與覆蓋式匯入還原。',
    order: 8,
  },
  {
    code: 'CAT-AUDIT',
    shortLabel: '安全稽核',
    name: 'CAT-AUDIT 臨床安全與稽核日誌',
    description: '包含評閱審核軌跡鏈檢視、NIS 系統操作稽核日誌調閱與 RBAC 權限矩陣動態配置。',
    order: 9,
  },
];

export interface PermissionDefinition {
  key: string;
  code: string;
  name: string;
  category: PermissionCategoryCode;
  categoryName: string;
  level: number;
  levelLabel: string;
  description: string;
  defaultRoles: UserRole[];
}

export const PERMISSION_LIST: PermissionDefinition[] = [
  // CAT-AUTH: 帳號安全
  {
    key: 'auth_login_teacher',
    code: 'PERM-AUTH-01',
    name: '教師與督導身分安全密碼認證',
    category: 'CAT-AUTH',
    categoryName: 'CAT-AUTH 帳號與安全認證',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許以加密認證帳號密碼登入指導教師或 HN/NP 臨床審核身分。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'auth_login_admin',
    code: 'PERM-AUTH-02',
    name: '全域系統管理員高階身分認證',
    category: 'CAT-AUTH',
    categoryName: 'CAT-AUTH 帳號與安全認證',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '僅限管理員帳密驗證登入，取得全域最高管理權限。',
    defaultRoles: ['admin'],
  },

  // CAT-BASE: 個案基本
  {
    key: 'fill_internship_info',
    code: 'PERM-BASE-01',
    name: '實習身分與週次病房設定',
    category: 'CAT-BASE',
    categoryName: 'CAT-BASE 實習與個案基本資料',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許編輯實習單位、護生姓名、學號、實習週次與填表日期。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'fill_patient_basic_info',
    code: 'PERM-BASE-02',
    name: '產婦基本資料與產科史記錄',
    category: 'CAT-BASE',
    categoryName: 'CAT-BASE 實習與個案基本資料',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許填寫床號、產婦化名、產科史 (G/P)、週數、診斷與入院經過。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },

  // CAT-LND: 產程入院
  {
    key: 'fill_admission_assessment',
    code: 'PERM-LND-01',
    name: '入院護理評估與生理徵象填寫',
    category: 'CAT-LND',
    categoryName: 'CAT-LND 產程與入院評估',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許填寫入院方式、BMI/體重變化、V/S、社會文化背景、過敏史與抹片紀錄。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'fill_delivery_process',
    code: 'PERM-LND-02',
    name: '分娩過程與產程耗時記錄',
    category: 'CAT-LND',
    categoryName: 'CAT-LND 產程與入院評估',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許記錄自然產第一至第四產程耗時、剖腹產麻醉方式、失血量與胎盤重量。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'fill_baby_status',
    code: 'PERM-LND-03',
    name: '新生兒即刻評估與 Apgar 計分',
    category: 'CAT-LND',
    categoryName: 'CAT-LND 產程與入院評估',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許記錄新生兒出生身長體重、Apgar 1\'/5\' 評分、安置地點與餵食量。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },

  // CAT-POST: 產後傷口
  {
    key: 'fill_maternal_breast_uterus',
    code: 'PERM-POST-01',
    name: '產婦乳房泌乳與子宮宮底評估',
    category: 'CAT-POST',
    categoryName: 'CAT-POST 產後評估與傷口量表',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許記錄乳房充盈度、乳頭外觀、宮底高度 (U/U)、宮縮硬度與惡露性質。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'fill_wound_reeda_scale',
    code: 'PERM-POST-02',
    name: 'REEDA 會陰裂傷與剖腹傷口量表計分',
    category: 'CAT-POST',
    categoryName: 'CAT-POST 產後評估與傷口量表',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許填寫 REEDA (紅腫、水腫、瘀斑、分泌物、傷口對合) 評估與剖腹傷口換藥。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },

  // CAT-DART: DART紀錄
  {
    key: 'fill_dart_notes',
    code: 'PERM-DART-01',
    name: 'ISBAR 臨床交班與 DART 護理記錄撰寫',
    category: 'CAT-DART',
    categoryName: 'CAT-DART ISBAR與焦點護理記錄',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許撰寫產科交班重點備忘與 D-A-R-T 焦點護理記錄。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'sign_student',
    code: 'PERM-DART-02',
    name: '護生個人數位簽章確認',
    category: 'CAT-DART',
    categoryName: 'CAT-DART ISBAR與焦點護理記錄',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許護生在作業完成後進行手寫簽署並上傳交班。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },

  // CAT-GRADE: 評閱簽核
  {
    key: 'view_grading_dashboard',
    code: 'PERM-GRADE-01',
    name: '批閱中心與視覺化進度分佈長條圖',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 1.5,
    levelLabel: 'Level 1.5 小組協作',
    description: '允許檢視作業批閱總覽中心、視覺化完成度長條圖與進度落後警示標記。',
    defaultRoles: ['team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'use_split_grading_mode',
    code: 'PERM-GRADE-02',
    name: '啟用「雙欄對照批閱視窗」',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許開啟左側學生作業對照與右側教師固定評閱簽章面板之高效雙欄介面。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'grade_assignment_score',
    code: 'PERM-GRADE-03',
    name: '評定實習成績等第與分數',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許核給成績等第 (A+ ~ 需補正) 與實習評量分數 (0-100)。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'write_instructor_comment',
    code: 'PERM-GRADE-04',
    name: '撰寫指導教師/臨床督導評語',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許撰寫專業指正評語與一鍵帶入常用產科臨床評語範本。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'sign_instructor',
    code: 'PERM-GRADE-05',
    name: '教師與臨床督導官方電子印章簽署',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許使用手寫或官方電子專屬章進行正式評閱簽核並寫入審核軌跡。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'hn_np_secondary_audit',
    code: 'PERM-GRADE-06',
    name: 'HN/NP 護理長與專師高階二審覆核',
    category: 'CAT-GRADE',
    categoryName: 'CAT-GRADE 實習評閱與簽核核定',
    level: 2.5,
    levelLabel: 'Level 2.5 臨床督導',
    description: '允許護理長與專科護理師針對特殊高危個案進行二次覆核與品質驗證。',
    defaultRoles: ['hn_np', 'admin'],
  },

  // CAT-ROSTER: 名冊單位
  {
    key: 'manage_clinical_units',
    code: 'PERM-ROSTER-01',
    name: '實習病房單位完全自訂與編輯',
    category: 'CAT-ROSTER',
    categoryName: 'CAT-ROSTER 師生名冊與實習單位',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '允許新增、修改、啟用/停用與刪除臨床實習病房單位與床位代碼。',
    defaultRoles: ['admin'],
  },
  {
    key: 'manage_faculty_roster',
    code: 'PERM-ROSTER-02',
    name: '指導教師與 HN/NP 督導名冊自訂管理',
    category: 'CAT-ROSTER',
    categoryName: 'CAT-ROSTER 師生名冊與實習單位',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '允許新增、修改職稱單位、指派主要督導與編輯指導教師名冊。',
    defaultRoles: ['admin'],
  },
  {
    key: 'manage_student_roster',
    code: 'PERM-ROSTER-03',
    name: '實習護生名冊與梯次小組長指派',
    category: 'CAT-ROSTER',
    categoryName: 'CAT-ROSTER 師生名冊與實習單位',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許自訂學生學號、姓名、梯次週次、分組指派與設定小組長。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },

  // CAT-SYS: 系統維護
  {
    key: 'use_clinical_tools',
    code: 'PERM-SYS-01',
    name: '使用產科臨床計算工具箱',
    category: 'CAT-SYS',
    categoryName: 'CAT-SYS 系統維護與資料備份',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許開啟 EDC 預產期推算、宮縮計時器、REEDA 指引與 ISBAR 產生器。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'create_duplicate_case',
    code: 'PERM-SYS-02',
    name: '指派/新增病人個案與建立新週次作業',
    category: 'CAT-SYS',
    categoryName: 'CAT-SYS 系統維護與資料備份',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '由實習指導老師或管理員進行病人個案指派、新增病患與建立獨立作業（防止未授權新增）。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'delete_case_record',
    code: 'PERM-SYS-03',
    name: '刪除作業紀錄 (防止誤刪保護)',
    category: 'CAT-SYS',
    categoryName: 'CAT-SYS 系統維護與資料備份',
    level: 2,
    levelLabel: 'Level 2 教學核定',
    description: '允許永久刪除單筆實習個案作業 (學生端預設受保護)。',
    defaultRoles: ['instructor', 'hn_np', 'admin'],
  },
  {
    key: 'export_json_backup',
    code: 'PERM-SYS-04',
    name: '匯出個案 JSON 格式備份檔',
    category: 'CAT-SYS',
    categoryName: 'CAT-SYS 系統維護與資料備份',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許下載單一或全體實習個案之標準 JSON 資料檔案。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'import_restore_database',
    code: 'PERM-SYS-05',
    name: '全域覆蓋式 JSON 匯入還原',
    category: 'CAT-SYS',
    categoryName: 'CAT-SYS 系統維護與資料備份',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '僅限管理員執行全系統個案資料庫覆蓋式還原。',
    defaultRoles: ['admin'],
  },

  // CAT-AUDIT: 安全稽核
  {
    key: 'view_review_history_chain',
    code: 'PERM-AUDIT-01',
    name: '檢視個案「評閱審核軌跡鏈」',
    category: 'CAT-AUDIT',
    categoryName: 'CAT-AUDIT 臨床安全與稽核日誌',
    level: 1,
    levelLabel: 'Level 1 基礎操作',
    description: '允許於簽章區段下方展開查閱每次指導老師簽核之時間戳記與審核鏈。',
    defaultRoles: ['student', 'team_leader', 'instructor', 'hn_np', 'admin'],
  },
  {
    key: 'view_audit_logs',
    code: 'PERM-AUDIT-02',
    name: '檢視 NIS 系統安全與全域稽核日誌',
    category: 'CAT-AUDIT',
    categoryName: 'CAT-AUDIT 臨床安全與稽核日誌',
    level: 2.5,
    levelLabel: 'Level 2.5 臨床督導',
    description: '允許調閱登入、評閱、資料更動與系統設定之完整 NIS 系統日誌。',
    defaultRoles: ['hn_np', 'admin'],
  },
  {
    key: 'configure_rbac_matrix',
    code: 'PERM-AUDIT-03',
    name: '動態配置 RBAC 角色權限矩陣',
    category: 'CAT-AUDIT',
    categoryName: 'CAT-AUDIT 臨床安全與稽核日誌',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '最高管理權限，即時自訂 5 大角色與各項臨床功能的授權開關。',
    defaultRoles: ['admin'],
  },
  {
    key: 'system_factory_reset',
    code: 'PERM-AUDIT-04',
    name: '全域系統初始化與工廠重置',
    category: 'CAT-AUDIT',
    categoryName: 'CAT-AUDIT 臨床安全與稽核日誌',
    level: 3,
    levelLabel: 'Level 3 全域最高治理',
    description: '清除所有自訂資料並重置為標準臨床範本 (含防呆確認機制)。',
    defaultRoles: ['admin'],
  },
];

const RBAC_STORAGE_KEY = 'maternity_rbac_matrix_v2';
const AUDIT_LOGS_KEY = 'maternity_audit_logs_v2';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  category: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'success' | 'danger';
}

// Get saved permission matrix
export function getSavedPermissionMatrix(): Record<string, UserRole[]> {
  try {
    const raw = localStorage.getItem(RBAC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load RBAC matrix from localStorage', e);
  }

  // Default matrix from PERMISSION_LIST
  const defaults: Record<string, UserRole[]> = {};
  PERMISSION_LIST.forEach((p) => {
    defaults[p.key] = [...p.defaultRoles];
  });
  return defaults;
}

// Save permission matrix
export function savePermissionMatrix(matrix: Record<string, UserRole[]>): void {
  try {
    localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(matrix));
  } catch (e) {
    console.error('Failed to save RBAC matrix to localStorage', e);
  }
}

// Check permission
export function hasPermission(role: UserRole, permissionKey: string): boolean {
  // Super admin always has all permissions
  if (role === 'admin') return true;

  const matrix = getSavedPermissionMatrix();
  const allowedRoles = matrix[permissionKey];
  if (allowedRoles && Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }

  // Fallback to default
  const perm = PERMISSION_LIST.find((p) => p.key === permissionKey);
  return perm ? perm.defaultRoles.includes(role) : false;
}

// Audit Logs Management
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load audit logs', e);
  }

  // Default initial audit entries
  const initialLogs: AuditLogEntry[] = [
    {
      id: `log_init_${Date.now() - 3600000}`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userName: 'NIS 系統核心守護',
      userRole: 'admin',
      category: '系統安全',
      action: '系統初始化完成',
      details: '產科護理資訊系統 (NIS) 多階層 RBAC 安全權限架構與審核軌跡鏈已就緒。',
      severity: 'info',
    },
    {
      id: `log_init_${Date.now() - 1800000}`,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userName: '實習指導教師',
      userRole: 'instructor',
      category: '教學評核',
      action: '載入產科實習名冊與單位設定',
      details: '已載入臨床病房單位、實習護生名單與 REEDA 傷口評估指引。',
      severity: 'success',
    },
  ];
  return initialLogs;
}

export function logAuditEvent(
  userName: string,
  userRole: UserRole,
  category: string,
  action: string,
  details: string,
  severity: 'info' | 'warning' | 'success' | 'danger' = 'info'
): void {
  try {
    const currentLogs = getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      category,
      action,
      details,
      severity,
    };
    // Keep latest 200 logs
    const updated = [newEntry, ...currentLogs].slice(0, 200);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to append audit log', e);
  }
}

export function recordAuditLog(
  userName: string,
  userRole: UserRole,
  actionOrCategory: string,
  detailsOrAction: string,
  optionalDetails?: string,
  severity: 'info' | 'warning' | 'success' | 'danger' = 'info'
): void {
  let category = '系統操作';
  let action = actionOrCategory;
  let details = detailsOrAction;

  if (optionalDetails !== undefined) {
    category = actionOrCategory;
    action = detailsOrAction;
    details = optionalDetails;
  }

  logAuditEvent(userName, userRole, category, action, details, severity);
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_LOGS_KEY);
  } catch (e) {
    console.error('Failed to clear audit logs', e);
  }
}
