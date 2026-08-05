import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Menu, 
  Activity, 
  Database,
  Send,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Hexagon
} from 'lucide-react';
import './App.css';

const Layout = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn">
            <MessageSquare size={18} />
            + Nueva Conversación
          </button>
        </div>
        <div className="sidebar-content">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Ajustes del Modelo</h3>
            
            <label className="toggle-label" style={{ marginBottom: '12px' }}>
              <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} />
              <Database size={16} /> Búsqueda RAG (Bases Vectoriales)
            </label>
            
            <label className="toggle-label">
              <input type="checkbox" defaultChecked />
              <Settings size={16} /> Herramientas de Agente (MCP)
            </label>
          </div>
        </div>
        <div className="sidebar-footer">
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> Observabilidad en Vivo
          </h3>
          <div className="metrics-panel">
            <div className="metric-row">
              <span className="metric-label">Latencia Promedio</span>
              <span className="metric-value">120 ms</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Throughput</span>
              <span className="metric-value">45 tok/s</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="icon-btn mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <Hexagon className="logo-icon" size={24} fill="var(--accent-indigo)" color="var(--accent-indigo)" />
            <span className="brand-name">NEXUS GenAI Platform</span>
          </div>
          
          <div className="header-right">
            <select className="context-selector">
              <option>Banca Personal</option>
              <option>Banca Empresarial</option>
              <option>Análisis Normativo</option>
            </select>
            
            <div className="api-status">
              <span className="status-indicator"></span>
              API: Online (Gemma 2 9B)
            </div>
            
            <button className="icon-btn" title="Alto Contraste">
              <Sun size={20} />
            </button>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

const AgentThought = ({ thought }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="agent-thought">
      <div className="thought-header" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>🛠️ Agente analizando: {thought.summary}</span>
      </div>
      {expanded && (
        <div className="thought-content">
          {thought.details}
        </div>
      )}
    </div>
  );
};

const CitationBadge = ({ docName }) => (
  <span className="citation-badge" title="Ver fragmento original">
    <FileText size={12} /> {docName}
  </span>
);

const InteractiveCard = ({ data }) => {
  return (
    <div className="interactive-card">
      <div className="card-header">
        <BarChart3 size={16} color="var(--accent-indigo)" />
        Resumen de la Simulación de Crédito
      </div>
      <div className="card-grid">
        <div className="card-cell">
          <div className="cell-label">Monto Solicitado</div>
          <div className="cell-value">{data.monto}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Pago Mensual Est.</div>
          <div className="cell-value" style={{ color: 'var(--accent-emerald)' }}>{data.pagoMensual}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Plazo</div>
          <div className="cell-value">{data.plazo}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Tasa de Interés</div>
          <div className="cell-value">{data.tasa}</div>
        </div>
      </div>
    </div>
  );
};

const Message = ({ msg }) => {
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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hola. Soy tu Copiloto Financiero Multi-Agente. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userText) => {
    const newMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsProcessing(true);

    setMessages(prev => [
      ...prev, 
      { 
        role: 'system', 
        content: '', 
        streaming: true,
        citations: []
      }
    ]);

    try {
      const response = await fetch('http://localhost:8000/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText, use_rag: useRag })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let done = false;
      let textContent = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr.trim() === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'token') {
                  textContent += data.content;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = textContent;
                    return updated;
                  });
                } else if (data.type === 'sources') {
                  setMessages(prev => {
                    const updated = [...prev];
                    const sources = Array.isArray(data.content) ? data.content : [];
                    updated[updated.length - 1].citations = sources.map((s, i) => s.metadata && s.metadata.source ? s.metadata.source : `Fuente ${i+1}`);
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
      
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].streaming = false;
        return updated;
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Error al comunicarse con el servidor.';
        updated[updated.length - 1].streaming = false;
        return updated;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    sendMessage(input);
  };

  return (
    <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <Message key={idx} msg={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-container">
        <div className="input-bar">
          <textarea
            className="input-field"
            placeholder="Escribe tu consulta o pide una simulación..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isProcessing}
          />
          <div className="input-actions">
            <div className="action-toggles">
              <label className="toggle-label">
                <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} />
                <Database size={16} /> RAG
              </label>
            </div>
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
