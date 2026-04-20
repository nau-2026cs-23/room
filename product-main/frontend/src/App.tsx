import { HashRouter, Routes, Route } from 'react-router-dom';
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

const App = () => (
  <HashRouter>
    <NavBar />
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
  </HashRouter>
);

export default App;
