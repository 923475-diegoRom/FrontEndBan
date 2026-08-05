import React from 'react';
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { AgentThought } from './AgentThought';
import { CitationBadge } from './CitationBadge';
import { InteractiveCard } from './InteractiveCard';

export const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`message-row ${isUser ? 'user' : 'system'}`}>
      <div style={{ display: 'flex', flexDirection: 'column', width: isUser ? 'auto' : '100%', maxWidth: '80%' }}>
        {msg.thought && <AgentThought thought={msg.thought} />}
        
        <div className="message-bubble">
          {msg.content}
          
          {msg.streaming && <span className="typing-cursor animate-blink"></span>}
          
          {msg.citations && msg.citations.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {msg.citations.map((c, i) => <CitationBadge key={i} docName={c} />)}
            </div>
          )}
          
          {msg.interactiveData && <InteractiveCard data={msg.interactiveData} />}
        </div>
        
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
