// src/components/Config/CustoForm.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustoForm = ({ existingCusto, onSuccess, onCancel }) => {
  const isEditMode = !!existingCusto;
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const [formData, setFormData] = useState({
    Nome: '',
    ValorFixo: '',
    Porcentagem: '',
    Descricao: '',
    OndeAfeta: '', // Novo campo
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && existingCusto) {
      setFormData({
        Nome: existingCusto.Nome || '',
        ValorFixo: existingCusto.ValorFixo !== undefined ? existingCusto.ValorFixo : '',
        Porcentagem: existingCusto.Porcentagem !== undefined ? existingCusto.Porcentagem : '',
        Descricao: existingCusto.Descricao || '',
        OndeAfeta: existingCusto.OndeAfeta || '', // Preencher o campo se existir
      });
    }
  }, [existingCusto, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ValorFixo' || name === 'Porcentagem' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.Nome || formData.ValorFixo === '' || formData.Porcentagem === '' || !formData.Descricao || !formData.OndeAfeta) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    try {
      if (isEditMode) {
        // Atualizar Custo
        const response = await axios.put( `https://api.multiluzsolar.com.br/app1000/api/custos/${existingCusto.IdCusto}` ||  `http://localhost:${port}/api/custos/${existingCusto.IdCusto}`, formData);
        alert('Custo atualizado com sucesso!');
        onSuccess({ ...existingCusto, ...formData }); // Passa o Custo atualizado para o pai
      } else {
        // Criar Custo
        const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/api/custos` || `http://localhost:${port}/api/custos`, formData);
        alert('Custo criado com sucesso!');
        onSuccess({ IdCusto: response.data.IdCusto, ...formData });
      }
    } catch (error) {
      console.error('Erro ao salvar Custo:', error);
      const message = error.response?.data?.error || 'Falha ao salvar Custo.';
      setError(message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">{isEditMode ? 'Editar Custo' : 'Adicionar Custo'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Nome */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            required
          />
        </div>

        {/* Valor Fixo */}
        <div className="mb-4">
          <label className="block text-gray-700">Valor Fixo</label>
          <input
            type="number"
            name="ValorFixo"
            value={formData.ValorFixo}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {/* Porcentagem */}
        <div className="mb-4">
          <label className="block text-gray-700">Porcentagem (%)</label>
          <input
            type="number"
            name="Porcentagem"
            value={formData.Porcentagem}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
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
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            rows="3"
          ></textarea>
        </div>

        {/* OndeAfeta - Novo Campo */}
        <div className="mb-4">
          <label className="block text-gray-700">Onde Afeta</label>
          <select
            name="OndeAfeta"
            value={formData.OndeAfeta}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="" disabled>Selecione onde a porcentagem afeta no kit</option>
            <option value="Módulo">Módulo</option>
            <option value="Inversor">Inversor</option>
            <option value="Total Kit">Total Kit</option>
            <option value="Preço Total">Preço Total</option>
            <option value="Estrutura">Estrutura</option>
            
          </select>
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

export default CustoForm;
