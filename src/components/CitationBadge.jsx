import React, { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const CitationBadge = ({ citation }) => {
  const source = typeof citation === 'string' ? citation : citation.source;
  const pageContent = typeof citation === 'string' ? null : citation.pageContent;
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

  return (
    <div ref={containerRef} style={{ display: 'inline-block', position: 'relative', margin: '0 8px 8px 0' }}>
      <button 
        className="citation-badge" 
        onClick={() => pageContent && setIsOpen(!isOpen)}
        title="Ver fragmento original"
        style={{
          border: 'none',
          cursor: pageContent ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'inherit',
          padding: '4px 10px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}
      >
        <FileText size={14} /> 
        {source}
        {pageContent && (
          <span style={{ marginLeft: '2px', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>

      {isOpen && pageContent && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          width: 'max-content',
          maxWidth: '300px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 100,
          whiteSpace: 'pre-wrap',
          lineHeight: '1.4'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Fragmento extraído:</div>
          {pageContent}
        </div>
      )}
    </div>
  );
};
