import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { UserRole } from '../utils/rbac';
import { authenticateCredentials } from '../utils/auth';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  currentUserRole: UserRole;
  instructorName: string;
  onLogin: (name: string, role: UserRole) => void;
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
  const [selectedRole, setSelectedRole] = useState<'instructor' | 'admin'>('instructor');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const result = await authenticateCredentials(selectedRole, account, password);
      setIsVerifying(false);

      if (!result.success || !result.role || !result.name) {
        setError(result.error || '帳號或密碼驗證錯誤，請重新確認。');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onLogin(result.name!, result.role!);
        setIsSuccess(false);
        setAccount('');
        setPassword('');
        onClose();
      }, 400);
    } catch (err) {
      setIsVerifying(false);
      setError('認證模組發生異常，請重試。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className={`p-5 flex items-center justify-between text-white ${
          selectedRole === 'admin' 
            ? 'bg-gradient-to-r from-purple-900 to-indigo-900' 
            : 'bg-gradient-to-r from-emerald-800 to-teal-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              {selectedRole === 'admin' ? <Shield className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {selectedRole === 'admin' ? '全域系統管理員身分認證' : '實習指導教師身分認證'}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {selectedRole === 'admin' ? 'NIS 護理資訊系統全域治理控制' : '實習作業批閱與核定簽章授權'}
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
        <div className="p-6 space-y-5">
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                currentUserRole === 'admin'
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <ShieldCheck className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  currentUserRole === 'admin' ? 'text-purple-700' : 'text-emerald-700'
                }`} />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">
                    目前已登入身分：{currentUserRole === 'admin' ? '全域系統管理員' : '實習指導教師'}
                    {instructorName && <span className="ml-1 text-slate-600">({instructorName})</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentUserRole === 'admin' 
                      ? '具備最高管理權限 (Level 3)，可全域配置 RBAC 權限矩陣、師生名冊管理與系統稽核日誌。' 
                      : '已解鎖教師評閱權限 (Level 2)，可開啟「雙欄對照批閱視窗」、核定等第成績與留存評語。'}
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
                  切換回學生身分 (登出)
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors ${
                    currentUserRole === 'admin' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  確認返回系統
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('instructor');
                    setError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'instructor'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>實習指導教師</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('admin');
                    setError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>全域系統管理員</span>
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>身分密碼驗證成功，正在載入授權環境...</span>
                </div>
              )}

              {/* Account Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {selectedRole === 'admin' ? '管理員認證帳號' : '指導教師認證帳號'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="請輸入認證帳號"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium text-slate-800"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  安全密碼 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入安全密碼"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium text-slate-800"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`w-full py-2.5 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-purple-800 hover:bg-purple-900 disabled:bg-purple-400'
                      : 'bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400'
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
                      <span>{selectedRole === 'admin' ? '進入全域管理後台' : '登入指導教師批閱模式'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
