/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CommunityPage from './pages/CommunityPage';
import AboutUs from './pages/AboutUs';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}
