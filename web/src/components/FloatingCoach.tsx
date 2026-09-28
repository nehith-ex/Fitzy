import React, { useState, useRef, useEffect } from 'react';
import { askCoach } from '../lib/coach';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export const FloatingCoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: 'Hey! I am your Fitzy fitness assistant. Ask me about your sets, macros, or recovery.',
      time: 'Now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await askCoach(userText);
      const coachMsg: ChatMessage = {
        id: `c_${Date.now()}`,
        sender: 'coach',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `c_${Date.now()}`,
        sender: 'coach',
        text: 'Unable to reach coach right now. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="floating-coach-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Fitness Coach"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
      </button>

      {isOpen && (
        <div className="sheet-overlay" onClick={() => setIsOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ height: '70vh' }}>
            <div className="sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4" />
                    <path d="m4.93 10.93 2.83-2.83" />
                    <path d="M2 18h4" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-2.83-2.83" />
                    <path d="M22 22H2" />
                    <path d="m8 22 4-10 4 10" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Fitzy Coach</h3>
                  <p style={{ fontSize: '11px', color: 'var(--gold)' }}>Online</p>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="sheet-body" style={{ flex: 1, padding: '16px', gap: '12px' }}>
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        borderBottomRightRadius: isUser ? '4px' : '16px',
                        borderBottomLeftRadius: isUser ? '16px' : '4px',
                        backgroundColor: isUser ? 'var(--gold)' : 'var(--surface-raised)',
                        color: isUser ? '#0A0A0A' : 'var(--text)',
                        border: isUser ? 'none' : '1px solid var(--border)',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        fontWeight: isUser ? 600 : 400,
                      }}
                    >
                      {m.text}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '0 4px' }}>
                      {m.time}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 12px', color: 'var(--gold)' }}>
                  <span style={{ fontSize: '12px', fontStyle: 'italic' }}>Coach is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '8px',
                backgroundColor: 'var(--surface)',
              }}
            >
              <input
                type="text"
                className="input"
                placeholder="Ask about workouts, macros..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ padding: '10px 14px', fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{ width: '44px', height: '44px', padding: 0 }}
                aria-label="Send Message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
