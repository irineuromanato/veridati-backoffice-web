import React, { useState } from 'react';

function IconeOlho({ aberto }: { aberto: boolean }) {
  if (aberto) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.87 18.87 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.82 18.82 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function CampoSenha({
  valor,
  aoMudar,
  placeholder,
  dica,
  style,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  dica?: string;
  style?: React.CSSProperties;
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div style={style}>
      <div style={{ position: 'relative' }}>
        <input
          className="campo"
          type={mostrar ? 'text' : 'password'}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          style={{ paddingRight: 40 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setMostrar((anterior) => !anterior)}
          tabIndex={-1}
          title={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#5B6072',
            padding: 6,
            display: 'flex',
          }}
        >
          <IconeOlho aberto={mostrar} />
        </button>
      </div>
      {dica && (
        <div style={{ fontSize: 11, color: '#8A8FA3', marginTop: 4 }}>{dica}</div>
      )}
    </div>
  );
}
