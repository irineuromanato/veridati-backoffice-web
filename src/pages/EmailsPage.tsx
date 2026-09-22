import React, { useEffect, useState } from 'react';
import { listarTiposEmail, definirHabilitadoTipoEmail, TipoEmail } from '../api/admin';
import { useI18n } from '../i18n/I18nContext';

// Bloco A02 (2026-09-17) -- lista de todos os tipos de e-mail de aviso
// que o sistema manda, com liga/desliga GLOBAL: desligar aqui afeta
// todas as organizações, de uma vez. Mesmo padrão visual de Jobs
// (selo Ativo/Pausado, opacidade, botão de alternar).
export default function EmailsPage() {
  const { t } = useI18n();
  const [tipos, setTipos] = useState<TipoEmail[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [alternando, setAlternando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    const dados = await listarTiposEmail();
    setTipos(dados);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function lidarComAlternar(item: TipoEmail) {
    setErro(null);
    setAlternando(item.tipo);
    try {
      const atualizados = await definirHabilitadoTipoEmail(item.tipo, !item.habilitado);
      setTipos(atualizados);
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('emails.erroAlterar'));
    } finally {
      setAlternando(null);
    }
  }

  if (carregando) {
    return <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>;
  }

  return (
    <div>
      <h1 style={{ color: '#1B2E8A', marginTop: 0 }}>{t('emails.titulo')}</h1>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -8, marginBottom: 20 }}>
        {t('emails.subtitulo')}
      </p>

      {erro && <p className="erro" style={{ maxWidth: 640 }}>{erro}</p>}

      <div className="cartao" style={{ padding: 0, width: '100%' }}>
        <table className="tabela">
          <thead>
            <tr>
              <th>{t('emails.colTipo')}</th>
              <th style={{ width: 100 }}>{t('emails.colStatus')}</th>
              <th style={{ width: 110 }} />
            </tr>
          </thead>
          <tbody>
            {tipos.map((item) => (
              <tr key={item.tipo} style={{ opacity: item.habilitado ? 1 : 0.6 }}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t(`emails.titulo.${item.tipo}`)}</div>
                  <div style={{ fontSize: 12, color: '#8A8FA3', marginTop: 2 }}>{t(`emails.descricao.${item.tipo}`)}</div>
                </td>
                <td>
                  <span className={`selo ${!item.habilitado ? 'selo-inativo' : ''}`}>
                    {item.habilitado ? t('comum.ativo') : t('emails.desligado')}
                  </span>
                </td>
                <td>
                  <button
                    className={item.habilitado ? 'botao-perigo' : 'botao-primario'}
                    onClick={() => lidarComAlternar(item)}
                    disabled={alternando === item.tipo}
                    style={{ fontSize: 12, whiteSpace: 'nowrap' }}
                  >
                    {alternando === item.tipo ? t('comum.aguarde') : item.habilitado ? t('emails.desligar') : t('emails.ligar')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
