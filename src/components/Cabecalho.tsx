import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import MinhaContaModal from './MinhaContaModal';
import SeletorIdioma from './SeletorIdioma';

function iniciaisDoNome(nome: string | undefined): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

// Igual ao Cabecalho.tsx do Account: mesma faixa com a largura exata do
// menu lateral (220px), logo completo centralizado dentro dela,
// clicavel pra voltar a pagina principal, avatar com iniciais no lugar
// do usuario com dropdown. Sem nome de organizacao (nao existe
// organizacao aqui).
//
// Bloco A11a / Sub-bloco 60 (2026-09-17): o seletor de idioma entrou
// aqui, a esquerda do avatar. Como este Cabecalho e' renderizado uma
// vez so' dentro do Layout, montar o seletor aqui e' o que o coloca em
// TODAS as telas de uma vez -- nao ha' tela do Backoffice fora do
// Layout alem do Login, que tem o proprio seletor.
export default function Cabecalho() {
  const { admin, sair } = useAuth();
  const { t } = useI18n();
  const navegar = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [minhaContaAberta, setMinhaContaAberta] = useState(false);

  function lidarComSair() {
    sair();
    navegar('/login');
  }

  return (
    <>
    <header
      style={{
        height: 64,
        borderBottom: '1px solid #E1E3EF',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px 0 0',
      }}
    >
      <button
        onClick={() => navegar('/organizacoes')}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        title={t('cabecalho.irParaOrganizacoes')}
      >
        {/* Bloco 22 (2026-09-14): faixa com a largura exata do menu
            lateral (220px), logo completo centralizado dentro dela.
            Bloco A11a (2026-09-17): logo trocado para o wordmark
            "tight" -- e' mais largo e mais baixo que o anterior, entao
            a altura caiu de 48 pra 40 e o teto de largura subiu de 160
            pra 200; com os valores antigos o wordmark ficaria
            cortado. */}
        <div style={{ width: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <img src="/veridati-wordmark-tight.png" alt="Veridati" style={{ height: 40, width: 'auto', maxWidth: 200, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 32 }}>
          <span style={{ color: '#D5D8E8', fontSize: 17 }}>·</span>
          <span style={{ color: '#5B6072', fontWeight: 600, fontSize: 15 }}>{t('cabecalho.backoffice')}</span>
        </div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SeletorIdioma />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuAberto((anterior) => !anterior)}
            title={admin?.nome}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: '#1B2E8A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {iniciaisDoNome(admin?.nome)}
          </button>

          {menuAberto && (
            <>
              <div
                onClick={() => setMenuAberto(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 9 }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: 8,
                  background: '#FFFFFF',
                  border: '1px solid #E1E3EF',
                  borderRadius: 12,
                  minWidth: 180,
                  boxShadow: '0 4px 16px rgba(20,24,46,0.12)',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F1F7' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1B2E8A' }}>
                    {admin?.nome}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A8FA3' }}>{admin?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setMenuAberto(false);
                    setMinhaContaAberta(true);
                  }}
                  style={estiloItemMenu}
                >
                  {t('cabecalho.minhaConta')}
                </button>
                <button onClick={lidarComSair} style={{ ...estiloItemMenu, color: '#D62828' }}>
                  {t('cabecalho.sair')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {minhaContaAberta && <MinhaContaModal aoFechar={() => setMinhaContaAberta(false)} />}
    </>
  );
}

const estiloItemMenu: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 14px',
  background: 'transparent',
  border: 'none',
  fontSize: 13,
  color: '#3A3F55',
  cursor: 'pointer',
};
