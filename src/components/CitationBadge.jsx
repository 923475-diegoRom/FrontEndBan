import React, { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, X } from 'lucide-react';

export const CitationBadge = ({ citation }) => {
  const source = typeof citation === 'string' ? citation : (citation.source || citation.metadata?.source || 'Fuente');
  const pageContent = typeof citation === 'string' ? citation : (citation.pageContent || citation.text || citation.info || citation.content || null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasContent = pageContent && pageContent.trim().length > 0;

  return (
    <div ref={containerRef} style={{ display: 'inline-block', position: 'relative', margin: '4px 6px 4px 0' }}>
      <button 
        className="citation-badge" 
        onClick={() => hasContent && setIsOpen(!isOpen)}
        title={hasContent ? "Ver fragmento original" : source}
        style={{
          border: '1px solid var(--border-color)',
          cursor: hasContent ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'inherit',
          padding: '4px 10px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '0.82rem',
          fontWeight: '500',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          transition: 'all 0.15s ease'
        }}
      >
        <FileText size={14} style={{ color: 'var(--accent-brand)' }} /> 
        <span>{source}</span>
        {hasContent && (
          <span style={{ marginLeft: '2px', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>

      {isOpen && hasContent && (
        <div 
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            padding: '14px',
            width: '340px',
            maxWidth: '85vw',
            maxHeight: '260px',
            overflowY: 'auto',
            zIndex: 9999,
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            fontSize: '0.85rem'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-brand)', fontWeight: '700', fontSize: '0.88rem' }}>
              <FileText size={16} />
              <span>Fragmento extraído:</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'var(--bg-surface-light)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          {/* Source Subtitle */}
          <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.8rem' }}>
            Fuente: {source}
          </div>

          {/* Body Text */}
          <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            {pageContent}
          </div>
        </div>
      )}
    </div>
  );
};
