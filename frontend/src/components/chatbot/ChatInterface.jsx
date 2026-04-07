import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help? Try: 'Total expenses for CSE this month' or 'Equipment spending in April'.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/analytics/query', { query: userMsg.text });
      setMessages(prev => [...prev, { 
        text: res.data.answer, 
        sender: 'bot',
        records: res.data.data
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        text: "Sorry, server not reachable. Please ensure backend is running.", 
        sender: 'bot', 
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            zIndex: 1000
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bot color="var(--primary-color)" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Data Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '0.75rem',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                {msg.sender === 'bot' && (
                  <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '0.4rem', flexShrink: 0 }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                
                <div style={{ 
                  background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--surface-color-2)',
                  color: msg.isError ? 'var(--danger-color)' : 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  borderTopLeftRadius: msg.sender === 'bot' ? 0 : '12px',
                  borderTopRightRadius: msg.sender === 'user' ? 0 : '12px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  {/* Render **bold** markdown */}
                  {msg.text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                    i % 2 === 1 
                      ? <strong key={i} style={{ color: '#818cf8' }}>{part}</strong>
                      : <span key={i}>{part}</span>
                  )}
                  {/* Show mini table if records returned */}
                  {msg.records && msg.records.length > 0 && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                      {msg.records.slice(0, 5).map((r, ri) => (
                        <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                          <span>{r.date} — {r.department}</span>
                          <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>₹{r.amount?.toLocaleString()}</span>
                        </div>
                      ))}
                      {msg.records.length > 5 && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>+{msg.records.length - 5} more records</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '0.4rem' }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Processing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(30, 41, 59, 0.9)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ask about expenses..."
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '0.75rem 1rem',
                  borderRadius: '20px',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() ? 'var(--primary-color)' : 'var(--surface-color-2)',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInterface;
