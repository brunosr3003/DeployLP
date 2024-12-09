// frontend/src/components/Kanban/KanbanCard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import StatusGeralForm from './StatusGeralForm';
import { toast } from 'react-toastify';

const KanbanCard = ({ cliente, index, isProcessing, onUpdateStatusGeral, statusGeralList, usuarios }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const handleCardClick = () => {
    if (!isProcessing && !showForm) {
      navigate(`/visualizacao/${cliente.IdCliente}`);
    }
  };

  const handleOpenForm = (event) => {
    event.stopPropagation(); // Evita que o clique no botão também acione o clique no cartão
    console.log('Abrindo o modal de StatusGeralForm'); // Log para depuração
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  // Função helper para formatar a data e hora
  const formatarDataHora = (dataISO) => {
    if (!dataISO) return 'Não disponível';

    const dateObj = new Date(dataISO);

    // Verificar se a data é válida
    if (isNaN(dateObj)) return 'Data inválida';

    // Formatar a data e hora no fuso horário de Brasília em formato numérico
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Formato 24 horas
      timeZone: 'America/Sao_Paulo', // Define o fuso horário para Brasília
    });

    return formatter.format(dateObj);
  };

  const dataHoraFormatada = formatarDataHora(cliente.Data);

  return (
    <Draggable draggableId={cliente.IdCliente.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={`p-2 mb-2 bg-white dark:bg-gray-800 rounded shadow cursor-pointer relative transition-colors 
            ${snapshot.isDragging ? 'bg-blue-100' : ''} 
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            fixed-card`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
        >
          {/* Detalhes do cliente */}
          <p className="font-semibold text-gray-900 dark:text-white truncate w-full card-title" title={cliente.Nome}>
            <strong>Nome: </strong>{cliente.Nome}
          </p>
          <p className="text-gray-700 dark:text-gray-300 truncate w-full" title={cliente.Telefone}>
            <strong>Telefone: </strong> {cliente.Telefone}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full" title={cliente.Email}>
            <strong>E-mail:</strong> {cliente.Email}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full" title={cliente.Endereco}>
            <strong>Endereço: </strong>{cliente.Endereco}
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full" title={dataHoraFormatada}>
            <strong>Data e Hora:</strong> {dataHoraFormatada}
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full" title={usuarios[cliente.UsuarioRelacionado] || 'Desconhecido'}>
            <strong>Responsável:</strong> {usuarios[cliente.UsuarioRelacionado] || 'Desconhecido'}
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full card-value" title={`R$ ${cliente.Valor?.toFixed(2) || 'Não disponível'}`}>
            <strong>Valor:</strong> R$ {cliente.Valor?.toFixed(2) || 'Não disponível'}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-full">
            <span
              className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded ${
                cliente.Temperatura === 'FRIO' ? 'bg-blue-200 text-blue-800' :
                cliente.Temperatura === 'MORNO' ? 'bg-yellow-500 text-yellow-900' :
                cliente.Temperatura === 'ON FIRE' ? 'bg-red-500 text-yellow-900' :
                'bg-red-200 text-red-800'
              }`}
              title={cliente.Temperatura}
            >
              {cliente.Temperatura}
            </span>
          </p>

          {showForm && (
            <>
              {console.log('statusGeralList passed to StatusGeralForm:', statusGeralList)}
              <StatusGeralForm
                clienteId={cliente.IdCliente}
                currentStatusId={cliente.StatusRelacionado}
                statusGeralList={statusGeralList}
                onClose={handleCloseForm}
                onUpdate={onUpdateStatusGeral}
              />
            </>
          )}

          {/* Indicador de processamento */}
          {isProcessing && (
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center rounded">
              <span className="text-xs text-gray-500 dark:text-gray-300">Atualizando...</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};  

export default KanbanCard;
