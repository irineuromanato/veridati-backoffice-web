import React, { useEffect, useState } from 'react';
import { buscarMinhaConta, atualizarMinhaConta } from '../api/admin';

export default function MinhaContaPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [sucessoNome, setSucessoNome] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [sucessoSenha, setSucessoSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState<string | null>(null);

  useEffect(() => {
    buscarMinhaConta().then((dados) => {
      setNome(dados.nome);
      setEmail(dados.email);
      setCarregando(false);
    });
  }, []);

  async function lidarComSalvarNome() {
    setSalvandoNome(true);
    setSucessoNome(false);
    try {
      await atualizarMinhaConta({ nome });
      setSucessoNome(true);
    } finally {
      setSalvandoNome(false);
    }
  }

  async function lidarComTrocarSenha() {
    setErroSenha(null);
    setSucessoSenha(false);
    if (senhaNova.length < 8) {
      setErroSenha('A senha nova precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (senhaNova !== confirmarSenha) {
      setErroSenha('As duas senhas novas não coincidem.');
      return;
    }
    setSalvandoSenha(true);
    try {
      await atualizarMinhaConta({ senhaAtual, senhaNova });
      setSucessoSenha(true);
      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');
    } catch (e: any) {
      setErroSenha(
        e?.response?.status === 401 ? 'Senha atual incorreta.' : 'Não foi possível trocar a senha.',
      );
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>Carregando...</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>Minha conta</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        Seus dados de acesso ao Backoffice. Autenticação em duas etapas ainda não existe — fica para um
        próximo passo, esse ambiente é crítico o bastante pra justificar.
      </p>

      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>Dados</h2>
        <label style={{ fontSize: 12, color: '#5B6072' }}>Nome</label>
        <input
          className="campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
        />
        <label style={{ fontSize: 12, color: '#5B6072' }}>E-mail</label>
        <input
          className="campo"
          value={email}
          disabled
          style={{ marginTop: 4, marginBottom: 12, width: '100%', opacity: 0.6 }}
        />
        {sucessoNome && <p style={{ color: '#1E7A46', fontSize: 12, marginBottom: 8 }}>Nome atualizado.</p>}
        <button className="botao-primario" onClick={lidarComSalvarNome} disabled={salvandoNome}>
          {salvandoNome ? 'Salvando...' : 'Salvar nome'}
        </button>
      </div>

      <div className="cartao" style={{ maxWidth: 480 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>Trocar senha</h2>
        <label style={{ fontSize: 12, color: '#5B6072' }}>Senha atual</label>
        <input
          type="password"
          className="campo"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
        />
        <label style={{ fontSize: 12, color: '#5B6072' }}>Senha nova</label>
        <input
          type="password"
          className="campo"
          value={senhaNova}
          onChange={(e) => setSenhaNova(e.target.value)}
          style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
        />
        <label style={{ fontSize: 12, color: '#5B6072' }}>Confirmar senha nova</label>
        <input
          type="password"
          className="campo"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
        />
        {erroSenha && <p className="erro" style={{ fontSize: 12 }}>{erroSenha}</p>}
        {sucessoSenha && <p style={{ color: '#1E7A46', fontSize: 12, marginBottom: 8 }}>Senha trocada.</p>}
        <button
          className="botao-primario"
          onClick={lidarComTrocarSenha}
          disabled={salvandoSenha || !senhaAtual || !senhaNova || !confirmarSenha}
        >
          {salvandoSenha ? 'Trocando...' : 'Trocar senha'}
        </button>
      </div>
    </div>
  );
}
