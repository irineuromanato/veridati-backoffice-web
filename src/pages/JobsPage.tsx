import React, { useEffect, useState } from 'react';
import { listarJobs, forcarJob, listarLogsDoJob, definirHabilitadoJob, JobStatus, LogJob } from '../api/admin';
import { useI18n } from '../i18n/I18nContext';
import Icone from '../components/Icone';

// O idioma da interface vira o locale das datas (mesmo mapa do Dashboard).
const LOCAIS_POR_IDIOMA: Record<string, string> = {
  PT: 'pt-PT',
  PT_BR: 'pt-BR',
  EN: 'en-US',
  IT: 'it-IT',
  ES: 'es-ES',
  FR: 'fr-FR',
};

function formatarDataHora(iso: string | null, locale: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(locale);
}

export default function JobsPage() {
  const { idioma, t } = useI18n();
  const locale = LOCAIS_POR_IDIOMA[idioma] ?? 'pt-BR';
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [forcando, setForcando] = useState<string | null>(null);
  const [alternando, setAlternando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ jobNome: string; resultado: any } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Bloco 19 (2026-09-12) -- "log completo": antes só dava pra ver a
  // última tentativa de cada job, no card. Agora um botão abre as
  // últimas 20 execuções daquele job específico.
  const [historico, setHistorico] = useState<{ jobNome: string; logs: LogJob[] } | null>(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  async function carregar() {
    const dados = await listarJobs();
    setJobs(dados);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function lidarComForcar(nome: string) {
    setErro(null);
    setForcando(nome);
    try {
      const resultado = await forcarJob(nome);
      // Vira um box de verdade (2026-09-06) -- antes era só uma linha
      // de texto pequena, fácil de não notar. Agora abre um modal com
      // o resultado formatado, não o JSON cru.
      setMensagem({ jobNome: nome, resultado });
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('jobs.erroForcar'));
    } finally {
      setForcando(null);
    }
  }

  // Bloco A11 (2026-09-16) -- "parar um job" de verdade: liga/desliga o
  // agendamento automático dele. Igual ao Task Scheduler do Windows,
  // um job pausado também não pode ser forçado manualmente (backend
  // recusa) -- reative primeiro.
  async function lidarComAlternarHabilitado(job: JobStatus) {
    setErro(null);
    setAlternando(job.nome);
    try {
      const atualizados = await definirHabilitadoJob(job.nome, !job.habilitado);
      setJobs(atualizados);
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('jobs.erroAlterar'));
    } finally {
      setAlternando(null);
    }
  }

  async function lidarComVerHistorico(nome: string) {
    setCarregandoHistorico(true);
    try {
      const logs = await listarLogsDoJob(nome);
      setHistorico({ jobNome: nome, logs });
    } finally {
      setCarregandoHistorico(false);
    }
  }

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('jobs.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {t('jobs.subtitulo')}
      </p>

      {erro && <p className="erro" style={{ maxWidth: 640 }}>{erro}</p>}

      {jobs.map((job) => (
        <div
          key={job.nome}
          className="cartao"
          style={{ width: '100%', marginBottom: 16, opacity: job.habilitado ? 1 : 0.7 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 15, color: '#1B2E8A' }}>
                  {t(`jobs.titulo.${job.nome}`)}
                </h2>
                <span className={`selo ${!job.habilitado ? 'selo-inativo' : ''}`}>
                  {job.habilitado ? t('comum.ativo') : t('jobs.pausado')}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#8A8FA3', margin: 0 }}>{t(`jobs.descricao.${job.nome}`)}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                className={job.habilitado ? 'botao-perigo' : 'botao-primario'}
                onClick={() => lidarComAlternarHabilitado(job)}
                disabled={alternando === job.nome}
                style={{ whiteSpace: 'nowrap' }}
              >
                {alternando === job.nome ? t('comum.aguarde') : job.habilitado ? t('jobs.pausar') : t('jobs.reativar')}
              </button>
              <button
                className="botao-secundario"
                onClick={() => lidarComVerHistorico(job.nome)}
                disabled={carregandoHistorico}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Icone nome="relogio" tamanho={16} />
                {t('jobs.verHistorico')}
              </button>
              <button
                className="botao-secundario"
                onClick={() => lidarComForcar(job.nome)}
                disabled={forcando === job.nome || !job.habilitado}
                title={job.habilitado ? undefined : t('jobs.tituloForcar')}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Icone nome="atualizar" tamanho={16} />
                {forcando === job.nome ? t('jobs.executando') : t('jobs.forcarExecucao')}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
              marginTop: 14, paddingTop: 12, borderTop: '1px solid #F0F1F7',
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>{t('jobs.ultimaVerificacao')}</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>{formatarDataHora(job.ultimaVerificacao, locale)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>{t('jobs.ultimaAcao')}</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>{formatarDataHora(job.ultimaAcao, locale)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>{t('jobs.proximaPrevista')}</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>
                {job.habilitado ? formatarDataHora(job.proximaExecucaoPrevista, locale) : t('jobs.pausado')}
              </div>
            </div>
          </div>

          {job.ultimoDetalhe && (
            <p style={{ fontSize: 11, color: '#8A8FA3', marginTop: 10, marginBottom: 0 }}>
              {job.ultimoDetalhe}
            </p>
          )}
        </div>
      ))}

      {mensagem && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
          onClick={() => setMensagem(null)}
        >
          <div className="cartao" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1E7A46' }}>{t('jobs.jobExecutado')}</h2>
            <p style={{ fontSize: 13, color: '#5B6072', marginTop: -8 }}>{mensagem.jobNome}</p>
            <div style={{ background: '#F5F6FA', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              {typeof mensagem.resultado === 'object' && mensagem.resultado !== null ? (
                Object.entries(mensagem.resultado).map(([chave, valor]) => (
                  <div key={chave} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#5B6072' }}>{chave}</span>
                    <strong>{String(valor)}</strong>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 13 }}>{String(mensagem.resultado)}</span>
              )}
            </div>
            <button className="botao-primario" onClick={() => setMensagem(null)} style={{ width: '100%' }}>
              {t('comum.fechar')}
            </button>
          </div>
        </div>
      )}

      {historico && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
          onClick={() => setHistorico(null)}
        >
          <div className="cartao" style={{ width: 480, maxHeight: '70vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1B2E8A' }}>{t('jobs.historicoTitulo')} — {historico.jobNome}</h2>
            <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: -8, marginBottom: 16 }}>
              {/* Bloco A11a (2026-09-17): o original era "Últimas N
                  verificações..." -- o número entra por fora e o
                  trecho nominal vem do dicionário, porque `t()` não
                  interpola e o adjetivo muda de posição entre os
                  idiomas. */}
              {historico.logs.length}{' '}
              {t(
                historico.logs.length === 1
                  ? 'jobs.historicoContagemSingular'
                  : 'jobs.historicoContagemPlural',
              )}
            </p>

            {historico.logs.length === 0 ? (
              <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('jobs.nenhumRegistro')}</p>
            ) : (
              historico.logs.map((log, indice) => (
                <div
                  key={indice}
                  style={{
                    display: 'flex', gap: 10, padding: '8px 0',
                    borderTop: indice > 0 ? '1px solid #F0F1F7' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0,
                      background: log.agiu ? '#1E7A46' : '#C3C6D4',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12, color: '#2A2E3F', fontWeight: 600 }}>
                      {formatarDataHora(log.executado_em, locale)}
                    </div>
                    {log.detalhe && (
                      <div style={{ fontSize: 12, color: '#8A8FA3' }}>{log.detalhe}</div>
                    )}
                  </div>
                </div>
              ))
            )}

            <button
              className="botao-primario"
              onClick={() => setHistorico(null)}
              style={{ width: '100%', marginTop: 16 }}
            >
              {t('comum.fechar')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
