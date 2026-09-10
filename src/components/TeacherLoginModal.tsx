import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  KeyRound, 
  X, 
  AlertCircle, 
  GraduationCap, 
  CheckCircle2, 
  LogOut,
  Shield,
  User,
  Loader2,
  Eye,
  EyeOff,
  Stethoscope,
  Users,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { UserRole } from '../utils/rbac';
import { authenticateCredentials, authenticateAnyCredentials } from '../utils/auth';
import { getUserAccounts, UserAccount } from '../utils/userAccounts';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentUserRole: UserRole;
  instructorName: string;
  onLogin: (name: string, role: UserRole, account?: UserAccount) => void;
  onLogout: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  currentUserRole,
  instructorName,
  onLogin,
  onLogout,
}) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<'universal' | 'instructor' | 'admin' | 'student'>('universal');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; role: UserRole } | null>(null);
  const [showQuickAccounts, setShowQuickAccounts] = useState(false);

  // Load real user accounts from persistent store (including those added in Admin Console)
  const [availableAccounts, setAvailableAccounts] = useState<UserAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAvailableAccounts(getUserAccounts().filter((a) => a.isActive));
      setError('');
      setIsSuccess(false);
      setSuccessInfo(null);
    }
  }, [isOpen]);

  // Filter accounts according to tab if desired
  const filteredQuickAccounts = useMemo(() => {
    if (selectedRoleTab === 'admin') {
      return availableAccounts.filter((a) => a.role === 'admin');
    }
    if (selectedRoleTab === 'instructor') {
      return availableAccounts.filter((a) => a.role === 'instructor' || a.role === 'hn_np');
    }
    if (selectedRoleTab === 'student') {
      return availableAccounts.filter((a) => a.role === 'student' || a.role === 'team_leader');
    }
    return availableAccounts;
  }, [availableAccounts, selectedRoleTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      let result;
      if (selectedRoleTab === 'universal') {
        // Authenticate any account and automatically apply the role configured in Admin Console
        result = await authenticateAnyCredentials(account, password);
      } else if (selectedRoleTab === 'admin') {
        result = await authenticateCredentials('admin', account, password);
      } else if (selectedRoleTab === 'instructor') {
        result = await authenticateCredentials('instructor', account, password);
      } else {
        result = await authenticateCredentials('student', account, password);
      }

      setIsVerifying(false);

      if (!result.success || !result.role || !result.name) {
        setError(result.error || '帳號或密碼驗證錯誤，請確認後重新輸入。');
        return;
      }

      setIsSuccess(true);
      setSuccessInfo({ name: result.name, role: result.role });

      setTimeout(() => {
        onLogin(result.name!, result.role!, result.account);
        setIsSuccess(false);
        setAccount('');
        setPassword('');
        onClose();
      }, 500);
    } catch (err) {
      setIsVerifying(false);
      setError('身分認證模組發生異常，請重試。');
    }
  };

  const handleSelectQuickAccount = (acc: UserAccount) => {
    setAccount(acc.username);
    setPassword(acc.password);
    setError('');
    setShowQuickAccounts(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: '全域管理員', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'instructor':
        return { label: '實習指導教師', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'hn_np':
        return { label: '護理長/專師', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'team_leader':
        return { label: '梯次小組長', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'student':
        return { label: '實習護生', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: '使用者', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between text-white shrink-0 ${
          selectedRoleTab === 'admin'
            ? 'bg-gradient-to-r from-purple-900 to-indigo-900'
            : selectedRoleTab === 'instructor'
            ? 'bg-gradient-to-r from-emerald-800 to-teal-800'
            : selectedRoleTab === 'student'
            ? 'bg-gradient-to-r from-blue-700 to-indigo-800'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
              {selectedRoleTab === 'admin' ? (
                <Shield className="w-6 h-6" />
              ) : selectedRoleTab === 'instructor' ? (
                <GraduationCap className="w-6 h-6" />
              ) : selectedRoleTab === 'student' ? (
                <Users className="w-6 h-6" />
              ) : (
                <KeyRound className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>
                  {selectedRoleTab === 'admin'
                    ? '全域系統管理員登入'
                    : selectedRoleTab === 'instructor'
                    ? '實習指導教師 / 督導登入'
                    : selectedRoleTab === 'student'
                    ? '實習護生 / 小組長登入'
                    : '產科 NIS 系統身分認證'}
                </span>
              </h3>
              <p className="text-xs text-white/80 font-medium">
                支援管理員後台動態建立之真實帳號與密碼
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                currentUserRole === 'admin'
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : currentUserRole === 'instructor' || currentUserRole === 'hn_np'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <ShieldCheck className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  currentUserRole === 'admin'
                    ? 'text-purple-700'
                    : currentUserRole === 'instructor' || currentUserRole === 'hn_np'
                    ? 'text-emerald-700'
                    : 'text-blue-700'
                }`} />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">
                    目前已登入身分：
                    <span className="ml-1 underline font-bold">
                      {currentUserRole === 'admin'
                        ? '全域最高系統管理員'
                        : currentUserRole === 'instructor'
                        ? '實習指導教師'
                        : currentUserRole === 'hn_np'
                        ? '護理長暨專師督導'
                        : currentUserRole === 'team_leader'
                        ? '梯次實習小組長'
                        : '實習護生'}
                    </span>
                    {instructorName && <span className="ml-1 text-slate-600">({instructorName})</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {currentUserRole === 'admin'
                      ? '已開啟全域治理權限，可自由配置 RBAC 權限矩陣、新增帳號密碼與檢視系統日誌。'
                      : currentUserRole === 'instructor' || currentUserRole === 'hn_np'
                      ? '已解鎖雙欄對照批閱、成績核定與指導教師電子章授權簽署。'
                      : '已載入專屬護生作業與每週個案填寫空間。'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  切換登出
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors ${
                    currentUserRole === 'admin'
                      ? 'bg-purple-700 hover:bg-purple-800'
                      : currentUserRole === 'instructor' || currentUserRole === 'hn_np'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  確認返回系統
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('universal');
                    setError('');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRoleTab === 'universal'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  全角色
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('instructor');
                    setError('');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRoleTab === 'instructor'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  指導教師
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('admin');
                    setError('');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRoleTab === 'admin'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  管理員
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('student');
                    setError('');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRoleTab === 'student'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  護生/組長
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {isSuccess && successInfo && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>
                    登入成功！歡迎 <strong>{successInfo.name}</strong>，正在載入授權環境...
                  </span>
                </div>
              )}

              {/* Account Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    認證登入帳號 <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAccounts(!showQuickAccounts)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>查看現有帳號 ({availableAccounts.length})</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showQuickAccounts ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="請輸入後台建立之帳號 (例：admin, teacher, 11231001)"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-800"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Quick Accounts Helper Drawer */}
              {showQuickAccounts && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-500 px-1 flex items-center justify-between">
                    <span>點選任一帳號快速帶入表單：</span>
                    <span className="text-slate-400">已啟用帳號</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredQuickAccounts.map((acc) => {
                      const badge = getRoleBadge(acc.role);
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSelectQuickAccount(acc)}
                          className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 group-hover:text-indigo-900">
                              {acc.username}
                            </span>
                            <span className="text-slate-500 text-[11px] truncate max-w-[120px]">
                              {acc.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  安全密碼 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-medium text-slate-800"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                    title={showPassword ? '隱藏密碼' : '顯示密碼'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`w-full py-2.5 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    selectedRoleTab === 'admin'
                      ? 'bg-purple-800 hover:bg-purple-900 disabled:bg-purple-400'
                      : selectedRoleTab === 'instructor'
                      ? 'bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400'
                      : selectedRoleTab === 'student'
                      ? 'bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400'
                      : 'bg-slate-900 hover:bg-indigo-950 disabled:bg-slate-400'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在驗證憑證...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {selectedRoleTab === 'admin'
                          ? '登入全域管理後台'
                          : selectedRoleTab === 'instructor'
                          ? '登入指導教師批閱模式'
                          : selectedRoleTab === 'student'
                          ? '登入護生作業系統'
                          : '驗證登入並切換身分'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Hint */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  帳號密碼可由全域管理員在「管理後台 &gt; 帳號管理」隨時新增、修改密碼或啟用/停用。
                </span>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
