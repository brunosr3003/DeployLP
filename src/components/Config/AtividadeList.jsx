// src/components/Config/AtividadeList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import AtividadeForm from './AtividadeForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AtividadeList = () => {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  // Estados para o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAtividade, setCurrentAtividade] = useState(null);

  // Função para buscar todas as atividades padrão
  const fetchAtividades = async () => {
    try {
      const response = await axios.get( `https://api.multiluzsolar.com.br/app1000/api/padraoAtividade` || `http://localhost:${port}/api/padraoAtividade`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAtividades(response.data.atividades);
    } catch (error) {
      console.error('Erro ao buscar atividades padrão:', error);
      alert('Falha ao buscar atividades padrão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtividades();
  }, []);

  // Função para deletar uma atividade padrão
  const handleDeleteAtividade = async (IdPadraoAtividade) => {
    if (window.confirm('Tem certeza que deseja deletar esta atividade padrão?')) {
      try {
        await axios.delete(`https://api.multiluzsolar.com.br/app1000/api/padraoAtividade/${IdPadraoAtividade}` ||  `http://localhost:5000/api/padraoAtividade/${IdPadraoAtividade}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert('Atividade padrão deletada com sucesso!');
        setAtividades(atividades.filter(atividade => atividade.IdPadraoAtividade !== IdPadraoAtividade));
      } catch (error) {
        console.error('Erro ao deletar atividade padrão:', error);
        alert('Falha ao deletar atividade padrão.');
      }
    }
  };

  // Função para abrir o modal de adicionar ou editar
  const openModal = (atividade = null) => {
    setCurrentAtividade(atividade);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAtividade(null);
  };

  // Função para atualizar a lista após criar ou editar
  const handleSuccess = (atividade) => {
    if (currentAtividade) {
      // Edição
      setAtividades(atividades.map(a => a.IdPadraoAtividade === atividade.IdPadraoAtividade ? atividade : a));
    } else {
      // Criação
      setAtividades([...atividades, atividade]);
    }
    closeModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p>Carregando Atividades Padrão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Lista de Atividades Padrão</h2>
        <button
          onClick={() => openModal()}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Adicionar Atividade
        </button>
      </div>
      {atividades.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>Nenhuma atividade padrão cadastrada.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>AtividadeNum</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((atividade) => (
                <tr key={atividade.IdPadraoAtividade} className="bg-base-100">
                  <td>{atividade.AtividadeNum}</td>
                  <td>{atividade.Nome}</td>
                  <td>{atividade.Descricao}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(atividade)}
                        className="btn btn-sm btn-warning flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAtividade(atividade.IdPadraoAtividade)}
                        className="btn btn-sm btn-error flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Adicionar/Editar Atividade */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={currentAtividade ? "Editar Atividade" : "Adicionar Atividade"}
        className="bg-base-100 p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-20 overflow-auto max-h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <AtividadeForm
          existingAtividade={currentAtividade}
          onSuccess={handleSuccess}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default AtividadeList;
