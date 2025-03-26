import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../styles/global.css';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="app-container">
      {user && <Navbar role={user.role} />}
      <div className="content-wrapper">
        {user && <Sidebar role={user.role} />}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;