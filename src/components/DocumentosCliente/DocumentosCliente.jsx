import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Para notificações
import AtualizarStatusForm from './AtualizarStatusForm'; // Importar o novo modal

const DocumentosCliente = ({ IdCliente }) => {
  const { auth } = useContext(AuthContext);
  const userRole = auth.user && auth.user.Cargo && auth.user.Cargo.toUpperCase();

  const allowedRoles = ['SUPERVISOR'];

  console.log("User Role:", userRole);

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o upload de documentos
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Estado para o formulário de upload
  const [formData, setFormData] = useState({
    IdDadosContrato: '',
    documento: null,
  });

  // Estados para o modal de atualização de status
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentContratoId, setCurrentContratoId] = useState(null);
  const [novoStatusAction, setNovoStatusAction] = useState('');

  // Estado para rastrear documentos sendo enviados para o ClickSign
  const [sendingDocumentIds, setSendingDocumentIds] = useState([]);
  const port = import.meta.env.REACT_APP_PORT || 1000; 

  const openModal = (IdDadosContrato, novoStatus) => {
    setCurrentContratoId(IdDadosContrato);
    setNovoStatusAction(novoStatus);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentContratoId(null);
    setNovoStatusAction('');
  };

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const token = auth.token;
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/documentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            clienteId: IdCliente,
          },
        });

        console.log('Resposta da API /api/documentos:', response.data);

        if (response.data.success) {
          const documentosCliente = response.data.documentos;
          console.log('Documentos Cliente:', documentosCliente);
          setDocumentos(documentosCliente);
        } else {
          setError(response.data.message || 'Erro ao buscar documentos.');
        }
      } catch (err) {
        console.error('Erro ao buscar documentos:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Erro desconhecido.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (IdCliente) {
      fetchDocumentos();
    } else {
      setError('ID do cliente não fornecido.');
      setLoading(false);
    }
  }, [IdCliente, auth.token, port]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documento') {
      setFormData({ ...formData, documento: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const { IdDadosContrato, documento } = formData;

    if (!IdDadosContrato || !documento) {
      setUploadError('Todos os campos são obrigatórios.');
      setUploading(false);
      return;
    }

    try {
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('IdDadosContrato', IdDadosContrato);
      formDataToSend.append('ClienteRelacionado', IdCliente);
      formDataToSend.append('documento', documento);

      const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/v1/api/documentos`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta da API /api/documentos POST:', response.data);

      if (response.data.success) {
        setUploadSuccess('Documento carregado com sucesso.');
        setFormData({
          IdDadosContrato: '',
          documento: null,
        });
        setDocumentos([response.data.documento, ...documentos]);
      } else {
        setUploadError(response.data.message || 'Erro ao carregar documento.');
      }
    } catch (err) {
      console.error('Erro ao carregar documento:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setUploadError(err.response.data.message);
      } else {
        setUploadError('Erro desconhecido.');
      }
    } finally {
      setUploading(false);
    }
  };

  const atualizarStatus = async (IdDadosContrato, novoStatus, descricaoStatus) => {
    try {
      console.log(`Atualizando contrato ${IdDadosContrato} para status ${novoStatus} com descrição: ${descricaoStatus}`);
      
      const token = auth.token;
      console.log(`Token utilizado: ${token}`);
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }
      
      const response = await axios.post(
        `https://api.multiluzsolar.com.br/app1000/v1/api/contrato/${IdDadosContrato}/status`,
        { StatusAutorizacao: novoStatus, DescricaoStatus: descricaoStatus }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Resposta do servidor:', response.data);
      
      if (response.data.success) {
        setDocumentos((prevDocumentos) =>
          prevDocumentos.map((doc) =>
            doc.IdDadosContrato === IdDadosContrato
              ? { ...doc, StatusAutorizacao: novoStatus, DescricaoStatus: descricaoStatus }
              : doc
          )
        );
        toast.success('Status atualizado com sucesso.');
      } else {
        toast.error('Erro ao atualizar o status: ' + response.data.message);
      }
    } catch (err) {
      console.error('Erro ao atualizar o status:', err);
      if (err.response) {
        console.error('Resposta do servidor:', err.response.data);
      }
      toast.error('Erro ao atualizar o status.');
    }
  };

  const handleCriarDocumentos = async (IdDadosContrato) => {
    try {
      setSendingDocumentIds(prev => [...prev, IdDadosContrato]);

      const token = auth.token;
      console.log(`Token utilizado: ${token}`);
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const responseDocumento = await axios.post(
        `https://api.multiluzsolar.com.br/app1000/v1/api/criarDocumentos`,
        { IdDadosContrato },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (responseDocumento.status === 200) {
        toast.success("Documentos criados e enviados para o ClickSign com sucesso.");
        // Atualizar a lista de documentos após criação
        fetchDocumentos();
      } else {
        toast.error("Erro ao criar documentos.");
      }
    } catch (error) {
      console.error("Erro ao criar documentos:", error);
      toast.error("Erro ao criar documentos.");
    } finally {
      // Remover o documento do estado de envio
      setSendingDocumentIds(prev => prev.filter(id => id !== IdDadosContrato));
    }
  };

  // Função auxiliar para extrair signatários com status
  const extractSigners = (sign) => {
    const signers = [];
    for (let i = 1; i <= 4; i++) {
      const name = sign[`SignerName${i}`];
      const email = sign[`SignerEmail${i}`];
      const status = sign[`SignerStatus${i}`];
      if (name && email) {
        signers.push({ nome: name, email: email, status });
      }
    }
    return signers;
  };

  // Função para cancelar documento
  const handleCancelarDocumento = async (documentKey) => {
    try {
      console.log('Tentando cancelar documento com key:', documentKey);
      const token = auth.token;
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }
  
      // Confirmação antes de cancelar
      const confirmCancel = window.confirm('Tem certeza de que deseja cancelar este documento?');
      if (!confirmCancel) return;
  
      // Chamar o endpoint de cancelamento
      const response = await axios.post(
        `https://api.multiluzsolar.com.br/app1000/v1/api/cancelarDocumento`,
        { documentKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Resposta da API /api/cancelarDocumento:', response.data);
  
      if (response.data.mensagem) {
        toast.success('Documento cancelado com sucesso.');
  
        // Atualizar a lista de documentos após o cancelamento
        setDocumentos((prevDocumentos) =>
          prevDocumentos.map((doc) => ({
            ...doc,
            CadDadosSign: doc.CadDadosSign.map((sign) =>
              sign.IdDocSign === documentKey
                ? { ...sign, StatusDocSign: 'CANCELADO', DescricaoStatus: 'Documento cancelado manualmente.' }
                : sign
            ),
          }))
        );
      } else {
        toast.error('Erro ao cancelar o documento: ' + (response.data.erro || 'Erro desconhecido.'));
      }
    } catch (error) {
      console.error('Erro ao cancelar documento:', error);
      const mensagemErro = error.response?.data?.erro || 'Erro desconhecido.';
      toast.error(`Falha ao cancelar documento: ${mensagemErro}`);
    }
  };
  

  if (loading) {
    return <div>Carregando documentos...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      {/* Lista de Documentos */}
      {documentos.length === 0 ? (
        <div>Não há documentos relacionados a este cliente.</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-wrap space-x-4">
            {documentos.map((doc) => {
              // Verificar se há documentos abertos para este contrato
              const hasOpenDocuments = doc.CadDadosSign && doc.CadDadosSign.some(sign => sign.StatusDocSign === 'ABERTO');

              return (
                <div key={doc.IdDadosContrato} className="min-w-[300px] p-4 rounded shadow mb-4">
                  <h3 className="text-lg font-bold mb-2">Nome do Responsavel pelos dados: {doc.nomeCompletoResponsavel}</h3>
                  <p>
                    <strong>Data do Contrato:</strong> {new Date(doc.DataContrato).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {doc.StatusAutorizacao}
                  </p>
                                        {/* Botão de Edição Adicionado */}
                  <Link to={`/gerador/${IdCliente}/${doc.IdDadosContrato}`}>
                    <button className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                        Editar
                    </button>
                  </Link>

                  {doc.DescricaoStatus && (
                    <p>
                      <strong>Descrição:</strong> {doc.DescricaoStatus}
                    </p>
                  )}
                  {doc.LinkDocumento && (
                    <a
                      href={doc.LinkDocumento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2 block"
                    >
                      Visualizar Documento
                    </a>
                  )}

                  {/* Exibir DadosCadSign relacionados */}
                  {doc.CadDadosSign && doc.CadDadosSign.length > 1 && (
                    <div className="mt-4 p-2 border-t border-gray-300">
                      <h4 className="font-semibold mb-2">Dados de Assinatura:</h4>
                      {doc.CadDadosSign
                        .filter(sign => sign.StatusDocSign !== 'FECHADO' && sign.StatusDocSign !== 'CANCELADO')
                        .length > 0 ? (
                          doc.CadDadosSign
                            .filter(sign => sign.StatusDocSign !== 'FECHADO' && sign.StatusDocSign !== 'CANCELADO')
                            .map((sign, index) => {
                              const signers = extractSigners(sign);
                              return (
                                <div key={sign.IdDocSign || index} className="mb-2">
                                  <p><strong>ID DocSign:</strong> {sign.IdDocSign}</p>
                                  <p><strong>Nome do Documento:</strong> {sign.FileName}</p>
                                  <p><strong>Data de Upload:</strong> {new Date(sign.uploadedTime).toLocaleString()}</p>
                                  <p><strong>Deadline:</strong> {new Date(sign.DeadlineTime).toLocaleString()}</p>
                                    
                                  {/* Renderizando os Signatários */}
                                  <div className="mt-2">
                                    <h5 className="font-semibold mb-1">Signatários:</h5>
                                    {signers.length === 0 ? (
                                      <p>Nenhum signatário disponível.</p>
                                    ) : (
                                      signers.map((signer, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 border-b">
                                          <div>
                                            <p className="font-semibold">
                                              Signatário {idx + 1}: {signer.nome} ({signer.email})
                                            </p>
                                          </div>
                                          <div>
                                            <span
                                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                signer.status === 'ESPERANDO ASSINATURA'
                                                  ? 'bg-yellow-200 text-yellow-800'
                                                  : signer.status === 'ASSINADO'
                                                  ? 'bg-green-200 text-green-800'
                                                  : signer.status === 'CANCELADO'
                                                  ? 'bg-red-200 text-red-800'
                                                  : 'bg-gray-200 text-gray-800'
                                              }`}
                                            >
                                              {signer.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <p><strong>Status do Documento:</strong> {sign.StatusDocSign}</p>
                                  <hr className="my-2" />
                                  
                                  {/* Botão de Cancelamento por IdDocSign */}
                                  {allowedRoles.includes(userRole) && doc.StatusAutorizacao !== 'CANCELADO' && (
                                    <button
                                      onClick={() => handleCancelarDocumento(sign.IdDocSign)}
                                      className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      Cancelar Documento 
                                    </button>
                                  )}
                                </div>
                              );
                            })
                        ) : (
                          <p>Nenhum documento com status aberto disponível.</p>
                        )
                      }
                    </div>
                  )}

                  {allowedRoles.includes(userRole) && (
                    <div className="mt-4 flex space-x-2 flex-wrap">
                      {doc.StatusAutorizacao === 'Necessita Autorização' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(doc.IdDadosContrato, 'Autorizado');
                            }}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            Autorizar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              openModal(doc.IdDadosContrato, 'Negado');
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded"
                          >
                            Negar
                          </button>
                        </>
                      )}
                      {doc.StatusAutorizacao === 'Autorizado' && (
                        <>
                          {/* Verifica se há documentos abertos para desabilitar o botão */}
                          <button
                            onClick={() => handleCriarDocumentos(doc.IdDadosContrato)}
                            disabled={hasOpenDocuments || sendingDocumentIds.includes(doc.IdDadosContrato)}
                            className={`flex items-center px-2 py-1 bg-blue-500 text-white rounded ${
                              hasOpenDocuments || sendingDocumentIds.includes(doc.IdDadosContrato)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-600'
                            }`}
                          >
                            {hasOpenDocuments && sendingDocumentIds.includes(doc.IdDadosContrato) ? (
                              <>
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  ></path>
                                </svg>
                                Enviando...
                              </>
                            ) : (
                              'Criar Documentos e Enviar para o ClickSign'
                            )}
                          </button>
                        </>
                      )}
                      

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal para Atualizar Status */}
      {modalIsOpen && (
        <AtualizarStatusForm
          contratoId={currentContratoId}
          novoStatus={novoStatusAction}
          onClose={closeModal}
          onSubmit={atualizarStatus}
        />
      )}
    </div>
  );
};

export default DocumentosCliente;