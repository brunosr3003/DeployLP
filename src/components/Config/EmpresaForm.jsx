// src/components/Config/EmpresaForm.jsx

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';

const EmpresaForm = ({ existingEmpresa, onSuccess, onCancel }) => {
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      RazaoSocial: '',
      CNPJ: '',
      Responsavel: '',
 
      PontosLogisticos: [],
      PontosVenda: [],
  
    },
  });

  const {
    fields: logisticFields,
    append: appendLogistic,
    remove: removeLogistic,
  } = useFieldArray({
    control,
    name: 'PontosLogisticos',
  });

  const {
    fields: vendaFields,
    append: appendVenda,
    remove: removeVenda,
  } = useFieldArray({
    control,
    name: 'PontosVenda',
  });

  useEffect(() => {
    if (existingEmpresa) {
      reset(existingEmpresa);
    }
  }, [existingEmpresa, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        RazaoSocial: data.RazaoSocial,
        CNPJ: data.CNPJ,
        Responsavel: data.Responsavel,
  
        PontosLogisticos: data.PontosLogisticos,
        PontosVenda: data.PontosVenda,
      };

      if (existingEmpresa) {
        // Atualizar empresa
        await axios.put(`https://api.multiluzsolar.com.br/app1000/api/empresa/${existingEmpresa.IdEmpresa}` || `http://localhost:${port}/api/empresa/${existingEmpresa.IdEmpresa}`, payload);
        alert('Empresa atualizada com sucesso!');
        onSuccess(payload);
      } else {
        // Criar empresa
        await axios.post(`https://api.multiluzsolar.com.br/app1000/api/empresa` || `http://localhost:${port}/api/empresa`, payload);
        alert('Empresa criada com sucesso!');
        onSuccess(payload);
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      alert('Falha ao salvar empresa. Verifique os logs para mais detalhes.');
    }
  };



  return (
    <div>
      <h2 className="text-2xl mb-4">{existingEmpresa ? 'Editar Empresa' : 'Adicionar Empresa'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Razão Social */}
        <div className="mb-4">
          <label className="block text-gray-700">Razão Social</label>
          <input
            type="text"
            {...register('RazaoSocial', { required: 'Razão Social é obrigatória' })}
            className={`w-full px-3 py-2 border ${errors.RazaoSocial ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {errors.RazaoSocial && <p className="text-red-500 text-sm">{errors.RazaoSocial.message}</p>}
        </div>

        {/* CNPJ */}
        <div className="mb-4">
          <label className="block text-gray-700">CNPJ</label>
          <input
            type="text"
            {...register('CNPJ', { required: 'CNPJ é obrigatório' })}
            className={`w-full px-3 py-2 border ${errors.CNPJ ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {errors.CNPJ && <p className="text-red-500 text-sm">{errors.CNPJ.message}</p>}
        </div>

        {/* Responsável */}
        <div className="mb-4">
          <label className="block text-gray-700">Responsável</label>
          <input
            type="text"
            {...register('Responsavel', { required: 'Responsável é obrigatório' })}
            className={`w-full px-3 py-2 border ${errors.Responsavel ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {errors.Responsavel && <p className="text-red-500 text-sm">{errors.Responsavel.message}</p>}
        </div>

       

        {/* Pontos Logísticos */}
        <div className="mb-4">
          <label className="block text-gray-700">Pontos Logísticos</label>
          {logisticFields.map((item, index) => (
            <div key={item.id} className="border p-4 mb-2 rounded relative">
              <button
                type="button"
                onClick={() => removeLogistic(index)}
                className="absolute top-2 right-2 text-red-500"
              >
                &times;
              </button>
              <div className="mb-2">
                <label className="block text-gray-700">Endereço</label>
                <input
                  type="text"
                  {...register(`PontosLogisticos.${index}.Endereco`, { required: 'Endereço é obrigatório' })}
                  className={`w-full px-3 py-2 border ${errors.PontosLogisticos?.[index]?.Endereco ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosLogisticos?.[index]?.Endereco && (
                  <p className="text-red-500 text-sm">{errors.PontosLogisticos[index].Endereco.message}</p>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Equipe Inst.</label>
                <input
                  type="text"
                  {...register(`PontosLogisticos.${index}.EquipeInst`, { required: 'Equipe Inst. é obrigatória' })}
                  className={`w-full px-3 py-2 border ${errors.PontosLogisticos?.[index]?.EquipeInst ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosLogisticos?.[index]?.EquipeInst && (
                  <p className="text-red-500 text-sm">{errors.PontosLogisticos[index].EquipeInst.message}</p>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Telefone</label>
                <input
                  type="text"
                  {...register(`PontosLogisticos.${index}.Telefone`, { required: 'Telefone é obrigatório' })}
                  className={`w-full px-3 py-2 border ${errors.PontosLogisticos?.[index]?.Telefone ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosLogisticos?.[index]?.Telefone && (
                  <p className="text-red-500 text-sm">{errors.PontosLogisticos[index].Telefone.message}</p>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  {...register(`PontosLogisticos.${index}.Email`, { required: 'Email é obrigatório' })}
                  className={`w-full px-3 py-2 border ${errors.PontosLogisticos?.[index]?.Email ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosLogisticos?.[index]?.Email && (
                  <p className="text-red-500 text-sm">{errors.PontosLogisticos[index].Email.message}</p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendLogistic({ Endereco: '', EquipeInst: '', Telefone: '', Email: '' })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Adicionar Ponto Logístico
          </button>
        </div>

        {/* Pontos de Venda */}
        <div className="mb-4">
          <label className="block text-gray-700">Pontos de Venda</label>
          {vendaFields.map((item, index) => (
            <div key={item.id} className="border p-4 mb-2 rounded relative">
              <button
                type="button"
                onClick={() => removeVenda(index)}
                className="absolute top-2 right-2 text-red-500"
              >
                &times;
              </button>
              <div className="mb-2">
                <label className="block text-gray-700">Unidade</label>
                <input
                  type="text"
                  {...register(`PontosVenda.${index}.Unidade`, { required: 'Unidade é obrigatória' })}
                  className={`w-full px-3 py-2 border ${errors.PontosVenda?.[index]?.Unidade ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosVenda?.[index]?.Unidade && (
                  <p className="text-red-500 text-sm">{errors.PontosVenda[index].Unidade.message}</p>
                )}
              </div>
              <div className="mb-2">
                <label className="block text-gray-700">Endereço</label>
                <input
                  type="text"
                  {...register(`PontosVenda.${index}.Endereco`, { required: 'Endereço é obrigatório' })}
                  className={`w-full px-3 py-2 border ${errors.PontosVenda?.[index]?.Endereco ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {errors.PontosVenda?.[index]?.Endereco && (
                  <p className="text-red-500 text-sm">{errors.PontosVenda[index].Endereco.message}</p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendVenda({ Unidade: '', Endereco: '' })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Adicionar Ponto de Venda
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded"
          >
            {existingEmpresa ? 'Atualizar Empresa' : 'Adicionar Empresa'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmpresaForm;
