import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Bot } from 'lucide-react';
import { AgentThought } from './AgentThought';
import { CitationBadge } from './CitationBadge';
import { InteractiveCard } from './InteractiveCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export const Message = ({ msg, onQuickActionClick }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`message-row ${isUser ? 'user' : 'system'}`}>
      { !isUser && (
        <div style={{ marginRight: '12px', marginTop: '8px' }}>
          <div style={{ backgroundColor: 'var(--accent-brand-light)', padding: '8px', borderRadius: '50%', color: 'var(--accent-brand)' }}>
            <Bot size={24} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', width: isUser ? 'auto' : '100%', maxWidth: '80%' }}>
        {msg.thought && <AgentThought thought={msg.thought} />}
        
        <div className="message-bubble">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
          
          {msg.streaming && (
            <div className="typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
          
          {msg.citations && msg.citations.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap' }}>
              {msg.citations.map((c, i) => <CitationBadge key={i} citation={c} />)}
            </div>
          )}
          
          {msg.content && msg.content.includes('[REQUIERE_CONFIRMACION:') && (
            <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(235, 0, 41, 0.05)', border: '1px solid var(--accent-brand)', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-brand)' }}>
                ⚠️ Confirmación requerida para transferir dinero
              </p>
              <button 
                className="confirm-transfer-btn"
                style={{
                  backgroundColor: 'var(--accent-brand)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => onQuickActionClick && onQuickActionClick('Sí, confirmo la transferencia')}
              >
                ✅ Confirmar Transacción
              </button>
            </div>
          )}
          
          {msg.interactiveData && <InteractiveCard data={msg.interactiveData} />}
        </div>

        {msg.quickActions && msg.quickActions.length > 0 && (
          <div className="quick-actions-row" style={{ marginTop: '12px' }}>
            {msg.quickActions.map((action, i) => (
              <button 
                key={i} 
                className="quick-action-chip"
                onClick={() => onQuickActionClick && onQuickActionClick(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}
        
        {!isUser && !msg.streaming && msg.metrics && (
          <div className="message-footer">
            <div className="metrics-bar">
              <span>⏱️ TTFT: {msg.metrics.ttft}</span>
              <span>⚡ Latencia Total: {msg.metrics.latency}</span>
              <span>🔄 {msg.metrics.tokens} Tokens</span>
              <span>🤖 Modelo: {msg.metrics.model}</span>
            </div>
            <div className="action-buttons">
              <button className="icon-btn"><Copy size={14} /></button>
              <button className="icon-btn"><ThumbsUp size={14} /></button>
              <button className="icon-btn"><ThumbsDown size={14} /></button>
              <button className="icon-btn"><RefreshCw size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
