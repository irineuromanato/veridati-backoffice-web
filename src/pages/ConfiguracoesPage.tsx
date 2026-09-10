import React, { useEffect, useState } from 'react';
import { buscarConfiguracao, atualizarConfiguracao } from '../api/admin';

const diasSemana = [
  { valor: 1, rotulo: 'Segunda-feira' },
  { valor: 2, rotulo: 'Terça-feira' },
  { valor: 3, rotulo: 'Quarta-feira' },
  { valor: 4, rotulo: 'Quinta-feira' },
  { valor: 5, rotulo: 'Sexta-feira' },
  { valor: 6, rotulo: 'Sábado' },
  { valor: 7, rotulo: 'Domingo' },
];

export default function ConfiguracoesPage() {
  const [jobHora, setJobHora] = useState('20:00');
  const [notifDia, setNotifDia] = useState(5);
  const [notifHora, setNotifHora] = useState('17:00');
  const [diasValidadeExportacao, setDiasValidadeExportacao] = useState(7);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    buscarConfiguracao().then((dados) => {
      setJobHora(dados.job_ocorrencias_hora?.slice(0, 5) ?? '20:00');
      setNotifDia(dados.notificacao_semanal_dia ?? 5);
      setNotifHora(dados.notificacao_semanal_hora?.slice(0, 5) ?? '17:00');
      setDiasValidadeExportacao(dados.dias_validade_exportacao ?? 7);
      setCarregando(false);
    });
  }, []);

  async function lidarComSalvar() {
    setSalvando(true);
    setSucesso(false);
    try {
      await atualizarConfiguracao({
        jobOcorrenciasHora: jobHora,
        notificacaoSemanalDia: notifDia,
        notificacaoSemanalHora: notifHora,
        diasValidadeExportacao,
      });
      setSucesso(true);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>Carregando...</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>Configurações</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        Jobs e notificações válidos para toda a plataforma.
      </p>

      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>Geração de ocorrências</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          Horário em que o job diário roda para gerar as ocorrências de checklist do dia (ainda não implementado — só a configuração fica pronta aqui).
        </p>
        <label style={{ fontSize: 12, color: '#5B6072' }}>Horário do job</label>
        <input
          type="time"
          className="campo"
          value={jobHora}
          onChange={(e) => setJobHora(e.target.value)}
          style={{ marginTop: 4, maxWidth: 140 }}
        />
      </div>

      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>Resumo semanal por e-mail</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          Dia e horário do e-mail de resumo (checklists atrasados e concluídos) — ainda não implementado, só a configuração fica pronta aqui.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#5B6072' }}>Dia da semana</label>
            <select
              className="campo"
              value={notifDia}
              onChange={(e) => setNotifDia(Number(e.target.value))}
              style={{ marginTop: 4 }}
            >
              {diasSemana.map((d) => (
                <option key={d.valor} value={d.valor}>{d.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#5B6072' }}>Horário</label>
            <input
              type="time"
              className="campo"
              value={notifHora}
              onChange={(e) => setNotifHora(e.target.value)}
              style={{ marginTop: 4, maxWidth: 140 }}
            />
          </div>
        </div>
      </div>

      {/* Bloco 11 (2026-09-06) -- validade do link de exportação de
          dados, vale pra todas as organizações. */}
      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>Exportação de dados</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          Por quantos dias o link de download de uma exportação de dados (Bloco 11) fica
          válido antes de ser apagado automaticamente pela limpeza diária.
        </p>
        <label style={{ fontSize: 12, color: '#5B6072' }}>Dias de validade</label>
        <input
          type="number"
          min={1}
          max={90}
          className="campo"
          value={diasValidadeExportacao}
          onChange={(e) => setDiasValidadeExportacao(Number(e.target.value))}
          style={{ marginTop: 4, maxWidth: 100 }}
        />
      </div>

      {sucesso && <p style={{ color: '#1E7A46', fontSize: 13, marginBottom: 12 }}>Configuração salva.</p>}
      <button className="botao-primario" onClick={lidarComSalvar} disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar configuração'}
      </button>
    </div>
  );
}
