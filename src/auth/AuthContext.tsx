import React, { createContext, useContext, useEffect, useState } from 'react';
import { definirTokenAdminNaApi } from '../api/client';
import { login as loginApi, login2fa as login2faApi, AdminLogado } from '../api/admin';

// Bloco A024 (2026-09-24) -- `entrar` agora pode devolver "falta o
// código" em vez de terminar o login. LoginPage decide, com isso, se
// navega direto ou mostra o segundo passo.
type ResultadoEntrar = { pendente2fa: false } | { pendente2fa: true; tokenPendente: string };

interface AuthContextValor {
  admin: AdminLogado | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<ResultadoEntrar>;
  confirmarLogin2fa: (tokenPendente: string, codigo: string) => Promise<void>;
  sair: () => void;
  atualizarAdminLocal: (patch: Partial<AdminLogado>) => void;
}

const AuthContext = createContext<AuthContextValor | undefined>(undefined);

const CHAVE_TOKEN = 'veridati_backoffice_token';
const CHAVE_ADMIN = 'veridati_backoffice_admin';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(CHAVE_TOKEN);
    const adminSalvo = localStorage.getItem(CHAVE_ADMIN);
    if (token && adminSalvo) {
      definirTokenAdminNaApi(token);
      setAdmin(JSON.parse(adminSalvo));
    }
    setCarregando(false);
  }, []);

  // Só finaliza a sessão (localStorage + estado) quando já tem o token
  // de verdade -- seja direto (sem 2FA) ou depois do segundo passo.
  function finalizarLogin(token: string, adminRecebido: AdminLogado) {
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_ADMIN, JSON.stringify(adminRecebido));
    definirTokenAdminNaApi(token);
    setAdmin(adminRecebido);
  }

  async function entrar(email: string, senha: string): Promise<ResultadoEntrar> {
    const resultado = await loginApi(email, senha);
    if ('pendente2fa' in resultado) {
      return { pendente2fa: true, tokenPendente: resultado.tokenPendente };
    }
    finalizarLogin(resultado.token, resultado.admin);
    return { pendente2fa: false };
  }

  async function confirmarLogin2fa(tokenPendente: string, codigo: string) {
    const { token, admin: adminRecebido } = await login2faApi(tokenPendente, codigo);
    finalizarLogin(token, adminRecebido);
  }

  function sair() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_ADMIN);
    definirTokenAdminNaApi(null);
    setAdmin(null);
  }

  // Depois que o admin edita o próprio nome em "Minha conta", isso
  // reflete na hora no avatar e no cabeçalho, sem precisar logar de novo.
  function atualizarAdminLocal(patch: Partial<AdminLogado>) {
    setAdmin((anterior) => {
      if (!anterior) return anterior;
      const atualizado = { ...anterior, ...patch };
      localStorage.setItem(CHAVE_ADMIN, JSON.stringify(atualizado));
      return atualizado;
    });
  }

  return (
    <AuthContext.Provider
      value={{ admin, carregando, entrar, confirmarLogin2fa, sair, atualizarAdminLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return contexto;
}
