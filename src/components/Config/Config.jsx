// src/components/Config/Config.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaBuilding, FaTasks, FaClipboardList, FaMoneyBillWave  } from 'react-icons/fa';


const Config = () => {
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  
  return (
    <div className="bg-base-200 min-h-screen flex flex-col">
      <header className="bg-base-100 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <nav className="flex space-x-4">
            <NavLink 
              to="." 
              end 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? "bg-primary text-primary-content" : "text-primary-content hover:bg-primary hover:text-white"
                }`
              }
            >
              <FaBuilding className="mr-2" />
              Empresas
            </NavLink>
            <NavLink 
              to="status" 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? "bg-primary text-primary-content" : "text-primary-content hover:bg-primary hover:text-white"
                }`
              }
            >
              <FaTasks className="mr-2" />
              Status
            </NavLink>
            <NavLink 
              to="atividades" 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? "bg-primary text-primary-content" : "text-primary-content hover:bg-primary hover:text-white"
                }`
              }
            >
              <FaClipboardList className="mr-2" />
              Atividades
            </NavLink>
            <NavLink 
              to="custos" 
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${
                  isActive ? "bg-primary text-primary-content" : "text-primary-content hover:bg-primary hover:text-white"
                }`
              }
            >
              <FaMoneyBillWave className="mr-2" />
              Custos
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
      <footer className="bg-base-100 text-center p-4">
        <p className="text-sm text-gray-500">© 2024 Seu CRM. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Config;
