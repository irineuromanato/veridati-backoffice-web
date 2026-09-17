import React, { useEffect, useState } from 'react';
import {
  listarOrganizacoes,
  alternarAtivoOrganizacao,
  editarOrganizacao,
  historicoOrganizacao,
  resetarSenhaSupervisor,
  listarPlanos,
  trocarPlanoOrganizacao,
  historicoPlanoOrganizacao,
  OrganizacaoResumo,
  HistoricoOrganizacao,
  Plano,
  HistoricoPlanoItem,
} from '../api/admin';
import { useI18n } from '../i18n/I18nContext';
import { Idioma } from '../i18n/dicionarios';

// Locale de exibicao por idioma -- so' pra data e hora sairem no
// formato do idioma escolhido, em vez do 'pt-BR' fixo que estava
// aqui antes. Mesmo mapa de DashboardPage.tsx.
const LOCALES: Record<Idioma, string> = {
  PT: 'pt-PT',
  PT_BR: 'pt-BR',
  EN: 'en-US',
  IT: 'it-IT',
  ES: 'es-ES',
  FR: 'fr-FR',
};

export default function OrganizacoesPage() {
  const { t, idioma } = useI18n();
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
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('organizacoes.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {/* Diferenca do original: a contagem era montada com pedacos
            ("organizaç" + "ão"/"ões"), o que so' funciona em portugues.
            Agora sao DUAS chaves inteiras -- `t()` nao interpola. */}
        {organizacoes.length}{' '}
        {t(
          organizacoes.length === 1
            ? 'organizacoes.contagemSingular'
            : 'organizacoes.contagemPlural',
        )}
        . {t('organizacoes.subtitulo')}
      </p>

      <div className="cartao" style={{ padding: 0 }}>
        {carregando ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('comum.carregando')}</p>
        ) : organizacoes.length === 0 ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('organizacoes.nenhuma')}</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>{t('organizacoes.colNome')}</th>
                <th>{t('organizacoes.colStatus')}</th>
                <th>{t('organizacoes.colSupervisor')}</th>
                <th>{t('organizacoes.colCriadaEm')}</th>
                <th>{t('organizacoes.colLocaisAtivos')}</th>
                <th>{t('organizacoes.colUsuariosAtivos')}</th>
                <th>{t('organizacoes.colChecklistsPublicados')}</th>
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
                      {t(org.ativo ? 'comum.ativa' : 'comum.inativa')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {org.supervisor_nome ? (
                      <>
                        <div>{org.supervisor_nome}</div>
                        <div style={{ color: '#8A8FA3' }}>{org.supervisor_email}</div>
                      </>
                    ) : (
                      <span style={{ color: '#B23A2E' }}>{t('organizacoes.semSupervisor')}</span>
                    )}
                  </td>
                  <td style={{ color: '#8A8FA3' }}>
                    {new Date(org.criado_em).toLocaleDateString(LOCALES[idioma] ?? 'pt-BR')}
                  </td>
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

type Aba = 'acoes' | 'editar' | 'plano' | 'historico';

// Nomes de produto: NAO se traduzem. 'Free'/'Basic'/'Pro'/'Premium' sao
// os codigos comerciais como aparecem pro cliente.
const NOME_PLANO: Record<string, string> = { FREE: 'Free', BASIC: 'Basic', PRO: 'Pro', PREMIUM: 'Premium' };

function ModalOrganizacao({
  organizacao,
  aoFechar,
  aoMudar,
}: {
  organizacao: OrganizacaoResumo;
  aoFechar: () => void;
  aoMudar: () => void;
}) {
  const { t, idioma } = useI18n();
  const [aba, setAba] = useState<Aba>('acoes');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<{ email: string; nome: string; senhaTemporaria: string } | null>(null);

  const locale = LOCALES[idioma] ?? 'pt-BR';

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

  // Bloco A01 (2026-09-17), Fase 2 -- trocar plano com motivo
  // obrigatório, mesmo padrão de UI que ativar/inativar já usa (aba
  // própria, em vez de reaproveitar acaoPendente, porque aqui tem um
  // terceiro campo -- qual plano -- que ativar/inativar não tem).
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [historicoPlano, setHistoricoPlano] = useState<HistoricoPlanoItem[] | null>(null);
  const [trocandoPlano, setTrocandoPlano] = useState(false);
  const [planoEscolhido, setPlanoEscolhido] = useState('');
  const [motivoPlano, setMotivoPlano] = useState('');

  useEffect(() => {
    if (aba === 'historico' && historico === null) {
      setCarregandoHistorico(true);
      historicoOrganizacao(organizacao.id).then((dados) => {
        setHistorico(dados);
        setCarregandoHistorico(false);
      });
    }
    if (aba === 'plano' && historicoPlano === null) {
      Promise.all([listarPlanos(), historicoPlanoOrganizacao(organizacao.id)]).then(([listaPlanos, hist]) => {
        setPlanos(listaPlanos);
        setHistoricoPlano(hist);
      });
    }
  }, [aba, historico, historicoPlano, organizacao.id]);

  const planoVigente = historicoPlano?.find((h) => h.fim_em === null) ?? null;

  async function confirmarAcao() {
    if (!motivo.trim() || !acaoPendente) return;
    setErro(null);
    setProcessando(true);
    try {
      await alternarAtivoOrganizacao(organizacao.id, acaoPendente === 'ATIVAR', motivo.trim());
      aoMudar();
    } catch (e: any) {
      setErro(
        e?.response?.data?.message ||
          t(acaoPendente === 'ATIVAR' ? 'organizacoes.erroAtivar' : 'organizacoes.erroInativar'),
      );
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
      setErro(e?.response?.data?.message || t('organizacoes.erroSalvar'));
      setProcessando(false);
    }
  }

  async function lidarComResetarSenha() {
    // O texto original citava o nome da organização dentro da frase
    // ("...supervisor de \"X\"?"). Como `t()` nao interpola, a chave
    // diz "desta organização" -- o nome ja' e' o titulo do modal, e o
    // mesmo confirm nao pode ser montado por concatenacao sem quebrar
    // a ordem das palavras nos outros idiomas.
    const confirmado = window.confirm(t('organizacoes.confirmarTrocarSenha'));
    if (!confirmado) return;
    setErro(null);
    setProcessando(true);
    try {
      const resultado = await resetarSenhaSupervisor(organizacao.id);
      setSenhaGerada(resultado);
    } catch {
      setErro(t('organizacoes.erroTrocarSenha'));
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarTrocaPlano() {
    if (!planoEscolhido || !motivoPlano.trim()) return;
    setErro(null);
    setProcessando(true);
    try {
      await trocarPlanoOrganizacao(organizacao.id, planoEscolhido, motivoPlano.trim());
      const hist = await historicoPlanoOrganizacao(organizacao.id);
      setHistoricoPlano(hist);
      setTrocandoPlano(false);
      setPlanoEscolhido('');
      setMotivoPlano('');
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('organizacoes.erroTrocarPlano'));
    } finally {
      setProcessando(false);
    }
  }

  const rotuloAcao: Record<string, string> = {
    ATIVAR: t('organizacoes.acaoAtivada'),
    INATIVAR: t('organizacoes.acaoInativada'),
    EDITAR: t('organizacoes.acaoEditada'),
  };
  const corAcao: Record<string, string> = {
    ATIVAR: '#1E7A46',
    INATIVAR: '#B23A2E',
    EDITAR: '#5B6072',
  };

  const ROTULO_ABA: Record<Aba, string> = {
    acoes: t('organizacoes.abaAcoes'),
    editar: t('organizacoes.abaEditar'),
    plano: t('organizacoes.abaPlano'),
    historico: t('organizacoes.abaHistorico'),
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
              {t('organizacoes.senhaTrocadaPara')} <strong>{senhaGerada.nome}</strong> ({senhaGerada.email}).{' '}
              {t('organizacoes.senhaAviso')}
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
              {t('comum.fechar')}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #E1E3EF' }}>
              {(['acoes', 'editar', 'plano', 'historico'] as Aba[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAba(a)}
                  style={{
                    background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
                    borderBottom: aba === a ? '2px solid #2946E0' : '2px solid transparent',
                    color: aba === a ? '#2946E0' : '#5B6072', fontWeight: 700, fontSize: 13,
                  }}
                >
                  {ROTULO_ABA[a]}
                </button>
              ))}
            </div>

            {erro && <p className="erro" style={{ fontSize: 12 }}>{erro}</p>}

            {aba === 'acoes' && (
              <>
                <p style={{ fontSize: 13, color: '#5B6072' }}>
                  {t('organizacoes.statusAtual')}{' '}
                  <strong>{t(organizacao.ativo ? 'comum.ativa' : 'comum.inativa')}</strong>
                  {organizacao.supervisor_nome && (
                    <>
                      <br />
                      {t('organizacoes.supervisor')} <strong>{organizacao.supervisor_nome}</strong> ({organizacao.supervisor_email})
                    </>
                  )}
                </p>

                {acaoPendente ? (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#5B6072' }}>
                      {t(
                        acaoPendente === 'ATIVAR'
                          ? 'organizacoes.motivoReativacao'
                          : 'organizacoes.motivoInativacao',
                      )}
                    </label>
                    <textarea
                      className="campo"
                      rows={3}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder={t(
                        acaoPendente === 'ATIVAR'
                          ? 'organizacoes.placeholderReativacao'
                          : 'organizacoes.placeholderInativacao',
                      )}
                      style={{ width: '100%', marginTop: 4, resize: 'vertical' }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button className="botao-secundario" onClick={() => { setAcaoPendente(null); setMotivo(''); }} style={{ flex: 1 }}>
                        {t('comum.cancelar')}
                      </button>
                      <button
                        className={acaoPendente === 'ATIVAR' ? 'botao-primario' : 'botao-perigo'}
                        onClick={confirmarAcao}
                        disabled={!motivo.trim() || processando}
                        style={{ flex: 1 }}
                      >
                        {processando
                          ? t('comum.salvando')
                          : t(
                              acaoPendente === 'ATIVAR'
                                ? 'organizacoes.confirmarReativacao'
                                : 'organizacoes.confirmarInativacao',
                            )}
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
                      {t(organizacao.ativo ? 'organizacoes.inativar' : 'organizacoes.ativar')}
                    </button>
                    <button className="botao-secundario" onClick={lidarComResetarSenha} disabled={processando}>
                      {t('organizacoes.trocarSenhaSupervisor')}
                    </button>
                    <button className="botao-secundario" onClick={aoFechar} disabled={processando}>
                      {t('comum.fechar')}
                    </button>
                  </div>
                )}
              </>
            )}

            {aba === 'editar' && (
              <>
                <label style={{ fontSize: 12, color: '#5B6072' }}>{t('organizacoes.nomeDaOrganizacao')}</label>
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
                  <span style={{ fontSize: 13 }}>{t('organizacoes.sempreAtiva')}</span>
                </label>

                {!sempreAtivaEditada && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>{t('organizacoes.vigenciaDe')}</label>
                      <input
                        className="campo"
                        type="date"
                        value={vigenciaInicioEditada}
                        onChange={(e) => setVigenciaInicioEditada(e.target.value)}
                        style={{ width: '100%', marginTop: 4 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>{t('organizacoes.vigenciaAte')}</label>
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
                  {processando ? t('comum.salvando') : t('comum.salvar')}
                </button>
              </>
            )}

            {aba === 'plano' && (
              historicoPlano === null ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('comum.carregando')}</p>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: '#5B6072' }}>
                    {t('organizacoes.planoAtual')}{' '}
                    <strong>{planoVigente ? (NOME_PLANO[planoVigente.codigo] ?? planoVigente.codigo) : '—'}</strong>
                    {planoVigente?.origem === 'CADASTRO' && ` ${t('organizacoes.planoAutomatico')}`}
                  </p>

                  {trocandoPlano ? (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>{t('organizacoes.novoPlano')}</label>
                      <select
                        className="campo"
                        value={planoEscolhido}
                        onChange={(e) => setPlanoEscolhido(e.target.value)}
                        style={{ width: '100%', marginTop: 4, marginBottom: 12 }}
                      >
                        <option value="">{t('organizacoes.selecione')}</option>
                        {planos.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.codigo === planoVigente?.codigo}>
                            {NOME_PLANO[p.codigo] ?? p.codigo}
                          </option>
                        ))}
                      </select>
                      <label style={{ fontSize: 12, color: '#5B6072' }}>{t('organizacoes.motivoTroca')}</label>
                      <textarea
                        className="campo"
                        rows={3}
                        value={motivoPlano}
                        onChange={(e) => setMotivoPlano(e.target.value)}
                        placeholder={t('organizacoes.placeholderTroca')}
                        style={{ width: '100%', marginTop: 4 }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="botao-secundario" onClick={() => { setTrocandoPlano(false); setPlanoEscolhido(''); setMotivoPlano(''); }} style={{ flex: 1 }}>
                          {t('comum.cancelar')}
                        </button>
                        <button
                          className="botao-primario"
                          onClick={confirmarTrocaPlano}
                          disabled={!planoEscolhido || !motivoPlano.trim() || processando}
                          style={{ flex: 1 }}
                        >
                          {processando ? t('comum.salvando') : t('organizacoes.confirmarTroca')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="botao-secundario" onClick={() => setTrocandoPlano(true)} style={{ marginBottom: 16 }}>
                      {t('organizacoes.trocarPlano')}
                    </button>
                  )}

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6072', marginTop: 8, marginBottom: 6 }}>
                    {t('organizacoes.historico')}
                  </div>
                  {historicoPlano.length === 0 ? (
                    <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('organizacoes.nenhumEvento')}</p>
                  ) : (
                    historicoPlano.map((h) => (
                      <div key={h.id} style={{ borderLeft: '3px solid #2946E0', paddingLeft: 10, marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2A2E3F' }}>
                          {NOME_PLANO[h.codigo] ?? h.codigo}
                          {h.fim_em === null && <span style={{ color: '#1E7A46' }}> {t('organizacoes.vigente')}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#8A8FA3' }}>
                          {new Date(h.inicio_em).toLocaleString(locale)}
                          {h.alterado_por_nome && ` · ${h.alterado_por_nome}`}
                          {' · '}{h.origem}
                        </div>
                        {h.motivo && <div style={{ fontSize: 12, marginTop: 2 }}>{h.motivo}</div>}
                      </div>
                    ))
                  )}
                </>
              )
            )}

            {aba === 'historico' && (
              carregandoHistorico ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('comum.carregando')}</p>
              ) : !historico || historico.length === 0 ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('organizacoes.nenhumEventoRegistrado')}</p>
              ) : (
                <div>
                  {historico.map((h) => (
                    <div key={h.id} style={{ borderLeft: `3px solid ${corAcao[h.acao]}`, paddingLeft: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: corAcao[h.acao] }}>
                        {rotuloAcao[h.acao] ?? h.acao}
                      </div>
                      <div style={{ fontSize: 11, color: '#8A8FA3' }}>
                        {new Date(h.criado_em).toLocaleString(locale)}
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
