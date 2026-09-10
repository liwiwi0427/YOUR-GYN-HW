import { UserRole } from './rbac';
import { recordAuditLog } from './rbac';

export interface UserAccount {
  id: string;
  username: string;           // 登入帳號 (不分大小寫)
  password: string;           // 登入安全密碼
  name: string;               // 使用者姓名 (例如：黎哲瑋、陳秋蓉 老師、林佩儀 同學)
  role: UserRole;             // 'admin' | 'instructor' | 'hn_np' | 'team_leader' | 'student'
  title?: string;             // 專業職稱 (例如：全域系統管理員、專任指導教師、護理長)
  departmentOrUnit?: string;  // 負責單位或實習梯次 (例如：5B 婦產科病房、114學年第一梯次)
  employeeOrStudentId?: string; // 員工編號或學生學號 (例如：INS-01, 11231001)
  email?: string;             // 公務信箱
  phone?: string;             // 聯絡電話/分機
  isActive: boolean;          // 帳號是否啟用
  createdAt: string;          // 建立時間
  lastLoginAt?: string;       // 最後登入時間
  notes?: string;             // 備註說明
}

export const USER_ACCOUNTS_STORAGE_KEY = 'maternity_user_accounts_v3';

// Default initial accounts for all 5 roles
export const DEFAULT_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc_admin_01',
    username: 'admin',
    password: 'admin123',
    name: '黎哲瑋 (全域系統管理員)',
    role: 'admin',
    title: '全域最高系統管理員 (Super Admin)',
    departmentOrUnit: '產科護理資訊系統 (NIS) 資訊中心',
    employeeOrStudentId: 'ADM-01',
    email: 'admin.nis@hospital.edu.tw',
    phone: '分機 1000',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: '全域最高治理權限，管控權限矩陣與資料庫',
  },
  {
    id: 'acc_ins_01',
    username: 'teacher',
    password: 'teacher123',
    name: '臨床實習指導教師',
    role: 'instructor',
    title: '專任產兒科臨床指導教師',
    departmentOrUnit: '5B 婦產科病房',
    employeeOrStudentId: 'INS-01',
    email: 'maternity.instructor@hospital.edu.tw',
    phone: '分機 5201',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: '負責雙欄對照批閱、成績核定與教師電子簽章',
  },
  {
    id: 'acc_hn_01',
    username: 'hn01',
    password: 'hn123',
    name: '病房護理長暨臨床督導',
    role: 'hn_np',
    title: '5B 婦產科病房 護理長 (HN)',
    departmentOrUnit: '5B 婦產科病房',
    employeeOrStudentId: 'HN-01',
    email: 'headnurse.5b@hospital.edu.tw',
    phone: '分機 5200',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: '負責病房臨床品質把關、高危個案覆核',
  },
  {
    id: 'acc_leader_01',
    username: 'leader',
    password: 'leader123',
    name: '實習小組長 (張組長)',
    role: 'team_leader',
    title: '第一梯次實習小組長',
    departmentOrUnit: '114學年第一梯次 A組',
    employeeOrStudentId: '11231001',
    email: 'leader.stu@hospital.edu.tw',
    phone: '分機 5210',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: '負責梯次催繳統計、同儕互審初核',
  },
  {
    id: 'acc_stu_01',
    username: 'student',
    password: 'student123',
    name: '實習護生 (第一梯次)',
    role: 'student',
    title: '實習護生 (Nursing Intern)',
    departmentOrUnit: '114學年第一梯次 A組',
    employeeOrStudentId: '11231002',
    email: 'student.intern@hospital.edu.tw',
    phone: '',
    isActive: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: '臨床實習個案記錄填寫與每週作業維護',
  },
];

// Broadcast channel for realtime account updates across tabs
let accountBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    accountBroadcastChannel = new BroadcastChannel('maternity_user_accounts_channel');
  } catch (e) {
    console.warn('BroadcastChannel not supported for user accounts');
  }
}

/**
 * Retrieve all registered user accounts from persistent storage
 */
export function getUserAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USER_ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user accounts from localStorage', err);
  }

  // First time initialization: save default accounts
  saveUserAccounts(DEFAULT_USER_ACCOUNTS, false);
  return DEFAULT_USER_ACCOUNTS;
}

/**
 * Save user accounts to persistent storage
 */
