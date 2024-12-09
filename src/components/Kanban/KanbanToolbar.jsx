// frontend/src/components/Kanban/KanbanToolbar.jsx

import React from 'react';
import './Kanban.css'; // Importando os estilos

const KanbanToolbar = ({
  statusGeralList,
  selectedStatusGeral,
  setSelectedStatusGeral,
  searchTerm,
  setSearchTerm,
  handleOpenForm,
}) => {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      {/* Dropdown para selecionar StatusGeral */}
      <select
        value={selectedStatusGeral}
        onChange={(e) => setSelectedStatusGeral(e.target.value)}
        className="p-2 border border-gray-300 rounded truncate-dropdown"
      >
        <option value="">Selecione um Funil</option>
        {statusGeralList.map((statusGeral) => (
          <option key={statusGeral} value={statusGeral} className="truncate-dropdown-option">
            {statusGeral}
          </option>
        ))}
      </select>

      {/* Campo de busca */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar clientes..."
        className="p-2 border border-gray-300 rounded w-1/3"
      />

      {/* Botão para abrir o formulário modal */}
      <button
        onClick={handleOpenForm}
        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Novo Cliente
      </button>
    </div>
  );
};

export default KanbanToolbar;
