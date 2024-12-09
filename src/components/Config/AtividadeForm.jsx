// src/components/Config/AtividadeForm.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const AtividadeForm = ({ existingAtividade, onSuccess, onCancel }) => {
  const isEditMode = !!existingAtividade;
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const [formData, setFormData] = useState({
    AtividadeNum: '',
    Nome: '',
    Descricao: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && existingAtividade) {
      setFormData({
        AtividadeNum: existingAtividade.AtividadeNum || '',
        Nome: existingAtividade.Nome || '',
        Descricao: existingAtividade.Descricao || '',
      });
    }
  }, [existingAtividade, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Para AtividadeNum, garantir que apenas números sejam aceitos
    if (name === 'AtividadeNum') {
      if (value === '' || /^[1-9]\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.AtividadeNum || !formData.Nome || !formData.Descricao) {
      setError('AtividadeNum, Nome e Descrição são obrigatórios.');
      return;
    }

    try {
      if (isEditMode) {
        // Atualizar Atividade
        const response = await axios.put(
           `https://api.multiluzsolar.com.br/app1000/api/padraoAtividade/${existingAtividade.IdPadraoAtividade}` || `http://localhost:${port}/api/padraoAtividade/${existingAtividade.IdPadraoAtividade}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Ajuste conforme sua implementação de autenticação
            },
          }
        );
        alert('Atividade padrão atualizada com sucesso!');
        onSuccess(response.data.atividade);
      } else {
        // Criar Atividade
        const response = await axios.post(
          `https://api.multiluzsolar.com.br/app1000/api/padraoAtividade` ||  `http://localhost:${port}/api/padraoAtividade`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        alert('Atividade padrão criada com sucesso!');
        onSuccess(response.data.atividade);
      }
    } catch (error) {
      console.error('Erro ao salvar atividade padrão:', error);
      setError(error.response?.data?.message || 'Falha ao salvar atividade padrão.');
    }
  };

  return (
    <div className="p-6 bg-base-100 shadow-md rounded-lg">
      <h2 className="text-2xl mb-4">{isEditMode ? 'Editar Atividade' : 'Adicionar Atividade'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* AtividadeNum */}
        <div className="mb-4">
          <label className="block text-gray-700">AtividadeNum</label>
          <input
            type="number"
            name="AtividadeNum"
            value={formData.AtividadeNum}
            onChange={handleChange}
            required
            min="1"
            className="input input-bordered w-full"
            placeholder="Número da Atividade"
          />
        </div>

        {/* Nome */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
            placeholder="Nome da Atividade"
          />
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <label className="block text-gray-700">Descrição</label>
          <textarea
            name="Descricao"
            value={formData.Descricao}
            onChange={handleChange}
            required
            className="textarea textarea-bordered w-full"
            placeholder="Descrição da Atividade"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="btn btn-success flex items-center"
          >
            <FaSave className="mr-2" />
            {isEditMode ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline flex items-center"
          >
            <FaTimes className="mr-2" />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AtividadeForm;
