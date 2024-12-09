// src/pages/HomeUser.jsx

import React, { useState } from 'react';
import Navbar2 from '../components/navbar/Navbar2';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import ClienteForm from '../components/Clientes/ClienteForm';

const HomeUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenForm = () => {
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <Navbar2 />
      <div className="flex-1 p-6">


        {/* Exibir Kanban Board */}
        <KanbanBoard />

        {/* Formulário de Cliente como Modal */}
        {isModalOpen && <ClienteForm onClose={handleCloseForm} />}
      </div>
    </div>
  );
};

export default HomeUser;
