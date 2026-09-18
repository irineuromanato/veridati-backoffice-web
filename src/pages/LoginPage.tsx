import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import SeletorIdioma from '../components/SeletorIdioma';
import RodapeLegal from '../components/RodapeLegal';

// Bloco 22 (2026-09-14): reconstruída do zero pra seguir exatamente o
// mesmo padrão do Account -- fundo claro (era escuro, #0E1233), logo
// completo (ícone + nome embaixo) no canto superior esquerdo, símbolo
// sozinho centralizado dentro da caixa (era só um <h1> de texto, sem
// logo nenhum).
//
// Bloco A11a / Sub-bloco 60 (2026-09-17): o seletor de idioma entra
// AQUI também. Esta tela fica FORA do Layout, então não herda o
// seletor do Cabecalho -- sem ele, quem não lê português não teria
// como trocar o idioma antes de conseguir entrar. Vai no canto
// superior direito, espelhando o logo no esquerdo.
export default function LoginPage() {
  const navegar = useNavigate();
  const { entrar } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function lidarComEntrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await entrar(email, senha);
      navegar('/organizacoes');
    } catch {
      setErro(t('login.erro'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 24, left: 28, display: 'flex', alignItems: 'center' }}>
        <img src="/logo-veridati-canto.png" alt="Veridati" style={{ height: 80, width: 'auto' }} />
      </div>

      <div style={{ position: 'absolute', top: 24, right: 28 }}>
        <SeletorIdioma />
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={lidarComEntrar} className="cartao" style={{ width: 360 }}>
          <img
            src="/logo-veridati-icone.png"
            alt="Veridati"
            style={{ height: 44, width: 'auto', display: 'block', margin: '0 auto 16px' }}
          />
          <p style={{ color: '#5B6072', fontSize: 14, marginTop: 0, marginBottom: 24, textAlign: 'center' }}>
            {t('login.subtitulo')}
          </p>

          <label style={{ fontSize: 12, color: '#5B6072' }}>{t('login.email')}</label>
          <input
            className="campo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
            autoFocus
          />
          <label style={{ fontSize: 12, color: '#5B6072' }}>{t('login.senha')}</label>
          <input
            className="campo"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ marginTop: 4, marginBottom: 16, width: '100%' }}
          />
          {erro && <p className="erro">{erro}</p>}
          <button className="botao-primario" type="submit" disabled={carregando || !email || !senha} style={{ width: '100%' }}>
            {carregando ? t('login.entrando') : t('login.entrar')}
          </button>
        </form>
      </div>

      {/* Bloco A09 (2026-09-18) -- os links legais na tela de login.
          Pedido: "na tela de login deve estar na parte inferior, na
          parte direita". Fica em posicao absoluta de proposito, pra NAO
          participar do flex que centraliza o cartao -- se entrasse no
          fluxo normal, empurraria o formulario pra cima e ele deixaria
          de estar centralizado na altura da tela. */}
      <div style={{ position: 'absolute', bottom: 24, right: 28 }}>
        <RodapeLegal alinhamento="direita" />
      </div>
    </div>
  );
}
