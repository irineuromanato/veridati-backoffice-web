import React, { useEffect, useState } from 'react';
import {
  listarPlanos,
  atualizarPlano,
  atualizarPrecoPlano,
  conversoesPlanos,
  Plano,
  ConversaoPlano,
} from '../api/admin';
import { useI18n } from '../i18n/I18nContext';
import Icone from '../components/Icone';

// Bloco A01 (2026-09-17), Fase 1 -- CRUD de planos no Backoffice.
// Nenhum texto fixo de "nome do plano" ou "frase de limite" vem do
// banco -- só números/booleanos. Aqui montamos a frase na hora, a
// partir do número (ver rotuloLimite). Isso é o que garante que
// mudar um limite aqui já reflete em qualquer lugar que descreve o
// plano, sem precisar lembrar de atualizar texto solto em nenhum
// outro lugar.
const NOME_PLANO: Record<string, string> = {
  FREE: 'Free',
  BASIC: 'Basic',
  PRO: 'Pro',
  PREMIUM: 'Premium',
};

const MOEDAS: { valor: 'BRL' | 'EUR' | 'USD'; simbolo: string }[] = [
  { valor: 'BRL', simbolo: 'R$' },
  { valor: 'EUR', simbolo: '€' },
  { valor: 'USD', simbolo: 'US$' },
];

type Traduzir = (chave: string) => string;

function rotuloLimite(valor: number | null, t: Traduzir): string {
  return valor === null ? t('comum.ilimitado') : String(valor);
}

function rotuloNivel(valor: string | null | undefined, t: Traduzir): string {
  switch (valor) {
    case 'NENHUM':
      return t('planos.nivelNENHUM');
    case 'LIMITADO':
      return t('planos.nivelLIMITADO');
    case 'BASICO':
      return t('planos.nivelBASICO');
    case 'COMPLETO':
      return t('planos.nivelCOMPLETO');
    default:
      return valor ?? '';
  }
}

