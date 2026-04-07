import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Mic, Image as ImageIcon, Send, Edit2, CheckCircle, Type, X, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser does not support Speech Recognition. Please use Chrome/Edge.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; 
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSmartFill(transcript);
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      setError("Audio input failed. Please type the details instead.");
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSmartFill = async (textToParse = inputText) => {
    if (!textToParse.trim()) return;
    
    setParsing(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:8000/expenses/parse', { text: textToParse });
      setParsedData(res.data);
    } catch (err) {
      setError('Auto-fill request failed. Please check backend connection.');
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setParsing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:8000/expenses/upload_receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setInputText(res.data.extracted_text);
      setParsedData(res.data.parsed_data);
    } catch (err) {
      setError('Receipt processing failed. Ensure Tesseract dependency is available.');
    } finally {
      setParsing(false);
    }
  };

  const handleManualEdit = (field, value) => {
    setParsedData({ ...parsedData, [field]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post('http://localhost:8000/expenses/', parsedData);
      navigate('/');
    } catch (err) {
      setError('Failed to record expense. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // If no parsed data, create empty template so user can type it manually
  const openManualForm = () => {
      setParsedData({
          amount: 0,
          department: 'CSE',
          category: 'Miscellaneous',
          mode: 'Card',
          description: '',
          date: new Date().toISOString()
      });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Add New Expense</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Record a transaction manually or use Auto-Fill.</p>
      </div>
      
      {/* Smart Input Box */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Wand2 size={18} color="var(--primary-color)" /> Smart Entry
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              className="form-input"
              style={{ minHeight: '100px', resize: 'none', fontSize: '1.05rem', padding: '1rem' }}
              placeholder='Describe the expense (e.g., "Spent ₹15000 yesterday for server maintenance via Card")'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={startListening} 
              className={`btn ${isListening ? 'btn-primary' : ''}`}
            >
              <Mic size={18} /> {isListening ? 'Listening...' : 'Voice Input'}
            </button>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <button onClick={() => fileInputRef.current.click()} className="btn">
              <ImageIcon size={18} /> Upload Receipt
            </button>
          </div>
          
          <button 
            onClick={() => handleSmartFill()} 
            className="btn btn-primary"
            disabled={!inputText.trim() || parsing}
          >
            {parsing ? <span className="spinner" style={{width: 14, height: 14}}></span> : <Wand2 size={18} />}
            {parsing ? ' Processing...' : ' Auto-fill Details'}
          </button>
        </div>
        
        {error && <div style={{ color: 'var(--danger-color)', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}
      </div>

      {!parsedData && (
          <div style={{ textAlign: 'center' }}>
              <button onClick={openManualForm} className="btn" style={{ background: 'transparent', color: 'var(--primary-color)' }}>
                  Or enter details manually
              </button>
          </div>
      )}
      
      {/* Extracted Form Review Box */}
      {parsedData && (
        <div className="glass-panel" style={{ borderTop: '3px solid var(--primary-color)', position: 'relative', animation: 'fadeIn 0.5s ease-out' }}>
          
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit2 size={18} /> Review Transaction Details
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--success-color)' }}
                value={parsedData.amount} 
                onChange={(e) => handleManualEdit('amount', parseFloat(e.target.value))} 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <select 
                className="form-input" 
                value={parsedData.department}
                onChange={(e) => handleManualEdit('department', e.target.value)}
              >
                {['AI Lab', 'CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'Admin', 'Library', 'Hostel'].map(d => (
                  <option key={d} value={d} style={{ background: 'var(--bg-color)' }}>{d}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select 
                className="form-input" 
                value={parsedData.category}
                onChange={(e) => handleManualEdit('category', e.target.value)}
              >
                {['Equipment', 'Maintenance', 'Events', 'Miscellaneous', 'Salary', 'Utilities'].map(c => (
                  <option key={c} value={c} style={{ background: 'var(--bg-color)' }}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Payment Mode</label>
              <select 
                className="form-input" 
                value={parsedData.mode}
                onChange={(e) => handleManualEdit('mode', e.target.value)}
              >
                {['Cash', 'Card', 'UPI', 'Bank Transfer'].map(m => (
                  <option key={m} value={m} style={{ background: 'var(--bg-color)' }}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label className="form-label">Transaction Notes</label>
              <textarea 
                className="form-input" 
                value={parsedData.description} 
                onChange={(e) => handleManualEdit('description', e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button onClick={() => setParsedData(null)} className="btn" style={{ background: 'transparent' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : <CheckCircle size={18} />}
              {submitting ? ' Recording...' : ' Confirm and Save'}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AddExpense;
