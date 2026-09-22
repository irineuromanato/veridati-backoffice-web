import { api } from './client';

export interface AdminLogado {
  id: string;
  nome: string;
  email: string;
}

export async function login(email: string, senha: string): Promise<{ token: string; admin: AdminLogado }> {
  const resposta = await api.post('/admin/login', { email, senha });
  return resposta.data;
}

export interface OrganizacaoResumo {
  id: string;
  nome: string;
  criado_em: string;
  ativo: boolean;
  sempre_ativa: boolean;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  locais_ativos: number;
  usuarios_ativos: number;
  checklists_publicados: number;
  supervisor_nome: string | null;
  supervisor_email: string | null;
  // Bloco A12a (2026-09-19) -- plano vigente, pra coluna Plano da lista.
  // Vem do backend ja' pronto (codigo do plano, ex.: 'FREE'/'PRO'), nunca
  // null numa organizacao de verdade -- toda organizacao nasce com Free.
  // Fica null so' se a consulta nao achar linha vigente nenhuma.
  plano_codigo: string | null;
  // Bloco A015 (2026-09-22), Fase 2 -- soma dos PDFs anexados aos
  // contratos desta organização, em bytes.
  pdf_bytes_usados: number;
}

export interface HistoricoOrganizacao {
  id: string;
  acao: 'ATIVAR' | 'INATIVAR' | 'EDITAR';
  motivo: string | null;
  criado_em: string;
  criado_por_nome: string | null;
}

export async function listarOrganizacoes(): Promise<OrganizacaoResumo[]> {
  const resposta = await api.get('/admin/organizacoes');
  return resposta.data;
}

export async function alternarAtivoOrganizacao(
  id: string,
  ativo: boolean,
  motivo?: string,
): Promise<OrganizacaoResumo> {
  const resposta = await api.patch(`/admin/organizacoes/${id}/ativo`, { ativo, motivo });
  return resposta.data;
}

export async function editarOrganizacao(
  id: string,
  dados: { nome: string; sempreAtiva: boolean; vigenciaInicio: string | null; vigenciaFim: string | null },
): Promise<{ id: string; nome: string }> {
  const resposta = await api.patch(`/admin/organizacoes/${id}`, dados);
  return resposta.data;
}

export async function historicoOrganizacao(id: string): Promise<HistoricoOrganizacao[]> {
  const resposta = await api.get(`/admin/organizacoes/${id}/historico`);
  return resposta.data;
}

export async function resetarSenhaSupervisor(
  id: string,
): Promise<{ email: string; nome: string; senhaTemporaria: string }> {
  const resposta = await api.post(`/admin/organizacoes/${id}/resetar-senha-supervisor`);
  return resposta.data;
}

export async function buscarMinhaConta(): Promise<AdminLogado> {
  const resposta = await api.get('/admin/minha-conta');
  return resposta.data;
}

export async function atualizarMinhaConta(dados: {
  nome?: string;
  senhaNova?: string;
}): Promise<AdminLogado> {
  const resposta = await api.patch('/admin/minha-conta', dados);
  return resposta.data;
}

export interface JobStatus {
  nome: string;
  titulo: string;
  descricao: string;
  habilitado: boolean;
  ultimaVerificacao: string | null;
  ultimaAcao: string | null;
  ultimoDetalhe: string | null;
  proximaExecucaoPrevista: string | null;
}

export async function listarJobs(): Promise<JobStatus[]> {
  const resposta = await api.get('/admin/jobs');
  return resposta.data;
}

export async function forcarJob(nome: string) {
  const resposta = await api.post(`/admin/jobs/${nome}/forcar`);
  return resposta.data;
}

export async function definirHabilitadoJob(nome: string, habilitado: boolean): Promise<JobStatus[]> {
  await api.patch(`/admin/jobs/${nome}/habilitado`, { habilitado });
  return listarJobs();
}

// Bloco A02 (2026-09-17) -- catálogo de tipos de e-mail de aviso, com
// liga/desliga global (afeta todas as organizações).
export interface TipoEmail {
  tipo: string;
  titulo: string;
  descricao: string;
  supervisorRecebe: boolean;
  habilitado: boolean;
}

