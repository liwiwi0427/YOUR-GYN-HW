// Roster & Clinical Unit Management Store
// Supports fully customizable units, faculty rosters, and student cohorts

export interface ClinicalUnit {
  id: string;
  code: string;
  name: string;
  floor: string;
  bedCount: number;
  description: string;
  isActive: boolean;
}

export interface FacultyMember {
  id: string;
  facultyNumber: string;
  name: string;
  role: 'instructor' | 'hn_np';
  title: string;
  primaryUnit: string;
  email: string;
  phone: string;
  isMainSupervisor: boolean;
}

export interface StudentMember {
  id: string;
  studentId: string;
  name: string;
  cohort: string;        // 梯次 (例如: 114學年度第1梯次)
  assignedWeek: string;  // 實習週次 (例如: 第 1 週)
  assignedUnit: string;  // 指派實習單位
  assignedInstructor: string; // 指導老師
  groupName: string;     // 小組 (例如: A組)
  isTeamLeader?: boolean;// 是否為梯次小組長
  status: 'active' | 'completed' | 'leave';
}

const STORAGE_UNITS_KEY = 'maternity_clinical_units_v2';
const STORAGE_FACULTY_KEY = 'maternity_faculty_roster_v2';
const STORAGE_STUDENTS_KEY = 'maternity_student_roster_v2';

export const DEFAULT_CLINICAL_UNITS: ClinicalUnit[] = [
  {
    id: 'unit_1',
    code: '5B',
    name: '5B 婦產科病房',
    floor: '醫療大樓 5F',
    bedCount: 42,
    description: '產後母嬰照護、高危險妊娠安胎與婦科術後病房',
    isActive: true,
  },
  {
    id: 'unit_2',
    code: 'L&D',
    name: '產房暨產程待產室 (Labor & Delivery)',
    floor: '醫療大樓 3F',
    bedCount: 12,
    description: '第一至第四產程監測、NST 胎兒監視、自然分娩與急產接生',
    isActive: true,
  },
  {
    id: 'unit_3',
    code: 'NBC',
    name: '新生兒中重度病房 (NBC / SBR)',
    floor: '兒童大樓 4F',
    bedCount: 20,
    description: '新生兒即刻評估、黃疸光療、早產兒保溫箱照護與餵食訓練',
    isActive: true,
  },
  {
    id: 'unit_4',
    code: 'BR',
    name: '母嬰同室親善示範病房 (Baby-Friendly Unit)',
    floor: '醫療大樓 5F',
    bedCount: 16,
    description: '純母乳哺餵指導、肌膚接觸 (STS) 與新手父母個別衛教',
    isActive: true,
  },
  {
    id: 'unit_5',
    code: 'OBS',
    name: '高危險妊娠與產科急診觀察室',
    floor: '醫療大樓 3F',
    bedCount: 8,
    description: '子癇前症 (Pre-eclampsia)、早期破水 (PROM) 與產後大出血觀察',
    isActive: true,
  },
];

export const DEFAULT_FACULTY_ROSTER: FacultyMember[] = [
  {
    id: 'fac_1',
    facultyNumber: 'INS-01',
    name: '臨床實習指導教師',
    role: 'instructor',
    title: '專任產兒科臨床指導教師',
    primaryUnit: '5B 婦產科病房',
    email: 'maternity.instructor@hospital.edu.tw',
    phone: '分機 5201',
    isMainSupervisor: true,
  },
  {
    id: 'fac_2',
    facultyNumber: 'HN-01',
    name: '病房護理長暨臨床督導',
    role: 'hn_np',
    title: '5B 婦產科病房 護理長 (HN)',
    primaryUnit: '5B 婦產科病房',
    email: 'headnurse.5b@hospital.edu.tw',
    phone: '分機 5200',
    isMainSupervisor: false,
  },
  {
    id: 'fac_3',
    facultyNumber: 'NP-01',
    name: '產科專科護理師',
    role: 'hn_np',
    title: '母胎醫學科 專科護理師 (NP)',
    primaryUnit: '產房暨產程待產室 (Labor & Delivery)',
    email: 'np.maternal@hospital.edu.tw',
    phone: '分機 3105',
    isMainSupervisor: false,
  },
];

export const DEFAULT_STUDENT_ROSTER: StudentMember[] = [
  {
    id: 'stu_1',
    studentId: '11231001',
    name: '第一梯次實習護生 (A)',
    cohort: '114學年第一梯次',
    assignedWeek: '1',
    assignedUnit: '5B 婦產科病房',
    assignedInstructor: '臨床實習指導教師',
    groupName: '第 1 組',
    isTeamLeader: true,
    status: 'active',
  },
  {
    id: 'stu_2',
    studentId: '11231002',
    name: '第一梯次實習護生 (B)',
    cohort: '114學年第一梯次',
    assignedWeek: '1',
    assignedUnit: '5B 婦產科病房',
    assignedInstructor: '臨床實習指導教師',
    groupName: '第 1 組',
    isTeamLeader: false,
    status: 'active',
  },
  {
    id: 'stu_3',
    studentId: '11231003',
    name: '第二梯次實習護生 (C)',
    cohort: '114學年第一梯次',
    assignedWeek: '2',
    assignedUnit: '5B 婦產科病房',
    assignedInstructor: '臨床實習指導教師',
    groupName: '第 2 組',
    isTeamLeader: false,
    status: 'active',
  },
  {
    id: 'stu_4',
    studentId: '11231004',
    name: '第二梯次實習護生 (D)',
    cohort: '114學年第一梯次',
    assignedWeek: '2',
    assignedUnit: '產房暨產程待產室 (Labor & Delivery)',
    assignedInstructor: '臨床實習指導教師',
    groupName: '第 2 組',
    isTeamLeader: true,
    status: 'active',
  },
];

// --- Clinical Units Methods ---
export function getClinicalUnits(): ClinicalUnit[] {
  try {
    const raw = localStorage.getItem(STORAGE_UNITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load units', e);
  }
  return DEFAULT_CLINICAL_UNITS;
}

export function saveClinicalUnits(units: ClinicalUnit[]): void {
  try {
    localStorage.setItem(STORAGE_UNITS_KEY, JSON.stringify(units));
  } catch (e) {
    console.error('Failed to save units', e);
  }
}

// --- Faculty Roster Methods ---
export function getFacultyRoster(): FacultyMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_FACULTY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load faculty roster', e);
  }
  return DEFAULT_FACULTY_ROSTER;
}

export function saveFacultyRoster(faculty: FacultyMember[]): void {
  try {
    localStorage.setItem(STORAGE_FACULTY_KEY, JSON.stringify(faculty));
  } catch (e) {
    console.error('Failed to save faculty roster', e);
  }
}

// --- Student Roster Methods ---
export function getStudentRoster(): StudentMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_STUDENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load student roster', e);
  }
  return DEFAULT_STUDENT_ROSTER;
}

export function saveStudentRoster(students: StudentMember[]): void {
  try {
    localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save student roster', e);
  }
}
