import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Emails } from './pages/Emails';
import { Repositories } from './pages/Repositories';
import { InstallPWA } from './components/InstallPWA'; // <--- IMPORTAR

function App() {
  return (
    <>
      <InstallPWA /> {/* <--- COMPONENTE DE INSTALACIÓN AQUÍ */}
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          
          <Route path="/clients" element={
            <Layout>
              <Clients />
            </Layout>
          } />

          <Route path="/emails" element={
            <Layout>
              <Emails />
            </Layout>
          } />

          <Route path="/repos" element={
            <Layout>
              <Repositories />
            </Layout>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
