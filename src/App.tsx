import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './pages/Layout';
import OrganizacoesPage from './pages/OrganizacoesPage';
import AdministradoresPage from './pages/AdministradoresPage';
import ExportacoesPage from './pages/ExportacoesPage';
import JobsPage from './pages/JobsPage';
import EmailsPage from './pages/EmailsPage';
import PlanosPage from './pages/PlanosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import DashboardPage from './pages/DashboardPage';

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { admin, carregando } = useAuth();
  if (carregando) return null;
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RotaProtegida>
                <Layout>
                  <Routes>
                    {/* Bloco A11a (2026-09-17): a raiz passou a abrir no
                        Dashboard -- e' a tela natural de abertura de um
                        backoffice, e era o unico item do menu que
                        responde "como esta a plataforma agora". */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/organizacoes" element={<OrganizacoesPage />} />
                    <Route path="/administradores" element={<AdministradoresPage />} />
                    <Route path="/exportacoes" element={<ExportacoesPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/emails" element={<EmailsPage />} />
                    <Route path="/planos" element={<PlanosPage />} />
                    <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                  </Routes>
                </Layout>
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
