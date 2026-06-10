import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CountyProvider } from './context/CountyContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './components/AuthPage';
import TopNav from './components/TopNav';
import CitizenDashboard from './components/CitizenDashboard';
import ContractorDashboard from './components/ContractorDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import AdminDashboard from './components/AdminDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GISCenter from './pages/GISCenter';
import Telemetry from './pages/Telemetry';
import Agents from './pages/Agents';
import Fleet from './pages/Fleet';
import SmartBinNetwork from './pages/SmartBinNetwork';
import CitizenPortal from './pages/CitizenPortal';
import ContractorPortal from './pages/ContractorPortal';
import ExecutivePortal from './pages/ExecutivePortal';
import Sustainability from './pages/Sustainability';
import IncidentCenter from './pages/IncidentCenter';
import DigitalTwin from './pages/DigitalTwin';
import ReportGenerator from './pages/ReportGenerator';
import UserManagement from './pages/UserManagement';
import AuditTrail from './pages/AuditTrail';
import Notifications from './pages/Notifications';
import SystemSettings from './pages/SystemSettings';
import Profile from './pages/Profile';
import Permissions from './pages/Permissions';

function RoleDashboard() {
  const { effectiveRole, isAuthenticated } = useAuth();

  // If not authenticated, redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Route to role-specific dashboard
  switch (effectiveRole) {
    case 'citizen': return <CitizenDashboard />;
    case 'contractor': return <ContractorDashboard />;
    case 'dispatcher': return <DispatcherDashboard />;
    case 'municipal_admin': return <AdminDashboard />;
    case 'executive': return <ExecutiveDashboard />;
    case 'super_admin': return <SuperAdminDashboard />;
    default: return <CitizenDashboard />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CountyProvider>
          <div className="min-h-screen bg-slate-900 text-slate-50">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </div>
        </CountyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function MainLayout() {
  return (
    <>
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Role-specific dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/citizen" element={<ProtectedRoute><CitizenPortal /></ProtectedRoute>} />
          <Route path="/contractor" element={<ProtectedRoute roles={['contractor','dispatcher','municipal_admin','super_admin']}><ContractorPortal /></ProtectedRoute>} />
          <Route path="/dispatcher" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><DispatcherDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['municipal_admin','super_admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/executive" element={<ProtectedRoute roles={['executive','municipal_admin','super_admin']}><ExecutivePortal /></ProtectedRoute>} />
          <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
          {/* Shared pages */}
          <Route path="/gis" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><GISCenter /></ProtectedRoute>} />
          <Route path="/telemetry" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><Telemetry /></ProtectedRoute>} />
          <Route path="/agents" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><Agents /></ProtectedRoute>} />
          <Route path="/fleet" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><Fleet /></ProtectedRoute>} />
          <Route path="/bins" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><SmartBinNetwork /></ProtectedRoute>} />
          <Route path="/sustainability" element={<ProtectedRoute roles={['executive','municipal_admin','super_admin']}><Sustainability /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute roles={['dispatcher','municipal_admin','super_admin']}><IncidentCenter /></ProtectedRoute>} />
          <Route path="/digital-twin" element={<ProtectedRoute roles={['executive','municipal_admin','super_admin']}><DigitalTwin /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportGenerator /></ProtectedRoute>} />
          {/* Admin pages */}
          <Route path="/users" element={<ProtectedRoute roles={['municipal_admin','super_admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute roles={['municipal_admin','super_admin']}><AuditTrail /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute roles={['municipal_admin','super_admin']}><SystemSettings /></ProtectedRoute>} />
          <Route path="/permissions" element={<ProtectedRoute roles={['super_admin']}><Permissions /></ProtectedRoute>} />
          {/* User pages */}
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