export function saveUserAccounts(accounts: UserAccount[], broadcast: boolean = true): void {
  try {
    localStorage.setItem(USER_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    if (broadcast && accountBroadcastChannel) {
      accountBroadcastChannel.postMessage({ type: 'ACCOUNTS_UPDATED', timestamp: Date.now() });
    }
  } catch (err) {
    console.error('Failed to save user accounts to localStorage', err);
  }
}

/**
 * Add a new user account with uniqueness validation
 */
export function addUserAccount(
  accountData: Omit<UserAccount, 'id' | 'createdAt'>
): { success: boolean; account?: UserAccount; error?: string } {
  const cleanUsername = accountData.username.trim().toLowerCase();
  const cleanPassword = accountData.password.trim();
  const cleanName = accountData.name.trim();

  if (!cleanUsername) {
    return { success: false, error: '請輸入登入帳號' };
  }
  if (!cleanPassword) {
    return { success: false, error: '請輸入安全密碼' };
  }
  if (!cleanName) {
    return { success: false, error: '請輸入使用者姓名' };
  }

  const currentAccounts = getUserAccounts();
  const exists = currentAccounts.some(
    (acc) => acc.username.trim().toLowerCase() === cleanUsername
  );

  if (exists) {
    return { success: false, error: `帳號「${accountData.username}」已存在，請使用不同帳號。` };
  }

  const newAccount: UserAccount = {
    ...accountData,
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    password: cleanPassword,
    name: cleanName,
    isActive: accountData.isActive ?? true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newAccount, ...currentAccounts];
  saveUserAccounts(updated);

  recordAuditLog(
    '系統管理員',
    'admin',
    '帳號管理',
    `建立新帳號：${newAccount.username} (${newAccount.name})`,
    `身分角色：${newAccount.role}，單位：${newAccount.departmentOrUnit || '未指派'}`,
    'success'
  );

  return { success: true, account: newAccount };
}

/**
 * Update an existing user account
 */
export function updateUserAccount(
  id: string,
  updates: Partial<Omit<UserAccount, 'id' | 'createdAt'>>
): { success: boolean; account?: UserAccount; error?: string } {
  const currentAccounts = getUserAccounts();
  const targetIndex = currentAccounts.findIndex((acc) => acc.id === id);

  if (targetIndex === -1) {
    return { success: false, error: '找不到欲更新的帳號' };
  }

  // If username is being changed, verify uniqueness
  if (updates.username) {
    const cleanUsername = updates.username.trim().toLowerCase();
    const duplicate = currentAccounts.some(
      (acc) => acc.id !== id && acc.username.trim().toLowerCase() === cleanUsername
    );
    if (duplicate) {
      return { success: false, error: `帳號「${updates.username}」已被其他使用者佔用` };
    }
  }

  const existing = currentAccounts[targetIndex];
  const updatedAccount: UserAccount = {
    ...existing,
    ...updates,
    username: updates.username ? updates.username.trim().toLowerCase() : existing.username,
    password: updates.password !== undefined ? updates.password.trim() : existing.password,
    name: updates.name ? updates.name.trim() : existing.name,
  };

  const updatedList = [...currentAccounts];
  updatedList[targetIndex] = updatedAccount;
  saveUserAccounts(updatedList);

  recordAuditLog(
    '系統管理員',
    'admin',
    '帳號管理',
    `更新帳號：${updatedAccount.username} (${updatedAccount.name})`,
    `變更資料與密碼設定`,
    'info'
  );

  return { success: true, account: updatedAccount };
}

/**
 * Delete a user account (with protection for root admin)
 */
export function deleteUserAccount(id: string): { success: boolean; error?: string } {
  const currentAccounts = getUserAccounts();
  const target = currentAccounts.find((acc) => acc.id === id);

  if (!target) {
    return { success: false, error: '欲刪除的帳號不存在' };
  }

  // Protect the last active admin from deletion
  if (target.role === 'admin') {
    const adminCount = currentAccounts.filter((acc) => acc.role === 'admin' && acc.isActive).length;
    if (adminCount <= 1) {
      return { success: false, error: '系統必須至少保留一位啟用的全域管理員帳號，無法刪除此帳號。' };
    }
  }

  const updatedList = currentAccounts.filter((acc) => acc.id !== id);
  saveUserAccounts(updatedList);

  recordAuditLog(
    '系統管理員',
    'admin',
    '帳號管理',
    `刪除帳號：${target.username} (${target.name})`,
    `已永久自系統帳號庫移除`,
    'warning'
  );

  return { success: true };
}

/**
 * Reset all user accounts to system defaults
 */
export function resetUserAccountsToDefault(): void {
  saveUserAccounts(DEFAULT_USER_ACCOUNTS);
  recordAuditLog(
    '系統管理員',
    'admin',
    '帳號管理',
    '還原預設系統帳號清單',
    '所有管理員、指導教師、督導與學生帳號已重置為初始示範名冊',
    'warning'
  );
}

export interface UserAuthResult {
  success: boolean;
  account?: UserAccount;
  role?: UserRole;
  name?: string;
  error?: string;
}

/**
 * Authenticates user credentials against the dynamic User Accounts store.
 * Supports exact or flexible role matching and records the last login time.
 */
export function authenticateWithUserAccounts(
  usernameInput: string,
  passwordInput: string,
  targetRole?: UserRole
): UserAuthResult {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: '請輸入認證帳號' };
  }
  if (!cleanPassword) {
    return { success: false, error: '請輸入安全密碼' };
  }

  const accounts = getUserAccounts();
  const matched = accounts.find(
    (acc) => acc.username.trim().toLowerCase() === cleanUsername
  );

  if (!matched) {
    return {
      success: false,
      error: `查無此帳號「${usernameInput}」，請確認是否已於管理員介面新增該帳號。`,
    };
  }

  if (!matched.isActive) {
    return {
      success: false,
      error: `帳號「${matched.username}」目前處於停用狀態，請聯繫全域系統管理員啟用。`,
    };
  }

  if (matched.password !== cleanPassword) {
    return {
      success: false,
      error: '密碼驗證錯誤，請重新確認後再試。',
    };
  }

  // If a specific role tab was selected, check role compatibility
  if (targetRole) {
    // If logging into Admin tab, user must have admin role
    if (targetRole === 'admin' && matched.role !== 'admin') {
      return {
        success: false,
        error: `此帳號身分為「${matched.role}」，未具備全域管理員 (admin) 權限。`,
      };
    }
    // If logging into Teacher tab, user must be instructor or hn_np or admin
    if (targetRole === 'instructor' && !['instructor', 'hn_np', 'admin'].includes(matched.role)) {
      return {
        success: false,
        error: `此帳號身分為「${matched.role}」，未具備教師批閱或督導權限。`,
      };
    }
  }

  // Update last login timestamp
  matched.lastLoginAt = new Date().toISOString();
  saveUserAccounts(accounts, false);

  recordAuditLog(
    matched.name,
    matched.role,
    '使用者登入',
    `帳號登入成功：${matched.username}`,
    `身分：${matched.role}，姓名：${matched.name}`,
    'success'
  );

  return {
    success: true,
    account: matched,
    role: matched.role,
    name: matched.name,
  };
}
