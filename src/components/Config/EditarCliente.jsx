// src/pages/EditarCliente.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UsuarioForm from '../components/Config/UsuarioForm';
import { FaUserEdit } from 'react-icons/fa';

const EditarCliente = () => {
  const { IdCliente } = useParams(); // Obtém o IdCliente da URL
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  useEffect(() => {
    // Função para buscar dados do usuário
    const fetchUsuario = async () => {
      try {
        const response = await axios.get(`http://localhost:${port}/api/usuario/${IdCliente}`);
        setUsuario(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setError('Falha ao buscar usuário.');
        setLoading(false);
      }
    };

    if (IdCliente) {
      fetchUsuario();
    }
  }, [IdCliente]);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const empresaResponse = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/empresa/${usuario.EmpresaRelacionada}` || `http://localhost:${port}/api/empresa/${usuario.EmpresaRelacionada}`);
        setUnidades(empresaResponse.data.PontosVenda); // Ajuste conforme a estrutura da resposta
      } catch (error) {
        console.error('Erro ao buscar unidades:', error);
        setError('Falha ao buscar unidades.');
      }
    };

    if (usuario) {
      fetchUnidades();
    }
  }, [usuario]);

  const handleSuccess = () => {
    navigate('/homeuser', { state: { message: 'Usuário atualizado com sucesso!' } });
  };

  const handleCancel = () => {
    navigate('/homeuser');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p>Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-100 shadow-md rounded-lg">
      <div className="flex items-center mb-6">
        <FaUserEdit className="text-3xl text-primary mr-3" />
        <h1 className="text-3xl font-bold">Editar Usuário</h1>
      </div>
      <UsuarioForm
        existingUsuario={usuario}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        IdEmpresa={usuario.EmpresaRelacionada}
        unidades={unidades}
      />
    </div>
  );
};

export default EditarCliente;
