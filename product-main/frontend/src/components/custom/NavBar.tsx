import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Search, Upload, User, Coins, Shield, Bot, Menu, X, LogOut, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import type { AppView } from '@/pages/Index';

interface NavBarProps {
  currentView: AppView;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'home', label: '首页', icon: BookOpen },
  { id: 'resources', label: '资料库', icon: Search },
  { id: 'ai', label: 'AI助手', icon: Bot },
  { id: 'upload', label: '上传', icon: Upload },
];

export default function NavBar({ currentView, onNavigate }: NavBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F172A] text-lg hidden sm:block">&#23398;&#30740;&#31038;</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('points')}
                  className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-amber-100 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />
                  {user.points}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1.5 transition-colors"
                  >
                    <div className="w-7 h-7 bg-[#6366F1] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-[#1E293B] max-w-[80px] truncate">{user.username}</span>
                    {user.isTeacherCertified && (
                      <Badge className="hidden sm:flex bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 h-4">认证</Badge>
                    )}
                    <ChevronDown className="w-3 h-3 text-[#64748B]" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1 z-50">
                      <button onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-slate-50">
                        <User className="w-4 h-4" /> 个人中心
                      </button>
                      <button onClick={() => { onNavigate('points'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-slate-50">
                        <Coins className="w-4 h-4" /> 积分中心
                      </button>
                      {(user.role === 'admin' || user.role === 'reviewer') && (
                        <button onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1E293B] hover:bg-slate-50">
                          <Shield className="w-4 h-4" /> 审核后台
                        </button>
                      )}
                      <div className="border-t border-[#E2E8F0] my-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-[#64748B] hover:text-[#1E293B]">登录</Button>
                <Button size="sm" onClick={() => navigate('/signup')} className="bg-[#0F172A] text-white hover:bg-[#1E293B] rounded-lg">注册</Button>
              </div>
            )}
            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          {user && (
            <>
              <button onClick={() => { onNavigate('profile'); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-slate-100">
                <User className="w-4 h-4" /> 个人中心
              </button>
              <button onClick={() => { onNavigate('points'); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-slate-100">
                <Coins className="w-4 h-4" /> 积分中心 ({user.points}分)
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
