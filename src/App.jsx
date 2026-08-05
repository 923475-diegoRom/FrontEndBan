import React, { useState, useEffect, useRef } from 'react';
import { Database, Send } from 'lucide-react';
import { Layout } from './components/Layout';
import { Message } from './components/Message';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hola. Soy tu Copiloto Financiero Multi-Agente. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/status');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data);
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
                } else if (data.type === 'metrics') {
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].metrics = data.content;
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
    <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} useRag={useRag} setUseRag={setUseRag} serverStatus={serverStatus}>
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
