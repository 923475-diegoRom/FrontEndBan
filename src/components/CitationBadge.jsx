import React from 'react';
import { FileText } from 'lucide-react';

export const CitationBadge = ({ docName }) => (
  <span className="citation-badge" title="Ver fragmento original">
    <FileText size={12} /> {docName}
  </span>
);
