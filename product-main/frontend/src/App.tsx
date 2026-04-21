import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NavBar from './components/custom/NavBar';
import HomePage from './components/custom/HomePage';
import ResourceListPage from './components/custom/ResourceListPage';
import ResourceDetailPage from './components/custom/ResourceDetailPage';
import UploadPage from './components/custom/UploadPage';
import ProfilePage from './components/custom/ProfilePage';
import PointsPage from './components/custom/PointsPage';
import AIAssistantPage from './components/custom/AIAssistantPage';
import AdminPage from './components/custom/AdminPage';

type AppView = 'home' | 'resources' | 'ai' | 'upload' | 'profile' | 'points' | 'admin';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getCurrentView = (): AppView => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/resources') return 'resources';
    if (path === '/ai') return 'ai';
    if (path === '/upload') return 'upload';
    if (path === '/profile') return 'profile';
    if (path === '/points') return 'points';
    if (path === '/admin') return 'admin';
    return 'home';
  };
  
  const handleNavigate = (view: string) => {
    navigate(`/${view}`);
  };
  
  return (
    <>
      <NavBar currentView={getCurrentView()} onNavigate={handleNavigate} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/points" element={<PointsPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
};

const App = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
