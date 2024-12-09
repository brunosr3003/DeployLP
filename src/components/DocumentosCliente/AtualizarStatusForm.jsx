// frontend/src/components/Documentos/AtualizarStatusForm.jsx

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AtualizarStatusForm = ({ contratoId, novoStatus, onClose, onSubmit }) => {
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Chamar a função onSubmit passada via props com os dados necessários
    try {
      await onSubmit(contratoId, novoStatus, descricao);
      toast.success(`Contrato ${novoStatus.toLowerCase()} com sucesso.`);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
      setErrorMessage(
        error.response?.data?.message || 'Erro ao atualizar o status. Por favor, tente novamente.'
      );
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar o status. Por favor, tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Defina o elemento raiz para o modal (certifique-se de ter <div id="modal-root"></div> no seu index.html)
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fechar Modal"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {novoStatus === 'Autorizado' ? 'Autorizar Contrato' : 'Negar Contrato'}
        </h2>
        {errorMessage && (
          <div className="mb-2 text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label htmlFor="descricao" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
              Descrição {novoStatus === 'Negado' ? '*' : '(Opcional)'}
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              rows="4"
              placeholder={novoStatus === 'Negado' ? 'Insira uma descrição para a negação.' : 'Descreva brevemente a autorização.'}
              required={novoStatus === 'Negado'}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded mr-2 hover:bg-gray-600 focus:outline-none"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') // Certifique-se de ter este elemento no seu index.html
  );
};

export default AtualizarStatusForm;
