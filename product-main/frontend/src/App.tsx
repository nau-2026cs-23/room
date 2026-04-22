import { HashRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<Index />} />
      <Route path="/resources" element={<Index />} />
      <Route path="/resources/:id" element={<Index />} />
      <Route path="/upload" element={<Index />} />
      <Route path="/profile" element={<Index />} />
      <Route path="/points" element={<Index />} />
      <Route path="/ai" element={<Index />} />
      <Route path="/admin" element={<Index />} />
    </Routes>
  </HashRouter>
);

export default App;
