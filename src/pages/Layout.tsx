import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import Cabecalho from '../components/Cabecalho';

// Mesma estrutura do Layout.tsx do Account: Cabecalho em cima,
// barra lateral esquerda de 220px embaixo dele -- nao um menu
// suspenso. A barra lateral tem seu proprio botao Sair no rodape,
// igual ao Account faz (redundante com o do avatar no Cabecalho,
// de proposito, pra manter o padrao identico).
const linkEstilo = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'block',
  padding: '10px 16px',
  borderRadius: 10,
  color: isActive ? '#2946E0' : '#5B6072',
  background: isActive ? '#E7E9F5' : 'transparent',
  fontWeight: isActive ? 700 : 500,
  fontSize: 14,
  marginBottom: 4,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const { sair } = useAuth();
  const { t } = useI18n();
  const navegar = useNavigate();

  function lidarComSair() {
    sair();
    navegar('/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Cabecalho />

      <div style={{ display: 'flex', flex: 1 }}>
        <aside
          style={{
            width: 220,
            background: '#FFFFFF',
            borderRight: '1px solid #E1E3EF',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Bloco A11a (2026-09-17): Dashboard entrou como PRIMEIRO
              item -- e' a tela de abertura (a raiz "/" redireciona
              pra ele agora), entao o item do menu tem de bater com
              onde o admin cai ao entrar. */}
          <NavLink to="/dashboard" style={linkEstilo}>
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/organizacoes" style={linkEstilo}>
            {t('nav.organizacoes')}
          </NavLink>
          <NavLink to="/administradores" style={linkEstilo}>
            {t('nav.administradores')}
          </NavLink>
          <NavLink to="/exportacoes" style={linkEstilo}>
            {t('nav.exportacoes')}
          </NavLink>
          <NavLink to="/jobs" style={linkEstilo}>
            {t('nav.jobs')}
          </NavLink>
          <NavLink to="/emails" style={linkEstilo}>
            {t('nav.emails')}
          </NavLink>
          <NavLink to="/planos" style={linkEstilo}>
            {t('nav.planos')}
          </NavLink>
          <NavLink to="/configuracoes" style={linkEstilo}>
            {t('nav.configuracoes')}
          </NavLink>
          {/* Pacote 4 — Backoffice (2026-09-05): "Minha conta" saiu
              daqui, duplicado com o dropdown do avatar no Cabecalho.
              Continua acessível só por lá, mesmo padrão do Account. */}

          <div style={{ flex: 1 }} />

          <button className="botao-secundario" onClick={lidarComSair} style={{ marginTop: 8 }}>
            {t('nav.sair')}
          </button>
        </aside>

        <main style={{ flex: 1, padding: 32 }}>{children}</main>
      </div>
    </div>
  );
}
