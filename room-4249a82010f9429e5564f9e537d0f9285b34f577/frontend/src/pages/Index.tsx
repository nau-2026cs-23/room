import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../lib/api';
import Navbar from '../components/custom/Navbar';
import HomePage from '../components/custom/HomePage';
import OmniflowBadge from '../components/custom/OmniflowBadge';
import type { ViewType, User } from '../types';

const ResourcesView = lazy(() => import('../components/custom/ResourcesView'));
const ResourceDetailView = lazy(() => import('../components/custom/ResourceDetailView'));
const UploadView = lazy(() => import('../components/custom/UploadView'));
const ProfileView = lazy(() => import('../components/custom/ProfileView'));
const AdminView = lazy(() => import('../components/custom/AdminView'));

const Index = () => {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.success && res.data?.user) {
          setUser(res.data.user as User);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const handleNavigate = (view: ViewType, resourceId?: string) => {
    setCurrentView(view);
    if (view === 'resource-detail' && resourceId) {
      setSelectedResourceId(resourceId);
    } else {
      setSelectedResourceId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;

      case 'resources':
      case 'postgrad':
      case 'civil':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ResourcesView
              onNavigate={handleNavigate}
              initialCategory={
                currentView === 'postgrad' ? 'postgrad' :
                currentView === 'civil' ? 'civil' : ''
              }
            />
          </Suspense>
        );

      case 'resource-detail':
        return selectedResourceId ? (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ResourceDetailView
              resourceId={selectedResourceId}
              onNavigate={handleNavigate}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ResourcesView onNavigate={handleNavigate} />
          </Suspense>
        );

      case 'upload':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <UploadView onNavigate={handleNavigate} />
          </Suspense>
        );

      case 'profile':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ProfileView onNavigate={handleNavigate} initialTab="overview" />
          </Suspense>
        );

      case 'favorites':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ProfileView onNavigate={handleNavigate} initialTab="favorites" />
          </Suspense>
        );

      case 'my-uploads':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ProfileView onNavigate={handleNavigate} initialTab="uploads" />
          </Suspense>
        );

      case 'points':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ProfileView onNavigate={handleNavigate} initialTab="points" />
          </Suspense>
        );

      case 'classes':
      case 'teacher':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <ProfileView onNavigate={handleNavigate} initialTab="classes" />
          </Suspense>
        );

      case 'admin':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">加载中...</div>}>
            <AdminView onNavigate={handleNavigate} />
          </Suspense>
        );

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      {renderView()}
      <OmniflowBadge />
    </div>
  );
};

export default Index;
