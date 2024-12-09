// src/pages/EditarCliente.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../AuthContext';
import { FaSave, FaArrowLeft } from 'react-icons/fa'; // Importação de ícones

interface Cliente {
  IdCliente: string;
  Nome: string;
  Email: string;
  Telefone: string;
  Endereco: string;
  Data: string;
  // Outros campos conforme necessário
}

const EditarCliente: React.FC = () => {
  const { IdCliente } = useParams<{ IdCliente: string }>();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const token = auth.token;
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/clientes/${IdCliente}` || `http://localhost:5004/api/clientes/${IdCliente}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setCliente(response.data.cliente);
        } else {
          setError(response.data.message || 'Cliente não encontrado.');
          toast.error(response.data.message || 'Cliente não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do cliente:', err);
        if (axios.isAxiosError(err)) {
          if (err.response) {
            setError(err.response.data.message || 'Erro ao carregar os detalhes do cliente.');
            toast.error(err.response.data.message || 'Erro ao carregar os detalhes do cliente.');
          } else if (err.request) {
            setError('Nenhuma resposta recebida do servidor.');
            toast.error('Nenhuma resposta recebida do servidor.');
          } else {
            setError('Erro ao configurar a requisição.');
            toast.error('Erro ao configurar a requisição.');
          }
        } else {
          setError('Erro desconhecido.');
          toast.error('Erro desconhecido.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (IdCliente) {
      fetchCliente();
    } else {
      setError('ID do cliente não fornecido.');
      setLoading(false);
      toast.error('ID do cliente não fornecido.');
    }
  }, [IdCliente, auth.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (cliente) {
      setCliente({ ...cliente, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.put(
        `https://api.multiluzsolar.com.br/app1000/api/clientes/${IdCliente}` || `http://localhost:5004/api/clientes/${IdCliente}`,
        {
          Nome: cliente?.Nome,
          Email: cliente?.Email,
          Telefone: cliente?.Telefone,
          Endereco: cliente?.Endereco,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Cliente atualizado com sucesso!');
        navigate(`/cliente-detalhes/${IdCliente}`);
      } else {
        toast.error(response.data.message || 'Erro ao atualizar o cliente.');
      }
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          toast.error(err.response.data.message || 'Erro ao atualizar o cliente.');
        } else if (err.request) {
          toast.error('Nenhuma resposta recebida do servidor.');
        } else {
          toast.error('Erro ao configurar a requisição.');
        }
      } else {
        toast.error('Erro desconhecido.');
      }
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 dark:bg-slate-900 dark:text-white min-h-screen">
      {/* Cabeçalho com Botão de Voltar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Voltar
        </button>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2" htmlFor="Nome">
            Nome
          </label>
          <input
            id="Nome"
            name="Nome"
            type="text"
            value={cliente?.Nome || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2" htmlFor="Email">
            Email
          </label>
          <input
            id="Email"
            name="Email"
            type="email"
            value={cliente?.Email || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2" htmlFor="Telefone">
            Telefone
          </label>
          <input
            id="Telefone"
            name="Telefone"
            type="text"
            value={cliente?.Telefone || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2" htmlFor="Endereco">
            Endereço
          </label>
          <textarea
            id="Endereco"
            name="Endereco"
            value={cliente?.Endereco || ''}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            <FaSave className="mr-2" />
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarCliente;
