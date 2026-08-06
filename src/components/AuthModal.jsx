import React, { useState } from 'react';
import { X, UserCheck, LogIn, ShieldCheck, Loader2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/v1/login' : '/api/v1/signup';
      const bodyPayload = isLogin
        ? { email: email.trim(), password: password.trim() }
        : { name: name.trim(), email: email.trim(), password: password.trim() };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://fluffy-zebra-9667j6gxr5j37xjg-8000.app.github.dev'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token);
          
          // Fetch user profile immediately
          try {
            const meRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://fluffy-zebra-9667j6gxr5j37xjg-8000.app.github.dev'}/api/v1/me`, {
              headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            const userData = meRes.ok ? await meRes.json() : data.user;
            onAuthSuccess(data.access_token, userData);
          } catch (_) {
            onAuthSuccess(data.access_token, data.user);
          }
          
          onClose();
        } else if (data.message) {
          setSuccessMsg(data.message);
        }
      } else {
        setError(data.detail || data.message || 'Error en la autenticación con Supabase.');
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
      setError(`Error al conectar con el servidor: ${err.message || 'Sin respuesta del backend.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '420px',
        padding: '28px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--border-color)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(235, 0, 41, 0.15)',
            color: 'var(--accent-brand)',
            marginBottom: '12px'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Autenticación Banorte
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isLogin 
              ? 'Ingresa tu correo y contraseña para acceder a tu cuenta.' 
              : 'Crea tu cuenta con email para recibir $1,000,000 MXN de saldo inicial.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface-light)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: isLogin ? 'var(--bg-surface)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: !isLogin ? 'var(--bg-surface)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '0.8rem',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: '3px solid #ef4444'
            }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{
              fontSize: '0.8rem',
              color: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: '3px solid #10b981'
            }}>
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-brand)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                Procesando en Supabase...
              </>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                Iniciar Sesión
              </>
            ) : (
              <>
                <UserCheck size={18} />
                Crear Mi Cuenta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

