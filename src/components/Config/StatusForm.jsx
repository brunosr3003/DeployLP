// src/components/Config/StatusForm.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const StatusForm = ({ existingStatus, onSuccess, onCancel }) => {
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  const isEditMode = !!existingStatus;

  const [formData, setFormData] = useState({
    Status: '',
    StatusGeral: '',
    StatusNum: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        Status: existingStatus.Status || '',
        StatusGeral: existingStatus.StatusGeral || '',
        StatusNum: existingStatus.StatusNum !== undefined ? existingStatus.StatusNum : '',
      });
    }
  }, [existingStatus, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'StatusNum' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.Status || !formData.StatusGeral || formData.StatusNum === '') {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      if (isEditMode) {
        // Atualizar Status
        const response = await axios.put(`https://api.multiluzsolar.com.br/app1000/v1/api/status/${existingStatus.IdStatus}` || `http://localhost:${port}/v1/api/status/${existingStatus.IdStatus}`, formData);
        alert('Status atualizado com sucesso!');
        onSuccess(response.data); // Passa o Status atualizado para o pai
      } else {
        // Criar Status
        const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/v1/api/status` || `http://localhost:${port}/v1/api/status`, formData);
        // Para obter o IdStatus gerado, você pode modificar o backend para retornar o novo Status
        const newStatus = { ...formData, IdStatus: response.data.IdStatus || uuidv4() }; // Ajuste conforme a resposta do backend
        alert('Status criado com sucesso!');
        onSuccess(newStatus);
      }
    } catch (error) {
      console.error('Erro ao salvar Status:', error);
      const message = error.response?.data?.error || 'Falha ao salvar Status.';
      setError(message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">{isEditMode ? 'Editar Status' : 'Adicionar Status'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Status */}
        <div className="mb-4">
          <label className="block text-gray-700">Status</label>
          <input
            type="text"
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Status Geral */}
        <div className="mb-4">
          <label className="block text-gray-700">Status Geral</label>
          <input
            type="text"
            name="StatusGeral"
            value={formData.StatusGeral}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Status Num */}
        <div className="mb-4">
          <label className="block text-gray-700">Número do Status</label>
          <input
            type="number"
            name="StatusNum"
            value={formData.StatusNum}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            min="0"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {isEditMode ? 'Atualizar' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusForm;
