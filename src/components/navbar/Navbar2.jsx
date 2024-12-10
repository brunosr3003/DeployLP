// src/components/navbar/Navbar2.jsx

import React, { useEffect, useState, useContext } from "react";
import Logo from "../../public/Icon.png";
import { AuthContext } from "../../AuthContext"; // Ajuste o caminho conforme necessário
import { useNavigate, Link } from "react-router-dom"; // Importação para navegação pós-logout e Link
import { FaCog, FaUserCircle } from "react-icons/fa"; // Importação dos ícones

const Navbar2 = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const element = document.documentElement;

  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // Inicialização para navegação pós-logout (opcional)

  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");BN
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme, element]);

  const handleLogout = () => {
    logout();
    // Opcional: Redirecionar para a página de login ou home após o logout
    navigate("/login"); // Substitua "/login" pela rota desejada
  };

  return (
    <header
      data-aos="fade"
      data-aos-duration="300"
      className="relative z-[99] border-b-[1px] border-primary/50 bg-gradient-to-l from-blue-950 via-blue-800 to-blue-950 text-white shadow-lg transition-colors duration-500"
    >
      <nav className="container flex h-[70px] items-center justify-between py-2">
        {/* Logo */}
        <div className="text-2xl text-white md:text-3xl">
          <Link to="/#home">
            <img
              className="max-h-[50px] w-full object-fill"
              src={Logo}
              alt="Logo Multiluz"
            />
          </Link>
        </div>

        {/* Botões de Navegação */}
        <div className="flex items-center gap-4">
          {/* Exibir Informações do Usuário */}
          {auth.isAuthenticated && auth.user && (
            <div className="flex items-center space-x-2">
              <FaUserCircle className="text-xl" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {auth.user.Nome || auth.user.Email}
                </span>
                <span className="text-xs text-gray-300">
                  {auth.user.Cargo} - {auth.user.Unidade}
                </span>
              </div>
            </div>
          )}

          {/* Botão de Configuração da Empresa - Apenas para Administradores */}
          {auth.isAuthenticated && auth.user && auth.user.Cargo === "ADMINISTRADOR" && (
            <Link
              to="/configuracao" // Certifique-se de que esta rota está definida no seu sistema de rotas
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
              <FaCog className="mr-2" />
              Configuração
            </Link>
          )}

          {/* Botão de Logout */}
          {auth.isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar2;
