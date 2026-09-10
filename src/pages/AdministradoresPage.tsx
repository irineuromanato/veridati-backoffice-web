import React, { useEffect, useState } from 'react';
import { listarAdmins, criarAdmin, Administrador } from '../api/admin';

// Bloco 10 (2026-09-06) -- criar mais administradores do Backoffice.
// Qualquer admin autenticado pode criar outro, sem hierarquia entre
// eles por enquanto. supervisor@veridati.online é criado sozinho no
// setup, se o banco começar sem nenhum admin (ver admin.service.ts).
export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);

  function carregar() {
    listarAdmins().then((dados) => {
      setAdmins(dados);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1B2E8A' }}>Administradores</h1>
        <button className="botao-primario" onClick={() => setCriando(true)}>
          + Novo administrador
        </button>
      </div>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -12, marginBottom: 20 }}>
        Pessoas com acesso ao Backoffice inteiro -- organizações, jobs, configurações. Sem
        hierarquia entre eles: qualquer um pode criar outro.
      </p>

      <div className="cartao" style={{ padding: 0 }}>
        {carregando ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>Carregando...</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.nome}</td>
                  <td>{a.email}</td>
                  <td style={{ color: '#8A8FA3' }}>{new Date(a.criado_em).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {criando && (
        <ModalCriarAdmin
          aoFechar={() => setCriando(false)}
          aoCriar={() => {
            setCriando(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function ModalCriarAdmin({ aoFechar, aoCriar }: { aoFechar: () => void; aoCriar: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      await criarAdmin({ nome: nome.trim(), email: email.trim(), senha });
      aoCriar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || 'Não foi possível criar o administrador.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
      onClick={aoFechar}
    >
      <div className="cartao" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Novo administrador</h2>

        <label style={{ fontSize: 12, color: '#5B6072' }}>Nome</label>
        <input className="campo" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 12 }} />

        <label style={{ fontSize: 12, color: '#5B6072' }}>E-mail</label>
        <input className="campo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 12 }} />

        <label style={{ fontSize: 12, color: '#5B6072' }}>Senha (mínimo 8 caracteres)</label>
        <input className="campo" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 16 }} />

        {erro && <p className="erro" style={{ fontSize: 12 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="botao-secundario" onClick={aoFechar} disabled={salvando} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button
            className="botao-primario"
            onClick={salvar}
            disabled={!nome.trim() || !email.trim() || senha.length < 8 || salvando}
            style={{ flex: 1 }}
          >
            {salvando ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
