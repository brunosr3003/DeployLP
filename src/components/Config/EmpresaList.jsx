// src/components/Config/EmpresaList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import EmpresaForm from './EmpresaForm';
import UsuarioForm from './UsuarioForm'; // Importando o UsuarioForm
import { useNavigate } from 'react-router-dom';
import UsuarioList from './UsuarioList';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

const EmpresaList = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o modal de adicionar empresa
  const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  
  // Estados para o modal de adicionar usuário
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [currentEmpresaId, setCurrentEmpresaId] = useState(null);
  
  // Estado para armazenar as unidades da empresa selecionada
  const [unidades, setUnidades] = useState([]);
  
  const navigate = useNavigate();

  const port = import.meta.env.REACT_APP_PORT || 1000; 

  // Função para buscar todas as empresas
  const fetchEmpresas = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/empresa` || `http://localhost:${port}/v1/api/empresa`);
      setEmpresas(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      alert('Falha ao buscar empresas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Função para deletar uma empresa
  const handleDeleteEmpresa = async (IdEmpresa) => {
    if (window.confirm('Tem certeza que deseja deletar esta empresa? Isso também deletará todos os usuários associados.')) {
      try {
        await axios.delete(`https://api.multiluzsolar.com.br/app1000/v1/api/empresa/${IdEmpresa}` || `http://localhost:${port}/v1/api/empresa/${IdEmpresa}`);
        alert('Empresa deletada com sucesso!');
        setEmpresas(empresas.filter(empresa => empresa.IdEmpresa !== IdEmpresa));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert('Falha ao deletar empresa.');
      }
    }
  };

  // Função para abrir a rota de edição
  const openEditRoute = (empresa) => {
    navigate(`editar/${empresa.IdEmpresa}`);
  };

  // Função para abrir o modal de adicionar usuário
  const openAddUsuarioModal = async (IdEmpresa) => {
    setCurrentEmpresaId(IdEmpresa);
    setIsUsuarioModalOpen(true);
    
    // Buscar as unidades da empresa selecionada para passar ao formulário de usuário
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/empresa/${IdEmpresa}/pontovenda` || `http://localhost:${port}/v1/api/empresa/${IdEmpresa}/pontovenda`);
      // Extrair 'Unidade' de cada objeto dentro de 'PontosVenda'
      const extractedUnidades = response.data.map(ponto => ponto.Unidade);
      setUnidades(extractedUnidades);
    } catch (error) {
      console.error('Erro ao buscar PontoVenda:', error);
      alert('Falha ao buscar unidades da empresa.');
      setUnidades([]);
    }
  };

  // Função para fechar o modal de usuário
  const closeUsuarioModal = () => {
    setIsUsuarioModalOpen(false);
    setCurrentEmpresaId(null);
    setUnidades([]);
  };

  // Função para atualizar a lista após criar ou editar uma empresa
  const updateEmpresaList = (empresa) => {
    if (currentEmpresa) {
      // Edição
      setEmpresas(empresas.map(e => e.IdEmpresa === empresa.IdEmpresa ? empresa : e));
    } else {
      // Criação
      setEmpresas([...empresas, empresa]);
    }
    closeEmpresaModal();
  };

  // Função para adicionar um novo usuário
  const handleAddUsuario = (usuario) => {
    // Aqui você pode atualizar a lista de usuários se necessário
    // Ou deixar que o componente UsuarioList cuide disso
    alert('Usuário adicionado com sucesso!');
    closeUsuarioModal();
    // Opcional: Atualizar a lista de usuários ou recarregar as empresas
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p>Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Lista de Empresas</h2>
        {/* Removido o botão "Adicionar Empresa" */}
      </div>
      {empresas.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>Nenhuma empresa cadastrada.</span>
        </div>
      ) : (
        empresas.map((empresa) => (
          <div key={empresa.IdEmpresa} className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="card-title">{empresa.RazaoSocial}</h3>
                  <p><strong>CNPJ:</strong> {empresa.CNPJ}</p>
                  <p><strong>Responsável:</strong> {empresa.Responsavel}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditRoute(empresa)}
                    className="btn btn-sm btn-warning flex items-center"
                  >
                    <FaEdit className="mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteEmpresa(empresa.IdEmpresa)}
                    className="btn btn-sm btn-error flex items-center"
                  >
                    <FaTrash className="mr-1" />
                    Deletar
                  </button>
                  <button
                    onClick={() => openAddUsuarioModal(empresa.IdEmpresa)}
                    className="btn btn-sm btn-success flex items-center"
                  >
                    <FaUserPlus className="mr-1" />
                    Adicionar Usuário
                  </button>
                </div>
              </div>
              {/* Lista de Usuários da Empresa */}
              <div className="mt-4">
                <h4 className="text-xl font-semibold mb-2">Usuários</h4>
                <UsuarioList IdEmpresa={empresa.IdEmpresa} />
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal para Adicionar Usuário */}
      <Modal
        isOpen={isUsuarioModalOpen}
        onRequestClose={closeUsuarioModal}
        contentLabel="Adicionar Usuário"
        className="bg-base-100 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-20 overflow-auto max-h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <div className="flex justify-end">
          <button onClick={closeUsuarioModal} className="btn btn-sm btn-circle btn-ghost">
            ✖️
          </button>
        </div>
        <UsuarioForm
          existingUsuario={null}
          onSuccess={handleAddUsuario}
          onCancel={closeUsuarioModal}
          IdEmpresa={currentEmpresaId}
          unidades={unidades} // As unidades estão definidas agora
        />
      </Modal>
    </div>
  );
};

export default EmpresaList;
