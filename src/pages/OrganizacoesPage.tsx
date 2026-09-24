import React, { useEffect, useState } from 'react';
import {
  listarOrganizacoes,
  alternarAtivoOrganizacao,
  editarOrganizacao,
  historicoOrganizacao,
  resetarSenhaSupervisor,
  resetar2faSupervisor,
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

// Bloco A015 (2026-09-22), Fase 2 -- mesma função de DashboardPage.tsx
// (cada tela guarda a sua, é o padrão já usado aqui).
function formatarBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < unidades.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  return `${valor.toFixed(indice <= 1 ? 0 : 1)} ${unidades[indice]}`;
}

export default function OrganizacoesPage() {
  const { t, idioma } = useI18n();
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<OrganizacaoResumo | null>(null);

  // Bloco A12a (2026-09-19) -- filtros da lista. Nada aqui vai ao
  // backend: a lista inteira ja' chega de uma vez em listarOrganizacoes,
  // entao filtrar em memoria e' instantaneo e nao inventa uma segunda
  // consulta pra manter em dia. As opcoes de plano saem do proprio dado
  // carregado, nunca de uma lista fixa -- se amanha existir um plano
  // novo, ele aparece no filtro sozinho.
  const [busca, setBusca] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'ativas' | 'inativas'>('todas');

  function carregar() {
    listarOrganizacoes().then((dados) => {
      setOrganizacoes(dados);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregar();
  }, []);

  const termoBusca = busca.trim().toLowerCase();
  const organizacoesFiltradas = organizacoes.filter((org) => {
    if (termoBusca && !org.nome.toLowerCase().includes(termoBusca)) return false;
    if (filtroPlano && (org.plano_codigo ?? '') !== filtroPlano) return false;
    if (filtroStatus === 'ativas' && !org.ativo) return false;
    if (filtroStatus === 'inativas' && org.ativo) return false;
    return true;
  });

  // Ordem canonica dos planos (Free -> Premium), nao a alfabetica: e' a
  // ordem comercial, a mesma que PlanosPage.tsx mostra.
  const ORDEM_PLANOS = ['FREE', 'BASIC', 'PRO', 'PREMIUM'];
  const planosPresentes = ORDEM_PLANOS.filter((codigo) =>
    organizacoes.some((org) => org.plano_codigo === codigo),
  );

  const filtrando = termoBusca !== '' || filtroPlano !== '' || filtroStatus !== 'todas';

  // Bloco A12a (2026-09-19) -- quando ha' filtro ativo, o subtitulo
  // mostra "X de Y" em vez do total. Sem isso a contagem mente: diz
  // "3 organizacoes" com a tabela mostrando 1.
  const contagem = filtrando ? organizacoesFiltradas.length : organizacoes.length;

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('organizacoes.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {/* Diferenca do original: a contagem era montada com pedacos
            ("organizaç" + "ão"/"ões"), o que so' funciona em portugues.
            Agora sao DUAS chaves inteiras -- `t()` nao interpola. */}
        {contagem}
        {/* Bloco A12a -- "3 / 12" enquanto ha' filtro. Barra e numeros,
            sem palavra nenhuma: nao ha' o que traduzir. */}
        {filtrando && ` / ${organizacoes.length}`}{' '}
        {t(
          contagem === 1
            ? 'organizacoes.contagemSingular'
            : 'organizacoes.contagemPlural',
        )}
        . {t('organizacoes.subtitulo')}
      </p>

      {/* Bloco A12a (2026-09-19) -- barra de filtros. Fica fora do
          cartao da tabela, sempre visivel, pra nao sumir junto com o
          "carregando" nem com o "nenhuma" -- filtrar e' o que a pessoa
          faz ANTES de saber se sobrou alguma coisa. */}
      {!carregando && organizacoes.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            className="campo"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={t('organizacoes.filtrarPorNome')}
            style={{ minWidth: 220, flex: 1 }}
          />
          <select
            className="campo"
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="">{t('organizacoes.filtroPlanoTodos')}</option>
            {planosPresentes.map((codigo) => (
              <option key={codigo} value={codigo}>{NOME_PLANO[codigo] ?? codigo}</option>
            ))}
          </select>
          <select
            className="campo"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as 'todas' | 'ativas' | 'inativas')}
            style={{ minWidth: 160 }}
          >
            <option value="todas">{t('organizacoes.filtroStatusTodos')}</option>
            <option value="ativas">{t('organizacoes.filtroStatusAtivas')}</option>
            <option value="inativas">{t('organizacoes.filtroStatusInativas')}</option>
          </select>
        </div>
      )}

      <div className="cartao" style={{ padding: 0 }}>
        {carregando ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('comum.carregando')}</p>
        ) : organizacoes.length === 0 ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('organizacoes.nenhuma')}</p>
        ) : organizacoesFiltradas.length === 0 ? (
          // Antes esta tela nao tinha filtro nenhum, entao "nenhuma
          // organizacao" so' podia significar lista vazia. Agora que
          // pode ser filtro sem resultado, a mensagem tem que dizer
          // QUAL dos dois casos e' -- senao parece que a base sumiu.
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('organizacoes.nenhumResultado')}</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>{t('organizacoes.colNome')}</th>
                <th>{t('organizacoes.colStatus')}</th>
                <th>{t('organizacoes.colPlano')}</th>
                <th>{t('organizacoes.colSupervisor')}</th>
                <th>{t('organizacoes.colCriadaEm')}</th>
                <th>{t('organizacoes.colLocaisAtivos')}</th>
                <th>{t('organizacoes.colUsuariosAtivos')}</th>
                <th>{t('organizacoes.colChecklistsPublicados')}</th>
                <th>{t('organizacoes.colPdfContratos')}</th>
              </tr>
            </thead>
            <tbody>
              {organizacoesFiltradas.map((org) => (
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
                  {/* Bloco A12a (2026-09-19) -- plano vigente da
                      organizacao, direto na lista: antes so' dava pra
                      saber abrindo o modal de cada uma, uma por uma. */}
                  <td style={{ fontWeight: 600 }}>
                    {org.plano_codigo ? (NOME_PLANO[org.plano_codigo] ?? org.plano_codigo) : '—'}
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
                  <td style={{ color: '#8A8FA3' }}>{formatarBytes(org.pdf_bytes_usados)}</td>
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

// Bloco A023 (2026-09-24) -- os 3 tipos de "ação com motivo obrigatório"
// da aba Ações usam o mesmo formulário (textarea + confirmar); só o
// texto muda. Chaves de i18n, não o texto em si -- t() é chamado no
// componente, que tem acesso ao idioma atual.
const TEXTOS_ACAO_PENDENTE: Record<'ATIVAR' | 'INATIVAR' | 'RESETAR_2FA', {
  motivo: string;
  placeholder: string;
  confirmar: string;
}> = {
  ATIVAR: {
    motivo: 'organizacoes.motivoReativacao',
    placeholder: 'organizacoes.placeholderReativacao',
    confirmar: 'organizacoes.confirmarReativacao',
  },
  INATIVAR: {
    motivo: 'organizacoes.motivoInativacao',
    placeholder: 'organizacoes.placeholderInativacao',
    confirmar: 'organizacoes.confirmarInativacao',
  },
  RESETAR_2FA: {
    motivo: 'organizacoes.motivoResetar2fa',
    placeholder: 'organizacoes.placeholderResetar2fa',
    confirmar: 'organizacoes.confirmarResetar2fa',
  },
};

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
  const [acaoPendente, setAcaoPendente] = useState<'ATIVAR' | 'INATIVAR' | 'RESETAR_2FA' | null>(null);
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

  // Bloco A12a (2026-09-19) -- a aba Historico passou a trazer TAMBEM as
  // trocas de plano (ver a linha do tempo mais abaixo). Antes ela buscava
  // so' tbl_organizacao_historico, e por isso uma troca de plano nao
  // aparecia em lugar nenhum do historico: ela ficava escondida na aba
  // Plano, junto do formulario que a causou -- lugar de agir, nao de
  // consultar.
  useEffect(() => {
    if (aba === 'historico' && (historico === null || historicoPlano === null)) {
      setCarregandoHistorico(true);
      Promise.all([
        historico ?? historicoOrganizacao(organizacao.id),
        historicoPlano ?? historicoPlanoOrganizacao(organizacao.id),
      ])
        .then(([dadosHistorico, dadosPlano]) => {
          setHistorico(dadosHistorico);
          setHistoricoPlano(dadosPlano);
        })
        .finally(() => setCarregandoHistorico(false));
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
      if (acaoPendente === 'RESETAR_2FA') {
        await resetar2faSupervisor(organizacao.id, motivo.trim());
      } else {
        await alternarAtivoOrganizacao(organizacao.id, acaoPendente === 'ATIVAR', motivo.trim());
      }
      aoMudar();
    } catch (e: any) {
      setErro(
        e?.response?.data?.message ||
          t(
            acaoPendente === 'RESETAR_2FA'
              ? 'organizacoes.erroResetar2fa'
              : acaoPendente === 'ATIVAR'
                ? 'organizacoes.erroAtivar'
                : 'organizacoes.erroInativar',
          ),
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
    RESETAR_2FA_SUPERVISOR: t('organizacoes.acaoResetou2fa'),
  };
  const corAcao: Record<string, string> = {
    ATIVAR: '#1E7A46',
    INATIVAR: '#B23A2E',
    EDITAR: '#5B6072',
    RESETAR_2FA_SUPERVISOR: '#B26A00',
  };

  const ROTULO_ABA: Record<Aba, string> = {
    acoes: t('organizacoes.abaAcoes'),
    editar: t('organizacoes.abaEditar'),
    plano: t('organizacoes.abaPlano'),
    historico: t('organizacoes.abaHistorico'),
  };

  // Bloco A12a (2026-09-19) -- linha do tempo unica desta organizacao:
  // acoes administrativas (tbl_organizacao_historico) + trocas de plano
  // (tbl_organizacao_plano), misturadas e ordenadas por data. Sao duas
  // tabelas com donos diferentes -- uma e' do admin.service, a outra do
  // planos.service -- e por isso nunca se juntaram sozinhas. Juntar na
  // tela e' o que faz a aba Historico cumprir o que o nome promete: o
  // que aconteceu com esta organizacao, numa lista so'.
  const linhaDoTempo = [
    ...(historico ?? []).map((h) => ({
      id: `acao-${h.id}`,
      quando: h.criado_em,
      rotulo: rotuloAcao[h.acao] ?? h.acao,
      cor: corAcao[h.acao],
      quem: h.criado_por_nome,
      detalhe: null as string | null,
      motivo: h.motivo,
      vigente: false,
    })),
    ...(historicoPlano ?? []).map((h) => ({
      id: `plano-${h.id}`,
      quando: h.inicio_em,
      // `t()` nao interpola: a frase e' montada com o nome do plano
      // colado depois do rotulo, como ja' se faz no resto do sistema.
      rotulo: `${t('organizacoes.mudancaDePlano')}: ${NOME_PLANO[h.codigo] ?? h.codigo}`,
      cor: '#2946E0',
      quem: h.alterado_por_nome,
      detalhe: h.origem,
      motivo: h.motivo,
      vigente: h.fim_em === null,
    })),
  ].sort((a, b) => new Date(b.quando).getTime() - new Date(a.quando).getTime());

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
                    <label style={{ fontSize: 12, color: '#5B6072' }}>{t(TEXTOS_ACAO_PENDENTE[acaoPendente].motivo)}</label>
                    <textarea
                      className="campo"
                      rows={3}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder={t(TEXTOS_ACAO_PENDENTE[acaoPendente].placeholder)}
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
                        {processando ? t('comum.salvando') : t(TEXTOS_ACAO_PENDENTE[acaoPendente].confirmar)}
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
                    {/* Bloco A023 (2026-09-24) -- só aparece quando o
                        supervisor realmente tem 2FA ativo: resetar algo
                        que não existe só confundiria. */}
                    {organizacao.supervisor_totp_habilitado && (
                      <button className="botao-secundario" onClick={() => setAcaoPendente('RESETAR_2FA')} disabled={processando}>
                        {t('organizacoes.resetar2faSupervisor')}
                      </button>
                    )}
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

                  {/* Bloco A12a (2026-09-19) -- o historico de planos
                      saiu desta aba e foi pra aba Historico, junto das
                      ativacoes/inativacoes/edicoes. Aqui ficou o que
                      esta aba sabe fazer: mostrar o plano vigente e
                      trocar. Consultar historico e' na outra. */}
                  <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 4, marginBottom: 0 }}>
                    {t('organizacoes.historicoNaAbaHistorico')}
                  </p>
                </>
              )
            )}

            {aba === 'historico' && (
              carregandoHistorico ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('comum.carregando')}</p>
              ) : linhaDoTempo.length === 0 ? (
                <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('organizacoes.nenhumEventoRegistrado')}</p>
              ) : (
                <div>
                  {linhaDoTempo.map((item) => (
                    <div key={item.id} style={{ borderLeft: `3px solid ${item.cor}`, paddingLeft: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: item.cor }}>
                        {item.rotulo}
                        {item.vigente && <span style={{ color: '#1E7A46' }}> {t('organizacoes.vigente')}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#8A8FA3' }}>
                        {new Date(item.quando).toLocaleString(locale)}
                        {item.quem && ` · ${item.quem}`}
                        {item.detalhe && ` · ${item.detalhe}`}
                      </div>
                      {item.motivo && <div style={{ fontSize: 12, marginTop: 2 }}>{item.motivo}</div>}
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
