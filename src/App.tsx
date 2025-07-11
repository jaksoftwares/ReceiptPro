import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ReceiptCreator from './components/Receipt/ReceiptCreator';
import BusinessProfile from './components/Profile/BusinessProfile';
import Settings from './components/Settings/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<ReceiptCreator />} />
          <Route path="/edit/:id" element={<ReceiptCreator />} />
          <Route path="/profile" element={<BusinessProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;