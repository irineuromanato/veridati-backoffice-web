import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './pages/Layout';
import OrganizacoesPage from './pages/OrganizacoesPage';
import AdministradoresPage from './pages/AdministradoresPage';
import ExportacoesPage from './pages/ExportacoesPage';
import JobsPage from './pages/JobsPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import MinhaContaPage from './pages/MinhaContaPage';

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
                    <Route path="/" element={<Navigate to="/organizacoes" replace />} />
                    <Route path="/organizacoes" element={<OrganizacoesPage />} />
                    <Route path="/administradores" element={<AdministradoresPage />} />
                    <Route path="/exportacoes" element={<ExportacoesPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                    <Route path="/minha-conta" element={<MinhaContaPage />} />
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
