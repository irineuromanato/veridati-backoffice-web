import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Bloco 22 (2026-09-14): reconstruída do zero pra seguir exatamente o
// mesmo padrão do Account -- fundo claro (era escuro, #0E1233), logo
// completo (ícone + nome embaixo) no canto superior esquerdo, símbolo
// sozinho centralizado dentro da caixa (era só um <h1> de texto, sem
// logo nenhum).
export default function LoginPage() {
  const navegar = useNavigate();
  const { entrar } = useAuth();
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
      setErro('E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 24, left: 28, display: 'flex', alignItems: 'center' }}>
        <img src="/logo-veridati-canto.png" alt="Veridati" style={{ height: 80, width: 'auto' }} />
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={lidarComEntrar} className="cartao" style={{ width: 360 }}>
          <img
            src="/logo-veridati-icone.png"
            alt="Veridati"
            style={{ height: 44, width: 'auto', display: 'block', margin: '0 auto 16px' }}
          />
          <p style={{ color: '#5B6072', fontSize: 14, marginTop: 0, marginBottom: 24, textAlign: 'center' }}>
            Backoffice — acesso restrito a administradores da plataforma
          </p>

          <label style={{ fontSize: 12, color: '#5B6072' }}>E-mail</label>
          <input
            className="campo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
            autoFocus
          />
          <label style={{ fontSize: 12, color: '#5B6072' }}>Senha</label>
          <input
            className="campo"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ marginTop: 4, marginBottom: 16, width: '100%' }}
          />
          {erro && <p className="erro">{erro}</p>}
          <button className="botao-primario" type="submit" disabled={carregando || !email || !senha} style={{ width: '100%' }}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
