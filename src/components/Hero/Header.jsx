// src/components/Header.jsx

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCog, FaUserCircle } from "react-icons/fa"; 
import { AuthContext } from "../../AuthContext"; 
import Logo from "../../assets/Icon.jpg";

const Header = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // Para redirecionamento após logout

  const handleLogout = () => {
    logout();
    navigate("/"); // Substitua "/login" pela rota desejada
  };

  return (
    <header
      className="relative z-50 border-b border-gray-200 bg-gradient-to-l from-white-950 via-gray-800 to-gray-950 text-white shadow-lg"
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              className="h-10 w-auto"
              src={Logo}
              alt="Agricoop Logo"
            />
          </Link>
        </div>

        {/* Links de Navegação */}
        <ul className="flex space-x-6">
          <li>
            <a href="#introducao" className="hover:underline">
              Introdução
            </a>
          </li>
          <li>
            <a href="#servicos" className="hover:underline">
              Serviços
            </a>
          </li>
          <li>
            <a href="#missao" className="hover:underline">
              Missão
            </a>
          </li>
          {/* Adicione mais links conforme necessário */}
        </ul>

        {/* Botões e Informações do Usuário */}
        <div className="flex items-center space-x-4 text-black">
          {/* Exibir Informações do Usuário */}
          {auth.isAuthenticated && auth.user && (
            <div className="flex items-center space-x-2">
              <FaUserCircle className="text-2xl" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {auth.user.Nome || auth.user.Email}
                </span>

              </div>
            </div>
          )}

          {/* Botão de Configuração da Empresa - Apenas para Administradores */}
          {auth.isAuthenticated && auth.user && auth.user.Cargo === "ADMINISTRADOR" && (
            <Link
              to="/configuracao" // Certifique-se de que esta rota está definida no seu sistema de rotas
              className="flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
              <FaCog className="mr-2" />
              Configuração
            </Link>
          )}

          {/* Botão de Logout */}
          {auth.isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
