import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import AddExpense from './components/expenses/AddExpense';
import Navbar from './components/layout/Navbar';
import ChatInterface from './components/chatbot/ChatInterface';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <div className="app-container">
        {children}
      </div>
      {user && <ChatInterface />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['Admin', 'Faculty', 'Accountant']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/add-expense" element={
              <ProtectedRoute allowedRoles={['Admin', 'Faculty']}>
                <AddExpense />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
