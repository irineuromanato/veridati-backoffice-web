import React from 'react';

// Ícone de ação por linha de lista, padrão em Locais/Equipe/Checklists
// (e qualquer lista nova). Neutro por padrão (cinza), muda de cor no
// hover conforme o tipo — sem cor forte fixa, como pedido.
type TipoIcone = 'editar' | 'remover' | 'ordem' | 'reativar' | 'anular';

const corHover: Record<TipoIcone, string> = {
  editar: '#2946E0',
  remover: '#D62828',
  ordem: '#1B2E8A',
  reativar: '#1E7A46',
  anular: '#B26A00',
};

const caminhoSvg: Record<TipoIcone, React.ReactNode> = {
  editar: (
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  ),
  remover: (
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
  ),
  ordem: (
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  ),
  reativar: (
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
  ),
  anular: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 5.5l13 13" />
    </>
  ),
};

export default function IconeAcao({
  tipo,
  titulo,
  onClick,
}: {
  tipo: TipoIcone;
  titulo: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [emHover, setEmHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={titulo}
      onMouseEnter={() => setEmHover(true)}
      onMouseLeave={() => setEmHover(false)}
      style={{
        background: emHover ? '#F0F1F7' : 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: 5,
        cursor: 'pointer',
        display: 'inline-flex',
        color: emHover ? corHover[tipo] : '#8A8FA3',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {caminhoSvg[tipo]}
      </svg>
    </button>
  );
}
