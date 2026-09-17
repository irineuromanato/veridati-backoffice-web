// Bloco A11a / Sub-bloco 60 (2026-09-17) -- provider de idioma do
// Backoffice. Mesmo desenho do Account (`veridati-account-web`), com
// uma diferenca obrigatoria de chave de storage: os dois apps podem
// estar abertos no mesmo navegador, entao a chave e' propria deste app.
//
// O idioma vive SO' no localStorage. `tbl_admin_plataforma` nao tem
// coluna `idioma` (id, nome, email, senha_hash, criado_em) e o schema
// vive num Postgres externo ao repo -- entao a escolha nao acompanha o
// admin de um navegador pro outro. Limitacao conhecida e aceita.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { dicionarios, Idioma } from './dicionarios';

const CHAVE_IDIOMA = 'veridati_backoffice_idioma';

interface I18nValor {
  idioma: Idioma;
  definirIdioma: (idioma: Idioma) => void;
  t: (chave: string) => string;
}

const I18nContext = createContext<I18nValor | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>('PT_BR');

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_IDIOMA);
    if (salvo && dicionarios[salvo as Idioma]) setIdioma(salvo as Idioma);
  }, []);

  // O atributo `lang` do <html> nasce 'pt-BR' no index.html e fica
  // mentindo depois que o admin troca de idioma. Acompanha aqui: e' o
  // que leitor de tela e corretor ortografico do navegador leem.
  useEffect(() => {
    document.documentElement.lang = idioma === 'PT_BR' ? 'pt-BR' : idioma.toLowerCase();
  }, [idioma]);

  function definirIdioma(novoIdioma: Idioma) {
    setIdioma(novoIdioma);
    localStorage.setItem(CHAVE_IDIOMA, novoIdioma);
  }

  // Lookup puro, sem interpolacao. Chave ausente cai no PT_BR e, se
  // tambem nao existir la, devolve a propria chave -- some da tela como
  // texto estranho em vez de quebrar a renderizacao.
  function t(chave: string): string {
    return dicionarios[idioma]?.[chave] ?? dicionarios.PT_BR[chave] ?? chave;
  }

  return (
    <I18nContext.Provider value={{ idioma, definirIdioma, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValor {
  const contexto = useContext(I18nContext);
  if (!contexto) throw new Error('useI18n precisa estar dentro de <I18nProvider>.');
  return contexto;
}
