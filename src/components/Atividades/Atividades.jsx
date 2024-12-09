// src/components/Atividades/Atividades.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { FaPlus, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import AtividadeForm from './AtividadeForm';
import ConcluirAtividadeForm from './ConcluirAtividadeForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parseISO, format } from 'date-fns';
import AtividadeEditForm from './AtividadeEditForm';

// Definição das constantes de status
const STATUS_TODAS = 'Todas';
const STATUS_ABERTA = 'Aberta';
const STATUS_CONCLUIDA = 'Concluída'; // Com acento
const port = import.meta.env.REACT_APP_PORT || 1000; 

const Atividades = ({ clienteId, onActivityChange }) => {
  const { auth } = useContext(AuthContext); // Acessa o contexto de autenticação

  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  
  const [editingAtividade, setEditingAtividade] = useState(null);

  const [filterStatus, setFilterStatus] = useState(STATUS_TODAS); // "Todas", "Aberta", "Concluída"

  // Estado para gerenciar o modal de conclusão
  const [atividadeConcluir, setAtividadeConcluir] = useState(null);

  // Função para buscar atividades
  const fetchAtividades = async () => {
    setLoading(true);
    setError('');
    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.get(
        `https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${clienteId}/atividades` || `http://localhost:${port}/v1/api/clientes/${clienteId}/atividades`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAtividades(response.data.atividades);
        console.log('Atividades recebidas:', response.data.atividades); // Para depuração
      } else {
        setError(response.data.message || 'Erro ao buscar atividades.');
        toast.error(response.data.message || 'Erro ao buscar atividades.');
      }
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erro ao buscar atividades.');
        toast.error(err.response?.data?.message || 'Erro ao buscar atividades.');
      } else {
        setError('Erro desconhecido.');
        toast.error('Erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchAtividades();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  // Função para adicionar uma nova atividade
  const handleAddAtividade = () => {
    setEditingAtividade(null);
    setShowForm(true);
  };

  // Função para editar uma atividade existente
  const handleEditAtividade = (atividade) => {
    setEditingAtividade(atividade);
    setShowFormEdit(true);
  };

  // Função para abrir o modal de conclusão
  const handleConcluirAtividadeClick = (atividade) => {
    setAtividadeConcluir(atividade);
  };

  // Função para concluir atividade (callback após sucesso)
  const handleConcluirAtividadeSuccess = (atividadeAtualizada) => {
    // Atualizar a lista de atividades com a atividade concluída
    const novasAtividades = atividades.map((a) =>
      a.IdAtividade === atividadeAtualizada.IdAtividade ? atividadeAtualizada : a
    );
    setAtividades(novasAtividades);

    // Notificar ClienteDetalhes.jsx para recarregar o histórico
    if (onActivityChange) {
      onActivityChange();
    }
  };

  // Função para reabrir uma atividade concluída (opcional)
  const handleReabrirAtividade = async (atividadeId) => {
    if (!window.confirm('Tem certeza que deseja reabrir esta atividade?')) return;

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      // Atualizar o status da atividade para "Aberta" e remover DescricaoConclusao
      const response = await axios.put(
        `https://api.multiluzsolar.com.br/app1000/api/atividades/${atividadeId}/reabrir` || `http://localhost:${port}/api/atividades/${atividadeId}/reabrir`, // Supondo que exista essa rota
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Atividade reaberta com sucesso.');
        await fetchAtividades();
        if (onActivityChange) onActivityChange();
      } else {
        toast.error(response.data.message || 'Erro ao reabrir atividade.');
      }
    } catch (err) {
      console.error('Erro ao reabrir atividade:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Erro ao reabrir atividade.');
      } else {
        toast.error('Erro desconhecido.');
      }
    }
  };

  // Função para fechar o formulário modal
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAtividade(null);
    setShowFormEdit(false);
  };

  // Função para submissão do formulário de criação
  const handleSubmitFormAdd = async () => {
    console.log('Submetendo formulário de criação');
    await fetchAtividades();
    if (onActivityChange) onActivityChange();
    setShowForm(false); // Fecha o modal de criação
  };

  // Função para submissão do formulário de edição
  const handleSubmitFormEdit = async () => {
    console.log('Submetendo formulário de edição');
    await fetchAtividades();
    if (onActivityChange) onActivityChange();
    setShowFormEdit(false); // Fecha o modal de edição
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg shadow mb-6">
        <p className="text-center text-gray-700 dark:text-gray-200">Carregando atividades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-800 rounded-lg shadow mb-6">
        <p className="text-center text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  // Filtrar e ordenar atividades com base no status e na data de início
  const atividadesFiltradas = atividades
    .filter((atividade) => {
      if (filterStatus === STATUS_TODAS) return true;
      return atividade.StatusAtividade === filterStatus;
    })
    .sort((a, b) => new Date(b.DateTimeInicio) - new Date(a.DateTimeInicio)); // Ordena do mais recente para o mais antigo

  const formatarDataSegura = (dateInput) => {
    let dateString = dateInput;
  
    // Se dateInput for um objeto com a chave 'value', extraia a string
    if (typeof dateInput === 'object' && dateInput !== null && 'value' in dateInput) {
      console.warn('Campo de data é um objeto com chave "value":', dateInput);
      dateString = dateInput.value;
    }
  
    if (!dateString) {
      return '---'; // Retorna um placeholder se a data for null ou undefined
    }
  
    if (typeof dateString !== 'string') {
      console.warn('Campo de data não é uma string após extração:', dateString);
      return 'Data inválida';
    }
  
    try {
      const parsedDate = parseISO(dateString);
      if (isNaN(parsedDate)) {
        throw new Error('Data inválida após parseISO');
      }
      return format(parsedDate, 'dd/MM/yyyy HH:mm:ss');
    } catch (error) {
      console.error('Erro ao formatar a data:', dateString, error);
      return 'Data inválida';
    }
  };
  
  return (
    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg shadow mb-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Atividades</h2>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setFilterStatus(STATUS_TODAS)}
            className={`px-3 py-1 rounded-md ${
              filterStatus === STATUS_TODAS
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            } transition duration-200`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus(STATUS_ABERTA)}
            className={`px-3 py-1 rounded-md ${
              filterStatus === STATUS_ABERTA
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            } transition duration-200`}
          >
            Abertas
          </button>
          <button
            onClick={() => setFilterStatus(STATUS_CONCLUIDA)}
            className={`px-3 py-1 rounded-md ${
              filterStatus === STATUS_CONCLUIDA
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            } transition duration-200`}
          >
            Concluídas
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Total de Atividades:</strong> {atividades.length}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Ativas:</strong> {atividades.filter(a => a.StatusAtividade === STATUS_ABERTA).length}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Concluídas:</strong> {atividades.filter(a => a.StatusAtividade === STATUS_CONCLUIDA).length}
          </p>
        </div>
        <button
          onClick={handleAddAtividade}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          <FaPlus className="mr-2" />
          Nova Atividade
        </button>
      </div>

      {atividadesFiltradas.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Contêiner com altura fixa e rolagem vertical */}
          <div className="max-h-60 overflow-y-auto"> {/* Ajuste 'max-h-60' conforme necessário */}
            <table className="min-w-full bg-white dark:bg-slate-800 rounded-lg shadow">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Nome</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Descrição</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Início</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Previsão</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Conclusão</th>
                  <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Descrição da Conclusão</th> {/* Nova Coluna */}
                  <th className="py-2 px-4 border-b text-center text-gray-700 dark:text-gray-300">Status</th>
                  <th className="py-2 px-4 border-b text-center text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {atividadesFiltradas.map((atividade) => (
                  <tr key={atividade.IdAtividade} className="hover:bg-gray-100 dark:hover:bg-slate-700 transition duration-200">
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">{atividade.Nome}</td>
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">{atividade.Descricao}</td>
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">
                      {atividade.DateTimeInicio ? 
                        formatarDataSegura(atividade.DateTimeInicio) 
                        : '---'}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">
                      {atividade.DateTimePrevisao ? 
                        formatarDataSegura(atividade.DateTimePrevisao) 
                        : '---'}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">
                      {atividade.DateTimeConclusao
                        ? formatarDataSegura(atividade.DateTimeConclusao)
                        : '---'}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">
                      {atividade.StatusAtividade === STATUS_CONCLUIDA && atividade.DescricaoConclusao
                        ? atividade.DescricaoConclusao
                        : '---'}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {atividade.StatusAtividade === STATUS_CONCLUIDA ? (
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                          Concluída
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                          Aberta
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {atividade.StatusAtividade === STATUS_ABERTA && (
                        <button
                          onClick={() => handleConcluirAtividadeClick(atividade)}
                          className="text-green-500 hover:text-green-700 mr-2"
                          title="Concluir Atividade"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {atividade.StatusAtividade !== STATUS_CONCLUIDA && (
                        <>
                          <button
                            onClick={() => handleEditAtividade(atividade)}
                            className="text-yellow-500 hover:text-yellow-700 mr-2"
                            title="Editar Atividade"
                          >
                            <FaEdit />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">Nenhuma atividade encontrada.</p>
      )}

      {/* Formulário Modal para Criação de Atividades */}
      {showForm && (
        <AtividadeForm
          clienteId={clienteId}
          atividade={editingAtividade}
          onClose={handleCloseForm}
          onSubmit={handleSubmitFormAdd} // Usando a função de criação
        />
      )}

      {/* Formulário Modal para Edição de Atividades */}
      {showFormEdit && (
        <AtividadeEditForm
          clienteId={clienteId}
          atividade={editingAtividade}
          onClose={handleCloseForm}
          onSubmit={handleSubmitFormEdit} // Usando a função de edição
        />
      )}

      {/* Modal para Concluir Atividade */}
      {atividadeConcluir && (
        <ConcluirAtividadeForm
          atividade={atividadeConcluir}
          onClose={() => setAtividadeConcluir(null)}
          onConcluida={handleConcluirAtividadeSuccess}
        />
      )}
    </div>
  );
};

export default Atividades;
