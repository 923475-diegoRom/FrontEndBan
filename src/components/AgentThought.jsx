import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const AgentThought = ({ thought }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="agent-thought">
      <div className="thought-header" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>🛠️ Agente analizando: {thought.summary}</span>
      </div>
      {expanded && (
        <div className="thought-content">
          {thought.details}
        </div>
      )}
    </div>
  );
};
