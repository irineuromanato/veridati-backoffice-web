import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { buscarMinhaConta, atualizarMinhaConta } from '../api/admin';
import CampoSenha from './CampoSenha';

// Bloco A11 (2026-09-16) -- igual ao MinhaContaModal do Account: mesmo
// layout de modal, mesmos campos de senha sem pedir a senha atual (a
// sessão já autentica o admin via token). Sem data de nascimento/gênero
// nem reenvio de ativação porque admin de plataforma não tem esses
// dados -- é só nome, e-mail (fixo) e senha.
export default function MinhaContaModal({ aoFechar }: { aoFechar: () => void }) {
  const { admin, atualizarAdminLocal } = useAuth();

  const [nome, setNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!admin) return;
    buscarMinhaConta().then((detalhe) => {
      setNome(detalhe.nome);
      setCarregando(false);
    });
  }, [admin]);

  async function lidarComSalvar() {
    if (!admin) return;
    setErro(null);
    setSalvando(true);
    try {
      await atualizarMinhaConta({
        nome,
        ...(novaSenha ? { senhaNova: novaSenha } : {}),
      });
      atualizarAdminLocal({ nome });
      setSucesso(true);
      setNovaSenha('');
    } catch {
      setErro('Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="overlay-modal" onClick={aoFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
        <h2 style={{ marginTop: 0, color: '#1B2E8A' }}>Minha conta</h2>

        {carregando ? (
          <p style={{ color: '#8A8FA3' }}>Carregando...</p>
        ) : (
          <>
            <label style={{ fontSize: 12, color: '#5B6072' }}>Nome</label>
            <input
              className="campo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ marginTop: 4, marginBottom: 12 }}
            />

            <label style={{ fontSize: 12, color: '#5B6072' }}>E-mail</label>
            <input className="campo" value={admin?.email ?? ''} disabled style={{ marginTop: 4, marginBottom: 12 }} />

            <label style={{ fontSize: 12, color: '#5B6072' }}>Nova senha</label>
            <CampoSenha
              valor={novaSenha}
              aoMudar={setNovaSenha}
              dica={novaSenha ? 'Mínimo de 8 caracteres.' : undefined}
              style={{ marginTop: 4, marginBottom: 16 }}
            />

            {erro && <p className="erro">{erro}</p>}
            {sucesso && <p style={{ color: '#1E7A46', fontSize: 13, marginBottom: 12 }}>Dados salvos.</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="botao-secundario" onClick={aoFechar} style={{ flex: 1 }}>
                Fechar
              </button>
              <button
                className="botao-primario"
                onClick={lidarComSalvar}
                disabled={salvando || !nome || (novaSenha.length > 0 && novaSenha.length < 8)}
                style={{ flex: 1 }}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
