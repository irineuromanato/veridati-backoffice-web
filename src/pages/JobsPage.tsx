import React, { useEffect, useState } from 'react';
import { listarJobs, forcarJob, listarLogsDoJob, JobStatus, LogJob } from '../api/admin';

function formatarDataHora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [forcando, setForcando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ jobNome: string; resultado: any } | null>(null);
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
    setForcando(nome);
    try {
      const resultado = await forcarJob(nome);
      // Vira um box de verdade (2026-09-06) -- antes era só uma linha
      // de texto pequena, fácil de não notar. Agora abre um modal com
      // o resultado formatado, não o JSON cru.
      setMensagem({ jobNome: nome, resultado });
      await carregar();
    } finally {
      setForcando(null);
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
    return <p style={{ color: '#8A8FA3' }}>Carregando...</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>Jobs</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        Os 3 jobs que rodam sozinhos no backend. "Última verificação" é toda vez que o job rodou
        (a cada 10 minutos); "última ação" é a última vez que ele fez de verdade alguma coisa (gerou
        ocorrência, notificou atraso, mandou resumo) — nem toda verificação vira ação.
      </p>

      {jobs.map((job) => (
        <div key={job.nome} className="cartao" style={{ maxWidth: 640, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 4, fontSize: 15, color: '#1B2E8A' }}>
                {job.titulo}
              </h2>
              <p style={{ fontSize: 12, color: '#8A8FA3', margin: 0 }}>{job.descricao}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
              <button
                className="botao-secundario"
                onClick={() => lidarComVerHistorico(job.nome)}
                disabled={carregandoHistorico}
                style={{ whiteSpace: 'nowrap' }}
              >
                Ver histórico
              </button>
              <button
                className="botao-secundario"
                onClick={() => lidarComForcar(job.nome)}
                disabled={forcando === job.nome}
                style={{ whiteSpace: 'nowrap' }}
              >
                {forcando === job.nome ? 'Executando...' : 'Forçar execução'}
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
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>Última verificação</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>{formatarDataHora(job.ultimaVerificacao)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>Última ação</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>{formatarDataHora(job.ultimaAcao)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#8A8FA3', textTransform: 'uppercase' }}>Próxima prevista</div>
              <div style={{ fontSize: 12, color: '#2A2E3F' }}>{formatarDataHora(job.proximaExecucaoPrevista)}</div>
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
            <h2 style={{ marginTop: 0, color: '#1E7A46' }}>Job executado</h2>
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
              Fechar
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
            <h2 style={{ marginTop: 0, color: '#1B2E8A' }}>Histórico — {historico.jobNome}</h2>
            <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: -8, marginBottom: 16 }}>
              Últimas {historico.logs.length} verificações, mais recente primeiro.
            </p>

            {historico.logs.length === 0 ? (
              <p style={{ color: '#8A8FA3', fontSize: 13 }}>Nenhum registro ainda.</p>
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
                      {formatarDataHora(log.executado_em)}
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
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
