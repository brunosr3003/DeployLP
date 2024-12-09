// src/components/Atividades/ConcluirAtividadeForm.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { AuthContext } from '../../AuthContext';
import { toast } from 'react-toastify';

const ConcluirAtividadeForm = ({ atividade, onClose, onConcluida }) => {
  const { auth } = useContext(AuthContext); // Acessa o contexto de autenticação
  const [descricaoConclusao, setDescricaoConclusao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (descricaoConclusao.trim() === '') {
      setErrorMessage('A descrição da conclusão é obrigatória.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.put(
        `https://api.multiluzsolar.com.br/app1000/v1/api/atividades/${atividade.IdAtividade}/concluir` || `http://localhost:${port}/v1/api/atividades/${atividade.IdAtividade}/concluir`,
        { DescricaoConclusao: descricaoConclusao },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Atividade concluída com sucesso.');
        onConcluida(response.data.atividade);
        onClose();
      } else {
        setErrorMessage(response.data.message || 'Erro ao concluir atividade.');
        toast.error(response.data.message || 'Erro ao concluir atividade.');
      }
    } catch (error) {
      console.error('Erro ao concluir atividade:', error);
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'Erro ao concluir atividade.');
        toast.error(error.response?.data?.message || 'Erro ao concluir atividade.');
      } else {
        setErrorMessage('Erro desconhecido.');
        toast.error('Erro desconhecido.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar o modal ao pressionar Esc
  const handleEsc = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Função para fechar o modal ao clicar fora
  const handleClickOutside = (e) => {
    if (e.target.id === 'concluir-atividade-overlay') {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      id="concluir-atividade-overlay"
      onClick={handleClickOutside}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6 overflow-y-auto transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Concluir Atividade</h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="mb-2 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="DescricaoConclusao" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
              Descrição da Conclusão<span className="text-red-500">*</span>
            </label>
            <textarea
              id="DescricaoConclusao"
              name="DescricaoConclusao"
              value={descricaoConclusao}
              onChange={(e) => setDescricaoConclusao(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Descreva a conclusão da atividade..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none transition duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Concluindo...' : 'Concluir'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') // Certifique-se de ter um elemento com id 'modal-root' no seu index.html
  );
};

export default ConcluirAtividadeForm;
