import React, { createContext, useContext, useEffect, useState } from 'react';
import { definirTokenAdminNaApi } from '../api/client';
import { login as loginApi, AdminLogado } from '../api/admin';

interface AuthContextValor {
  admin: AdminLogado | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
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

  async function entrar(email: string, senha: string) {
    const { token, admin: adminRecebido } = await loginApi(email, senha);
    localStorage.setItem(CHAVE_TOKEN, token);
    localStorage.setItem(CHAVE_ADMIN, JSON.stringify(adminRecebido));
    definirTokenAdminNaApi(token);
    setAdmin(adminRecebido);
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
    <AuthContext.Provider value={{ admin, carregando, entrar, sair, atualizarAdminLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return contexto;
}
