import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, PlusCircle, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color-1)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.5px' }}>
          VoiceKhata
        </h2>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        
        {['Admin', 'Faculty'].includes(user.role) && (
          <Link to="/add-expense" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Add Expense
          </Link>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={18} color="var(--primary-color)" />
            <span style={{ fontSize: '0.9rem' }}>{user.name} <span style={{ color: 'var(--text-secondary)' }}>({user.role})</span></span>
          </div>
          <button onClick={handleLogout} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
