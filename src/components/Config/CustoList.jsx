// src/components/Config/CustoList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import CustoForm from './CustoForm';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const CustoList = () => {
  const [custos, setCustos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCusto, setCurrentCusto] = useState(null);
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  // Função para buscar todos os Custos
  const fetchCustos = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/custos` ||  `http://localhost:${port}/api/custos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Ajuste conforme sua implementação de autenticação
        },
      });
      setCustos(response.data);
    } catch (error) {
      console.error('Erro ao buscar Custos:', error);
      alert('Falha ao buscar Custos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustos();
  }, []);

  // Função para deletar um Custo
  const handleDeleteCusto = async (IdCusto) => {
    if (window.confirm('Tem certeza que deseja deletar este Custo?')) {
      try {
        await axios.delete(`http://localhost:${port}/api/custos/${IdCusto}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Ajuste conforme sua implementação de autenticação
          },
        });
        alert('Custo deletado com sucesso!');
        setCustos(custos.filter(custo => custo.IdCusto !== IdCusto));
      } catch (error) {
        console.error('Erro ao deletar Custo:', error);
        alert('Falha ao deletar Custo.');
      }
    }
  };

  // Função para abrir o modal de adicionar ou editar Custo
  const openModal = (custo = null) => {
    setCurrentCusto(custo);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCusto(null);
  };

  // Função para atualizar a lista após criar ou editar um Custo
  const updateCustoList = (custo) => {
    if (currentCusto) {
      // Edição
      setCustos(custos.map(c => c.IdCusto === custo.IdCusto ? custo : c));
    } else {
      // Criação
      setCustos([...custos, custo]);
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
          <p>Carregando Custos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Lista de Custos</h2>
        <button
          onClick={() => openModal()}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Adicionar Custo
        </button>
      </div>
      {custos.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>Nenhum Custo cadastrado.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor Fixo</th>
                <th>Porcentagem (%)</th>
                <th>Onde Afeta</th> 
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {custos.map((custo) => (
                <tr key={custo.IdCusto}>
                  <td>{custo.Nome}</td>
                  <td>R$ {custo.ValorFixo.toFixed(2)}</td>
                  <td>{custo.Porcentagem.toFixed(2)}%</td>
                  <td>{custo.OndeAfeta || 'N/A'}</td> 
                  <td>{custo.Descricao}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(custo)}
                        className="btn btn-sm btn-warning flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCusto(custo.IdCusto)}
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

      {/* Modal para Adicionar/Editar Custo */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={currentCusto ? "Editar Custo" : "Adicionar Custo"}
        className="bg-base-100 p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-20 overflow-auto max-h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <CustoForm
          existingCusto={currentCusto}
          onSuccess={updateCustoList}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default CustoList;
