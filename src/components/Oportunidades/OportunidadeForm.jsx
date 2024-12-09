// src/components/Oportunidades/OportunidadeForm.jsx
import React, { useState, useEffect } from 'react';

const OportunidadeForm = ({ oportunidade, onClose }) => {
  const [nome, setNome] = useState(oportunidade ? oportunidade.Nome : '');
  const [status, setStatus] = useState(oportunidade ? oportunidade.Status : 'A Fazer');
  const [valor, setValor] = useState(oportunidade ? oportunidade.Valor : 0);
  const [clientesRelacionados, setClientesRelacionados] = useState(oportunidade ? oportunidade.Clientes : []);
  const [todosClientes, setTodosClientes] = useState([]);
  const [camposPersonalizados, setCamposPersonalizados] = useState(oportunidade ? oportunidade.Dados : []);
  const port = import.meta.env.REACT_APP_PORT || 1000; 
  useEffect(() => {
    // Buscar todos os clientes para selecionar
    const fetchClientes = async () => {
      try {
        const response = await fetch(`http://localhost:${port}/clientes`);
        if (!response.ok) {
          throw new Error('Erro ao buscar clientes');
        }
        const data = await response.json();
        setTodosClientes(data);
      } catch (err) {
        console.error(err);
        alert('Não foi possível carregar os clientes');
      }
    };

    fetchClientes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      IdOportunidade: oportunidade ? oportunidade.IdOportunidade : generateUUID(),
      IdUsuario: 'id_do_usuario_logado', // Substitua por lógica de autenticação
      Nome: nome,
      Status,
      Valor: parseFloat(valor),
      Dados: camposPersonalizados,
      Clientes: clientesRelacionados,
    };

    const method = oportunidade ? 'PUT' : 'POST';
    const url = oportunidade ? `http://localhost:${port}/oportunidades/${oportunidade.IdOportunidade}` : `http://localhost:${port}/oportunidades`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert(`Oportunidade ${oportunidade ? 'atualizada' : 'criada'} com sucesso`);
        onClose();
      } else {
        throw new Error('Erro ao salvar oportunidade');
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar a oportunidade');
    }
  };

  const addCampoPersonalizado = () => {
    setCamposPersonalizados([...camposPersonalizados, { Campo: '', Valor: '' }]);
  };

  const handleCampoChange = (index, field, value) => {
    const novosCampos = [...camposPersonalizados];
    novosCampos[index][field] = value;
    setCamposPersonalizados(novosCampos);
  };

  const handleClienteChange = (e) => {
    const options = e.target.options;
    const selecionados = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selecionados.push(options[i].value);
      }
    }
    setClientesRelacionados(selecionados);
  };

  const generateUUID = () => {
    // Utilize uma biblioteca como 'uuid' para gerar UUIDs
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4">
        <h2 className="text-xl font-bold mb-4">{oportunidade ? 'Editar Oportunidade' : 'Nova Oportunidade'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Nome:
            <input 
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label className="block mb-2">
            Status:
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full border rounded p-2 mt-1"
            >
              <option value="A Fazer">A Fazer</option>
              <option value="Em Progresso">Em Progresso</option>
              <option value="Concluído">Concluído</option>
            </select>
          </label>
          <label className="block mb-2">
            Valor:
            <input 
              type="number" 
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              required 
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label className="block mb-2">
            Clientes Relacionados:
            <select 
              multiple 
              value={clientesRelacionados} 
              onChange={handleClienteChange} 
              className="w-full border rounded p-2 mt-1"
            >
              {todosClientes.map((cliente) => (
                <option key={cliente.IdCliente} value={cliente.IdCliente}>{cliente.Nome}</option>
              ))}
            </select>
          </label>
          <h3 className="text-lg font-semibold mt-4">Campos Personalizados</h3>
          {camposPersonalizados.map((campo, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input 
                type="text" 
                placeholder="Nome do Campo" 
                value={campo.Campo} 
                onChange={(e) => handleCampoChange(index, 'Campo', e.target.value)} 
                required
                className="w-1/2 border rounded p-2"
              />
              <input 
                type="text" 
                placeholder="Valor" 
                value={campo.Valor} 
                onChange={(e) => handleCampoChange(index, 'Valor', e.target.value)} 
                required
                className="w-1/2 border rounded p-2"
              />
            </div>
          ))}
          <button 
            type="button" 
            onClick={addCampoPersonalizado} 
            className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
          >
            + Adicionar Campo Personalizado
          </button>
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Salvar</button>
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OportunidadeForm;
