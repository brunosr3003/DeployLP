// frontend/src/components/Kanban/KanbanColumn.jsx

import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';
import './Kanban.css'; // Importando os estilos

const KanbanColumn = ({ title, statusId, cards, processingClientes, onUpdateStatusGeral, statusGeralList, usuarios }) => {
  console.log(`KanbanColumn [${statusId}]:`, cards); // Log para depuração

  // Calcular a soma dos valores dos cards
  const totalValor = cards.reduce((sum, cliente) => sum + (parseFloat(cliente.Valor) || 0), 0);

  return (
    <div className="flex flex-col w-80 bg-gray-200 rounded-md p-4">
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        <span className="truncate" title={title}>
          {title}
        </span>
        {/* Exibir a soma dos valores no título da coluna */}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate total-value" title={`R$ ${totalValor.toFixed(2)}`}>
          R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </h2>
      <Droppable droppableId={statusId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col space-y-2 min-h-[100px]"
          >
            {cards.map((cliente, index) => (
              <KanbanCard
                key={cliente.IdCliente}
                cliente={cliente}
                index={index}
                isProcessing={processingClientes.includes(cliente.IdCliente)}
                onUpdateStatusGeral={onUpdateStatusGeral}
                statusGeralList={statusGeralList} // Passar a lista para o KanbanCard
                usuarios={usuarios} // Passar os usuários para o KanbanCard
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {/* Opcional: Exibir a soma no rodapé da coluna */}
      {/* 
      <div className="mt-4">
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Total: R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      */}
    </div>
  );
};

export default KanbanColumn;
