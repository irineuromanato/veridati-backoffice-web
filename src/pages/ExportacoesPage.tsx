import React, { useEffect, useState } from 'react';
import { listarExportacoesTodas, ExportacaoResumoAdmin } from '../api/admin';
import { useI18n } from '../i18n/I18nContext';

// Bloco 12 (2026-09-07) -- painel de visibilidade: quantas
// exportações de dados existem, por status, pra entender consumo de
// máquina/banda antes de virar surpresa. Não existia nada disso
// antes -- era um "clique e reza" sem visibilidade nenhuma.
export default function ExportacoesPage() {
  const { t } = useI18n();
  const [porStatus, setPorStatus] = useState<{ status: string; total: number }[]>([]);
  const [exportacoes, setExportacoes] = useState<ExportacaoResumoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarExportacoesTodas().then((dados) => {
      setPorStatus(dados.porStatus);
      setExportacoes(dados.exportacoes);
      setCarregando(false);
    });
  }, []);

  const rotuloStatus: Record<string, string> = {
    PENDENTE: t('exportacoes.statusPENDENTE'),
    PROCESSANDO: t('exportacoes.statusPROCESSANDO'),
    PRONTA: t('exportacoes.statusPRONTA'),
    ERRO: t('exportacoes.statusERRO'),
  };
  const corStatus: Record<string, string> = {
    PENDENTE: '#8A6D1D',
    PROCESSANDO: '#2946E0',
    PRONTA: '#1E7A46',
    ERRO: '#B23A2E',
  };

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('exportacoes.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {t('exportacoes.subtitulo')}
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {porStatus.map((s) => (
          <div key={s.status} className="cartao" style={{ padding: 16, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: corStatus[s.status] ?? '#2A2E3F' }}>{s.total}</div>
            <div style={{ fontSize: 12, color: '#8A8FA3' }}>{rotuloStatus[s.status] ?? s.status}</div>
          </div>
        ))}
        {porStatus.length === 0 && (
          <p style={{ color: '#8A8FA3', fontSize: 13 }}>{t('exportacoes.nenhuma')}</p>
        )}
      </div>

      <div className="cartao" style={{ padding: 0 }}>
        {exportacoes.length === 0 ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('exportacoes.nenhuma')}</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>{t('exportacoes.colOrganizacao')}</th>
                <th>{t('exportacoes.colStatus')}</th>
                <th>{t('exportacoes.colPedidaEm')}</th>
                <th>{t('exportacoes.colConcluidaEm')}</th>
                <th>{t('exportacoes.colExpiraEm')}</th>
              </tr>
            </thead>
            <tbody>
              {exportacoes.map((ex) => (
                <tr key={ex.id}>
                  <td>{ex.organizacao_nome}</td>
                  <td>
                    <span style={{ color: corStatus[ex.status], fontWeight: 700 }}>
                      {rotuloStatus[ex.status]}
                      {ex.status === 'ERRO' && ex.erro ? ` -- ${ex.erro}` : ''}
                    </span>
                  </td>
                  <td style={{ color: '#8A8FA3' }}>{new Date(ex.criado_em).toLocaleString()}</td>
                  <td style={{ color: '#8A8FA3' }}>{ex.concluido_em ? new Date(ex.concluido_em).toLocaleString() : '—'}</td>
                  <td style={{ color: '#8A8FA3' }}>{new Date(ex.expira_em).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
