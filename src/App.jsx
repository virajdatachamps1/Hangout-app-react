import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Training from './pages/Training';
import Celebrations from './pages/Celebrations';
import SOPs from './pages/SOPs';
import Kudos from './pages/Kudos';
import Timesheets from './pages/Timesheets';
import Announcements from './pages/Announcements';
import Layout from './components/Layout';
import Learning from './pages/Learning';
import CSVImport from './pages/CSVImport';
import Photos from './pages/Photos';
import ProfileSetup from './pages/ProfileSetup';
import FileUpload from './pages/FileUpload';
import Profile from './pages/Profile';
import TimesheetLink from './pages/TimesheetLink';
import './App.css';
import './styles/glassmorphism.css';
import './styles/dark-theme.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="training" element={<Training />} />
            <Route path="celebrations" element={<Celebrations />} />
            <Route path="sops" element={<SOPs />} />
            <Route path="kudos" element={<Kudos />} />
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="learning" element={<Learning />} />
            <Route path="csv-import" element={<CSVImport />} />
            <Route path="photos" element={<Photos />} />
            <Route path="file-upload" element={<FileUpload />} />
            <Route path="profile" element={<Profile />} />
            <Route path="timesheet-link" element={<TimesheetLink />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;