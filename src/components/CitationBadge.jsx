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
          border: '1px solid #d1d5db',
          cursor: hasContent ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'inherit',
          padding: '4px 10px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          color: '#374151',
          fontSize: '0.82rem',
          fontWeight: '500',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.15s ease'
        }}
      >
        <FileText size={14} style={{ color: '#eb0029' }} /> 
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
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eb0029', fontWeight: '700', fontSize: '0.88rem' }}>
              <FileText size={16} />
              <span>Fragmento extraído:</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: '#f3f4f6',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                color: '#6b7280',
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
          <div style={{ fontWeight: '600', color: '#4b5563', marginBottom: '8px', fontSize: '0.8rem' }}>
            Fuente: {source}
          </div>

          {/* Body Text */}
          <div style={{ color: '#1f2937', fontSize: '0.85rem' }}>
            {pageContent}
          </div>
        </div>
      )}
    </div>
  );
};
