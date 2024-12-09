  // src/components/Config/StatusList.jsx

  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import Modal from 'react-modal';
  import StatusForm from './StatusForm';
  import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

  const StatusList = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(null);
    const port = import.meta.env.REACT_APP_PORT || 1000; 

    // Função para buscar todos os Status
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/status` || `http://localhost:${port}/v1/api/status`);
        setStatuses(response.data);
      } catch (error) {
        console.error('Erro ao buscar Status:', error);
        alert('Falha ao buscar Status.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchStatuses();
    }, []);

    // Função para deletar um Status
    const handleDeleteStatus = async (IdStatus) => {
      if (window.confirm('Tem certeza que deseja deletar este Status?')) {
        try {
          await axios.delete(`https://api.multiluzsolar.com.br/app1000/api/api/status/${IdStatus}` || `http://localhost:5000/api/api/status/${IdStatus}`);
          alert('Status deletado com sucesso!');
          setStatuses(statuses.filter(status => status.IdStatus !== IdStatus));
        } catch (error) {
          console.error('Erro ao deletar Status:', error);
          alert('Falha ao deletar Status.');
        }
      }
    };

    // Função para abrir o modal de adicionar ou editar Status
    const openModal = (status = null) => {
      setCurrentStatus(status);
      setIsModalOpen(true);
    };

    // Função para fechar o modal
    const closeModal = () => {
      setIsModalOpen(false);
      setCurrentStatus(null);
    };

    // Função para atualizar a lista após criar ou editar um Status
    const updateStatusList = (status) => {
      if (currentStatus) {
        // Edição
        setStatuses(statuses.map(s => s.IdStatus === status.IdStatus ? status : s));
      } else {
        // Criação
        setStatuses([...statuses, status]);
      }
      closeModal();
    };

    // Função para agrupar os status por StatusGeral
    const groupByStatusGeral = (statuses) => {
      return statuses.reduce((groups, status) => {
        const { StatusGeral } = status;
        if (!groups[StatusGeral]) {
          groups[StatusGeral] = [];
        }
        groups[StatusGeral].push(status);
        return groups;
      }, {});
    };

    const groupedStatuses = groupByStatusGeral(statuses);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p>Carregando Status...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-base-200 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Lista de Status</h2>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            Adicionar Status
          </button>
        </div>
        {statuses.length === 0 ? (
          <div className="alert alert-info shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <span>Nenhum Status cadastrado.</span>
          </div>
        ) : (
          Object.entries(groupedStatuses).map(([statusGeral, statusGroup]) => (
            <div key={statusGeral} className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">{statusGeral}</h3>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Número do Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusGroup.map((status) => (
                      <tr key={status.IdStatus}>
                        <td>{status.Status}</td>
                        <td>{status.StatusNum}</td>
                        <td>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(status)}
                              className="btn btn-sm btn-warning flex items-center"
                            >
                              <FaEdit className="mr-1" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteStatus(status.IdStatus)}
                              className="btn btn-sm btn-error flex items-center"
                            >
                              <FaTrash className="mr-1" />
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* Modal para Adicionar/Editar Status */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel={currentStatus ? "Editar Status" : "Adicionar Status"}
          className="bg-base-100 p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-20 overflow-auto max-h-screen"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
        >
          <StatusForm
            existingStatus={currentStatus}
            onSuccess={updateStatusList}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    );
  };

  export default StatusList;
