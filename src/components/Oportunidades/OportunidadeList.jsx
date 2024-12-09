// src/components/Oportunidades/OportunidadeList.jsx
import React, { useState, useEffect } from 'react';
import OportunidadeForm from './OportunidadeForm';

const OportunidadeList = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentOportunidade, setCurrentOportunidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  useEffect(() => {
    fetchOportunidades();
  }, []);

  const fetchOportunidades = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/oportunidades`);
      if (!response.ok) {
        throw new Error('Erro ao buscar oportunidades');
      }
      const data = await response.json();
      setOportunidades(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as oportunidades.');
      setLoading(false);
    }
  };

  const handleEdit = (oportunidade) => {
    setCurrentOportunidade(oportunidade);
    setShowForm(true);
  };

  const handleDelete = (idOportunidade) => {
    if (window.confirm('Tem certeza que deseja deletar esta oportunidade?')) {
      fetch(`http://localhost:${port}/oportunidades/${idOportunidade}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            alert('Oportunidade deletada com sucesso');
            fetchOportunidades();
          } else {
            throw new Error('Erro ao deletar oportunidade');
          }
        })
        .catch((error) => {
          console.error(error);
          alert('Não foi possível deletar a oportunidade');
        });
    }
  };

  return (
    <div>
      <button 
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowForm(true)}
      >
        + Nova Oportunidade
      </button>
      {showForm && (
        <OportunidadeForm 
          oportunidade={currentOportunidade} 
          onClose={() => {
            setShowForm(false);
            setCurrentOportunidade(null);
            fetchOportunidades();
          }} 
        />
      )}
      {loading ? (
        <p>Carregando oportunidades...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2">Nome</th>
              <th className="py-2">Status</th>
              <th className="py-2">Valor</th>
              <th className="py-2">Data</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {oportunidades.map((op) => (
              <tr key={op.IdOportunidade} className="text-center">
                <td className="py-2">{op.Nome}</td>
                <td className="py-2">{op.Status}</td>
                <td className="py-2">R${op.Valor.toFixed(2)}</td>
                <td className="py-2">{new Date(op.Data).toLocaleDateString()}</td>
                <td className="py-2">
                  <button 
                    className="text-blue-500 mr-2"
                    onClick={() => handleEdit(op)}
                  >
                    Editar
                  </button>
                  <button 
                    className="text-red-500"
                    onClick={() => handleDelete(op.IdOportunidade)}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OportunidadeList;
