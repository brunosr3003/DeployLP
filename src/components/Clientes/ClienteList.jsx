// src/components/Clientes/ClienteList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClienteForm from './ClienteForm';

const ClienteList = () => {

  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);

  const fetchClientes = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/clientes` || `http://localhost:${port}/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setClientes(response.data.clientes);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      alert('Erro ao buscar clientes.');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenModal = (cliente = null) => {
    setClienteEditar(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClienteEditar(null);
    fetchClientes();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Lista de Clientes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Nome</th>
         
              <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Telefone</th>
              <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Endereço</th>
              <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.IdCliente} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">{cliente.Nome}</td>
              
                  <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">{cliente.Telefone}</td>
                  <td className="py-2 px-4 border-b text-gray-700 dark:text-gray-200">{cliente.Endereco}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleOpenModal(cliente)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mr-2 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    {/* Você pode adicionar mais ações, como excluir */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-4 px-4 text-center text-gray-500" colSpan="5">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulário de Cliente como Modal */}
      {isModalOpen && <ClienteForm cliente={clienteEditar} onClose={handleCloseModal} />}
    </div>
  );
};

export default ClienteList;
