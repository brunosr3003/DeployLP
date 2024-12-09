// src/routes.tsx

import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Navigate, Routes } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Home } from "./pages/Home";
import { Calc } from "./pages/Calc";
import { Data } from "./pages/Data";
import PrivateRoute from './PrivateRoute';
import HomeUser from "./pages/HomeUser";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Configuracao from "./pages/Configuracao";
import StatusList from "./components/Config/StatusList";
import EmpresaList from "./components/Config/EmpresaList";
import EmpresaForm from "./components/Config/EmpresaForm";
import EditEmpresa from "./components/Config/EditEmpresa";
import AtividadeList from "./components/Config/AtividadeList";
import CustoList from "./components/Config/CustoList";
import { GeradorContratos } from "./pages/GeradorContratos";



export const AppRoutes: React.FC = () => {
  const { auth, loading } = useContext(AuthContext);
  console.log(`AppRoutes - Is Authenticated: ${auth.isAuthenticated}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            auth.isAuthenticated ? <Navigate to="/homeuser" /> : <Home />
          } 
        />

        <Route path="/calculadora" element={
          <PrivateRoute>
            <Calc />
          </PrivateRoute>
        } />
        <Route path="/data" element={
          <PrivateRoute>
            <Data />
          </PrivateRoute>
        } />
        <Route path="/visualizacao/:IdCliente" element={
          <PrivateRoute>
            <ClienteDetalhes />
          </PrivateRoute>
        } /> 

        <Route path="/homeuser" element={
          <PrivateRoute>
            <HomeUser />
          </PrivateRoute>
        } />

        <Route
          path="/cliente-detalhes/:IdCliente"
          element={
            <PrivateRoute>
              <ClienteDetalhes />
            </PrivateRoute>
          }
        />

        <Route path="/gerador/:IdCliente/:IdDadosContrato" element={
          <PrivateRoute>
            <GeradorContratos />
          </PrivateRoute>
        } />



        {/* Rota de Configuração com rotas aninhadas */}
        <Route path="/configuracao/*" element={
          <PrivateRoute>
            <Configuracao />
          </PrivateRoute>
        }>
          {/* Rotas Aninhadas */}
          <Route index element={<EmpresaList />} /> {/* Página principal de Configuração */}
          {/* Se o modal de adicionar empresa foi removido, remova esta rota também */}
          {/* <Route path="adicionar" element={<EmpresaForm onSuccess={() => {}} onCancel={() => {}} />} /> */}
          <Route path="editar/:IdEmpresa" element={<EditEmpresa />} />
          {/* Rotas para Status Aninhadas */}
          <Route path="status" element={<StatusList />} />

          <Route path="atividades" element={<AtividadeList />} />
          <Route path="custos" element={<CustoList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};
