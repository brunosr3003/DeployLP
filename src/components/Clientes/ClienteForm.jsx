// src/components/Clientes/ClienteForm.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify';

const ClienteForm = ({ cliente = null, onClose }) => {

  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const [formData, setFormData] = useState({
    Nome: cliente ? cliente.Nome : '',
    Email: cliente ? cliente.Email : '',
    Telefone: cliente ? cliente.Telefone : '',
    CEP: cliente ? cliente.CEP : '',
    Logradouro: cliente ? cliente.Logradouro : '',
    Bairro: cliente ? cliente.Bairro : '',
    Cidade: cliente ? cliente.Cidade : '',
    Estado: cliente ? cliente.Estado : '',
    Numero: cliente ? cliente.Numero : '',
    Complemento: cliente ? cliente.Complemento : '',
    Valor: cliente ? cliente.Valor : '',
    Temperatura: cliente ? cliente.Temperatura : 'FRIO',
    StatusGeralRelacionado: cliente ? cliente.StatusGeralRelacionado : '', // Se necessário
    StatusRelacionado: cliente ? cliente.StatusRelacionado : '', // Se necessário
    NomeUsuario: cliente ? cliente.NomeUsuario : '', // Se necessário
    UsuarioRelacionado: cliente ? cliente.UsuarioRelacionado : '', // Se necessário
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cepError, setCepError] = useState('');
  const [atividadeInicial, setAtividadeInicial] = useState(null); // Para armazenar a atividade inicial criada

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');

    setFormData((prevData) => ({
      ...prevData,
      CEP: e.target.value,
    }));

    if (cep.length !== 8) {
      setCepError('CEP deve conter 8 dígitos.');
      return;
    }

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.data.erro) {
        setCepError('CEP não encontrado.');
        setFormData((prevData) => ({
          ...prevData,
          Logradouro: '',
          Bairro: '',
          Cidade: '',
          Estado: '',
        }));
      } else {
        setCepError('');
        setFormData((prevData) => ({
          ...prevData,
          Logradouro: response.data.logradouro || '',
          Bairro: response.data.bairro || '',
          Cidade: response.data.localidade || '',
          Estado: response.data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP. Tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    const token = localStorage.getItem('token'); // Supondo que você armazena o token no localStorage

    // Validação do telefone
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!telefoneRegex.test(formData.Telefone)) {
      setErrorMessage('Por favor, insira um telefone válido.');
      setIsSubmitting(false);
      return;
    }

    // Validação do CEP
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(formData.CEP)) {
      setErrorMessage('Por favor, insira um CEP válido.');
      setIsSubmitting(false);
      return;
    }

    // Validação adicional para campos obrigatórios
    // Adicione aqui validações para outros campos se necessário

    try {
      let response;
      if (cliente) {
        // Caso de edição
        response = await axios.put(
          `https://api.multiluzsolar.com.br/app1000/api/clientes/${cliente.IdCliente}` ||  `http://localhost:${port}/api/clientes/${cliente.IdCliente}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Caso de criação
        response = await axios.post(
         `https://api.multiluzsolar.com.br/app1000/api/clientes` ||  `http://localhost:${port}/api/clientes`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message || 'Operação realizada com sucesso.');

        if (!cliente && response.data.atividadeInicial) {
          setAtividadeInicial(response.data.atividadeInicial);
        }

        onClose();
      } else {
        const error = response.data.error;
        setErrorMessage(
          response.data.message ||
            'Erro ao salvar cliente.' +
              (error ? ` Detalhes: ${error}` : '')
        );
        toast.error(response.data.message || 'Erro ao salvar cliente.');
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      const backendError = error.response?.data?.error;
      setErrorMessage(
        error.response?.data?.message ||
          'Erro ao salvar cliente. Por favor, tente novamente.' +
            (backendError ? ` Detalhes: ${backendError}` : '')
      );
      toast.error(
        error.response?.data?.message ||
          'Erro ao salvar cliente. Por favor, tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Criar um portal para o modal
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-full transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-4 py-2">
          {errorMessage && (
            <div className="mb-2 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
          {/* Agrupando Campos em Linhas */}
          <div className="grid grid-cols-1 gap-2">
            {/* Nome e Email lado a lado em telas maiores */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Nome" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Nome*
                </label>
                <input
                  type="text"
                  name="Nome"
                  id="Nome"
                  placeholder="Nome"
                  value={formData.Nome}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-2 md:flex-1">
                <label htmlFor="Email" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="Email"
                  id="Email"
                  placeholder="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
            {/* Telefone e CEP lado a lado */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Telefone" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Telefone*
                </label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.Telefone}
                  onChange={handleChange}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      name="Telefone"
                      id="Telefone"
                      placeholder="(99) 99999-9999"
                      required
                      className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  )}
                </InputMask>
              </div>
              <div className="mb-2 md:flex-1">
                <label htmlFor="CEP" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  CEP*
                </label>
                <InputMask
                  mask="99999-999"
                  value={formData.CEP}
                  onChange={handleCepChange}
                  onBlur={handleCepChange}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      name="CEP"
                      id="CEP"
                      placeholder="00000-000"
                      required
                      className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                  )}
                </InputMask>
                {cepError && (
                  <div className="mt-1 text-red-500 text-xs">{cepError}</div>
                )}
              </div>
            </div>
            {/* Logradouro e Número lado a lado */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Logradouro" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Logradouro*
                </label>
                <input
                  type="text"
                  name="Logradouro"
                  id="Logradouro"
                  placeholder="Logradouro"
                  value={formData.Logradouro}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-2 md:w-1/4">
                <label htmlFor="Numero" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Número*
                </label>
                <input
                  type="text"
                  name="Numero"
                  id="Numero"
                  placeholder="Número"
                  value={formData.Numero}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
            {/* Bairro e Complemento lado a lado */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Bairro" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Bairro*
                </label>
                <input
                  type="text"
                  name="Bairro"
                  id="Bairro"
                  placeholder="Bairro"
                  value={formData.Bairro}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-2 md:flex-1">
                <label htmlFor="Complemento" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="Complemento"
                  id="Complemento"
                  placeholder="Complemento"
                  value={formData.Complemento}
                  onChange={handleChange}
                  
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
            {/* Cidade e Estado lado a lado */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Cidade" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Cidade*
                </label>
                <input
                  type="text"
                  name="Cidade"
                  id="Cidade"
                  placeholder="Cidade"
                  value={formData.Cidade}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-2 md:w-1/4">
                <label htmlFor="Estado" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Estado*
                </label>
                <input
                  type="text"
                  name="Estado"
                  id="Estado"
                  placeholder="UF"
                  value={formData.Estado}
                  onChange={handleChange}
                  required
                  maxLength={2}
                  className="w-full px-2 py-1 border rounded-md uppercase text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>
            {/* Valor Estimado e Temperatura lado a lado */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="Valor" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Valor Estimado*
                </label>
                <input
                  type="number"
                  name="Valor"
                  id="Valor"
                  placeholder="Valor estimado"
                  value={formData.Valor}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-2 md:flex-1">
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Temperatura*
                </label>
                <div className="flex space-x-2">
                  {['FRIO', 'MORNO', 'ON FIRE'].map((temp) => (
                    <label key={temp} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="Temperatura"
                        value={temp}
                        checked={formData.Temperatura === temp}
                        onChange={handleChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="text-sm">{temp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Campos Adicionais se Necessário */}
            {/* Por exemplo, se StatusGeralRelacionado, StatusRelacionado, NomeUsuario, UsuarioRelacionado devem ser enviados do frontend */}
            {/* Caso contrário, esses campos podem ser gerenciados no backend */}
          </div>

          {/* Exibir Atividade Inicial Criada */}
          {atividadeInicial && (
            <div className="mt-4 p-4 border border-green-300 bg-green-50 rounded-md">
              <h3 className="text-md font-semibold text-green-700">Atividade Inicial Criada</h3>
              <p><strong>Nome:</strong> {atividadeInicial.Nome}</p>
              <p><strong>Descrição:</strong> {atividadeInicial.Descricao}</p>
              <p><strong>Data de Início:</strong> {new Date(atividadeInicial.DateTimeInicio).toLocaleString()}</p>
              <p><strong>Previsão de Conclusão:</strong> {new Date(atividadeInicial.DateTimePrevisao).toLocaleString()}</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none transition-colors duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ClienteForm;
