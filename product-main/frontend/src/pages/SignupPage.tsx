import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { BookOpen, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const getPasswordStrength = (pwd: string): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
    if (pwd.length < 6) {
      return { strength: 'weak', message: '??????????' };
    } else if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[^A-Za-z0-9]/.test(pwd)) {
      return { strength: 'medium', message: '??????????' };
    } else {
      return { strength: 'strong', message: '?????????' };
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!username) {
      newErrors.username = '?????????';
    } else if (username.length < 2) {
      newErrors.username = '??????????2?????';
    }
    
    if (!email) {
      newErrors.email = '??????????';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '????????§¹????????';
    }
    
    if (!password) {
      newErrors.password = '??????????';
    } else if (password.length < 6) {
      newErrors.password = '???????????6?????';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '?????????';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = '????????????????';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await authApi.signup({ username, email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success('?????', { description: `???????????´|????50???????` });
        navigate('/');
      } else {
        toast.error('??????', { description: res.message || '???????????' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('???????', { description: '????????????' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">&#23398;&#30740;&#31038;</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">???????</h1>
          <p className="text-[#64748B] text-sm">????? 50 ????????????????????</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
          <div className="flex gap-3 mb-6 p-3 bg-emerald-50 rounded-xl">
            {['?????50????', '??????????', '??????????'].map(t => (
              <div key={t} className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle className="w-3 h-3" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#1E293B] font-medium">???</Label>
              <Input
                id="username"
                placeholder="???????????"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                required
                minLength={2}
                className={`h-11 border-[#E2E8F0] focus:border-[#6366F1] ${errors.username ? 'border-red-300 focus:border-red-400' : ''}`}
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1E293B] font-medium">????</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                required
                className={`h-11 border-[#E2E8F0] focus:border-[#6366F1] ${errors.email ? 'border-red-300 focus:border-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1E293B] font-medium">????</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="????6?????"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  required
                  minLength={6}
                  className={`h-11 border-[#E2E8F0] focus:border-[#6366F1] pr-10 ${errors.password ? 'border-red-300 focus:border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className={`text-xs mt-1 ${getPasswordStrength(password).strength === 'weak' ? 'text-red-500' : getPasswordStrength(password).strength === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {getPasswordStrength(password).message}
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1E293B] font-medium">???????</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPwd ? 'text' : 'password'}
                  placeholder="???????????"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  required
                  minLength={6}
                  className={`h-11 border-[#E2E8F0] focus:border-[#6366F1] pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]">
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <input type="checkbox" id="terms" required className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="terms" className="flex items-center gap-1">
                ?????
                <Link to="/terms" className="text-[#6366F1] hover:underline">???§¿??</Link>
                ??
                <Link to="/privacy" className="text-[#6366F1] hover:underline">???????</Link>
              </label>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl">
              {loading ? '?????...' : '???????'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-[#64748B]">
            ????????{' '}
            <Link to="/login" className="text-[#6366F1] font-medium hover:underline">???</Link>
          </div>
        </div>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">????????</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>? ????????????????????????????????????</li>
            <li>? ????????????????????????</li>
            <li>? ????????????????????</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
