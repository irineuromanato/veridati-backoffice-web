import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { buscarMinhaConta, atualizarMinhaConta, iniciar2fa, confirmar2fa, desativar2fa } from '../api/admin';
import CampoSenha from './CampoSenha';
import { useI18n } from '../i18n/I18nContext';

// Bloco A024 (2026-09-24) -- estados da seção de 2FA, dentro deste
// mesmo modal (não uma tela separada -- é aqui que "Minha conta" mora).
type Estado2fa = 'ocioso' | 'confirmando' | 'backup' | 'desativando';

// Bloco A11 (2026-09-16) -- igual ao MinhaContaModal do Account: mesmo
// layout de modal, mesmos campos de senha sem pedir a senha atual (a
// sessão já autentica o admin via token). Sem data de nascimento/gênero
// nem reenvio de ativação porque admin de plataforma não tem esses
// dados -- é só nome, e-mail (fixo) e senha.
export default function MinhaContaModal({ aoFechar }: { aoFechar: () => void }) {
  const { admin, atualizarAdminLocal } = useAuth();
  const { t } = useI18n();

  const [nome, setNome] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Bloco A024 (2026-09-24) -- 2FA.
  const [totpHabilitado, setTotpHabilitado] = useState(false);
  const [estado2fa, setEstado2fa] = useState<Estado2fa>('ocioso');
  const [processando2fa, setProcessando2fa] = useState(false);
  const [erro2fa, setErro2fa] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [segredoManual, setSegredoManual] = useState<string | null>(null);
  const [codigoConfirmar, setCodigoConfirmar] = useState('');
  const [codigosBackup, setCodigosBackup] = useState<string[] | null>(null);
  const [senhaDesativar, setSenhaDesativar] = useState('');
  const [codigoDesativar, setCodigoDesativar] = useState('');

  useEffect(() => {
    if (!admin) return;
    buscarMinhaConta().then((detalhe) => {
      setNome(detalhe.nome);
      setTotpHabilitado(detalhe.totp_habilitado);
      setCarregando(false);
    });
  }, [admin]);

  function lidarComCancelar2fa() {
    setEstado2fa('ocioso');
    setErro2fa(null);
    setQrCode(null);
    setSegredoManual(null);
    setCodigoConfirmar('');
    setSenhaDesativar('');
    setCodigoDesativar('');
  }

  async function lidarComIniciar2fa() {
    setErro2fa(null);
    setProcessando2fa(true);
    try {
      const resultado = await iniciar2fa();
      setQrCode(resultado.qrCode);
      setSegredoManual(resultado.segredo);
      setEstado2fa('confirmando');
    } catch {
      setErro2fa(t('minhaConta.erroIniciar2fa'));
    } finally {
      setProcessando2fa(false);
    }
  }

  async function lidarComConfirmar2fa() {
    setErro2fa(null);
    setProcessando2fa(true);
    try {
      const resultado = await confirmar2fa(codigoConfirmar.trim());
      setCodigosBackup(resultado.codigosBackup);
      setEstado2fa('backup');
    } catch {
      setErro2fa(t('minhaConta.erroConfirmar2fa'));
    } finally {
      setProcessando2fa(false);
    }
  }

  function lidarComConcluirBackup() {
    setTotpHabilitado(true);
    setQrCode(null);
    setSegredoManual(null);
    setCodigoConfirmar('');
    setCodigosBackup(null);
    setEstado2fa('ocioso');
  }

  async function lidarComDesativar2fa() {
    setErro2fa(null);
    setProcessando2fa(true);
    try {
      await desativar2fa(senhaDesativar, codigoDesativar.trim());
      setTotpHabilitado(false);
      lidarComCancelar2fa();
    } catch {
      setErro2fa(t('minhaConta.erroDesativar2fa'));
    } finally {
      setProcessando2fa(false);
    }
  }

  async function lidarComSalvar() {
    if (!admin) return;
    setErro(null);
    setSalvando(true);
    try {
      await atualizarMinhaConta({
        nome,
        ...(novaSenha ? { senhaNova: novaSenha } : {}),
      });
      atualizarAdminLocal({ nome });
      setSucesso(true);
      setNovaSenha('');
    } catch {
      setErro(t('minhaConta.erroSalvar'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="overlay-modal" onClick={aoFechar}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 640, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <h2 style={{ marginTop: 0, color: '#1B2E8A' }}>{t('minhaConta.titulo')}</h2>

        {carregando ? (
          <p style={{ color: '#8A8FA3' }}>{t('comum.carregando')}</p>
        ) : (
          // Bloco A026 (2026-09-24) -- duas colunas em vez de tudo
          // empilhado: a seção de 2FA (QR, backups...) tem bastante
          // conteúdo, e sozinha embaixo dos campos deixava o modal
          // comprido demais. Lado a lado, cabe tudo numa tela só.
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.nome')}</label>
              <input
                className="campo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ marginTop: 4, marginBottom: 12, width: '100%' }}
              />

              <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.email')}</label>
              <input className="campo" value={admin?.email ?? ''} disabled style={{ marginTop: 4, marginBottom: 12, width: '100%' }} />

              <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.novaSenha')}</label>
              <CampoSenha
                valor={novaSenha}
                aoMudar={setNovaSenha}
                dica={novaSenha ? t('minhaConta.dicaSenha') : undefined}
                style={{ marginTop: 4, marginBottom: 16 }}
              />

              {erro && <p className="erro">{erro}</p>}
              {sucesso && <p style={{ color: '#1E7A46', fontSize: 13, marginBottom: 12 }}>{t('minhaConta.sucesso')}</p>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="botao-secundario" onClick={aoFechar} style={{ flex: 1 }}>
                  {t('comum.fechar')}
                </button>
                <button
                  className="botao-primario"
                  onClick={lidarComSalvar}
                  disabled={salvando || !nome || (novaSenha.length > 0 && novaSenha.length < 8)}
                  style={{ flex: 1 }}
                >
                  {salvando ? t('comum.salvando') : t('comum.salvar')}
                </button>
              </div>
            </div>

            {/* Bloco A024 (2026-09-24) -- 2FA, dentro de Minha conta. */}
            <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid #E1E3EF', paddingLeft: 24 }}>
              <h3 style={{ fontSize: 13, margin: '0 0 4px', color: '#1B2E8A' }}>
                {t('minhaConta.segurancaTitulo')}
              </h3>
              <p style={{ fontSize: 12, color: '#8A8FA3', marginTop: 0, marginBottom: 12 }}>
                {t('minhaConta.segurancaDescricao')}
              </p>

              {estado2fa === 'ocioso' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`selo ${totpHabilitado ? '' : 'selo-inativo'}`}>
                    {t(totpHabilitado ? 'minhaConta.statusAtivado' : 'minhaConta.statusDesativado')}
                  </span>
                  <button
                    type="button"
                    className={totpHabilitado ? 'botao-perigo' : 'botao-secundario'}
                    onClick={() => (totpHabilitado ? setEstado2fa('desativando') : lidarComIniciar2fa())}
                    disabled={processando2fa}
                  >
                    {processando2fa
                      ? t('comum.carregando')
                      : t(totpHabilitado ? 'minhaConta.desativar2fa' : 'minhaConta.ativar2fa')}
                  </button>
                </div>
              )}

              {estado2fa === 'confirmando' && qrCode && (
                <div>
                  <p style={{ fontSize: 12, color: '#5B6072', marginTop: 0 }}>{t('minhaConta.escaneieQrCode')}</p>
                  <img
                    src={qrCode}
                    alt="QR code"
                    style={{ display: 'block', margin: '8px auto', width: 128, height: 128 }}
                  />
                  <p style={{ fontSize: 11, color: '#8A8FA3', marginBottom: 2 }}>{t('minhaConta.ouDigiteChave')}</p>
                  <div
                    style={{
                      fontFamily: 'monospace', fontSize: 13, background: '#F5F6FA', border: '1px solid #E1E3EF',
                      borderRadius: 6, padding: 8, textAlign: 'center', userSelect: 'all', marginBottom: 10,
                    }}
                  >
                    {segredoManual}
                  </div>
                  <p style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.digiteCodigoConfirmar')}</p>
                  <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.codigoDeVerificacao')}</label>
                  <input
                    className="campo"
                    value={codigoConfirmar}
                    onChange={(e) => setCodigoConfirmar(e.target.value)}
                    style={{ marginTop: 4, marginBottom: 10, width: '100%', textAlign: 'center', letterSpacing: 2 }}
                    autoFocus
                  />
                  {erro2fa && <p className="erro" style={{ fontSize: 12 }}>{erro2fa}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={lidarComCancelar2fa}
                      disabled={processando2fa}
                      style={{ flex: 1 }}
                    >
                      {t('comum.cancelar')}
                    </button>
                    <button
                      type="button"
                      className="botao-primario"
                      onClick={lidarComConfirmar2fa}
                      disabled={processando2fa || !codigoConfirmar.trim()}
                      style={{ flex: 1 }}
                    >
                      {processando2fa ? t('comum.salvando') : t('minhaConta.confirmarAtivacao')}
                    </button>
                  </div>
                </div>
              )}

              {estado2fa === 'backup' && codigosBackup && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1B2E8A', marginBottom: 4, marginTop: 0 }}>
                    {t('minhaConta.backupTitulo')}
                  </p>
                  <p style={{ fontSize: 12, color: '#5B6072', marginTop: 0, marginBottom: 10 }}>
                    {t('minhaConta.backupDescricao')}
                  </p>
                  <div
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: 'monospace',
                      fontSize: 13, background: '#F5F6FA', border: '1px solid #E1E3EF', borderRadius: 6,
                      padding: 10, marginBottom: 12, userSelect: 'all',
                    }}
                  >
                    {codigosBackup.map((codigo) => (
                      <div key={codigo}>{codigo}</div>
                    ))}
                  </div>
                  <button type="button" className="botao-primario" onClick={lidarComConcluirBackup} style={{ width: '100%' }}>
                    {t('minhaConta.concluir')}
                  </button>
                </div>
              )}

              {estado2fa === 'desativando' && (
                <div>
                  <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.senhaAtual')}</label>
                  <CampoSenha valor={senhaDesativar} aoMudar={setSenhaDesativar} style={{ marginTop: 4, marginBottom: 10 }} />
                  <label style={{ fontSize: 12, color: '#5B6072' }}>{t('minhaConta.codigoAtual')}</label>
                  <input
                    className="campo"
                    value={codigoDesativar}
                    onChange={(e) => setCodigoDesativar(e.target.value)}
                    style={{ marginTop: 4, marginBottom: 10, width: '100%' }}
                  />
                  {erro2fa && <p className="erro" style={{ fontSize: 12 }}>{erro2fa}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={lidarComCancelar2fa}
                      disabled={processando2fa}
                      style={{ flex: 1 }}
                    >
                      {t('comum.cancelar')}
                    </button>
                    <button
                      type="button"
                      className="botao-perigo"
                      onClick={lidarComDesativar2fa}
                      disabled={processando2fa || !senhaDesativar || !codigoDesativar.trim()}
                      style={{ flex: 1 }}
                    >
                      {processando2fa ? t('comum.salvando') : t('minhaConta.confirmarDesativacao')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