export default function PlanosPage() {
  const { t } = useI18n();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Partial<Plano>>({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [conversoes, setConversoes] = useState<{ upgrades: ConversaoPlano[]; downgrades: ConversaoPlano[] } | null>(null);

  async function carregar() {
    const dados = await listarPlanos();
    setPlanos(dados);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    conversoesPlanos().then(setConversoes);
  }, []);

  function iniciarEdicao(plano: Plano) {
    setEditando(plano.id);
    setRascunho({ ...plano });
    setErro(null);
  }

  async function salvarLimites() {
    if (!editando) return;
    setSalvando(true);
    setErro(null);
    try {
      await atualizarPlano(editando, {
        limiteLocalidades: rascunho.limite_localidades ?? null,
        limitePessoas: rascunho.limite_pessoas ?? null,
        limiteChecklistsAprovadosMes: rascunho.limite_checklists_aprovados_mes ?? null,
        limiteTarefasFinalizadasMes: rascunho.limite_tarefas_finalizadas_mes ?? null,
        limiteFotosPorPergunta: rascunho.limite_fotos_por_pergunta ?? null,
        temMapa: rascunho.tem_mapa,
        nivelRelatorios: rascunho.nivel_relatorios,
        nivelAlertasEmail: rascunho.nivel_alertas_email,
      });
      setEditando(null);
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('planos.erroSalvar'));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarPreco(planoId: string, moeda: string, periodicidade: string, valorTexto: string) {
    const valor = Number(valorTexto.replace(',', '.'));
    if (Number.isNaN(valor) || valor < 0) return;
    await atualizarPrecoPlano(planoId, moeda, periodicidade, valor);
    await carregar();
  }

  function campoNulavel(valor: number | null | undefined, onChange: (v: number | null) => void) {
    return (
      <input
        className="campo"
        type="text"
        value={valor === null || valor === undefined ? '' : String(valor)}
        placeholder={t('comum.ilimitado')}
        onChange={(e) => {
          const texto = e.target.value.trim();
          onChange(texto === '' ? null : Number(texto));
        }}
        style={{ width: 90 }}
      />
    );
  }

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('planos.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {t('planos.subtitulo')}
      </p>

      {erro && <p className="erro" style={{ maxWidth: 640 }}>{erro}</p>}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', marginBottom: 32 }}>
        {planos.map((plano) => (
          <div key={plano.id} className="cartao" style={{ opacity: plano.ativo ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ margin: 0, color: '#1B2E8A' }}>{NOME_PLANO[plano.codigo] ?? plano.codigo}</h2>
              {editando !== plano.id && (
                <button className="botao-secundario" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => iniciarEdicao(plano)}>
                  <Icone nome="editar" tamanho={14} />
                  {t('comum.editar')}
                </button>
              )}
            </div>

            {editando === plano.id ? (
              <>
                <TabelaLinha rotulo={t('planos.localidades')}>
                  {campoNulavel(rascunho.limite_localidades, (v) => setRascunho({ ...rascunho, limite_localidades: v }))}
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.pessoas')}>
                  {campoNulavel(rascunho.limite_pessoas, (v) => setRascunho({ ...rascunho, limite_pessoas: v }))}
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.checklistsAprovadosMes')}>
                  {campoNulavel(rascunho.limite_checklists_aprovados_mes, (v) => setRascunho({ ...rascunho, limite_checklists_aprovados_mes: v }))}
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.tarefasFinalizadasMes')}>
                  {campoNulavel(rascunho.limite_tarefas_finalizadas_mes, (v) => setRascunho({ ...rascunho, limite_tarefas_finalizadas_mes: v }))}
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.fotosPorPergunta')}>
                  {campoNulavel(rascunho.limite_fotos_por_pergunta, (v) => setRascunho({ ...rascunho, limite_fotos_por_pergunta: v }))}
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.mapa')}>
                  <input
                    type="checkbox"
                    checked={!!rascunho.tem_mapa}
                    onChange={(e) => setRascunho({ ...rascunho, tem_mapa: e.target.checked })}
                  />
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.relatorios')}>
                  <select
                    className="campo"
                    value={rascunho.nivel_relatorios}
                    onChange={(e) => setRascunho({ ...rascunho, nivel_relatorios: e.target.value as any })}
                  >
                    <option value="NENHUM">{t('planos.nivelNENHUM')}</option>
                    <option value="LIMITADO">{t('planos.nivelLIMITADO')}</option>
                    <option value="COMPLETO">{t('planos.nivelCOMPLETO')}</option>
                  </select>
                </TabelaLinha>
                <TabelaLinha rotulo={t('planos.alertasEmail')}>
                  <select
                    className="campo"
                    value={rascunho.nivel_alertas_email}
                    onChange={(e) => setRascunho({ ...rascunho, nivel_alertas_email: e.target.value as any })}
                  >
                    <option value="NENHUM">{t('planos.nivelNENHUM')}</option>
                    <option value="BASICO">{t('planos.nivelBASICO')}</option>
                    <option value="COMPLETO">{t('planos.nivelCOMPLETO')}</option>
                  </select>
                </TabelaLinha>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="botao-secundario" onClick={() => setEditando(null)}>{t('comum.cancelar')}</button>
                  <button className="botao-primario" disabled={salvando} onClick={salvarLimites}>
                    {salvando ? t('comum.salvando') : t('comum.salvar')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <TabelaLinha rotulo={t('planos.localidades')}>{rotuloLimite(plano.limite_localidades, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.pessoas')}>{rotuloLimite(plano.limite_pessoas, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.checklistsAprovadosMes')}>{rotuloLimite(plano.limite_checklists_aprovados_mes, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.tarefasFinalizadasMes')}>{rotuloLimite(plano.limite_tarefas_finalizadas_mes, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.fotosPorPergunta')}>{rotuloLimite(plano.limite_fotos_por_pergunta, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.mapa')}>{plano.tem_mapa ? t('comum.sim') : t('comum.nao')}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.relatorios')}>{rotuloNivel(plano.nivel_relatorios, t)}</TabelaLinha>
                <TabelaLinha rotulo={t('planos.alertasEmail')}>{rotuloNivel(plano.nivel_alertas_email, t)}</TabelaLinha>
              </>
            )}

            <div style={{ marginTop: 12, borderTop: '1px solid #F5F6FA', paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6072', marginBottom: 6 }}>{t('planos.precos')}</div>
              <table style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr style={{ color: '#8A8FA3', textAlign: 'left' }}>
                    <th></th><th>{t('planos.mensal')}</th><th>{t('planos.anual')}</th>
                  </tr>
                </thead>
                <tbody>
                  {MOEDAS.map((moeda) => {
                    const mensal = plano.precos.find((p) => p.moeda === moeda.valor && p.periodicidade === 'MENSAL');
                    const anual = plano.precos.find((p) => p.moeda === moeda.valor && p.periodicidade === 'ANUAL');
                    return (
                      <tr key={moeda.valor}>
                        <td style={{ fontWeight: 600 }}>{moeda.simbolo}</td>
                        <td>
                          <input
                            className="campo"
                            defaultValue={mensal?.valor ?? '0'}
                            style={{ width: 80, fontSize: 12 }}
                            onBlur={(e) => salvarPreco(plano.id, moeda.valor, 'MENSAL', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="campo"
                            defaultValue={anual?.valor ?? '0'}
                            style={{ width: 80, fontSize: 12 }}
                            onBlur={(e) => salvarPreco(plano.id, moeda.valor, 'ANUAL', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: '#B26A00', marginTop: 6, marginBottom: 0 }}>
                {t('planos.avisoAnual')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#1B2E8A' }}>{t('planos.conversoes')}</h2>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 16 }}>
        {t('planos.conversoesSubtitulo')}
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <div className="cartao" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0, color: '#1E7A46' }}>{t('planos.virouPago')} ({conversoes?.upgrades.length ?? 0})</h3>
          {conversoes?.upgrades.length === 0 && <p style={{ color: '#8A8FA3', fontSize: 12 }}>{t('planos.nenhumaAinda')}</p>}
          {conversoes?.upgrades.map((c) => (
            <div key={c.organizacao_id + c.inicio_em} style={{ fontSize: 12, marginBottom: 6 }}>
              <strong>{c.organizacao_nome}</strong> — {c.codigo_anterior ?? '—'} → {c.codigo_novo}
              <div style={{ color: '#8A8FA3', fontSize: 11 }}>{new Date(c.inicio_em).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
        <div className="cartao" style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0, color: '#B23A2E' }}>{t('planos.reduziuVoltou')} ({conversoes?.downgrades.length ?? 0})</h3>
          {conversoes?.downgrades.length === 0 && <p style={{ color: '#8A8FA3', fontSize: 12 }}>{t('planos.nenhumaAinda')}</p>}
          {conversoes?.downgrades.map((c) => (
            <div key={c.organizacao_id + c.inicio_em} style={{ fontSize: 12, marginBottom: 6 }}>
              <strong>{c.organizacao_nome}</strong> — {c.codigo_anterior ?? '—'} → {c.codigo_novo}
              <div style={{ color: '#8A8FA3', fontSize: 11 }}>{new Date(c.inicio_em).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabelaLinha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
      <span style={{ color: '#5B6072' }}>{rotulo}</span>
      <span style={{ fontWeight: 600 }}>{children}</span>
    </div>
  );
}