export async function listarTiposEmail(): Promise<TipoEmail[]> {
  const resposta = await api.get('/admin/tipos-email');
  return resposta.data;
}

export async function definirHabilitadoTipoEmail(tipo: string, habilitado: boolean): Promise<TipoEmail[]> {
  const resposta = await api.patch(`/admin/tipos-email/${tipo}/habilitado`, { habilitado });
  return resposta.data;
}

// Bloco 19 (2026-09-12) -- "log completo": últimas 20 execuções de um
// job específico, não só a mais recente.
export interface LogJob {
  executado_em: string;
  agiu: boolean;
  detalhe: string | null;
}

export async function listarLogsDoJob(nome: string): Promise<LogJob[]> {
  const resposta = await api.get(`/admin/jobs/${nome}/logs`);
  return resposta.data;
}

export interface ConfiguracaoPlataforma {
  job_ocorrencias_horarios: string;
  notificacao_semanal_dia: number;
  notificacao_semanal_hora: string;
  dias_validade_exportacao: number;
}

export async function buscarConfiguracao(): Promise<ConfiguracaoPlataforma> {
  const resposta = await api.get('/admin/configuracao');
  return resposta.data;
}

export async function atualizarConfiguracao(dados: {
  jobOcorrenciasHorarios?: string[];
  notificacaoSemanalDia?: number;
  notificacaoSemanalHora?: string;
  diasValidadeExportacao?: number;
}): Promise<ConfiguracaoPlataforma> {
  const resposta = await api.patch('/admin/configuracao', dados);
  return resposta.data;
}

export interface Administrador {
  id: string;
  nome: string;
  email: string;
  criado_em: string;
}

export async function listarAdmins(): Promise<Administrador[]> {
  const resposta = await api.get('/admin/administradores');
  return resposta.data;
}

export async function criarAdmin(dados: { nome: string; email: string; senha: string }): Promise<Administrador> {
  const resposta = await api.post('/admin/administradores', dados);
  return resposta.data;
}

export async function atualizarAdmin(
  id: string,
  dados: { nome?: string; email?: string; senha?: string },
): Promise<Administrador> {
  const resposta = await api.patch(`/admin/administradores/${id}`, dados);
  return resposta.data;
}

export async function excluirAdmin(id: string): Promise<void> {
  await api.delete(`/admin/administradores/${id}`);
}

// Bloco 12 (2026-09-07) -- painel de visibilidade de exportações de
// dados (Bloco 11/12), pra entender consumo de máquina/banda.
export interface ExportacaoResumoAdmin {
  id: string;
  status: 'PENDENTE' | 'PROCESSANDO' | 'PRONTA' | 'ERRO';
  criado_em: string;
  concluido_em: string | null;
  expira_em: string;
  erro: string | null;
  organizacao_nome: string;
}

export async function listarExportacoesTodas(): Promise<{
  porStatus: { status: string; total: number }[];
  exportacoes: ExportacaoResumoAdmin[];
}> {
  const resposta = await api.get('/admin/exportacoes');
  return resposta.data;
}

// Bloco A01 (2026-09-17), Fase 1 -- catálogo de planos. Nome/frase de
// limite não vêm do backend -- só números/booleanos; a tela monta o
// texto (ver PlanosPage.tsx).
export interface PrecoPlano {
  id: string;
  plano_id: string;
  moeda: 'BRL' | 'EUR' | 'USD';
  periodicidade: 'MENSAL' | 'ANUAL';
  valor: string;
  stripe_price_id: string | null;
}
export interface Plano {
  id: string;
  codigo: string;
  limite_localidades: number | null;
  limite_pessoas: number | null;
  limite_checklists_aprovados_mes: number | null;
  limite_tarefas_finalizadas_mes: number | null;
  limite_fotos_por_pergunta: number | null;
  limite_contratos: number | null;
  limite_documentos_por_contrato: number | null;
  tem_mapa: boolean;
  nivel_relatorios: 'NENHUM' | 'LIMITADO' | 'COMPLETO';
  nivel_alertas_email: 'NENHUM' | 'BASICO' | 'COMPLETO';
  ativo: boolean;
  ordem: number;
  precos: PrecoPlano[];
}

