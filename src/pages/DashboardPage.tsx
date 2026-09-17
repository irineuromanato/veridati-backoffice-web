import React, { useEffect, useState } from 'react';
import { buscarMetricas, MetricaRanking, MetricasPlataforma } from '../api/admin';
import { useI18n } from '../i18n/I18nContext';
import { Idioma } from '../i18n/dicionarios';

// Locale de exibicao por idioma -- so' pra separador de milhar e
// decimal sairem certos ("1.234" em pt-BR, "1,234" em en-US). Nao
// recarrega nenhuma traducao; e' formatacao de numero, nada mais.
const LOCALES: Record<Idioma, string> = {
  PT: 'pt-PT',
  PT_BR: 'pt-BR',
  EN: 'en-US',
  IT: 'it-IT',
  ES: 'es-ES',
  FR: 'fr-FR',
};

// Nao existe formatador de bytes no projeto (nem de numero -- nao ha'
// `Intl.NumberFormat` em lugar nenhum, nem modulo `utils`). A convencao
// da casa e' funcao local ao arquivo, como `formatarDataHora` em
// JobsPage.tsx. Sem isso, "espaco ocupado por fotos" sai como
// "4096000".
function formatarBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
  let valor = bytes;
  let indice = 0;
  while (valor >= 1024 && indice < unidades.length - 1) {
    valor /= 1024;
    indice += 1;
  }
  // Bytes e KB inteiros; de MB pra cima uma casa -- "3.4 GB" le melhor
  // que "3.4189 GB".
  return `${valor.toFixed(indice <= 1 ? 0 : 1)} ${unidades[indice]}`;
}

function CardMetrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="cartao" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, color: '#8A8FA3', marginBottom: 8 }}>{rotulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#1B2E8A' }}>{valor}</div>
    </div>
  );
}

// Tabela de ranking com barra em CSS puro. A barra e' proporcional ao
// MAIOR valor da lista (nao ao total), que e' o que faz o primeiro
// colocado ocupar a largura inteira e a comparacao ficar visivel.
// Sem biblioteca de graficos, por decisao ja' tomada.
function TabelaRanking({
  titulo,
  linhas,
  formatador,
  corDaBarra,
}: {
  titulo: string;
  linhas: MetricaRanking[];
  formatador: (valor: number) => string;
  corDaBarra: string;
}) {
  const { t } = useI18n();
  const maior = linhas.reduce((maximo, linha) => Math.max(maximo, linha.total), 0);

  return (
    <div className="cartao" style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 16, color: '#1B2E8A', margin: '0 0 16px' }}>{titulo}</h2>

      {linhas.length === 0 ? (
        <p style={{ color: '#8A8FA3', fontSize: 14, margin: 0 }}>{t('dashboard.vazio')}</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th style={{ width: '55%' }}>{t('dashboard.colOrganizacao')}</th>
              <th style={{ width: '45%' }}>{t('dashboard.colTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.organizacao_id}>
                <td>{linha.organizacao_nome}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        background: '#F0F1F7',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${maior ? (linha.total / maior) * 100 : 0}%`,
                          height: '100%',
                          background: corDaBarra,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 13, color: '#2A2E3F', whiteSpace: 'nowrap' }}>
                      {formatador(linha.total)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { t, idioma } = useI18n();
  const [metricas, setMetricas] = useState<MetricasPlataforma | null>(null);
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    buscarMetricas()
      .then((dados) => {
        if (ativo) setMetricas(dados);
      })
      // Estado de erro explicito -- diferente das outras paginas, que
      // nao tem nenhum. Uma tela de metricas que fica em branco ao
      // falhar e' pior que uma mensagem: nao da' pra saber se o numero
      // e' zero ou se a chamada caiu.
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    // Evita `setState` depois do unmount (troca de rota antes da
    // resposta chegar).
    return () => {
      ativo = false;
    };
  }, []);

  const locale = LOCALES[idioma] ?? 'pt-BR';
  function formatarNumero(valor: number): string {
    return valor.toLocaleString(locale);
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, color: '#1B2E8A', margin: '0 0 4px' }}>{t('dashboard.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 14, margin: '0 0 24px' }}>
        {t('dashboard.subtitulo')}
      </p>

      {carregando && <p style={{ color: '#8A8FA3', fontSize: 14 }}>{t('comum.carregando')}</p>}

      {!carregando && erro && <div className="erro">{t('dashboard.erro')}</div>}

      {!carregando && !erro && metricas && (
        <>
          <h2 style={{ fontSize: 16, color: '#1B2E8A', margin: '0 0 12px' }}>
            {t('dashboard.totais')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <CardMetrica
              rotulo={t('dashboard.totalOrganizacoes')}
              valor={formatarNumero(metricas.totais.organizacoes)}
            />
            <CardMetrica
              rotulo={t('dashboard.totalChecklists')}
              valor={formatarNumero(metricas.totais.checklists)}
            />
            <CardMetrica
              rotulo={t('dashboard.totalTarefas')}
              valor={formatarNumero(metricas.totais.tarefas)}
            />
            <CardMetrica
              rotulo={t('dashboard.totalLocais')}
              valor={formatarNumero(metricas.totais.locais)}
            />
            <CardMetrica
              rotulo={t('dashboard.totalEquipes')}
              valor={formatarNumero(metricas.totais.equipes)}
            />
            <CardMetrica
              rotulo={t('dashboard.espacoFotos')}
              valor={formatarBytes(metricas.totais.espaco_fotos_bytes)}
            />
            <CardMetrica
              rotulo={t('dashboard.espacoPersonalizacao')}
              valor={formatarBytes(metricas.totais.espaco_personalizacao_bytes)}
            />
          </div>

          <h2 style={{ fontSize: 16, color: '#1B2E8A', margin: '24px 0 12px' }}>
            {t('dashboard.planos')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <CardMetrica
              rotulo={t('dashboard.planosPagos')}
              valor={formatarNumero(metricas.planos.pagos)}
            />
            <CardMetrica
              rotulo={t('dashboard.planosGratuitos')}
              valor={formatarNumero(metricas.planos.gratuitos)}
            />
          </div>

          <TabelaRanking
            titulo={t('dashboard.topEspaco')}
            linhas={metricas.top_espaco}
            formatador={formatarBytes}
            corDaBarra="#2946E0"
          />
          <TabelaRanking
            titulo={t('dashboard.topChecklists')}
            linhas={metricas.top_checklists}
            formatador={formatarNumero}
            corDaBarra="#1E7A46"
          />
          <TabelaRanking
            titulo={t('dashboard.topTarefas')}
            linhas={metricas.top_tarefas}
            formatador={formatarNumero}
            corDaBarra="#B26A00"
          />
        </>
      )}
    </div>
  );
}
