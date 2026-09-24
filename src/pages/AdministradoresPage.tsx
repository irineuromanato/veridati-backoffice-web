import React, { useEffect, useState } from 'react';
import { listarAdmins, criarAdmin, atualizarAdmin, excluirAdmin, Administrador } from '../api/admin';
import { useAuth } from '../auth/AuthContext';
import IconeAcao from '../components/IconeAcao';
import Icone from '../components/Icone';
import { useI18n } from '../i18n/I18nContext';

// Bloco 10 (2026-09-06) -- criar mais administradores do Backoffice.
// Qualquer admin autenticado pode criar outro, sem hierarquia entre
// eles por enquanto. supervisor@veridati.online é criado sozinho no
// setup, se o banco começar sem nenhum admin (ver admin.service.ts).
export default function AdministradoresPage() {
  const { admin } = useAuth();
  const { t } = useI18n();
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState<'novo' | Administrador | null>(null);

  function carregar() {
    listarAdmins().then((dados) => {
      setAdmins(dados);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregar();
  }, []);

  async function lidarComExcluir(alvo: Administrador, evento: React.MouseEvent) {
    evento.stopPropagation();
    if (!window.confirm(t('administradores.confirmarExcluir'))) {
      return;
    }
    try {
      await excluirAdmin(alvo.id);
      carregar();
    } catch (e: any) {
      window.alert(e?.response?.data?.message || t('administradores.erroExcluir'));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#1B2E8A' }}>{t('administradores.titulo')}</h1>
        <button className="botao-primario" onClick={() => setModalAberto('novo')}>
          <Icone nome="adicionar" />
          {t('administradores.novo')}
        </button>
      </div>
      <p style={{ color: '#8A8FA3', fontSize: 13, marginTop: -12, marginBottom: 20 }}>
        {t('administradores.subtitulo')}
      </p>

      <div className="cartao" style={{ padding: 0 }}>
        {carregando ? (
          <p style={{ padding: 24, color: '#8A8FA3' }}>{t('comum.carregando')}</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>{t('administradores.colNome')}</th>
                <th>{t('administradores.colEmail')}</th>
                <th>{t('administradores.col2fa')}</th>
                <th>{t('administradores.colCriadoEm')}</th>
                <th style={{ width: 70 }} />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.nome}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className={`selo ${a.totp_habilitado ? '' : 'selo-inativo'}`}>
                      {t(a.totp_habilitado ? 'minhaConta.statusAtivado' : 'minhaConta.statusDesativado')}
                    </span>
                  </td>
                  <td style={{ color: '#8A8FA3' }}>{new Date(a.criado_em).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <IconeAcao tipo="editar" titulo={t('comum.editar')} onClick={() => setModalAberto(a)} />
                      {a.id !== admin?.id && (
                        <IconeAcao tipo="remover" titulo={t('comum.excluir')} onClick={(e) => lidarComExcluir(a, e)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalAdmin
          admin={modalAberto === 'novo' ? null : modalAberto}
          aoFechar={() => setModalAberto(null)}
          aoSalvar={() => {
            setModalAberto(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function ModalAdmin({
  admin,
  aoFechar,
  aoSalvar,
}: {
  admin: Administrador | null;
  aoFechar: () => void;
  aoSalvar: () => void;
}) {
  const { t } = useI18n();
  const [nome, setNome] = useState(admin?.nome ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      if (admin) {
        await atualizarAdmin(admin.id, {
          nome: nome.trim(),
          email: email.trim(),
          ...(senha ? { senha } : {}),
        });
      } else {
        await criarAdmin({ nome: nome.trim(), email: email.trim(), senha });
      }
      aoSalvar();
    } catch (e: any) {
      setErro(e?.response?.data?.message || t('administradores.erroSalvar'));
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = admin
    ? !!nome.trim() && !!email.trim() && (senha.length === 0 || senha.length >= 8)
    : !!nome.trim() && !!email.trim() && senha.length >= 8;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
      onClick={aoFechar}
    >
      <div className="cartao" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{admin ? t('administradores.editarTitulo') : t('administradores.novoTitulo')}</h2>

        <label style={{ fontSize: 12, color: '#5B6072' }}>{t('administradores.colNome')}</label>
        <input className="campo" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 12 }} />

        <label style={{ fontSize: 12, color: '#5B6072' }}>{t('administradores.colEmail')}</label>
        <input className="campo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 12 }} />

        <label style={{ fontSize: 12, color: '#5B6072' }}>
          {admin ? t('administradores.senhaManter') : t('administradores.senhaMinimo')}
        </label>
        <input className="campo" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ width: '100%', marginTop: 4, marginBottom: 16 }} />

        {erro && <p className="erro" style={{ fontSize: 12 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="botao-secundario" onClick={aoFechar} disabled={salvando} style={{ flex: 1 }}>
            {t('comum.cancelar')}
          </button>
          <button
            className="botao-primario"
            onClick={salvar}
            disabled={!podeSalvar || salvando}
            style={{ flex: 1 }}
          >
            {salvando ? t('comum.salvando') : admin ? t('comum.salvar') : t('comum.criar')}
          </button>
        </div>
      </div>
    </div>
  );
}
