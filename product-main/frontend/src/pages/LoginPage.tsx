import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
        toast.success('登录成功', { description: `欢迎回来，${res.data.user.username}` });
        navigate('/');
      } else {
        toast.error('登录失败', { description: res.message || '邮箱或密码错误' });
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
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">登录账号</h1>
          <p className="text-[#64748B] text-sm">登录后可下载资料、上传内容、使用AI助手</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="输入密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 border-[#E2E8F0] focus:border-[#6366F1] pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-xl">
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-[#64748B]">
            还没有账号？{' '}
            <Link to="/signup" className="text-[#6366F1] font-medium hover:underline">立即注册</Link>
          </div>
        </div>
        <p className="text-center text-xs text-[#64748B] mt-6">
          登录即表示您同意《用户协议》及《隐私政策》
        </p>
      </div>
    </div>
  );
}
