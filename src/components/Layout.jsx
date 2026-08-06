import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Menu, 
  Activity, 
  Sun,
  Moon,
  Hexagon,
  UploadCloud,
  Lock,
  X,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const Layout = ({ children, sidebarOpen, setSidebarOpen, serverStatus, user, onOpenAuthModal, onLogout, onNewChat }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadMessage('Error: Solo se permiten archivos PDF');
      setTimeout(() => setUploadMessage(''), 5000);
      return;
    }

    setIsUploading(true);
    setUploadMessage('Subiendo y procesando...');

    const formData = new FormData();
    formData.append('file', file);

    const getApiBaseUrl = () => {
      return import.meta.env.VITE_API_URL || 'https://fluffy-zebra-9667j6gxr5j37xjg-8000.app.github.dev';
    };

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        const chunkInfo = data.chunks_indexed !== undefined ? `${data.chunks_indexed} fragmentos indexados` : 'Documento indexado con éxito';
        setUploadMessage(`✅ Éxito: ${chunkInfo}`);
      } else {
        setUploadMessage(`❌ Error: ${data.message || 'Fallo en la subida'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('❌ Error de conexión');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(''), 8000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="new-chat-btn" 
            style={{ flex: 1 }}
            onClick={() => {
              if (onNewChat) onNewChat();
              setSidebarOpen(false);
            }}
          >
            <MessageSquare size={18} />
            + Nueva
          </button>
          <button className="icon-btn mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {/* User Account Info Section (Supabase Data) */}
          {user ? (
            <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--accent-brand)" /> Usuario Autenticado
              </h3>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '500' }}>
                • Sesión activa
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Inicia sesión con tu cuenta para identificarte.
              </div>
              <button 
                onClick={onOpenAuthModal}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-brand)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Cargar Conocimiento</h3>
            
            <button 
              className="new-chat-btn" 
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px dashed var(--border-color)', marginBottom: '8px' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadCloud size={18} />
              {isUploading ? 'Procesando PDF...' : 'Subir Documento (PDF)'}
            </button>
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {uploadMessage && (
              <div style={{ fontSize: '0.75rem', marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', borderLeft: '3px solid var(--accent-brand)' }}>
                {uploadMessage}
              </div>
            )}
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
        <header className="header sticky-header">
          <div className="header-left">
            <button className="icon-btn mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <Hexagon className="logo-icon" size={24} fill="var(--accent-brand)" color="var(--accent-brand)" />
            <span className="brand-name">Copiloto Financiero</span>
          </div>
          
          <div className="header-right">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}>
                  <User size={16} color="var(--accent-brand)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                </div>
                <button 
                  className="icon-btn" 
                  title="Cerrar Sesión" 
                  onClick={onLogout}
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '18px',
                  backgroundColor: 'var(--accent-brand)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <User size={15} /> Iniciar Sesión
              </button>
            )}

            <div className="secure-connection">
              <Lock size={14} />
              <span className="secure-text">Conexión segura</span>
            </div>
            <div className="api-status">
              <span className={`status-indicator ${serverStatus?.status?.toLowerCase() === 'online' ? 'online' : 'offline'}`} style={{ backgroundColor: serverStatus?.status?.toLowerCase() === 'online' ? '#10b981' : '#ef4444' }}></span>
              API: {serverStatus?.status || 'Buscando...'}
            </div>
            
            <button className="icon-btn" title="Alternar Tema" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

