// src/components/Config/UsuarioForm.jsx

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Select from 'react-select';
import { FaSave, FaTimes } from 'react-icons/fa';

const UsuarioForm = ({ existingUsuario, onSuccess, onCancel, IdEmpresa, unidades }) => {
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  const isEditMode = !!existingUsuario;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      Nome: '',
      Email: '',
      Telefone: '',
      Senha: '',
      Cargo: '',
      CPF: '',
      Unidade: null, // Inicialmente null para react-select
    },
  });

  useEffect(() => {
    if (isEditMode && existingUsuario) {
      reset({
        Nome: existingUsuario.Nome,
        Email: existingUsuario.Email,
        Telefone: existingUsuario.Telefone,
        Senha: '', // Não preenche a senha ao editar
        Cargo: existingUsuario.Cargo,
        CPF: existingUsuario.CPF,
        Unidade: existingUsuario.Unidade ? { label: existingUsuario.Unidade, value: existingUsuario.Unidade } : null,
      });
    }
  }, [existingUsuario, isEditMode, reset]);

  const onSubmitForm = async (data) => {
    try {
      // Construir o payload
      const payload = {
        Nome: data.Nome,
        Email: data.Email,
        Telefone: data.Telefone,
        Cargo: data.Cargo,
        CPF: data.CPF,
        Unidade: data.Unidade.value, // Campo 'Unidade' conforme esperado pela API
      };

      // Durante a criação, inclui 'EmpresaRelacionada'
      if (!isEditMode) {
        payload.EmpresaRelacionada = IdEmpresa;
      }

      // Inclui a senha se preenchida
      if (data.Senha) {
        payload.Senha = data.Senha;
      }

      // Log do payload para verificar
      console.log('Payload Enviado:', payload);

      if (isEditMode) {
        // Se a senha não for preenchida, remove do payload
        if (!data.Senha) {
          delete payload.Senha;
        }

        // Envia a requisição PUT para atualizar o usuário
        const response = await axios.put(`https://api.multiluzsolar.com.br/app1000/v1/api/usuario/${existingUsuario.IdUsuario}` || `http://localhost:${port}/v1/api/usuario/${existingUsuario.IdUsuario}`, payload);
        alert('Usuário atualizado com sucesso!');
        onSuccess(response.data); // Passa o usuário atualizado para o pai
      } else {
        // Envia a requisição POST para criar o usuário
        const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/v1/api/usuario` || `http://localhost:${port}/v1/api/usuario`, payload);
        alert('Usuário criado com sucesso!');
        onSuccess(response.data); // Ajuste conforme a resposta do backend
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      if (error.response) {
        console.error('Dados da Resposta de Erro:', error.response.data);
        alert(error.response.data.error || 'Falha ao salvar usuário.');
      } else {
        alert('Falha ao salvar usuário.');
      }
    }
  };

  // Converter Unidades para o formato esperado pelo react-select
  const unidadeOptions = unidades.map((unidade) => ({
    value: unidade, // 'Unidade' é uma string
    label: unidade, // 'Unidade' é uma string
  }));

  return (
    <div>
      <h2 className="text-2xl mb-4">{isEditMode ? 'Editar Usuário' : 'Cadastrar Usuário'}</h2>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        {/* Nome */}
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            {...register('Nome', { required: 'Nome é obrigatório' })}
            className={`input input-bordered w-full ${errors.Nome ? 'input-error' : 'input-primary'}`}
            placeholder="Digite o nome do usuário"
          />
          {errors.Nome && <p className="text-red-500 text-sm">{errors.Nome.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            {...register('Email', { 
              required: 'Email é obrigatório',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Email inválido',
              },
            })}
            className={`input input-bordered w-full ${errors.Email ? 'input-error' : 'input-primary'}`}
            placeholder="Digite o email do usuário"
          />
          {errors.Email && <p className="text-red-500 text-sm">{errors.Email.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">CPF</label>
          <input
            type="text"
            {...register('CPF', { 
              required: 'CPF é obrigatório',
              pattern: {
              
                message: 'CPF inválido',
              },
            })}
            className={`input input-bordered w-full }`}
            placeholder="Digite o CPF do usuário"
          />
         
        </div>

        {/* Telefone */}
        <div className="mb-4">
          <label className="block text-gray-700">Telefone</label>
          <input
            type="text"
            {...register('Telefone', { required: 'Telefone é obrigatório' })}
            className={`input input-bordered w-full ${errors.Telefone ? 'input-error' : 'input-primary'}`}
            placeholder="Digite o telefone do usuário"
          />
          {errors.Telefone && <p className="text-red-500 text-sm">{errors.Telefone.message}</p>}
        </div>

        {/* Senha */}
        <div className="mb-4">
          <label className="block text-gray-700">{isEditMode ? 'Nova Senha (opcional)' : 'Senha'}</label>
          <input
            type="password"
            {...register('Senha', { 
              required: !isEditMode ? 'Senha é obrigatória' : false,
              minLength: {
                value: 6,
                message: 'Senha deve ter pelo menos 6 caracteres',
              },
            })}
            className={`input input-bordered w-full ${errors.Senha ? 'input-error' : 'input-primary'}`}
            placeholder={isEditMode ? "Digite a nova senha" : "Digite a senha"}
          />
          {errors.Senha && <p className="text-red-500 text-sm">{errors.Senha.message}</p>}
        </div>

        {/* Cargo */}
        <div className="mb-4">
          <label className="block text-gray-700">Cargo</label>
          <select
            {...register('Cargo', { required: 'Cargo é obrigatório' })}
            className={`select select-bordered w-full ${errors.Cargo ? 'select-error' : 'select-primary'}`}
          >
            <option value="">Selecione o Cargo</option>
            <option value="VENDEDOR">VENDEDOR</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
          </select>
          {errors.Cargo && <p className="text-red-500 text-sm">{errors.Cargo.message}</p>}
        </div>

        {/* Unidade com react-select */}
        <div className="mb-4">
          <label className="block text-gray-700">Unidade</label>
          <Controller
            name="Unidade" // Nome do campo 'Unidade'
            control={control}
            rules={{ required: 'Unidade é obrigatória' }}
            render={({ field }) => (
              <Select
                {...field}
                options={unidadeOptions}
                placeholder="Selecione a Unidade"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
          />
          {errors.Unidade && <p className="text-red-500 text-sm">{errors.Unidade.message}</p>}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="submit"
            className="btn btn-success flex items-center"
          >
            <FaSave className="mr-2" />
            {isEditMode ? 'Atualizar Usuário' : 'Salvar Usuário'}
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

export default UsuarioForm;
