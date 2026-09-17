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
