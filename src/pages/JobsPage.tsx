import React, { useEffect, useState } from 'react';
import { listarJobs, forcarJob, JobStatus } from '../api/admin';

function formatarDataHora(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [forcando, setForcando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ jobNome: string; resultado: any } | null>(null);

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
            <button
              className="botao-secundario"
              onClick={() => lidarComForcar(job.nome)}
              disabled={forcando === job.nome}
              style={{ whiteSpace: 'nowrap', marginLeft: 12 }}
            >
              {forcando === job.nome ? 'Executando...' : 'Forçar execução'}
            </button>
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
    </div>
  );
}
