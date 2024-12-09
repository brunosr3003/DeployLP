// ClienteDetalhes.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../AuthContext';
import { FaCalculator, FaFileContract, FaEdit } from 'react-icons/fa';
import Navbar2 from '../components/navbar/Navbar2';
import { v4 as uuidv4 } from 'uuid'; 
import Atividades from '../components/Atividades/Atividades';
import DocumentosCliente from '../components/DocumentosCliente/DocumentosCliente';

// Definição da interface para o histórico
interface HistoricoItem {
  IdHistorico: string;
  IdCliente: string;
  IdUsuario: string;
  NomeUsuario?: string;
  Data: string;
  HistoricoStatus: string;
  HistoricoStatusGeral: string;
  StatusNome?: string;
}

interface Cliente {
  IdCliente: string;
  Nome: string;
  Email: string;
  Telefone: string;
  Endereco: string;
  Data: string;
  Valor?: number;
  Temperatura?: string;
  CEP?: string;
  Logradouro?: string;
  Bairro?: string;
  Cidade?: string;
  Estado?: string;
  Numero?: string;
  Complemento?: string;
  StatusGeralRelacionado?: string;
  StatusRelacionado?: string;
  NomeUsuario?: string;
  UsuarioRelacionado?: string;
}

// Definição da interface para campos alterados
interface ChangedField {
  field: string;
  oldValue: string | number | undefined;
  newValue: any;
}

