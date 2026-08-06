import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Mic, Square } from 'lucide-react';
import { Layout } from './components/Layout';
import { Message } from './components/Message';
import { AuthModal } from './components/AuthModal';
import './App.css';

function App() {
  // Persist a session identifier for the chat history
  const [sessionId, setSessionId] = useState(() => {
    const stored = localStorage.getItem('sessionId');
    if (stored) return stored;
    const generated = crypto.randomUUID();
    localStorage.setItem('sessionId', generated);
    return generated;
  });

  // Supabase Auth and User Profile state
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const welcomeMessage = { 
    role: 'system', 
    content: 'Hola. Soy tu Copiloto Financiero. ¿En qué te puedo ayudar hoy?',
    quickActions: ['Consultar saldo', 'Transferir dinero', 'Simular crédito', 'Buscar información']
  };

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shortWelcome = { role: 'system', content: 'Hola, ¿en qué puedo ayudarte?', quickActions: welcomeMessage.quickActions };

  const [useRag, setUseRag] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const latestMessageRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL || 'https://fluffy-zebra-9667j6gxr5j37xjg-8000.app.github.dev';
  };

  const scrollToNewMessage = () => {
    setTimeout(() => {
      latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Fetch current user profile from Supabase (/api/v1/me) if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token invalid or expired
          console.warn("Token de Supabase inválido o expirado");
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Error al obtener perfil de usuario:", err);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Manejar el enlace de confirmación de correo enviada por Supabase Auth (#access_token=...)
  useEffect(() => {
    const handleEmailConfirmation = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (accessToken) {
          localStorage.setItem('auth_token', accessToken);
          setToken(accessToken);
          // Limpiar el hash de la URL para una apariencia limpia
          window.history.replaceState(null, '', window.location.pathname);
          alert('🎉 ¡Correo verificado exitosamente! Tu cuenta y saldo bancario han sido activados en Banorte.');
        }
      }
    };

    handleEmailConfirmation();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/v1/status`);
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data);
          setInitialLoading(false);
        }
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        
        setIsProcessing(true);
        try {
          const res = await fetch(`${getApiBaseUrl()}/api/v1/audio/transcribe`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.status === 'success' && data.text) {
            setInput((prev) => prev + (prev ? ' ' : '') + data.text);
          } else {
            console.error("Error from whisper:", data);
          }
        } catch (err) {
          console.error("Error sending audio:", err);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendMessage = async (userText) => {
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        streaming: true,
        citations: [],
      }
    ]);

    scrollToNewMessage();

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/v1/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userText, use_rag: useRag, session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      let textContent = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });

          let eventEnd = buffer.indexOf('\n\n');
          while (eventEnd !== -1) {
            const eventStr = buffer.slice(0, eventEnd);
            buffer = buffer.slice(eventEnd + 2);

            const lines = eventStr.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr.trim() === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.type === 'token') {
                    textContent += data.content;
                    const cleanContent = textContent
                      .replace(/<herramienta[\s\S]*?(<\/herramienta>|<\/hfunction>|>)/gi, '')
                      .replace(/<function[\s\S]*?(<\/function>|>)/gi, '')
                      .replace(/<\/hfunction>/gi, '')
                      .replace(/<\/herramienta>/gi, '');
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1].content = cleanContent;
                      return updated;
                    });
                  } else if (data.type === 'sources') {
                    setMessages(prev => {
                      const updated = [...prev];
                      const sources = Array.isArray(data.content) ? data.content : [];
                      const newCitations = sources.map((s, i) => ({
                        source: typeof s === 'string' ? s : (s.metadata?.source || s.source || `Fuente ${i + 1}`),
                        pageContent: typeof s === 'string' ? '' : (s.pageContent || s.text || '')
                      }));
                      updated[updated.length - 1].citations = [
                        ...(updated[updated.length - 1].citations || []),
                        ...newCitations
                      ];
                      return updated;
                    });
                  } else if (data.type === 'metrics') {
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1].metrics = data.content;
                      return updated;
                    });
                  } else if (data.type === 'tool_start') {
                    setMessages(prev => {
                      const updated = [...prev];
                      const msg = updated[updated.length - 1];
                      if (!msg.thought) {
                        msg.thought = { summary: `Herramienta: ${data.name}`, details: `Entrada: ${JSON.stringify(data.input, null, 2)}` };
                      } else if (!msg.thought.summary.includes(data.name)) {
                        msg.thought.summary += `, ${data.name}`;
                        msg.thought.details += `\n\nHerramienta: ${data.name}\nEntrada: ${JSON.stringify(data.input, null, 2)}`;
                      }
                      return updated;
                    });
                  } else if (data.type === 'tool_end') {
                    setMessages(prev => {
                      const updated = [...prev];
                      const msg = updated[updated.length - 1];
                      if (msg.thought) {
                        msg.thought.details += `\nResultado: ${data.output}`;
                      }
                      try {
                        let rawStr = typeof data.output === 'string' ? data.output : JSON.stringify(data.output || '');
                        if (rawStr.includes('fuentes_usadas')) {
                          const jsonMatch = rawStr.match(/\{[\s\S]*"fuentes_usadas"[\s\S]*\}/);
                          const jsonToParse = jsonMatch ? jsonMatch[0] : rawStr;
                          const parsedOutput = JSON.parse(jsonToParse);
                          if (Array.isArray(parsedOutput.fuentes_usadas) && parsedOutput.fuentes_usadas.length > 0) {
                            const extractedCitations = parsedOutput.fuentes_usadas.map((src) => ({
                              source: src,
                              pageContent: parsedOutput.info || ''
                            }));
                            const existing = msg.citations || [];
                            const combined = [...existing];
                            extractedCitations.forEach(c => {
                              if (!combined.some(item => item.source === c.source)) {
                                combined.push(c);
                              }
                            });
                            msg.citations = combined;
                          }
                        }
                      } catch (err) {
                        console.warn("Error parsing citations:", err);
                      }
                      return updated;
                    });
                  }
                } catch (e) {
                  console.warn("Error parsing chunk", e, dataStr);
                }
              }
            }
            eventEnd = buffer.indexOf('\n\n');
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
    <Layout 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen} 
      useRag={useRag} 
      setUseRag={setUseRag} 
      serverStatus={serverStatus}
      user={user}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      onLogout={handleLogout}
      onNewChat={() => setMessages([])}
    >
      <div className="chat-area">
        {initialLoading ? (
          <div className="loader-container">
            <Loader2 className="spinner" size={40} />
            <p>Conectando con el servidor...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              isMobile ? <Message msg={shortWelcome} onQuickActionClick={sendMessage} /> : <Message msg={welcomeMessage} onQuickActionClick={sendMessage} />
            )}
            {messages.map((msg, idx) => {
              const isTargetForScroll = idx === Math.max(0, messages.length - 2);
              return (
                <div key={idx} ref={isTargetForScroll ? latestMessageRef : null}>
                  <Message msg={msg} onQuickActionClick={sendMessage} />
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="input-container">
        <div className="input-bar">
          <textarea
            className="input-field"
            placeholder={initialLoading ? "Conectando..." : "Escribe tu consulta o pide una simulación..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isProcessing || initialLoading}
          />
          <div className="input-actions">
            <button
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || initialLoading}
              title={isRecording ? "Detener grabación" : "Dictar por voz"}
            >
              {isRecording ? <Square size={18} /> : <Mic size={18} />}
            </button>

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing || initialLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </Layout>
  );
}

export default App;

