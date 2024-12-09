// frontend/src/components/Kanban/StatusGeralForm.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const StatusGeralForm = ({ clienteId, currentStatusId, statusGeralList = [], onClose, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = async (newStatusGeral) => {
    setIsSubmitting(true);
  
    try {
      await onUpdate(clienteId, { statusGeral: newStatusGeral }); // Campo correto
      
      onClose();
    } catch (error) {
      console.error('Erro ao mover cliente via formulário:', error);
      // Verificar mensagens de erro específicas
      if (error.response && error.response.data && error.response.data.message === 'Não é possível atualizar o Status Geral sem concluir pelo menos uma atividade no status atual.') {
        toast.error('Não é possível atualizar o Status Geral sem concluir pelo menos uma atividade no status atual.');
      } else if (error.response && error.response.data && error.response.data.message === 'StatusGeral informado inválido ou Status inicial não encontrado.') {
        toast.error('Status Geral informado inválido ou Status inicial não encontrado.');
      } else {
        toast.error(error.response?.data?.message || 'Erro ao atualizar o Status Geral. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!statusGeralList.length) {
    return (
      <Modal
        isOpen={true}
        onRequestClose={onClose}
        contentLabel="Mover para outro status"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            width: '400px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
        }}
      >
        <h2>Erro</h2>
        <p>Lista de status indisponível.</p>
        <button onClick={onClose} style={{ padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Fechar
        </button>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={true}
      onRequestClose={isSubmitting ? () => {} : onClose}
      contentLabel="Mover para outro status"
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          width: '400px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
      }}
    >
      <h2>Mover Cliente</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {statusGeralList.map((statusGeral, index) => (
          <button
            key={index}
            onClick={() => handleStatusChange(statusGeral)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '10px 0',
              padding: '10px 15px',
              width: '100%',
              textAlign: 'center',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: isSubmitting ? 0.6 : 1,
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
            ) : null}
            {statusGeral}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          display: 'block',
          marginTop: '20px',
          padding: '10px 15px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1,
        }}
        disabled={isSubmitting}
      >
        Cancelar
      </button>
    </Modal>
  );
};

export default StatusGeralForm;
