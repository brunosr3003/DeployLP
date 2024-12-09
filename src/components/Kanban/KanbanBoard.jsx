// frontend/src/components/Kanban/KanbanBoard.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanToolbar from './KanbanToolbar';
import KanbanColumn from './KanbanColumn';
import ClienteForm from '../Clientes/ClienteForm';
import { toast } from 'react-toastify';
import { AuthContext } from '../../AuthContext';

const KanbanBoard = () => {
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  const { auth } = useContext(AuthContext);
  const [statusGeralList, setStatusGeralList] = useState([]);
  const [selectedStatusGeral, setSelectedStatusGeral] = useState(() => {
    return localStorage.getItem('selectedStatusGeral') || '';
  });
  const [kanbanData, setKanbanData] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingClientes, setProcessingClientes] = useState([]);
  const [usuarios, setUsuarios] = useState({}); // Estado para armazenar mapeamento de usuários

  const handleOpenForm = () => setIsModalOpen(true);
  const handleCloseForm = () => {
    setIsModalOpen(false);
    fetchKanbanData(selectedStatusGeral);
  };

  /**
   * Função para buscar os StatusGeral (Funis)
   */
  const fetchStatusGeral = async () => {
    try {
      const response = await axios.get( `https://api.multiluzsolar.com.br/app1000/v1/api/statusgerais` || `http://localhost:${port}/v1/api/statusgerais`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.success) {
        setStatusGeralList(response.data.statusGeral);
        console.log('statusGeralList fetched:', response.data.statusGeral); // Log para depuração
      }
    } catch (err) {
      setError('Erro ao carregar funis.');
    }
  };

  /**
   * Função para buscar os dados do Kanban baseado no StatusGeral selecionado
   */
  const fetchKanbanData = async (statusGeral) => {
    if (!statusGeral) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.multiluzsolar.com.br/app1000/v1/api/kanban/${encodeURIComponent(statusGeral)}` ||  `http://localhost:${port}/v1/api/kanban/${encodeURIComponent(statusGeral)}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (response.data.success) {
        const initializedKanban = {};
        response.data.statuses.forEach((status) => {
          initializedKanban[status.IdStatus] = response.data.kanban[status.IdStatus] || [];
        });

        setKanbanData(initializedKanban);
        setStatuses(response.data.statuses);

        // Log de depuração
        console.log("Kanban Data Atualizado:", initializedKanban);
      } else {
        setError(response.data.message || 'Erro ao carregar dados do Kanban.');
      }
    } catch (err) {
      setError('Erro ao carregar dados do Kanban.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para buscar os usuários e criar um mapeamento ID -> Nome
   */
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/usuarios` ||  `http://localhost:${port}/v1/api/usuarios`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (response.data.success) {
        const usuariosMap = {};
        response.data.usuarios.forEach((usuario) => {
          usuariosMap[usuario.IdUsuario] = usuario.Nome;
        });
        setUsuarios(usuariosMap);
        console.log('Usuários mapeados:', usuariosMap); // Log para depuração
      } else {
        setError(response.data.message || 'Erro ao carregar usuários.');
      }
    } catch (err) {
      setError('Erro ao carregar usuários.');
    }
  };

  useEffect(() => {
    fetchStatusGeral();
    fetchUsuarios(); // Chamar para obter os usuários
  }, []);

  useEffect(() => {
    if (selectedStatusGeral) {
      fetchKanbanData(selectedStatusGeral);
    }
  }, [selectedStatusGeral]);

  useEffect(() => {
    if (selectedStatusGeral) {
      localStorage.setItem('selectedStatusGeral', selectedStatusGeral);
    }
  }, [selectedStatusGeral]);

  /**
   * Função chamada ao finalizar o drag and drop
   */
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const clienteId = draggableId;
    const newStatusId = destination.droppableId;
    const previousStatusId = source.droppableId;
    const token = auth.token;

    if (!clienteId) {
      toast.error('Erro: ID do cliente não fornecido.');
      return;
    }

    // Encontre o cliente no status anterior
    const cliente = kanbanData[previousStatusId].find(c => c.IdCliente === clienteId);
    if (!cliente) {
      toast.error('Cliente não encontrado.');
      return;
    }

    // Remover o cliente do status anterior visualmente
    setKanbanData((prevKanban) => {
      const newKanban = { ...prevKanban };
      newKanban[previousStatusId] = newKanban[previousStatusId].filter(c => c.IdCliente !== clienteId);
      return newKanban;
    });

    // Adicionar o cliente no novo status visualmente
    setKanbanData((prevKanban) => {
      const newKanban = { ...prevKanban };
      if (!Array.isArray(newKanban[newStatusId])) newKanban[newStatusId] = [];
      newKanban[newStatusId].splice(destination.index, 0, cliente);
      return newKanban;
    });

    // Adicione o cliente à lista de processamento
    setProcessingClientes((prev) => [...prev, clienteId]);

    try {
      const response = await axios.put(
        `https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${clienteId}/status` ||  `http://localhost:${port}/v1/api/clientes/${clienteId}/status`,
        { status: newStatusId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Resposta do Backend (onDragEnd):', response.data);

      if (!response.data.success) {
        toast.error(response.data.message || 'Erro ao mover cliente para outro status.');

        // Reverter a mudança visualmente
        setKanbanData((prevKanban) => {
          const newKanban = { ...prevKanban };
          // Remover do novo status
          newKanban[newStatusId] = newKanban[newStatusId].filter(c => c.IdCliente !== clienteId);
          // Adicionar de volta ao status anterior
          if (!Array.isArray(newKanban[previousStatusId])) newKanban[previousStatusId] = [];
          newKanban[previousStatusId].splice(source.index, 0, cliente);
          return newKanban;
        });
      } else {
        toast.success(response.data.message);
        const updatedCliente = response.data.cliente;

        setKanbanData((prevKanban) => {
          const newKanban = { ...prevKanban };
          // Atualizar o cliente no novo status com os dados atualizados
          newKanban[newStatusId] = newKanban[newStatusId].map(c =>
            c.IdCliente === clienteId ? updatedCliente : c
          );
          return newKanban;
        });
      }
    } catch (err) {
      console.error('Erro ao mover cliente:', err);
      // Reverter a mudança visualmente
      setKanbanData((prevKanban) => {
        const newKanban = { ...prevKanban };
        // Remover do novo status
        newKanban[newStatusId] = newKanban[newStatusId].filter(c => c.IdCliente !== clienteId);
        // Adicionar de volta ao status anterior
        newKanban[previousStatusId].splice(source.index, 0, cliente);
        return newKanban;
      });
      toast.error('Erro ao mover cliente para outro status. Usuario Precisa Concluir Atividade');
    } finally {
      // Remover o cliente da lista de processamento
      setProcessingClientes((prev) => prev.filter((id) => id !== clienteId));
    }
  };

  /**
   * Função para filtrar os clientes com base no termo de busca
   */
  const filterClientes = (clients) => {
    if (!searchTerm.trim()) return clients;
    const lowerCaseTerm = searchTerm.toLowerCase();
    return clients.filter(
      (cliente) =>
        cliente.Nome.toLowerCase().includes(lowerCaseTerm) ||
        cliente.Email.toLowerCase().includes(lowerCaseTerm) ||
        cliente.Telefone.includes(lowerCaseTerm)
    );
  };

  /**
   * Função para atualizar o StatusGeralRelacionado e StatusRelacionado de um cliente
   */
  const onUpdateStatusGeral = async (clienteId, updatedFields) => {
    const token = auth.token;
    try {
      const response = await axios.put(
       `https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${clienteId}/statusgeral` || `http://localhost:${port}/v1/api/clientes/${clienteId}/statusgeral`,
        { statusGeral: updatedFields.statusGeral }, // Envie o campo correto
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Resposta do Backend (onUpdateStatusGeral):', response.data);
  
      if (response.data.success) {
        toast.success('Status Geral atualizado com sucesso!');
        // Atualize o Kanban ou o estado conforme necessário
        fetchKanbanData(selectedStatusGeral);
      } else {
        toast.error('Erro ao atualizar Status Geral do cliente.');
      }
    } catch (error) {
      console.error('Erro ao atualizar Status Geral:', error);
      toast.error('Erro ao atualizar Status Geral do cliente. Precisa Concluir Atividade do Cliente');
    }
  };

  /**
   * Ordenar os statuses com base no StatusNum
   */
  const sortedStatuses = [...statuses].sort((a, b) => a.StatusNum - b.StatusNum);

  return (
    <div className="flex flex-col h-full">
      <KanbanToolbar
        statusGeralList={statusGeralList}
        selectedStatusGeral={selectedStatusGeral}
        setSelectedStatusGeral={setSelectedStatusGeral}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleOpenForm={handleOpenForm} // Passando a função para o toolbar
      />

      {loading ? (
        <div className="text-center mt-4">Carregando...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto mt-4 pb-4">
            {sortedStatuses.map((status) => {
              const statusId = status.IdStatus;
              const clients = kanbanData[statusId] || [];
              const filteredClientes = filterClientes(clients);

              return (
                <KanbanColumn
                  key={statusId}
                  title={`${status.StatusNum} - ${status.Status}`}
                  statusId={statusId}
                  cards={filteredClientes}
                  processingClientes={processingClientes}
                  onUpdateStatusGeral={onUpdateStatusGeral}
                  statusGeralList={statusGeralList} // Passar a lista para o KanbanColumn
                  usuarios={usuarios} // Passar os usuários para o KanbanColumn
                />
              );
            })}
          </div>
        </DragDropContext>
      )}

      {isModalOpen && <ClienteForm onClose={handleCloseForm} />}
    </div>
  );
};

export default KanbanBoard;
