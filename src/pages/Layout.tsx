import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import Cabecalho from '../components/Cabecalho';
import RodapeLegal from '../components/RodapeLegal';
import Icone from '../components/Icone';

// Mesma estrutura do Layout.tsx do Account: Cabecalho em cima,
// barra lateral esquerda de 220px embaixo dele -- nao um menu
// suspenso. A barra lateral tem seu proprio botao Sair no rodape,
// igual ao Account faz (redundante com o do avatar no Cabecalho,
// de proposito, pra manter o padrao identico).
// Bloco A12 (2026-09-18) -- o icone entra ANTES do rotulo, e por isso o link
// deixa de ser `block` e vira uma linha flex com um vao. Com `block`, o
// desenho ficaria EMPILHADO em cima do texto. O espacamento e' `gap` na
// linha, e nao `marginRight` no icone: quem manda no vao entre os dois e' a
// linha, nao um dos filhos.
//
// A cor do icone nao e' passada em lugar nenhum: o `Icone` desenha em
// `currentColor`, entao ele ja' acompanha o `color` daqui -- no link ativo,
// o azul. Sem isso o icone ficaria cinza fixo ao lado de um texto azul.
const linkEstilo = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
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
            <Icone nome="dashboard" />
            {t('nav.dashboard')}
          </NavLink>
          <NavLink to="/organizacoes" style={linkEstilo}>
            <Icone nome="organizacao" />
            {t('nav.organizacoes')}
          </NavLink>
          <NavLink to="/administradores" style={linkEstilo}>
            <Icone nome="seguranca" />
            {t('nav.administradores')}
          </NavLink>
          <NavLink to="/exportacoes" style={linkEstilo}>
            <Icone nome="baixar" />
            {t('nav.exportacoes')}
          </NavLink>
          <NavLink to="/jobs" style={linkEstilo}>
            <Icone nome="atualizar" />
            {t('nav.jobs')}
          </NavLink>
          <NavLink to="/emails" style={linkEstilo}>
            <Icone nome="email" />
            {t('nav.emails')}
          </NavLink>
          <NavLink to="/planos" style={linkEstilo}>
            <Icone nome="plano" />
            {t('nav.planos')}
          </NavLink>
          <NavLink to="/configuracoes" style={linkEstilo}>
            <Icone nome="configuracao" />
            {t('nav.configuracoes')}
          </NavLink>
          {/* Pacote 4 — Backoffice (2026-09-05): "Minha conta" saiu
              daqui, duplicado com o dropdown do avatar no Cabecalho.
              Continua acessível só por lá, mesmo padrão do Account. */}

          <div style={{ flex: 1 }} />

          {/* O `display`/`gap` vem inline porque este botao e' estilizado por
              `botao-secundario`, no styles.css -- e nao da' pra supor que
              aquele CSS seja flex. Sem isto, o icone empilharia em cima do
              rotulo. Um botao com dois filhos precisa dizer que e' linha. */}
          <button
            className="botao-secundario"
            onClick={lidarComSair}
            style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icone nome="sair" />
            {t('nav.sair')}
          </button>
        </aside>

        <main style={{ flex: 1, padding: 32 }}>{children}</main>
      </div>

      {/* Bloco A09 (2026-09-18) -- o rodape em TODAS as telas logadas.
          Fica dentro do Layout porque ele e' o unico ponto por onde
          toda tela logada passa: assim o rodape existe em todas de uma
          vez, e uma tela nova ja' nasce com ele sem ninguem precisar
          lembrar. */}
      <footer
        style={{
          borderTop: '1px solid #E1E3EF',
          background: '#FFFFFF',
          padding: '14px 24px',
        }}
      >
        <RodapeLegal />
      </footer>
    </div>
  );
}
