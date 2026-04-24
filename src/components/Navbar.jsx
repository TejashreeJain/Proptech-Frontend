import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  Admin: '#fbbf24',
  Manager: '#34d399',
  Agent: '#93c5fd',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h1>🏠 Lead CRM</h1>
      <div className="nav-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/leads">Leads</NavLink>
        <NavLink to="/leads/new">+ Add Lead</NavLink>
      </div>
      <div className="nav-user">
        <span className="nav-user-name">{user?.name}</span>
        <span
          className="nav-user-role"
          style={{ background: roleColors[user?.role] || '#93c5fd' }}
        >
          {user?.role}
        </span>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