const ClienteDetalhes: React.FC = () => {

  const { IdCliente } = useParams<{ IdCliente: string }>();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Estados para edição e salvamento
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({});
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});

  const [selectedArea, setSelectedArea] = useState('');

  

  // Função para concatenar os componentes do endereço
  const concatenarEndereco = (cliente: Cliente): string => {
    const { CEP, Logradouro, Numero, Complemento, Bairro, Cidade, Estado } = cliente;
    let endereco = '';

    if (Logradouro) endereco += Logradouro;
    if (Numero) endereco += `, ${Numero}`;
    if (Complemento) endereco += `, ${Complemento}`;
    if (Bairro) endereco += ` - ${Bairro}`;
    if (Cidade) endereco += `, ${Cidade}`;
    if (Estado) endereco += ` - ${Estado}`;
    if (CEP) endereco += `, CEP: ${CEP}`;

    return endereco;
  };

  // Função para buscar cliente e configurar estado
  const fetchCliente = async () => {
    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${IdCliente}` ||  `http://localhost:1000/v1/api/clientes/${IdCliente}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const clienteDados: Cliente = response.data.cliente;
        // Calcular Endereco
        clienteDados.Endereco = concatenarEndereco(clienteDados);

        setCliente(clienteDados);
        // Não atualizar o histórico aqui; será feito separadamente
        setFieldValues({
          Nome: clienteDados.Nome,
          Email: clienteDados.Email,
          Telefone: clienteDados.Telefone,
          CEP: clienteDados.CEP,
          Logradouro: clienteDados.Logradouro,
          Bairro: clienteDados.Bairro,
          Cidade: clienteDados.Cidade,
          Estado: clienteDados.Estado,
          Numero: clienteDados.Numero,
          Complemento: clienteDados.Complemento,
          Endereco: clienteDados.Endereco,
          Valor: clienteDados.Valor,
          Temperatura: clienteDados.Temperatura,
          StatusGeralRelacionado: clienteDados.StatusGeralRelacionado,
          StatusRelacionado: clienteDados.StatusRelacionado,
          NomeUsuario: clienteDados.NomeUsuario,
        });
      } else {
        setError(response.data.message || 'Cliente não encontrado.');
        toast.error(response.data.message || 'Cliente não encontrado.');
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do cliente:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erro ao carregar os detalhes do cliente.');
        toast.error(err.response?.data?.message || 'Erro ao carregar os detalhes do cliente.');
      } else {
        setError('Erro desconhecido.');
        toast.error('Erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar o histórico de movimentação
  const fetchHistorico = async () => {
    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${IdCliente}/historico` || `http://localhost:1000/v1/api/clientes/${IdCliente}/historico`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setHistorico(response.data.historico);
      } else {
        toast.error(response.data.message || 'Erro ao buscar histórico.');
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Erro ao buscar histórico.');
      } else {
        toast.error('Erro desconhecido.');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCliente();
      await fetchHistorico(); // Carrega o histórico após buscar os dados do cliente
    };
    if (IdCliente) {
      fetchData();
    } else {
      setError('ID do cliente não fornecido.');
      setLoading(false);
      toast.error('ID do cliente não fornecido.');
    }
  }, [IdCliente, auth.token]);

  if (loading) {
    return (
      <div>
        <Navbar2 />
        <div className="p-6">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar2 />
        <div className="p-6 text-red-500">{error}</div>
      </div>
    );
  }

  const formatarDataHora = (dataStr: string) => {
    const dateObj = new Date(dataStr);
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função modificada para gerar um novo IdDadosContrato e navegar com ambos os IDs
  const handleGerador = () => {
    const newIdDadosContrato = uuidv4(); // Gerar um novo UUID
    navigate(`/gerador/${IdCliente}/${newIdDadosContrato}`, { state: { cliente } });
  };

  const handleCalculadora = () => {
    navigate('/calculadora', { state: { cliente } });
  };

  const handleEditField = (fieldKey: string) => {
    // Evita a edição de campos somente leitura
    const readOnlyFields = ['Endereco', 'StatusGeralRelacionado', 'StatusRelacionado', 'NomeUsuario'];
    if (readOnlyFields.includes(fieldKey)) return;

    setIsEditing({ ...isEditing, [fieldKey]: true });
  };

  const handleCancelEdit = (fieldKey: string) => {
    setIsEditing({ ...isEditing, [fieldKey]: false });
    setIsSaving({ ...isSaving, [fieldKey]: false });
    if (cliente) {
      setFieldValues({ ...fieldValues, [fieldKey]: cliente[fieldKey as keyof Cliente] });
    }
  };

  const handleSaveField = async (fieldKey: string) => {
    setIsSaving({ ...isSaving, [fieldKey]: true });
    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      // Prepare os dados que serão atualizados
      const updatedData: { [key: string]: any } = {};
      const editableFields = [
        'Nome',
        'Email',
        'Telefone',
        'CEP',
        'Logradouro',
        'Bairro',
        'Cidade',
        'Estado',
        'Numero',
        'Complemento',
        'Valor',
        'Temperatura'
      ];

      editableFields.forEach(field => {
        if (field === 'Valor') {
          updatedData[field] = parseFloat(fieldValues[field]) || 0;
        } else {
          updatedData[field] = fieldValues[field];
        }
      });

      // Identificar quais campos foram alterados
      const changedFields: ChangedField[] = [];
      editableFields.forEach(field => {
        const oldValue = cliente ? (cliente[field as keyof Cliente] !== undefined ? cliente[field as keyof Cliente] : '') : '';
        const newValue = updatedData[field] !== undefined ? updatedData[field] : '';
        if (oldValue !== newValue) {
          changedFields.push({
            field,
            oldValue, 
            newValue
          });
        }
      });

      // Gerar descrição detalhada das mudanças
      let historicoDescricao = 'Cliente atualizado: ';

      if (changedFields.length > 0) {
        const mudancas = changedFields.map(change => {
          return `${change.field} de "${change.oldValue}" para "${change.newValue}"`;
        });
        historicoDescricao += mudancas.join(', ');
      } else {
        historicoDescricao += 'Nenhuma alteração detectada.';
      }

      // Concatenar os componentes do endereço na ordem padrão do Google Maps
      const EnderecoCompleto = `${fieldValues.Logradouro || ''}, ${fieldValues.Numero || ''}${fieldValues.Complemento ? ', ' + fieldValues.Complemento : ''}, ${fieldValues.Bairro || ''}, ${fieldValues.Cidade || ''} - ${fieldValues.Estado || ''}, CEP: ${fieldValues.CEP || ''}`;

      const response = await axios.put(
        `https://api.multiluzsolar.com.br/app1000/v1/api/clientes/${IdCliente}` || `http://localhost:1000/v1/api/clientes/${IdCliente}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Campo atualizado com sucesso.');

        // Atualizar o estado do cliente com os novos dados
        const clienteAtualizado = { ...cliente, ...updatedData, Endereco: EnderecoCompleto } as Cliente;

        setCliente(clienteAtualizado);
        setFieldValues({
          ...fieldValues,
          ...updatedData,
          Endereco: EnderecoCompleto, // Atualizar o campo Endereco no estado
        });
        setIsEditing({ ...isEditing, [fieldKey]: false });

        // Atualizar o histórico localmente (opcional)
        setHistorico([{
          IdHistorico: uuidv4(), // Gerar um ID único para o novo histórico
          IdCliente: IdCliente!,
          IdUsuario: auth.user.id, // Acessar o ID do usuário a partir do AuthContext
          NomeUsuario: response.data.cliente.NomeUsuario,
          Data: new Date().toISOString(),
          HistoricoStatus: historicoDescricao,
          HistoricoStatusGeral: clienteAtualizado.StatusGeralRelacionado || '',
          StatusNome: '', // Pode ser preenchido se necessário
        }, ...historico]);

        // Notificar ClienteDetalhes.jsx para recarregar o histórico
        await fetchHistorico();
      } else {
        toast.error(response.data.message || 'Erro ao atualizar o campo.');
      }
    } catch (err) {
      console.error('Erro ao atualizar o campo:', err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Erro ao atualizar o campo.');
      } else {
        toast.error('Erro desconhecido.');
      }
    } finally {
      setIsSaving({ ...isSaving, [fieldKey]: false });
    }
  };

  const renderField = (
    fieldKey: string,
    label: string,
    type: string = 'text',
    options?: string[],
    isReadOnly: boolean = false
  ) => {
    return (
      <div key={fieldKey} className="flex items-center space-x-4 mt-2">
        {!isReadOnly && (
          <button
            onClick={() => handleEditField(fieldKey)}
            className="flex items-center px-2 py-1 text-gray-600 hover:text-blue-500 focus:outline-none"
          >
            <FaEdit className="mr-1" />
          </button>
        )}
        <div className="w-full">
          <p className="font-semibold text-gray-800 dark:text-white">{label}:</p>
          {isEditing[fieldKey] && !isReadOnly ? (
            <div className="flex items-center mt-1">
              {options ? (
                <select
                  value={fieldValues[fieldKey] || ''}
                  onChange={(e) =>
                    setFieldValues({ ...fieldValues, [fieldKey]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none dark:bg-gray-700 dark:text-white"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={fieldValues[fieldKey] || ''}
                  onChange={(e) =>
                    setFieldValues({ ...fieldValues, [fieldKey]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              )}
              <button
                onClick={() => handleSaveField(fieldKey)}
                disabled={isSaving[fieldKey]}
                className={`ml-2 px-3 py-1 rounded-md transition duration-200 ${
                  isSaving[fieldKey]
                    ? 'bg-green-400 text-white cursor-not-allowed opacity-50'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isSaving[fieldKey] ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => handleCancelEdit(fieldKey)}
                className="ml-2 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <p className="mt-1">
              {fieldValues[fieldKey] !== undefined
                ? fieldValues[fieldKey]
                : 'Não disponível'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar2 />
      <div className="p-8 bg-gray-50 dark:bg-slate-900 dark:text-white min-h-screen transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Detalhes do Cliente</h1>
          <div className="flex space-x-3 mt-4 md:mt-0">

            <button
              onClick={handleCalculadora}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              <FaCalculator className="mr-2" />
              Calculadora
            </button>

          </div>
        </div>

        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 transition duration-300 hover:shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primeira Coluna */}
            <div className="space-y-4">
              {renderField('Nome', 'Nome')}
              {renderField('Email', 'Email', 'email')}
              {renderField('Telefone', 'Telefone')}
              {renderField('CEP', 'CEP')}
              {renderField('Logradouro', 'Logradouro')}
              {renderField('Numero', 'Número')}
              {renderField('Complemento', 'Complemento')}
            </div>
            {/* Segunda Coluna */}
            <div className="space-y-4">
              {renderField('Bairro', 'Bairro')}
              {renderField('Cidade', 'Cidade')}
              {renderField('Estado', 'Estado')}
              {renderField('Endereco', 'Endereço', 'text', [], true)} 
              {renderField('Valor', 'Valor Estimado', 'number')}
              {renderField('Temperatura', 'Temperatura', 'text', ['FRIO', 'MORNO', 'ON FIRE'])}
            </div>
          </div>
        </section>
        <section>
        <button
              onClick={handleGerador}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              <FaFileContract className="mr-2" />
              Gerar novo Documento
            </button>

              <DocumentosCliente IdCliente={IdCliente!} />
            </section>
        <section>
          <div>
            <Atividades clienteId={IdCliente} onActivityChange={fetchHistorico} />
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Histórico de Movimentação</h2>
          {historico.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {historico.map((item) => (
                <div
                  key={item.IdHistorico}
                  className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 w-80 transition duration-300 hover:shadow-lg"
                >
                  <p><strong>Data:</strong> {formatarDataHora(item.Data)}</p>
                  <p><strong>Responsável:</strong> {item.NomeUsuario || item.IdUsuario}</p>
                  <p><strong>Movimentação:</strong> {item.HistoricoStatus}</p>
                  {item.StatusNome && (
                    <p><strong>Status:</strong> {item.StatusNome}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">Nenhum histórico disponível.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClienteDetalhes;
