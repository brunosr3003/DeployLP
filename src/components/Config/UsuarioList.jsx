// src/components/Config/UsuarioList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import UsuarioForm from './UsuarioForm';
import { FaEdit, FaTrash } from 'react-icons/fa';

const UsuarioList = ({ IdEmpresa }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]); // Estado para armazenar as Unidades
  const [loading, setLoading] = useState(true);
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  // Função para buscar usuários
  const fetchUsuarios = async () => {
    try {
      console.log(`Buscando usuários para a empresa: ${IdEmpresa}`);

      if (!IdEmpresa) {
        throw new Error('IdEmpresa está indefinido.');
      }

      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/usuario?empresa=${IdEmpresa}` || `http://localhost:${port}/v1/api/usuario?empresa=${IdEmpresa}`);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Falha ao buscar usuários.');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar Unidades
  const fetchUnidades = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/empresa/${IdEmpresa}/pontovenda` || `http://localhost:${port}/v1/api/empresa/${IdEmpresa}/pontovenda`);
      // Extrair 'Unidade' de cada objeto dentro de 'PontosVenda'
      const extractedUnidades = response.data.map(ponto => ponto.Unidade);
      setUnidades(extractedUnidades);
    } catch (error) {
      console.error('Erro ao buscar Unidades:', error);
      alert('Falha ao buscar Unidades.');
      setUnidades([]);
    }
  };

  useEffect(() => {
    if (IdEmpresa) {
      fetchUsuarios();
      fetchUnidades();
    }
  }, [IdEmpresa]);

  const handleDeleteUsuario = async (IdUsuario) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await axios.delete(`https://api.multiluzsolar.com.br/app1000/api/usuario/${IdUsuario}` || `http://localhost:${port}/api/usuario/${IdUsuario}`);
        alert('Usuário deletado com sucesso!');
        setUsuarios(usuarios.filter(usuario => usuario.IdUsuario !== IdUsuario));
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        alert('Falha ao deletar usuário.');
      }
    }
  };

  const openEditModal = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleUpdateUsuario = (updatedUsuario) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.IdUsuario === updatedUsuario.IdUsuario ? updatedUsuario : usuario
    ));
    closeModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 p-4 rounded-lg shadow-md">
      {usuarios.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>Nenhum usuário cadastrado para esta empresa.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Cargo</th>
                <th>Unidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.IdUsuario} className="bg-base-100">
                  <td>{usuario.Nome}</td>
                  <td>{usuario.Email}</td>
                  <td>{usuario.Telefone}</td>
                  <td>{usuario.Cargo}</td>
                  <td>{usuario.Unidade}</td> {/* Certifique-se que 'Unidade' está correto */}
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(usuario)}
                        className="btn btn-sm btn-warning flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUsuario(usuario.IdUsuario)}
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
      )}

      {/* Modal para Adicionar/Editar Usuário */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Editar Usuário"
        className="bg-base-100 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-20 overflow-auto max-h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
      >
        <div className="flex justify-end">
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">
            ✖️
          </button>
        </div>
        {selectedUsuario && (
          <UsuarioForm
            existingUsuario={selectedUsuario}
            onSuccess={handleUpdateUsuario}
            onCancel={closeModal}
            IdEmpresa={IdEmpresa}
            unidades={unidades} 
          />
        )}
      </Modal>
    </div>
  );
};

export default UsuarioList;
