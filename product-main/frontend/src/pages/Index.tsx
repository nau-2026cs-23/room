import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import NavBar from '@/components/custom/NavBar';
import HomePage from '@/components/custom/HomePage';
import ResourceListPage from '@/components/custom/ResourceListPage';
import ResourceDetailPage from '@/components/custom/ResourceDetailPage';
import UploadPage from '@/components/custom/UploadPage';
import ProfilePage from '@/components/custom/ProfilePage';
import PointsPage from '@/components/custom/PointsPage';
import AdminPage from '@/components/custom/AdminPage';
import AIAssistantPage from '@/components/custom/AIAssistantPage';

export type AppView = 
  | 'home'
  | 'resources'
  | 'resource-detail'
  | 'upload'
  | 'profile'
  | 'points'
  | 'admin'
  | 'ai';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id: string }>();
  
  const [view, setView] = useState<AppView>('home');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<{ category?: string; stage?: string }>({});

  // 处理 URL 变化，更新视图
  useEffect(() => {
    const path = location.pathname;
    if (path === '/home') {
      setView('home');
    } else if (path === '/resources') {
      setView('resources');
    } else if (path.startsWith('/resources/') && params.id) {
      setSelectedResourceId(params.id);
      setView('resource-detail');
    } else if (path === '/upload') {
      if (!user) {
        navigate('/login');
      } else {
        setView('upload');
      }
    } else if (path === '/profile') {
      if (!user) {
        navigate('/login');
      } else {
        setView('profile');
      }
    } else if (path === '/points') {
      if (!user) {
        navigate('/login');
      } else {
        setView('points');
      }
    } else if (path === '/admin') {
      if (!user) {
        navigate('/login');
      } else {
        setView('admin');
      }
    } else if (path === '/ai') {
      if (!user) {
        navigate('/login');
      } else {
        setView('ai');
      }
    } else {
      setView('home');
    }
  }, [location.pathname, params.id, user, navigate]);

  const goToResource = (id: string) => {
    setSelectedResourceId(id);
    setView('resource-detail');
    navigate(`/resources/${id}`);
  };

  const goToResources = (filter?: { category?: string; stage?: string }) => {
    if (filter) setResourceFilter(filter);
    setView('resources');
    navigate('/resources');
  };

  const requireAuth = (targetView: AppView) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setView(targetView);
    navigate(`/${targetView}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster />
      <NavBar
        currentView={view}
        onNavigate={(v) => {
          if (v === 'upload' || v === 'profile' || v === 'points' || v === 'admin' || v === 'ai') {
            requireAuth(v);
          } else {
            setView(v as AppView);
            navigate(`/${v}`);
          }
        }}
      />
      <main>
        {view === 'home' && (
          <HomePage
            onGoToResources={goToResources}
            onGoToResource={goToResource}
            onGoToAI={() => requireAuth('ai')}
          />
        )}
        {view === 'resources' && (
          <ResourceListPage
            initialFilter={resourceFilter}
            onGoToResource={goToResource}
          />
        )}
        {view === 'resource-detail' && selectedResourceId && (
          <ResourceDetailPage
            resourceId={selectedResourceId}
            onBack={() => {
              setView('resources');
              navigate('/resources');
            }}
          />
        )}
        {view === 'upload' && user && (
          <UploadPage onSuccess={() => {
            setView('profile');
            navigate('/profile');
          }} />
        )}
        {view === 'profile' && user && (
          <ProfilePage
            onGoToResource={goToResource}
            onGoToPoints={() => {
              setView('points');
              navigate('/points');
            }}
            onGoToCert={() => setView('profile')}
          />
        )}
        {view === 'points' && user && (
          <PointsPage />
        )}
        {view === 'admin' && user && (
          <AdminPage onGoToResource={goToResource} />
        )}
        {view === 'ai' && user && (
          <AIAssistantPage />
        )}
      </main>
      <OmniflowBadge />
    </div>
  );
}