export async function listarPlanos(): Promise<Plano[]> {
  const resposta = await api.get('/admin/planos');
  return resposta.data;
}

export async function criarPlano(dados: {
  codigo: string;
  limiteLocalidades: number | null;
  limitePessoas: number | null;
  limiteChecklistsAprovadosMes: number | null;
  limiteTarefasFinalizadasMes: number | null;
  limiteFotosPorPergunta: number | null;
  limiteContratos: number | null;
  limiteDocumentosPorContrato: number | null;
  temMapa: boolean;
  nivelRelatorios: string;
  nivelAlertasEmail: string;
}): Promise<{ id: string }> {
  const resposta = await api.post('/admin/planos', dados);
  return resposta.data;
}

export async function atualizarPlano(
  id: string,
  dados: Partial<{
    limiteLocalidades: number | null;
    limitePessoas: number | null;
    limiteChecklistsAprovadosMes: number | null;
    limiteTarefasFinalizadasMes: number | null;
    limiteFotosPorPergunta: number | null;
    limiteContratos: number | null;
    limiteDocumentosPorContrato: number | null;
    temMapa: boolean;
    nivelRelatorios: string;
    nivelAlertasEmail: string;
    ativo: boolean;
  }>,
) {
  const resposta = await api.patch(`/admin/planos/${id}`, dados);
  return resposta.data;
}

export async function atualizarPrecoPlano(id: string, moeda: string, periodicidade: string, valor: number) {
  const resposta = await api.patch(`/admin/planos/${id}/preco`, { moeda, periodicidade, valor });
  return resposta.data;
}

export interface ConversaoPlano {
  organizacao_id: string;
  organizacao_nome: string;
  inicio_em: string;
  codigo_novo: string;
  codigo_anterior: string | null;
}

export async function conversoesPlanos(): Promise<{ upgrades: ConversaoPlano[]; downgrades: ConversaoPlano[] }> {
  const resposta = await api.get('/admin/planos/conversoes');
  return resposta.data;
}

export interface HistoricoPlanoItem {
  id: string;
  codigo: string;
  moeda: string | null;
  periodicidade: string | null;
  origem: string;
  motivo: string | null;
  alterado_por_nome: string | null;
  inicio_em: string;
  fim_em: string | null;
}

export async function trocarPlanoOrganizacao(organizacaoId: string, planoId: string, motivo: string) {
  const resposta = await api.post(`/admin/organizacoes/${organizacaoId}/plano`, { planoId, motivo });
  return resposta.data;
}

export async function historicoPlanoOrganizacao(organizacaoId: string): Promise<HistoricoPlanoItem[]> {
  const resposta = await api.get(`/admin/organizacoes/${organizacaoId}/plano/historico`);
  return resposta.data;
}

// Bloco A11a / Sub-bloco 60 (2026-09-17) -- Dashboard do Backoffice.
// Campos em snake_case espelhando o JSON de `GET /admin/dashboard`,
// como todo o resto deste arquivo.
//
// Os dois campos de espaço chegam em BYTES, não formatados: quem decide
// como exibir (KB/MB/GB) é a tela, não a API.
export interface MetricaRanking {
  organizacao_id: string;
  organizacao_nome: string;
  total: number;
}

export interface MetricasPlataforma {
  totais: {
    organizacoes: number;
    checklists: number;
    tarefas: number;
    locais: number;
    equipes: number;
    espaco_fotos_bytes: number;
    espaco_personalizacao_bytes: number;
  };
  planos: {
    gratuitos: number;
    pagos: number;
  };
  top_espaco: MetricaRanking[];
  top_checklists: MetricaRanking[];
  top_tarefas: MetricaRanking[];
}

export async function buscarMetricas(): Promise<MetricasPlataforma> {
  const resposta = await api.get('/admin/dashboard');
  return resposta.data;
}
