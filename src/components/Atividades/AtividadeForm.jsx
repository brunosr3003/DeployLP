// src/components/Atividades/AtividadeForm.jsx

import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';


const port = import.meta.env.REACT_APP_PORT || 1000; 
/**
 * Função para formatar a data para o input datetime-local
 * Converte 'YYYY-MM-DD HH:MM:SS' ou outros formatos reconhecidos para 'YYYY-MM-DDTHH:MM'
 */
const formatarDataInput = (dateTime) => {
  if (!dateTime || typeof dateTime !== 'string') return '';
  
  // Tenta criar um objeto Date
  const date = new Date(dateTime);
  
  if (isNaN(date)) {
    console.warn('Data inválida recebida:', dateTime);
    return '';
  }
  
  // Obtém componentes da data
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses são indexados de 0
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AtividadeForm = ({ clienteId, atividade = null, onClose, onSubmit }) => {
  const { auth } = useContext(AuthContext);
  const [padraoAtividades, setPadraoAtividades] = useState([]);
  const [selectedPadraoAtividade, setSelectedPadraoAtividade] = useState('');
  
  // Inicialização do estado formData
  const [formData, setFormData] = useState({
    Descricao: atividade ? atividade.Descricao : '',
    Nome: atividade ? atividade.Nome : '',
    DateTimeInicio: atividade ? formatarDataInput(atividade.DateTimeInicio) : '',
    DateTimePrevisao: atividade ? formatarDataInput(atividade.DateTimePrevisao) : '',
    DateTimeConclusao: atividade && atividade.DateTimeConclusao ? atividade.DateTimeConclusao : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Definir DateTimeInicio automaticamente ao criar uma nova atividade
  useEffect(() => {
    if (!atividade) {
      const now = new Date();
      const formattedNow = now.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'
      setFormData((prevData) => ({
        ...prevData,
        DateTimeInicio: formattedNow,
      }));
    }
  }, [atividade]);

  // Buscar atividades pré-definidas ao montar o componente
  useEffect(() => {
    const fetchPadraoAtividades = async () => {
      try {
        const token = auth.token;
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/padraoatividades` || `http://localhost:${port}/v1/api/padraoatividades`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setPadraoAtividades(response.data.padraoAtividades);
        } else {
          toast.error(response.data.message || 'Erro ao carregar atividades pré-definidas.');
        }
      } catch (err) {
        console.error('Erro ao buscar atividades pré-definidas:', err);
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message || 'Erro ao carregar atividades pré-definidas.');
        } else {
          toast.error('Erro desconhecido.');
        }
      }
    };

    fetchPadraoAtividades();
  }, [auth.token]);

  // Atualizar Nome e Descricao com base na seleção
  useEffect(() => {
    if (selectedPadraoAtividade !== 'Outra Atividade') {
      const atividadeSelecionada = padraoAtividades.find(
        (atividade) => atividade.Nome === selectedPadraoAtividade
      );

      if (atividadeSelecionada) {
        setFormData((prevData) => ({
          ...prevData,
          Nome: atividadeSelecionada.Nome,
          Descricao: atividadeSelecionada.Descricao,
        }));
      }
    } else {
      // Limpar os campos se "Outra Atividade" for selecionada
      setFormData((prevData) => ({
        ...prevData,
        Nome: '',
        Descricao: '',
      }));
    }
  }, [selectedPadraoAtividade, padraoAtividades]);

  // Função para lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Validações básicas
    if (!formData.Descricao.trim() || !formData.Nome.trim()) {
      setErrorMessage('Descrição e Nome são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.DateTimeInicio || !formData.DateTimePrevisao) {
      setErrorMessage('Data e hora de início e previsão são obrigatórias.');
      setIsSubmitting(false);
      return;
    }

    // Verificar se DateTimePrevisao é maior que DateTimeInicio
    if (new Date(formData.DateTimePrevisao) < new Date(formData.DateTimeInicio)) {
      setErrorMessage('Data e hora de previsão devem ser posteriores à data e hora de início.');
      setIsSubmitting(false);
      return;
    }

    // **Conversão do formato da data**
    const formatarDataParaBigQuery = (dateTime) => {
      if (!dateTime || typeof dateTime !== 'string') return null;
      return dateTime.replace('T', ' ') + ':00'; // Adiciona segundos
    };

    // Formatar as datas
    const dataToSend = {
      ClienteRelacionado: clienteId,
      Descricao: formData.Descricao,
      Nome: formData.Nome,
      DateTimeInicio: formatarDataParaBigQuery(formData.DateTimeInicio),
      DateTimePrevisao: formatarDataParaBigQuery(formData.DateTimePrevisao),
      DateTimeConclusao: formData.DateTimeConclusao || null,
    };

    console.log('Dados a serem enviados:', dataToSend);

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      let response;
      if (atividade) {
        // Edição de atividade
        response = await axios.put(
         `https://api.multiluzsolar.com.br/app1000/v1/api/atividades/${atividade.IdAtividade}` || `http://localhost:${port}/v1/api/atividades/${atividade.IdAtividade}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Criação de nova atividade
        response = await axios.post(
          `https://api.multiluzsolar.com.br/app1000/v1/api/atividades` || `http://localhost:${port}/v1/api/atividades`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message || 'Operação realizada com sucesso.');
        onSubmit();
      } else {
        setErrorMessage(response.data.message || 'Erro ao realizar a operação.');
        toast.error(response.data.message || 'Erro ao realizar a operação.');
      }
    } catch (err) {
      console.error('Erro ao salvar atividade:', err);
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message || 'Erro ao salvar atividade.');
        toast.error(err.response?.data?.message || 'Erro ao salvar atividade.');
      } else {
        setErrorMessage('Erro desconhecido.');
        toast.error('Erro desconhecido.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar o modal ao pressionar Esc
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Função para fechar o modal ao clicar fora
  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-overlay') {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      id="modal-overlay"
      onClick={handleClickOutside}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-y-auto max-h-full transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {atividade ? 'Editar Atividade' : 'Nova Atividade'}
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
          <div className="grid grid-cols-1 gap-4">

            {/* Seleção de Atividade Pré-definida */}
            <div>
              <label htmlFor="PadraoAtividade" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                Selecionar Atividade Pré-definida
              </label>
              <select
                id="PadraoAtividade"
                name="PadraoAtividade"
                value={selectedPadraoAtividade}
                onChange={(e) => setSelectedPadraoAtividade(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                <option value="">-- Selecione uma atividade --</option>
                {padraoAtividades.map((padrao) => (
                  <option key={padrao.Nome} value={padrao.Nome}>
                    {padrao.Nome}
                  </option>
                ))}
                <option value="Outra Atividade">Outra Atividade</option>
              </select>
            </div>

            {/* Campo Nome */}
            <div>
              <label htmlFor="Nome" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                Nome
              </label>
              <input
                type="text"
                id="Nome"
                name="Nome"
                value={formData.Nome}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${selectedPadraoAtividade !== 'Outra Atividade' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={selectedPadraoAtividade !== 'Outra Atividade'}
              />
            </div>

            {/* Campo Descrição */}
            <div>
              <label htmlFor="Descricao" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                Descrição
              </label>
              <textarea
                id="Descricao"
                name="Descricao"
                value={formData.Descricao}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${selectedPadraoAtividade !== 'Outra Atividade' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={selectedPadraoAtividade !== 'Outra Atividade'}
              ></textarea>
            </div>

            {/* Data e Hora de Início */}
            <div className="md:flex md:space-x-2">
              <div className="mb-2 md:flex-1">
                <label htmlFor="DateTimeInicio" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Data e Hora de Início (Automático)
                </label>
                <input
                  type="datetime-local"
                  id="DateTimeInicio"
                  name="DateTimeInicio"
                  value={formData.DateTimeInicio}
                  disabled // Torna o campo não editável
                  className="w-full px-3 py-2 border rounded-md text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
              </div>
              <div className="mb-2 md:flex-1">
                <label htmlFor="DateTimePrevisao" className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                  Data e Hora de Previsão
                </label>
                <input
                  type="datetime-local"
                  id="DateTimePrevisao"
                  name="DateTimePrevisao"
                  value={formData.DateTimePrevisao}
                  onChange={handleChange}
                  required
                  step="1" // Permite segundos
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>

          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end mt-4">
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
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition duration-200 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') // Certifique-se de ter um elemento com id 'modal-root' no seu index.html
  );
};

export default AtividadeForm;
