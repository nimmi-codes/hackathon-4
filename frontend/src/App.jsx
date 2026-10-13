import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { homeFor, useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import BrowseFound from './pages/BrowseFound.jsx';
import ReportForm from './pages/ReportForm.jsx';
import MyReports from './pages/MyReports.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ManageItems from './pages/ManageItems.jsx';
import Claims from './pages/Claims.jsx';
import { Skeleton } from './components/UI.jsx';

function Guard({ admin, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton count={3} />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/app" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton count={1} />;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function App() {
  const location = useLocation();
  return (
    <Layout>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />

        <Route path="/app" element={<Navigate to="/app/browse" replace />} />
        <Route path="/app/browse" element={<Guard><BrowseFound /></Guard>} />
        <Route path="/app/lost" element={<Guard><ReportForm type="lost" /></Guard>} />
        <Route path="/app/found" element={<Guard><ReportForm type="found" /></Guard>} />
        <Route path="/app/reports" element={<Guard><MyReports /></Guard>} />

        <Route path="/admin" element={<Navigate to="/admin/items" replace />} />
        <Route path="/admin/dashboard" element={<Guard admin><Dashboard /></Guard>} />
        <Route path="/admin/items" element={<Guard admin><ManageItems /></Guard>} />
        <Route path="/admin/claims" element={<Guard admin><Claims /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
