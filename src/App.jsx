import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import NotFound from './pages/NotFound';
import EventDetails from './pages/EventDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import CustomContextMenu from './components/CustomContextMenu';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import OrganizerQRScanner from './pages/organizer/OrganizerQRScanner';
import EventParticipants from './pages/organizer/EventParticipants';
import PendingApproval from './pages/auth/PendingApproval';

import PreviousYear from './pages/PreviousYear';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import NoInternet from './pages/NoInternet';

import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast'; // Added toast import for the blockKeys function

function App() {
  useEffect(() => {
    const blockKeys = (e) => {
      if (!e.key) return;
      const key = e.key.toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u")
      ) {
        e.preventDefault();
        toast.error("Action disabled.");
      }
    };
    document.addEventListener("keydown", blockKeys);
    return () => document.removeEventListener("keydown", blockKeys);
  }, []);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleNetworkError = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-error', handleNetworkError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-error', handleNetworkError);
    };
  }, []);

  if (isOffline) {
    return <NoInternet onRetry={() => setIsOffline(false)} />;
  }

  return (
    <>
      <CustomContextMenu />
      <AppContent />
    </>
  );
}

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function AppContent() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Toaster position="top-right" />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                {/* Organizer Routes */}
                <Route path="/organizer" element={<OrganizerDashboard />} />
                <Route path="/organizer/scan" element={<OrganizerQRScanner />} />
                <Route path="/organizer/events/:eventId/participants" element={<EventParticipants />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/previous-years" element={<PreviousYear />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
