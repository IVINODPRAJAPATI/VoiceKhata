import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertTriangle, TrendingUp, Download, IndianRupee } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app we'd pass Auth Headers
      const res = await axios.get('http://localhost:8000/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    window.open('http://localhost:8000/reports/pdf', '_blank');
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <span className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></span>
      <p style={{ color: 'var(--text-secondary)' }}>Loading financial insights...</p>
    </div>
  );
  if (!data) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>Failed to load connection data. Please ensure the backend is running.</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Financial Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Dashboard reporting for {user.role}</p>
        </div>
        
        <button onClick={handleDownloadReport} className="btn btn-primary">
          <Download size={18} /> Download Monthly PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%' }}>
            <IndianRupee color="var(--primary-color)" size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Spent</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{data.total.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%' }}>
            <TrendingUp color="var(--warning-color)" size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Predicted Next Month</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{data.prediction.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
        </div>
        
        {data.anomalies.length > 0 && (
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '50%' }}>
              <AlertTriangle color="var(--danger-color)" size={28} />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Anomalies Detected</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger-color)' }}>{data.anomalies.length}</div>
            </div>
          </div>
        )}
      </div>

      {data.total === 0 ? (
        <div className="glass-panel fadeIn" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>No Transactions Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You haven't recorded any expenses yet. Add your first transaction to see analytics.</p>
        </div>
      ) : (
      <div className="grid-dashboard">
        
        {/* Category Setup */}
        <div className="glass-panel" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>Category Breakdown</h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'var(--surface-color-1)', border: '1px solid var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Info */}
        <div className="glass-panel" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>Department Spending</h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip contentStyle={{ background: 'var(--surface-color-1)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Over Time */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1', animation: 'fadeIn 0.7s ease-out' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>Reports & Insights (Trend)</h2>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip contentStyle={{ background: 'var(--surface-color-1)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="value" stroke="var(--success-color)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
      )}
      
      {/* Anomalies List */}
      {data.anomalies.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Potential Outliers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.anomalies.map((anomaly, idx) => (
              <div key={idx} className="glass-panel" style={{ borderLeft: '4px solid var(--danger-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{anomaly.description}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{anomaly.reason}</div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger-color)' }}>
                  ₹{anomaly.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;
