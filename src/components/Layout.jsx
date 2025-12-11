import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DebugPanel from './DebugPanel';

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <DebugPanel />
    </div>
  );
}

export default Layout;