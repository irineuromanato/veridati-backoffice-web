import React, { useEffect, useState } from 'react';
import { buscarConfiguracao, atualizarConfiguracao } from '../api/admin';
import { useI18n } from '../i18n/I18nContext';

// Cada numero e' o valor que o backend grava (1 = segunda ... 7 = domingo);
// o rotulo visivel vem do dicionario (`configuracoes.dia.N`).
const diasSemana = [1, 2, 3, 4, 5, 6, 7];

export default function ConfiguracoesPage() {
  const { t } = useI18n();
  // Bloco 19 (2026-09-12): virou lista -- um horário só significava
  // que quem abre checklist de manhã ficava sem ocorrência gerada até
  // a noite anterior, se o horário configurado fosse tarde.
  const [jobHorarios, setJobHorarios] = useState<string[]>(['20:00']);
  const [novoHorario, setNovoHorario] = useState('06:00');
  const [notifDia, setNotifDia] = useState(5);
  const [notifHora, setNotifHora] = useState('17:00');
  const [diasValidadeExportacao, setDiasValidadeExportacao] = useState(7);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    buscarConfiguracao().then((dados) => {
      const horarios = (dados.job_ocorrencias_horarios ?? '20:00')
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean);
      setJobHorarios(horarios.length > 0 ? horarios : ['20:00']);
      setNotifDia(dados.notificacao_semanal_dia ?? 5);
      setNotifHora(dados.notificacao_semanal_hora?.slice(0, 5) ?? '17:00');
      setDiasValidadeExportacao(dados.dias_validade_exportacao ?? 7);
      setCarregando(false);
    });
  }, []);

  function adicionarHorario() {
    if (jobHorarios.includes(novoHorario)) return;
    setJobHorarios([...jobHorarios, novoHorario].sort());
  }

  function removerHorario(horario: string) {
    // Sempre precisa sobrar pelo menos 1 -- sem nenhum, o job para de
    // rodar silenciosamente (o backend também recusa, mas mais vale
    // não deixar chegar nesse estado pela tela).
    if (jobHorarios.length <= 1) return;
    setJobHorarios(jobHorarios.filter((h) => h !== horario));
  }

  async function lidarComSalvar() {
    setSalvando(true);
    setSucesso(false);
    try {
      await atualizarConfiguracao({
        jobOcorrenciasHorarios: jobHorarios,
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
    return <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('configuracoes.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {t('configuracoes.subtitulo')}
      </p>

      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>{t('configuracoes.geracaoOcorrencias')}</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          {t('configuracoes.geracaoOcorrenciasDesc')}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {jobHorarios.map((h) => (
            <div
              key={h}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#EDEFF7', borderRadius: 8, padding: '6px 10px', fontSize: 13,
              }}
            >
              <span>{h}</span>
              <button
                onClick={() => removerHorario(h)}
                disabled={jobHorarios.length <= 1}
                style={{
                  background: 'none', border: 'none', cursor: jobHorarios.length <= 1 ? 'default' : 'pointer',
                  color: jobHorarios.length <= 1 ? '#C3C6D4' : '#B23A2E', fontWeight: 700, padding: 0, lineHeight: 1,
                }}
                title={t('configuracoes.removerHorario')}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, color: '#5B6072' }}>{t('configuracoes.adicionarHorario')}</label>
            <input
              type="time"
              className="campo"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              style={{ marginTop: 4, maxWidth: 140 }}
            />
          </div>
          <button className="botao-secundario" onClick={adicionarHorario}>
            {t('configuracoes.adicionar')}
          </button>
        </div>
      </div>

      <div className="cartao" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>{t('configuracoes.resumoSemanal')}</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          {t('configuracoes.resumoSemanalDesc')}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#5B6072' }}>{t('configuracoes.diaDaSemana')}</label>
            <select
              className="campo"
              value={notifDia}
              onChange={(e) => setNotifDia(Number(e.target.value))}
              style={{ marginTop: 4 }}
            >
              {diasSemana.map((d) => (
                <option key={d} value={d}>{t(`configuracoes.dia.${d}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#5B6072' }}>{t('configuracoes.horario')}</label>
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
        <h2 style={{ marginTop: 0, fontSize: 15, color: '#1B2E8A' }}>{t('configuracoes.exportacaoDados')}</h2>
        <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
          {t('configuracoes.exportacaoDadosDesc')}
        </p>
        <label style={{ fontSize: 12, color: '#5B6072' }}>{t('configuracoes.diasDeValidade')}</label>
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

      {sucesso && <p style={{ color: '#1E7A46', fontSize: 13, marginBottom: 12 }}>{t('configuracoes.sucesso')}</p>}
      <button className="botao-primario" onClick={lidarComSalvar} disabled={salvando}>
        {salvando ? t('comum.salvando') : t('configuracoes.salvarConfiguracao')}
      </button>
    </div>
  );
}
