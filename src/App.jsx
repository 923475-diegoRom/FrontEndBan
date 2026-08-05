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
              <input type="checkbox" defaultChecked />
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
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateChatFlow = (userText) => {
    // 1. Add User Message
    const newMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsProcessing(true);

    // 2. Simulated SSE / TTFT phase
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'system', 
          content: '', 
          streaming: true,
          thought: {
            summary: 'Ejecutando simular_credito(monto=2000000, plazo=15)...',
            details: 'Invocando MCP Tool: credit_simulator\nParams: {"monto": 2000000, "plazo": 180, "tasa_base": 9.5}\nResponse: {"pago_mensual": 20911, "aprobado": true}'
          }
        }
      ]);

      // 3. Simulated Streaming phase
      setTimeout(() => {
        let text = 'He analizado tu solicitud. Basado en las condiciones actuales para un crédito hipotecario, aquí tienes los detalles de la simulación:';
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = text;
          updated[updated.length - 1].citations = ['📄 Reglamento_Hipotecario.pdf'];
          return updated;
        });

        // 4. Final Card and Footer phase
        setTimeout(() => {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].streaming = false;
            updated[updated.length - 1].interactiveData = {
              monto: '$2,000,000 MXN',
              pagoMensual: '$20,911',
              plazo: '15 Años (180 meses)',
              tasa: '9.5% Fija'
            };
            updated[updated.length - 1].metrics = {
              ttft: '180ms',
              latency: '1.2s',
              tokens: '142',
              model: 'Gemma 2 9B (Groq)'
            };
            return updated;
          });
          setIsProcessing(false);
        }, 1500);
      }, 1000);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    simulateChatFlow(input);
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
                <input type="checkbox" defaultChecked />
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
