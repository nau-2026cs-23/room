import { useState } from 'react';
import { BookOpen, Menu, X, Upload, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import type { User as UserType, ViewType } from '../../types';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  user: UserType | null;
  onLogout: () => void;
}

const Navbar = ({ currentView, onNavigate, user, onLogout }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks: { label: string; view: ViewType }[] = [
    { label: '资料广场', view: 'resources' },
    { label: '考研专区', view: 'postgrad' },
    { label: '考公考编', view: 'civil' },
    { label: '教师空间', view: 'teacher' },
  ];

  return (
    <nav className="bg-white border-b border-[#D8E0EE] sticky top-0 z-50 shadow-[0_1px_3px_0_rgb(26_58_107_/_0.08)]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 transition-all duration-200 hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1A3A6B] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A3A6B] tracking-tight">学资库</span>
            <span className="hidden sm:inline-block text-xs text-[#5A6A85] border border-[#D8E0EE] rounded-full px-2 py-0.5">Beta</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  currentView === link.view
                    ? 'text-[#2E6BE6] bg-blue-50'
                    : 'text-[#0F1C35] hover:text-[#2E6BE6] hover:bg-[#F4F6FA]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('upload')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2E6BE6] border border-[#2E6BE6] rounded-lg hover:bg-[#2E6BE6] hover:text-white transition-all duration-200 transform hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              <span>上传资料</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F4F6FA] transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-[#1A3A6B] flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#0F1C35] max-w-[80px] truncate">{user?.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#5A6A85] transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              <div className={`absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#D8E0EE] shadow-[0_10px_24px_-4px_rgb(26_58_107_/_0.15)] py-1 z-50 transition-all duration-300 transform origin-top-right ${
                userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}>
                <div className="px-3 py-2 border-b border-[#D8E0EE]">
                  <p className="text-sm font-semibold text-[#0F1C35] truncate">{user?.name}</p>
                  <p className="text-xs text-[#5A6A85]">{user?.points || 0} 积分</p>
                </div>
                <button 
                  onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F1C35] hover:bg-[#F4F6FA] transition-colors duration-200"
                >
                  <User className="w-4 h-4 text-[#5A6A85]" />
                  个人中心
                </button>
                <button 
                  onClick={() => { onNavigate('my-uploads'); setUserMenuOpen(false); }} 
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F1C35] hover:bg-[#F4F6FA] transition-colors duration-200"
                >
                  <Upload className="w-4 h-4 text-[#5A6A85]" />
                  我的上传
                </button>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                  <button 
                    onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }} 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0F1C35] hover:bg-[#F4F6FA] transition-colors duration-200"
                  >
                    <Shield className="w-4 h-4 text-[#5A6A85]" />
                    {user?.role === 'admin' ? '管理后台' : '审核资料'}
                  </button>
                )}
                <div className="border-t border-[#D8E0EE] mt-1">
                  <button 
                    onClick={() => { onLogout(); setUserMenuOpen(false); }} 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#F4F6FA] transition-colors duration-200"
            >
              {mobileOpen ? <X className="w-5 h-5 text-[#0F1C35]" /> : <Menu className="w-5 h-5 text-[#0F1C35]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden border-t border-[#D8E0EE] py-3 space-y-1 transition-all duration-300 transform ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => { onNavigate(link.view); setMobileOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                currentView === link.view ? 'text-[#2E6BE6] bg-blue-50' : 'text-[#0F1C35] hover:bg-[#F4F6FA]'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { onNavigate('upload'); setMobileOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#2E6BE6] hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Upload className="w-4 h-4" />
            上传资料
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
