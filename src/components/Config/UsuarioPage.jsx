// src/components/Config/UsuarioPage.jsx

import React, { useState, useEffect } from 'react';
import UsuarioForm from './UsuarioForm';
import axios from 'axios';
import { FaUserPlus } from 'react-icons/fa';

const UsuarioPage = ({ IdEmpresa }) => {
  const [unidades, setUnidades] = useState([]);
  const [existingUsuario, setExistingUsuario] = useState(null); // Para edição
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  useEffect(() => {
    // Buscar dados da empresa para obter unidades
    const fetchEmpresa = async () => {
      try {
        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/empresa/${IdEmpresa}` || `http://localhost:${port}/api/empresa/${IdEmpresa}`);
        const empresa = response.data;
        setUnidades(empresa.PontosVenda); // Ajuste conforme a estrutura da resposta
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    };

    fetchEmpresa();
  }, [IdEmpresa]);

  const handleSuccess = (usuario) => {
    // Lógica após sucesso (atualizar estado, fechar modal, etc.)
    alert('Usuário salvo com sucesso!');
    // Você pode atualizar a lista de usuários ou redirecionar conforme necessário
  };

  const handleCancel = () => {
    // Lógica para cancelar a operação
    alert('Operação cancelada.');
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <FaUserPlus className="text-3xl text-primary mr-3" />
        <h1 className="text-3xl font-bold">{existingUsuario ? 'Editar Usuário' : 'Cadastrar Usuário'}</h1>
      </div>
      <UsuarioForm
        existingUsuario={existingUsuario}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        IdEmpresa={IdEmpresa}
        unidades={unidades}
      />
    </div>
  );
};

export default UsuarioPage;
