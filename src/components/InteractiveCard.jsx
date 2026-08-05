import React from 'react';
import { BarChart3 } from 'lucide-react';

export const InteractiveCard = ({ data }) => {
  return (
    <div className="interactive-card">
      <div className="card-header">
        <BarChart3 size={16} color="var(--accent-indigo)" />
        Resumen de la Simulación de Crédito
      </div>
      <div className="card-grid">
        <div className="card-cell">
          <div className="cell-label">Monto Solicitado</div>
          <div className="cell-value">{data.monto}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Pago Mensual Est.</div>
          <div className="cell-value" style={{ color: 'var(--accent-emerald)' }}>{data.pagoMensual}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Plazo</div>
          <div className="cell-value">{data.plazo}</div>
        </div>
        <div className="card-cell">
          <div className="cell-label">Tasa de Interés</div>
          <div className="cell-value">{data.tasa}</div>
        </div>
      </div>
    </div>
  );
};
