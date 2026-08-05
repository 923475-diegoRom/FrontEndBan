import React, { useState, useEffect, useRef } from 'react';
import { Database, Send, Loader2, Mic, Square } from 'lucide-react';
import { Layout } from './components/Layout';
import { Message } from './components/Message';
import './App.css';

function App() {
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

  // Short welcome for mobile
  const shortWelcome = { role: 'system', content: 'Hola, ¿en qué puedo ayudarte?', quickActions: welcomeMessage.quickActions };

  // duplicate isProcessing removed
  const [useRag, setUseRag] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/status`);
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
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/audio/transcribe`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/chat/stream`, {
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
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1].content = textContent;
                      return updated;
                    });
                  } else if (data.type === 'sources') {
                    setMessages(prev => {
                      const updated = [...prev];
                      const sources = Array.isArray(data.content) ? data.content : [];
                      updated[updated.length - 1].citations = sources.map((s, i) => ({
                        source: s.metadata && s.metadata.source ? s.metadata.source : `Fuente ${i + 1}`,
                        pageContent: s.pageContent || ''
                      }));
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
                      } else {
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
    <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} useRag={useRag} setUseRag={setUseRag} serverStatus={serverStatus}>
      <div className="chat-area">
        {initialLoading ? (
          <div className="loader-container">
            <Loader2 className="spinner" size={40} />
            <p>Conectando con el servidor...</p>
          </div>
        ) : (
          <>
                          {isMobile ? <Message msg={shortWelcome} onQuickActionClick={sendMessage} /> : <Message msg={welcomeMessage} onQuickActionClick={sendMessage} />}
            {messages.map((msg, idx) => (
              <Message key={idx} msg={msg} onQuickActionClick={sendMessage} />
            ))}
            <div ref={chatEndRef} />
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
    </Layout>
  );
}

export default App;
