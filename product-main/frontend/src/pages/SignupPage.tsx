import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { BookOpen, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.signup({ username, email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success('注册成功', { description: `欢迎加入学研社！已获得50积分奖励` });
        navigate('/');
      } else {
        toast.error('注册失败', { description: res.message || '请检查输入信息' });
      }
    } catch {
      toast.error('网络错误', { description: '请检查网络连接' });
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
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">创建账号</h1>
          <p className="text-[#64748B] text-sm">注册即获 50 积分奖励，开始你的学习之旅</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
          <div className="flex gap-3 mb-6 p-3 bg-emerald-50 rounded-xl">
            {['注册奖励50积分', '每日签到奖励', '上传资料奖励'].map(t => (
              <div key={t} className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle className="w-3 h-3" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#1E293B] font-medium">昵称</Label>
              <Input
                id="username"
                placeholder="输入您的昵称"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={2}
                className="h-11 border-[#E2E8F0] focus:border-[#6366F1]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1E293B] font-medium">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 border-[#E2E8F0] focus:border-[#6366F1]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1E293B] font-medium">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="至少6个字符"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 border-[#E2E8F0] focus:border-[#6366F1] pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl">
              {loading ? '注册中...' : '立即注册'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-[#64748B]">
            已有账号？{' '}
            <Link to="/login" className="text-[#6366F1] font-medium hover:underline">登录</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
