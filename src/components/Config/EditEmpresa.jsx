// src/components/Config/EditEmpresa.jsx

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditEmpresa = () => {
  const { IdEmpresa } = useParams();
  const navigate = useNavigate();
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      RazaoSocial: '',
      CNPJ: '',
      Responsavel: '',
      Unidades: [],
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
    const fetchEmpresa = async () => {
      try {
        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/empresa/${IdEmpresa}` || `http://localhost:${port}/api/empresa/${IdEmpresa}`); // Endpoint completo
        reset(response.data);
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
        alert('Falha ao buscar empresa.');
      }
    };

    fetchEmpresa();
  }, [IdEmpresa, reset]);

  const onSubmit = async (data) => {
    try {
      // Preparar os dados para envio
      const payload = {
        RazaoSocial: data.RazaoSocial,
        CNPJ: data.CNPJ,
        Responsavel: data.Responsavel,
        Unidades: data.Unidades,
        PontosLogisticos: data.PontosLogisticos,
        PontosVenda: data.PontosVenda,
      };

      await axios.put(`https://api.multiluzsolar.com.br/app1000/api/empresa/${IdEmpresa}` || `http://localhost:${port}/api/empresa/${IdEmpresa}`, payload); // Endpoint completo
      alert('Empresa atualizada com sucesso!');
      navigate('/configuracao');
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert('Falha ao atualizar empresa. Verifique os logs para mais detalhes.');
    }
  };

  // Observa as Unidades para renderização dinâmica
  const unidades = watch('Unidades');

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <section className="bg-white p-6 rounded shadow-md w-full max-w-3xl overflow-auto max-h-screen">
        <h2 className="text-2xl mb-4">Editar Empresa</h2>
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
              <div key={item.id} className="border p-4 mb-2 rounded relative bg-base-200">
                <button
                  type="button"
                  onClick={() => removeLogistic(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
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
              className="btn btn-primary mt-2 flex items-center"
            >
              Adicionar Ponto Logístico
            </button>
          </div>

          {/* Pontos de Venda */}
          <div className="mb-4">
            <label className="block text-gray-700">Pontos de Venda</label>
            {vendaFields.map((item, index) => (
              <div key={item.id} className="border p-4 mb-2 rounded relative bg-base-200">
                <button
                  type="button"
                  onClick={() => removeVenda(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
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
              className="btn btn-primary mt-2 flex items-center"
            >
              Adicionar Ponto de Venda
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="btn btn-success flex items-center"
            >
              Atualizar Empresa
            </button>
            <button
              type="button"
              onClick={() => navigate('/configuracao')}
              className="btn btn-outline flex items-center"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default EditEmpresa;
