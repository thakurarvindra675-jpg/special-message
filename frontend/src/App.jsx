import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import MessageReveal from './pages/public/MessageReveal';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import PeopleManager from './pages/admin/PeopleManager';
import PersonEditor from './pages/admin/PersonEditor';
import GlobalSettings from './pages/admin/GlobalSettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/message/:slug" element={<MessageReveal />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/people" element={<PeopleManager />} />
        <Route path="/admin/people/new" element={<PersonEditor />} />
        <Route path="/admin/people/edit/:id" element={<PersonEditor />} />
        <Route path="/admin/settings" element={<GlobalSettings />} />
      </Routes>
    </Router>
  );
}

export default App;
