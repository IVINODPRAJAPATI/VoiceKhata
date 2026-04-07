import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@vit.edu');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:8000/auth/login', {
        email,
        password
      });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '85vh', alignItems: 'center', justifyContent: 'center' }}>
        
      {/* Centered Login Card */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Activity color="var(--primary-color)" size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>VoiceKhata</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Smart Expense Management System</p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem', transition: 'border-color 0.3s, box-shadow 0.3s' }} 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem', transition: 'border-color 0.3s, box-shadow 0.3s' }} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', fontSize: '1rem', letterSpacing: '0.5px' }} disabled={loading}>
            {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner"></span> Authenticating...
                </span>
            ) : 'Sign In'}
          </button>
          
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Demo Accounts:</div>
            admin@vit.edu | faculty@vit.edu | accountant@vit.edu<br/>
            (password for all: password)
          </div>
        </form>
      </div>
        
    </div>
  );
};

export default Login;
