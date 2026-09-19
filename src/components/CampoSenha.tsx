import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import Icone from './Icone';

// Bloco A12 (2026-09-19) -- aqui vivia um `IconeOlho` proprio, com os dois
// <path> do olho escritos a mao. Era o unico desenho do backoffice fora do
// vocabulario compartilhado: nao acompanhava tamanho nem espessura dos
// outros, e nao aparecia em nenhuma busca por "Icone". Agora sao `ver` /
// `ocultar`, os mesmos nomes que o resto do sistema usa. O `cor` nao e'
// passado: no web o `Icone` desenha em `currentColor` e herda o #5B6072
// do proprio botao.

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
  const { t } = useI18n();

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
          title={mostrar ? t('senha.ocultar') : t('senha.mostrar')}
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
          <Icone nome={mostrar ? 'ocultar' : 'ver'} tamanho={18} />
        </button>
      </div>
      {dica && (
        <div style={{ fontSize: 11, color: '#8A8FA3', marginTop: 4 }}>{dica}</div>
      )}
    </div>
  );
}
