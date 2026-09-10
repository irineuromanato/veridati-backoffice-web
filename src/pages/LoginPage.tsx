import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E1233' }}>
      <form onSubmit={lidarComEntrar} style={{ background: '#FFF', borderRadius: 16, padding: 32, width: 360 }}>
        <h1 style={{ marginTop: 0, color: '#1B2E8A', fontSize: 20 }}>Veridati — Backoffice</h1>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: -8, marginBottom: 24 }}>
          Acesso restrito a administradores da plataforma.
        </p>
        <label style={{ fontSize: 12, color: '#5B6072' }}>E-mail</label>
        <input
          className="campo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginTop: 4, marginBottom: 12 }}
          autoFocus
        />
        <label style={{ fontSize: 12, color: '#5B6072' }}>Senha</label>
        <input
          className="campo"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ marginTop: 4, marginBottom: 16 }}
        />
        {erro && <p className="erro">{erro}</p>}
        <button className="botao-primario" type="submit" disabled={carregando || !email || !senha} style={{ width: '100%' }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
