import React, { useEffect, useState } from 'react';
import {
  listarOrganizacoes,
  alternarAtivoOrganizacao,
  editarOrganizacao,
  historicoOrganizacao,
  resetarSenhaSupervisor,
  OrganizacaoResumo,
  HistoricoOrganizacao,
} from '../api/admin';

export default function OrganizacoesPage() {
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<OrganizacaoResumo | null>(null);

  function carregar() {
    listarOrganizacoes().then((dados) => {
      setOrganizacoes(dados);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>Organizações</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {organizacoes.length} organizaç{organizacoes.length === 1 ? 'ão' : 'ões'} cadastrada{organizacoes.length === 1 ? '' : 's'} na plataforma.
        Clique numa linha pra editar, ativar/inativar, trocar senha do supervisor ou ver o histórico.
      </p>

      <div className="cartao" style={{ padding: 0 }}>
        {carregando ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>Carregando...</p>
        ) : organizacoes.length === 0 ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>Nenhuma organização cadastrada ainda.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Supervisor</th>
                <th>Criada em</th>
                <th>Locais ativos</th>
                <th>Usuários ativos</th>
                <th>Checklists publicados</th>
              </tr>
            </thead>
            <tbody>
              {organizacoes.map((org) => (
                <tr
                  key={org.id}
                  onClick={() => setSelecionada(org)}
                  style={{ cursor: 'pointer', opacity: org.ativo ? 1 : 0.55 }}
                >
                  <td style={{ fontWeight: 600 }}>{org.nome}</td>
                  <td>
                    <span className={`selo ${!org.ativo ? 'selo-inativo' : ''}`}>
                      {org.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {org.supervisor_nome ? (
                      <>
                        <div>{org.supervisor_nome}</div>
                        <div style={{ color: '#8A8FA3' }}>{org.supervisor_email}</div>
                      </>
                    ) : (
                      <span style={{ color: '#B23A2E' }}>Sem supervisor</span>
                    )}
                  </td>
                  <td style={{ color: '#8A8FA3' }}>{new Date(org.criado_em).toLocaleDateString()}</td>
                  <td>{org.locais_ativos}</td>
                  <td>{org.usuarios_ativos}</td>
                  <td>{org.checklists_publicados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selecionada && (
        <ModalOrganizacao
          organizacao={selecionada}
          aoFechar={() => setSelecionada(null)}
          aoMudar={() => {
            setSelecionada(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}

type Aba = 'acoes' | 'editar' | 'historico';

function ModalOrganizacao({
  organizacao,
  aoFechar,
  aoMudar,
}: {
  organizacao: OrganizacaoResumo;
  aoFechar: () => void;
  aoMudar: () => void;
}) {
  const [aba, setAba] = useState<Aba>('acoes');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<{ email: string; nome: string; senhaTemporaria: string } | null>(null);

  // Bloco 8 (2026-09-06) + Bloco 12 (2026-09-07): motivo obrigatório
  // pras DUAS direções agora, não só inativar -- `acaoPendente` guarda
  // qual das duas está em confirmação.
  const [acaoPendente, setAcaoPendente] = useState<'ATIVAR' | 'INATIVAR' | null>(null);
  const [motivo, setMotivo] = useState('');

  const [nomeEditado, setNomeEditado] = useState(organizacao.nome);
  const [sempreAtivaEditada, setSempreAtivaEditada] = useState(organizacao.sempre_ativa);
  const [vigenciaInicioEditada, setVigenciaInicioEditada] = useState(organizacao.vigencia_inicio ?? '');
  const [vigenciaFimEditada, setVigenciaFimEditada] = useState(organizacao.vigencia_fim ?? '');

  const [historico, setHistorico] = useState<HistoricoOrganizacao[] | null>(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    if (aba === 'historico' && historico === null) {
      setCarregandoHistorico(true);
      historicoOrganizacao(organizacao.id).then((dados) => {
        setHistorico(dados);
        setCarregandoHistorico(false);
      });
    }
  }, [aba, historico, organizacao.id]);

  async function confirmarAcao() {
    if (!motivo.trim() || !acaoPendente) return;
    setErro(null);
    setProcessando(true);
    try {
      await alternarAtivoOrganizacao(organizacao.id, acaoPendente === 'ATIVAR', motivo.trim());
      aoMudar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || `Não foi possível ${acaoPendente === 'ATIVAR' ? 'ativar' : 'inativar'} a organização.`);
      setProcessando(false);
    }
  }

  async function lidarComSalvarNome() {
    setErro(null);
    setProcessando(true);
    try {
      await editarOrganizacao(organizacao.id, {
        nome: nomeEditado,
        sempreAtiva: sempreAtivaEditada,
        vigenciaInicio: sempreAtivaEditada ? null : (vigenciaInicioEditada || null),
        vigenciaFim: sempreAtivaEditada ? null : (vigenciaFimEditada || null),
      });
      aoMudar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || 'Não foi possível salvar.');
      setProcessando(false);
    }
  }

  async function lidarComResetarSenha() {
    const confirmado = window.confirm(
      `Trocar a senha do supervisor de "${organizacao.nome}"? A senha atual dele deixa de funcionar imediatamente.`,
    );
    if (!confirmado) return;
    setErro(null);
    setProcessando(true);
    try {
      const resultado = await resetarSenhaSupervisor(organizacao.id);
      setSenhaGerada(resultado);
    } catch {
      setErro('Não foi possível trocar a senha. Confirme que a organização tem um supervisor cadastrado.');
    } finally {
      setProcessando(false);
    }
  }

  const rotuloAcao: Record<string, string> = {
    ATIVAR: 'Ativada',
    INATIVAR: 'Inativada',
    EDITAR: 'Editada',
  };
  const corAcao: Record<string, string> = {
    ATIVAR: '#1E7A46',
    INATIVAR: '#B23A2E',
    EDITAR: '#5B6072',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
      onClick={aoFechar}
    >
      <div
        className="cartao"
        style={{ width: 460, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: '#1B2E8A' }}>{organizacao.nome}</h2>

        {senhaGerada ? (
          <div>
            <p style={{ fontSize: 13, color: '#5B6072' }}>
              Senha trocada para <strong>{senhaGerada.nome}</strong> ({senhaGerada.email}).
              Copie agora -- ela não fica visível de novo depois de fechar esta janela.
            </p>
            <div
              style={{
                background: '#F5F6FA', border: '1px solid #E1E3EF', borderRadius: 8,
                padding: 12, fontFamily: 'monospace', fontSize: 16, textAlign: 'center',
                marginBottom: 16, userSelect: 'all',
              }}
            >
              {senhaGerada.senhaTemporaria}
            </div>
            <button className="botao-primario" onClick={aoMudar} style={{ width: '100%' }}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #E1E3EF' }}>
              {(['acoes', 'editar', 'historico'] as Aba[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAba(a)}
                  style={{
                    background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
                    borderBottom: aba === a ? '2px solid #2946E0' : '2px solid transparent',
                    color: aba === a ? '#2946E0' : '#5B6072', fontWeight: 700, fontSize: 13,
                  }}
                >
                  {a === 'acoes' ? 'Ações' : a === 'editar' ? 'Editar' : 'Histórico'}
                </button>
              ))}
            </div>

            {erro && <p className="erro" style={{ fontSize: 12 }}>{erro}</p>}

            {aba === 'acoes' && (
              <>
                <p style={{ fontSize: 13, color: '#5B6072' }}>
                  Status atual: <strong>{organizacao.ativo ? 'Ativa' : 'Inativa'}</strong>
                  {organizacao.supervisor_nome && (
                    <>
                      <br />
                      Supervisor: <strong>{organizacao.supervisor_nome}</strong> ({organizacao.supervisor_email})
                    </>
                  )}
                </p>

                {acaoPendente ? (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#5B6072' }}>
                      Motivo da {acaoPendente === 'ATIVAR' ? 'reativação' : 'inativação'} (obrigatório)
                    </label>
                    <textarea
                      className="campo"
                      rows={3}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder={
                        acaoPendente === 'ATIVAR'
                          ? 'Ex: Pagamento regularizado, contrato renovado...'
                          : 'Ex: Inadimplência, pedido do cliente, teste encerrado...'
                      }
                      style={{ width: '100%', marginTop: 4, resize: 'vertical' }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="botao-secundario" onClick={() => { setAcaoPendente(null); setMotivo(''); }} style={{ flex: 1 }}>
                        Cancelar
                      </button>
                      <button
                        className={acaoPendente === 'ATIVAR' ? 'botao-primario' : 'botao-perigo'}
                        onClick={confirmarAcao}
                        disabled={!motivo.trim() || processando}
                        style={{ flex: 1 }}
                      >
                        {processando ? 'Salvando...' : `Confirmar ${acaoPendente === 'ATIVAR' ? 'reativação' : 'inativação'}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      className={organizacao.ativo ? 'botao-perigo' : 'botao-primario'}
                      onClick={() => setAcaoPendente(organizacao.ativo ? 'INATIVAR' : 'ATIVAR')}
                      disabled={processando}
                    >
                      {organizacao.ativo ? 'Inativar organização' : 'Ativar organização'}
                    </button>
                    <button className="botao-secundario" onClick={lidarComResetarSenha} disabled={processando}>
                      Trocar senha do supervisor
                    </button>
                    <button className="botao-secundario" onClick={aoFechar} disabled={processando}>
                      Fechar
                    </button>
                  </div>
                )}
              </>
            )}

            {aba === 'editar' && (
              <>
                <label style={{ fontSize: 12, color: '#5B6072' }}>Nome da organização</label>
                <input
                  className="campo"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  style={{ width: '100%', marginTop: 4, marginBottom: 16 }}
                />

                {/* Bloco 9 (2026-09-06): vigência -- sempre ativa, ou
                    data início/fim. Validado no login do Account e do
                    mobile (backend), não só aqui na tela. */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={sempreAtivaEditada}
                    onChange={(e) => setSempreAtivaEditada(e.target.checked)}
                  />
                  <span style={{ fontSize: 13 }}>Sempre ativa (sem data de início/fim)</span>
                </label>

                {!sempreAtivaEditada && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>Vigência de</label>
                      <input
                        className="campo"
                        type="date"
                        value={vigenciaInicioEditada}
                        onChange={(e) => setVigenciaInicioEditada(e.target.value)}
                        style={{ width: '100%', marginTop: 4 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>até</label>
                      <input
                        className="campo"
                        type="date"
                        value={vigenciaFimEditada}
                        onChange={(e) => setVigenciaFimEditada(e.target.value)}
                        style={{ width: '100%', marginTop: 4 }}
                      />
                    </div>
                  </div>
                )}

                <button
                  className="botao-primario"
                  onClick={lidarComSalvarNome}
                  disabled={!nomeEditado.trim() || processando}
                  style={{ width: '100%' }}
                >
                  {processando ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}

            {aba === 'historico' && (
              carregandoHistorico ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>Carregando...</p>
              ) : !historico || historico.length === 0 ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>Nenhum evento registrado ainda.</p>
              ) : (
                <div>
                  {historico.map((h) => (
                    <div key={h.id} style={{ borderLeft: `3px solid ${corAcao[h.acao]}`, paddingLeft: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: corAcao[h.acao] }}>
                        {rotuloAcao[h.acao] ?? h.acao}
                      </div>
                      <div style={{ fontSize: 11, color: '#8A8FA3' }}>
                        {new Date(h.criado_em).toLocaleString()}
                        {h.criado_por_nome && ` · ${h.criado_por_nome}`}
                      </div>
                      {h.motivo && <div style={{ fontSize: 12, marginTop: 2 }}>{h.motivo}</div>}
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
