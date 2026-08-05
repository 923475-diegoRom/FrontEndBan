import React from 'react';
import { 
  MessageSquare, 
  Settings, 
  Menu, 
  Activity, 
  Database,
  Sun,
  Hexagon
} from 'lucide-react';

export const Layout = ({ children, sidebarOpen, setSidebarOpen, useRag, setUseRag, serverStatus }) => {
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
              <span className="metric-value">{serverStatus?.average_latency || '--- ms'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Throughput</span>
              <span className="metric-value">{serverStatus?.throughput || '--- tok/s'}</span>
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
              <span className={`status-indicator ${serverStatus?.status?.toLowerCase() === 'online' ? 'online' : 'offline'}`} style={{ backgroundColor: serverStatus?.status?.toLowerCase() === 'online' ? '#10b981' : '#ef4444' }}></span>
              API: {serverStatus?.status || 'Buscando...'} ({serverStatus?.engine || '---'})
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
