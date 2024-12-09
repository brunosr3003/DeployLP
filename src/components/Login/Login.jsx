// src/components/Login/Login.jsx

import React, { useState, useContext } from "react";
import axios from 'axios';
import { AuthContext } from '../../AuthContext'; 
import { useNavigate, Link } from "react-router-dom"; 
import Logo from "../../assets/LogoMultiluzSolar.png";
import Banner from "../../assets/modulo.jpeg"; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate(); 

  // Obter a porta a partir das variáveis de ambiente
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      // Construir a URL dinamicamente usando a porta do .env
      const url = `https://api.multiluzsolar.com.br/app1000/v1/api/login` || `http://localhost:${port}/v1/api/login`;
      
      const response = await axios.post(url, { email, password });
      if (response.data.success) {
        // Login bem-sucedido
        setMessage('Login bem-sucedido!');
        setIsError(false);
        // Chama a função de login no contexto com o token
        login(response.data.token, { email }); 
        // Redireciona para /homeuser
        navigate("/homeuser");
      } else {
        // Falha no login
        setMessage('Falha no login: ' + response.data.message);
        setIsError(true);
      }
    } catch (error) {
      console.error('Ocorreu um erro:', error);
      setMessage('Ocorreu um erro durante o login.');
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Seção do Formulário de Login */}
      <section className="w-full md:w-2/6 flex flex-col items-center justify-center bg-white p-8">
        {/* Logo acima do formulário */}
        <img src={Logo} alt="Logo" className="mb-6 w-32 h-auto" />

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
          {message && (
            <div className={`mb-4 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Seu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Sua Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            />
            {/* Link "Esqueci minha senha" */}
            <div className="text-right">
              <Link to="https://api.whatsapp.com/send/?phone=5534996728437&text&type=phone_number&app_absent=0" className="text-sm text-blue-600 hover:text-blue-800">
                Esqueci minha senha
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            >
              Entrar
            </button>
          </div>
          {/* Link para criar uma nova conta */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="https://api.whatsapp.com/send/?phone=5534996728437&text&type=phone_number&app_absent=0" className="text-blue-600 hover:text-blue-800 font-semibold">
                Crie uma agora mesmo!
              </Link>
            </p>
          </div>
        </form>
      </section>

      {/* Barra Divisória */}
      <div className="hidden md:block md:w-px bg-gray-300"></div>

      {/* Seção da Imagem Lateral */}
      <div
        className="w-full md:w-full h-64 md:h-auto bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${Banner})` }}
      >
        {/* Logo acima da imagem lateral */}
        <img src={Logo} alt="Logo" className="absolute top-4 left-4 w-48 h-auto" />
      </div>
    </div>
  );
};

export default Login;
