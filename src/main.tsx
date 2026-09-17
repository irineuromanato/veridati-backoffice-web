import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import './styles.css';

// Bloco A11a / Sub-bloco 60 (2026-09-17) -- o provider de idioma fica
// por FORA do App (e portanto por fora do AuthProvider, das rotas e do
// Layout) de proposito: a tela de Login tambem e' traduzida, e ela
// renderiza antes de existir admin autenticado. Dentro do App, o
// seletor so' alcancaria as telas ja' logadas.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
