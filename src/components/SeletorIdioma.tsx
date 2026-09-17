// Bloco A11a / Sub-bloco 60 (2026-09-17) -- seletor de idioma do
// Backoffice. Portado do `SeletorIdioma` do Account com UMA diferenca
// obrigatoria: la' ele le `corPrimaria` de `useTema()`, e o Backoffice
// nao tem contexto de tema nenhum -- importar o do Account traria o
// provider inteiro por causa de uma cor. Entao o azul da casa entra
// literal (`styles.css` tambem usa `--cor-primaria: #2946E0`).
//
// Montado no `Cabecalho`, que e' renderizado uma vez so' dentro do
// `Layout` -- e' o que faz o seletor existir em todas as telas de uma
// vez, sem repetir em cada pagina.
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { dicionarios, Idioma, nomesIdiomas } from '../i18n/dicionarios';

const AZUL = '#2946E0';

export default function SeletorIdioma() {
  const { idioma, definirIdioma } = useI18n();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora -- sem isso o menu fica preso aberto por cima
  // do conteudo ate' o admin clicar de novo no proprio botao.
  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (caixa.current && !caixa.current.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [aberto]);

  return (
    <div ref={caixa} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        title={nomesIdiomas[idioma]}
        style={{
          height: 36,
          padding: '0 12px',
          borderRadius: 8,
          border: '1px solid #E1E3EF',
          background: '#FFFFFF',
          color: '#2A2E3F',
          fontSize: 14,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {nomesIdiomas[idioma]}
      </button>

      {aberto && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 42,
            right: 0,
            minWidth: 180,
            background: '#FFFFFF',
            border: '1px solid #E1E3EF',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(27, 46, 138, 0.12)',
            padding: 6,
            zIndex: 30,
          }}
        >
          {(Object.keys(dicionarios) as Idioma[]).map((codigo) => (
            <button
              key={codigo}
              type="button"
              role="option"
              aria-selected={codigo === idioma}
              onClick={() => {
                definirIdioma(codigo);
                setAberto(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: 6,
                border: 'none',
                background: codigo === idioma ? '#EEF1FE' : 'transparent',
                color: codigo === idioma ? AZUL : '#2A2E3F',
                fontWeight: codigo === idioma ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {nomesIdiomas[codigo]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
