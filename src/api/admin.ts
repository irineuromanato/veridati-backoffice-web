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
  senhaAtual?: string;
  senhaNova?: string;
}): Promise<AdminLogado> {
  const resposta = await api.patch('/admin/minha-conta', dados);
  return resposta.data;
}

export interface JobStatus {
  nome: string;
  titulo: string;
  descricao: string;
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

export interface ConfiguracaoPlataforma {
  job_ocorrencias_hora: string;
  notificacao_semanal_dia: number;
  notificacao_semanal_hora: string;
  dias_validade_exportacao: number;
}

export async function buscarConfiguracao(): Promise<ConfiguracaoPlataforma> {
  const resposta = await api.get('/admin/configuracao');
  return resposta.data;
}

export async function atualizarConfiguracao(dados: {
  jobOcorrenciasHora?: string;
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
