import React, { useState,useEffect,useContext  } from "react";
import InputMask from 'react-input-mask';
import axios from 'axios';
import './styles.css';
import dotenv from 'dotenv';
import { useParams, useLocation , useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify'; // Para notificações

const Forms = () => {
        
  const params = useParams();
  const location = useLocation();
  const { IdDadosContrato: paramIdDadosContrato } = useParams(); 
  const { IdCliente, IdDadosContrato } = useParams();

  const { auth } = useContext(AuthContext);

  const [idDadosContrato, setIdDadosContrato] = useState('');
       
  const [originalValues, setOriginalValues] = useState({});

  const [isInit, setisInit] = useState(false);
  const navigate = useNavigate();

  const port = import.meta.env.REACT_APP_PORT || 1000;          

                const [ClienteRelacionado, setClienteRelacionado] = useState("");
                const [areasAtuacao, setAreasAtuacao] = useState([]);
                const [selectedArea, setSelectedArea] = useState('');
                const [isSubmitting, setIsSubmitting] = useState(false);
                const [consultorResponsavel, setConsultorResponsavel] = useState("");
                const [CPFconsultorResponsavel, setCPFConsultorResponsavel] = useState("");
                const [consultores, setConsultores] = useState([]); 
                const [emailConsultor, setEmailConsultor] = useState("");
                const [origemOportunidade, setOrigemOportunidade] = useState("");
                const [preVendedor, setPreVendedor] = useState("");
                const [preVendedores, setPreVendedores] = useState([]);
                const [mostrarCampoPreVendedor, setMostrarCampoPreVendedor] = useState(false);
                const [modeloInversor, setModeloInversor] = useState("");
                const [inversores, setInversores] = useState([]);
                const [marcaInversor, setMarcaInversor] = useState("");
                const [marcasInversores, setMarcasInversores] = useState([]);
                const [modeloModulo, setModeloModulo] = useState("");
                const [modelosModulos, setModelosModulos] = useState([]);
                const [modalidadeCompensacao, setModalidadeCompensacao] = useState('');
                const [mostrarCamposAdicionais, setMostrarCamposAdicionais] = useState(false);
                const [tipoCompensacao, setTipoCompensacao] = useState("");
                const [expansaoUsina, setExpansaoUsina] = useState("");
                const [observacoesVistoria, setObservacoesVistoria] = useState("");
                const [nomeCompletoResponsavel, setNomeCompletoResponsavel] = useState("");
                const [emailResponsavel, setEmailResponsavel] = useState("");
                const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
                const [tipoCliente, setTipoCliente] = useState("");
                const [razaoSocial, setRazaoSocial] = useState("");
                const [cnpjCliente, setCnpjCliente] = useState("");
                const [cargoResp, setCargoResp] = useState("");
                const [finalidadeEmpresa, setFinalidadeEmpresa] = useState("");
                const [estadoCivil, setEstadoCivil] = useState("");
                const [profissao, setProfissao] = useState("");
                const [cpfCliente, setCpfCliente] = useState("");
                const [cep, setCep] = useState("");
                const [logradouro, setLogradouro] = useState("");
                const [numero, setNumero] = useState("");
                const [complemento, setComplemento] = useState("");
                const [bairro, setBairro] = useState("");
                const [cidadeUf, setCidadeUf] = useState("");
                const [numeroPropostaSolarMarket, setNumeroPropostaSolarMarket] = useState("");
                const [valorTotalContrato, setValorTotalContrato] = useState("");
                const [valorTotalContratoExtenso, setValorTotalContratoExtenso] = useState("");
                const [valorBrutoUsina, setValorBrutoUsina] = useState("");    
                const [potenciaExistente, setPotenciaExistente] = useState("");
                const [potenciaIncrementada, setPotenciaIncrementada] = useState("");
                const [potenciaTotalProjeto, setPotenciaTotalProjeto] = useState("");
                const [tipoEstrutura, setTipoEstrutura] = useState("");  
                const [padrao, setPadrao] = useState("");
                const [tipoPadrao, setTipoPadrao] = useState("");
                const [fotosPadrao, setFotosPadrao] = useState(null);                
                const [arquivos, setArquivos] = useState(null);
                const [observacoesPadrao, setObservacoesPadrao] = useState("");
                const [tipoTitularProjeto, setTipoTitularProjeto] = useState("");
                const [nomeTitularProjeto, setNomeTitularProjeto] = useState("");
                const [nomeResponsavelTitularProjeto,setNomeResponsavelTitularProjeto] = useState("");
                const [profissaoResponsavelTitularConcessionaria,setProfissaoResponsavelTitularConcessionaria] = useState("");
                const [cargo, setCargo] = useState(""); 
                const [outrosCargo, setOutrosCargo] = useState("");
                const [cpfResponsavelTitularProjeto,setCpfResponsavelTitularProjeto] = useState("");
                const [cpfTitularProjeto, setCpfTitularProjeto] = useState("");
                const [cnpjTitularProjeto, setCnpjTitularProjeto] = useState("");
                const [estadoCivilTitularConcessionaria, setEstadoCivilTitularConcessionaria] = useState("");
                const [finalidadeEmpresaTitularConc, setFinalidadeEmpresaTitularConc] = useState("");
                const [razaoSocialTitularConc, setRazaoSocialTitularConc] = useState("");
                const [profissaoTitularConcessionaria, setProfissaoTitularConcessionaria] = useState("");
                const [cepInstalacao, setCepInstalacao] = useState("");
                const [logradouroInstalacao, setLogradouroInstalacao] = useState("");
                const [numeroInstalacao, setNumeroInstalacao] = useState("");
                const [complementoInstalacao, setComplementoInstalacao] = useState("");
                const [bairroInstalacao, setBairroInstalacao] = useState("");
                const [cidadeUfInstalacao, setCidadeUfInstalacao] = useState("");   
                const [quantidadeModulos, setQuantidadeModulos] = useState("");
                const [mostrarOutroModelo, setMostrarOutroModelo] = useState(false);
                const [outroModeloModulo, setOutroModeloModulo] = useState("");    
                const [quantidadeTotalInversores, setQuantidadeTotalInversores] = useState("");
                const [potenciaTotalInversores, setPotenciaTotalInversores] = useState("");
                const [quantidadeInversor1, setQuantidadeInversor1] = useState("");
                const [mostrarInversor2, setMostrarInversor2] = useState(false);
                const [mostrarInversor3, setMostrarInversor3] = useState(false);
                const [quantidadeInversor2, setQuantidadeInversor2] = useState("");
                const [quantidadeInversor3, setQuantidadeInversor3] = useState("");
                const [tipoPagamento, setTipoPagamento] = useState("");
                const [descricaoFormaPagamento, setDescricaoFormaPagamento] = useState('');
                const [arquivoAutorizacao, setArquivoAutorizacao] = useState(null);  
                const [mostrarCamposOutros, setMostrarCamposOutros] = useState(false);
                const [formaPagamentoBoleto, setFormaPagamentoBoleto] = useState("");
                const [descricaoFormaPagamentoBoleto, setDescricaoFormaPagamentoBoleto] = useState("");
                const [aditivos, setAditivos] = useState("");
                const [possuiAditivos, setPossuiAditivos] = useState("");       
                const [formaPagamentoCartao, setFormaPagamentoCartao] = useState("");
                const [valorBoleto, setValorBoleto] = useState('');
                const [valorCartao, setValorCartao] = useState('');
                const [valorJurosCartao, setValorJurosCartao] = useState("");
                const [valorFinanciamento, setValorFinanciamento] = useState("");        
                const [bancoFinanciamento, setBancoFinanciamento] = useState("");
                const [outroBancoFinanciamento, setOutroBancoFinanciamento] = useState("");
                const [tipoFaturamento, setTipoFaturamento] = useState("");
                const [nfAntecipada, setNfAntecipada] = useState("");
                const [projetoAprovado, setProjetoAprovado] = useState("");
                const [nomeParecerAprovado, setNomeParecerAprovado] = useState("");
                const [linkInstalacaoUsina, setLinkInstalacaoUsina] = useState("");
                const [observacoes, setObservacoes] = useState("");
                const [dataContrato, setDataContrato] = useState("");
                const [correntePadrao, setCorrentePadrao] = useState("");
                const [quantidadeFasesDisjuntor, setQuantidadeFasesDisjuntor] = useState("");
                const [alteracaoPadrao, setAlteracaoPadrao] = useState("");
                const [descricaoAlteracao, setDescricaoAlteracao] = useState('');
                const [padraoMultiluz, setPadraoMultiluz] = useState('');
                const [valorPadrao, setValorPadrao] = useState('');
                const [EmailSignatario, setEmailSignatario] = useState("");
                const [TelefoneSignatario, setTelefoneSignatario] = useState("");
                const [CPFSignatario, setCPFSignatario] = useState("");
                const [NomeSignatario, setNomeSignatario] = useState("");
                const [marcaInversores, setMarcaInversores] = useState("");
                const [modeloInversor1, setModeloInversor1] = useState("");
                const [modeloInversor2, setModeloInversor2] = useState("");
                const [modeloInversor3, setModeloInversor3] = useState("");
                const [verificadorContrato, setVerificadorContrato] = useState("Verificador de Contratos"); 
                const [emailVerificadorContrato, setEmailVerificadorContrato] = useState("validacao.contratos@multiluzsolar.com.br"); 
                const [telefoneverificadorContrato, setTelefoneVerificadorContrato] = useState("00000000000"); 
                const [DescricaoPadrao, setDescricaoPadrao] = useState("");     
                const [descricaoFormaPagamentoCartao, setDescricaoFormaPagamentoCartao] = useState("");
                const [telefoneResponsavelHomologacao, setTelefoneResponsavelHomologacao] = useState("");      
                const [QuantidadePadroes, setQuantidadePadroes] = useState("");
                const [TipoConexaoPadrao, setTipoConexaoPadrao] = useState("");
                const [CorrenteDisjuntor, setCorrenteDisjuntor] = useState("");
                const [FavorOuContraRede, setFavorOuContraRede] = useState("");
                const [ServicoAlvenaria, setServicoAlvenaria] = useState("");         
                const [linkDocumentoIdentidade, setLinkDocumentoIdentidade] = useState([]);
                const [linkArquivoAutorizacao, setLinkArquivoAutorizacao] = useState([]);
                const [linkArquivos, setLinkArquivos] = useState([]);
                const [linkFotosPadrao, setLinkFotosPadrao] = useState([]);
                const [linkPropostaSolarMarket, setLinkPropostaSolarMarket] = useState([]);
                const [linkImagensDiversasPadrao, setLinkImagensDiversasPadrao] = useState([]);
                const [LinkDocumento, setLinkDocumento] = useState([]);
                const [linkComprovanteEnderecoFaturamento, setLinkComprovanteEnderecoFaturamento] = useState([]);
                const [linkComprovanteEnderecoInstalacao, setLinkComprovanteEnderecoInstalacao] = useState([]);
                const [linkFotosPadraoColetivo, setLinkFotosPadraoColetivo] = useState([]);


                const formatarValor = (numero) => {
                  const valorNumerico = parseInt(numero.replace(/\D/g, ''), 10); // Remove caracteres não numéricos
                  return isNaN(valorNumerico) ? '' : (valorNumerico).toLocaleString('pt-BR');
                 
                };
                const valorBoletoFormatado = valorBoleto ? `no valor total de ${formatarValor(valorBoleto)} reais ` : '';
                const valorCartaoFormatado = valorCartao ? `no valor total de ${formatarValor(valorCartao)} reais` : '';
                const valorFinanciamentoFormatado = valorFinanciamento ? `no valor total de ${formatarValor(valorFinanciamento)} reais` : '';
                const valorJurosCartaoFormatado = valorJurosCartao ? `sendo ${formatarValor(valorJurosCartao)} reais de juros do cartão` : '';
                const bancoFinanciamentoFinal = bancoFinanciamento === "Outro" ? outroBancoFinanciamento : bancoFinanciamento;
                const bancoFinanciamentoFormatado = bancoFinanciamentoFinal ? `O ${bancoFinanciamentoFinal} será o responsável pelo financiamento` : '';
               

                useEffect(() => {
                  

                  if (paramIdDadosContrato) {
                    setIdDadosContrato(paramIdDadosContrato);
                    // Opcional: carregar dados existentes para preencher o formulário
                  } else {
                    const newId = uuidv4();
                    setIdDadosContrato(newId);
                  }
                }, [paramIdDadosContrato]);


                const fetchContrato = async () => {
                  console.log("Iniciando a busca do contrato...");
                  console.log("IdDadosContrato:", idDadosContrato);
              
                  if (!idDadosContrato) {
                    console.error("IdDadosContrato não está disponível.");
                    return;
                  }
              
                  try {
                    const token = auth.token;
                    if (!token) {
                      throw new Error('Token de autenticação não encontrado.');
                    }
              
                    console.log("Fazendo requisição para a API...");
                    const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/contrato/${idDadosContrato}` || `http://localhost:${port}/v1/api/contrato/${idDadosContrato}`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
              
                    console.log("Resposta da API recebida:", response.data);
              
                    if (response.data.success) {
                      const contrato = response.data.contrato;
                      console.log("Dados do contrato:", contrato);
                      console.log('originalValues:', originalValues);
                      const shouldShowInversor2 = contrato.quantidadeInversor2 || contrato.modeloInversor2;
                      const shouldShowInversor3 = contrato.quantidadeInversor3 || contrato.modeloInversor3;
                      setMostrarInversor2(shouldShowInversor2 ? true : false);
                      setMostrarInversor3(shouldShowInversor3 ? true : false);
                      // Preencher os estados com os dados do contrato
                      setClienteRelacionado(contrato.ClienteRelacionado || "");
                      setConsultorResponsavel(contrato.consultorResponsavel || "");
                      setCPFConsultorResponsavel(contrato.CPFconsultorResponsavel || "");
                      setEmailConsultor(contrato.emailConsultor || "");
                      setOrigemOportunidade(contrato.origemOportunidade || "");
                      setPreVendedor(contrato.preVendedor || "");
                      setTipoCompensacao(contrato.tipoCompensacao || "");
                      setExpansaoUsina(contrato.expansaoUsina || "");
                      setObservacoesVistoria(contrato.observacoesVistoria || "");
                      setModalidadeCompensacao(contrato.modalidadeCompensacao || "");
                      setNomeCompletoResponsavel(contrato.nomeCompletoResponsavel || "");
                      setEmailResponsavel(contrato.emailResponsavel || "");
                      setTelefoneResponsavel(contrato.telefoneResponsavel || "");
                      setTipoCliente(contrato.tipoCliente || "");
                      setRazaoSocial(contrato.razaoSocial || "");
                      setCnpjCliente(contrato.cnpjCliente || "");
                      setCargoResp(contrato.cargoResp || "");
                      setFinalidadeEmpresa(contrato.finalidadeEmpresa || "");
                      setEstadoCivil(contrato.estadoCivil || "");
                      setProfissao(contrato.profissao || "");
                      setCpfCliente(contrato.cpfCliente || "");
                      setCep(contrato.cep || "");
                      setLogradouro(contrato.logradouro || "");
                      setNumero(contrato.numero || "");
                      setComplemento(contrato.complemento || "");
                      setBairro(contrato.bairro || "");
                      setCidadeUf(contrato.cidadeUf || "");
                      setNumeroPropostaSolarMarket(contrato.numeroPropostaSolarMarket || "");
                      setValorTotalContrato(contrato.valorTotalContrato || "");
                      setValorTotalContratoExtenso(contrato.valorTotalContratoExtenso || "");
                      setValorBrutoUsina(contrato.valorBrutoUsina || "");
                      setPotenciaTotalProjeto(contrato.potenciaTotalProjeto || "");
                      setPotenciaExistente(contrato.potenciaExistente || 0);
                      setPotenciaIncrementada(contrato.potenciaIncrementada || 0);
                      setTipoEstrutura(contrato.tipoEstrutura || "");
                      setPadrao(contrato.padrao || "");
                      setTipoPadrao(contrato.tipoPadrao || "");
                      setCorrentePadrao(contrato.correntePadrao || "");
                      setAlteracaoPadrao(contrato.alteracaoPadrao || "");
                      setObservacoesPadrao(contrato.observacoesPadrao || "");
                      setDescricaoAlteracao(contrato.descricaoAlteracao || "");
                      setPadraoMultiluz(contrato.padraoMultiluz || "");
                      setValorPadrao(contrato.valorPadrao || "");
                      setValorFinanciamento(contrato.valorFinanciamento || "");
                      setTipoTitularProjeto(contrato.tipoTitularProjeto || "");
                      setNomeTitularProjeto(contrato.nomeTitularProjeto || "");
                      setNomeResponsavelTitularProjeto(contrato.nomeResponsavelTitularProjeto || "");
                      setProfissaoResponsavelTitularConcessionaria(contrato.profissaoResponsavelTitularConcessionaria || "");
                      setCargo(contrato.cargo || ""); 
                      setOutrosCargo(contrato.outrosCargo || "");
                      setCpfResponsavelTitularProjeto(contrato.cpfResponsavelTitularProjeto || "");
                      setCpfTitularProjeto(contrato.cpfTitularProjeto || "");
                      setCnpjTitularProjeto(contrato.cnpjTitularProjeto || "");
                      setEstadoCivilTitularConcessionaria(contrato.estadoCivilTitularConcessionaria || "");
                      setFinalidadeEmpresaTitularConc(contrato.finalidadeEmpresaTitularConc || "");
                      setRazaoSocialTitularConc(contrato.razaoSocialTitularConc || "");
                      setProfissaoTitularConcessionaria(contrato.profissaoTitularConcessionaria || "");
                      setCepInstalacao(contrato.cepInstalacao || "");
                      setLogradouroInstalacao(contrato.logradouroInstalacao || "");
                      setNumeroInstalacao(contrato.numeroInstalacao || "");
                      setComplementoInstalacao(contrato.complementoInstalacao || "");
                      setBairroInstalacao(contrato.bairroInstalacao || "");
                      setCidadeUfInstalacao(contrato.cidadeUfInstalacao || "");   
                      setQuantidadeModulos(contrato.quantidadeModulos || "");
                      setMostrarOutroModelo(contrato.mostrarOutroModelo || false);
                      setOutroModeloModulo(contrato.outroModeloModulo || "");    
                      setQuantidadeTotalInversores(contrato.quantidadeTotalInversores || "");
                      setPotenciaTotalInversores(contrato.potenciaTotalInversores || "");
                      setMarcaInversores(contrato.marcaInversores || "");
                      setMarcaInversor(contrato.marcaInversor || "");
                    

                      setQuantidadeInversor2(contrato.quantidadeInversor2 || "");
                      setQuantidadeInversor3(contrato.quantidadeInversor3 || "");
                      setAditivos(contrato.aditivos || "");
                      setTipoPagamento(contrato.tipoPagamento || "");
                      setDescricaoFormaPagamento(contrato.descricaoFormaPagamento || '');
                      setArquivoAutorizacao(contrato.arquivoAutorizacao || null);
                      
                      
                      setFormaPagamentoBoleto(contrato.formaPagamentoBoleto || "");
                      setDescricaoFormaPagamentoBoleto(contrato.descricaoFormaPagamentoBoleto || "");
                      setFormaPagamentoCartao(contrato.formaPagamentoCartao || "");
                      setValorJurosCartao(contrato.valorJurosCartao || "");
                      setValorFinanciamento(contrato.valorFinanciamento || "");        
                      setBancoFinanciamento(contrato.bancoFinanciamento || "");
                      setOutroBancoFinanciamento(contrato.outroBancoFinanciamento || "");
                      setTipoFaturamento(contrato.tipoFaturamento || "");
                      setNfAntecipada(contrato.nfAntecipada || "");
                      setProjetoAprovado(contrato.projetoAprovado || "");
                      setNomeParecerAprovado(contrato.nomeParecerAprovado || "");
            
                      setObservacoes(contrato.observacoes || "");
                      setDataContrato(contrato.dataContrato || "");
                      setEmailSignatario(contrato.EmailSignatario || "");
                      setTelefoneSignatario(contrato.TelefoneSignatario || "");
                      setCPFSignatario(contrato.CPFSignatario || "");
                      setNomeSignatario(contrato.NomeSignatario || "");
            
                      setModeloInversor1(contrato.modeloInversor1 || "");
                 
                      setQuantidadePadroes(contrato.QuantidadePadroes || "");
                      setTipoConexaoPadrao(contrato.TipoConexaoPadrao || "");
                      setCorrenteDisjuntor(contrato.CorrenteDisjuntor || "");
                      setFavorOuContraRede(contrato.FavorOuContraRede || "");
                      setServicoAlvenaria(contrato.ServicoAlvenaria || "");        
            
                      setTelefoneResponsavelHomologacao(contrato.telefoneResponsavelHomologacao || "");
                      setVerificadorContrato(contrato.verificadorContrato || "Verificador de Contratos"); 
                      setEmailVerificadorContrato(contrato.emailVerificadorContrato || "validacao.contratos@multiluzsolar.com.br"); 
                      setTelefoneVerificadorContrato(contrato.telefoneverificadorContrato || "00000000000"); 
                      setDescricaoPadrao(contrato.DescricaoPadrao || ""); 
                      setDescricaoFormaPagamentoCartao(contrato.descricaoFormaPagamentoCartao || "");
                      setQuantidadeFasesDisjuntor(contrato.quantidadeFasesDisjuntor || "");
                      setLinkInstalacaoUsina(contrato.linkInstalacaoUsina || "");
                      setValorBoleto(contrato.valorBoleto || "");
                      setValorCartao(contrato.valorCartao || "");
                      setModeloModulo(contrato.modeloModulo || "");
                      setPossuiAditivos(contrato.possuiAditivos || "");
                      setSelectedArea(contrato.selectedArea || "");

                      setModeloInversor1(contrato.modeloInversor1 || "");
                      setModeloInversor2(contrato.modeloInversor2 || "");
                      setModeloInversor3(contrato.modeloInversor3 || "");
                      setQuantidadeInversor1(contrato.quantidadeInversor1 || "");
            
                      // Adicione qualquer outro campo conforme necessário

                      
                      
                      setOriginalValues(contrato);
              
                      console.log("Estados atualizados com sucesso.");
                    } else {
                      console.error('Erro ao buscar contrato:', response.data.message);
                    }
                  } catch (err) {
                    console.error('Erro ao buscar contrato:', err);
                  }
                };
                
                useEffect(() => {
                  console.log("IdDadosContrato disponível:", idDadosContrato);
                  if (idDadosContrato) {
                    fetchContrato();
                  } else {
                    console.error("IdDadosContrato não está disponível.");
                  }
                }, [idDadosContrato, auth.token]);


                useEffect(() => {
                  if (originalValues) {
                    if (originalValues.StatusAutorizacao === 'Autorizado') {
                      // Exibir uma notificação informando o redirecionamento
                      toast.info('Este contrato já está autorizado e você será redirecionado para a página inicial.');
                      
                      // Redirecionar para a página Home após um pequeno atraso para que a notificação seja visível
                      setTimeout(() => {
                        navigate('/');
                      }, 2000); // 2 segundos
                    }
                  }
                }, [ originalValues]);


                

                useEffect(() => {
                  const delay = 2000; // Delay in milliseconds, e.g., 5000ms = 5 seconds
                  const timeoutId = setTimeout(() => {
                    console.log("Refazendo a busca do contrato após o atraso...");
                    if (idDadosContrato) {
                      fetchContrato();
                    }
                  }, delay);
              
                  // Cleanup function to clear the timeout if the component unmounts or dependencies change
                  return () => clearTimeout(timeoutId);
                }, [idDadosContrato, auth.token]);
                // useEffect para buscar links existentes
                useEffect(() => {
                  const fetchLinks = async () => {
                    console.log("Iniciando a busca dos links...");
                    if (!idDadosContrato) {
                      console.error("IdDadosContrato não está disponível.");
                      return;
                    }
              
                    try {
                      const token = auth.token;
                      if (!token) {
                        throw new Error("Token de autenticação não encontrado.");
                      }
              
                      const url = `https://api.multiluzsolar.com.br/app1000/v1/api/contrato/${idDadosContrato}/links` || `http://localhost:${port}/v1/api/contrato/${idDadosContrato}/links`;
                      console.log(`Fazendo requisição para: ${url}`);
                      const response = await axios.get(url, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
              
                      console.log("Resposta da API recebida:", response.data);
              
                      if (response.data.success) {
                        const contrato = response.data.links;
              
                        // Sanitizar links
                        const sanitizeLink = (link) =>
                          Array.isArray(link)
                            ? link.filter(l => l && l !== "null" && l !== "undefined")
                            : [];
              
                        setLinkDocumentoIdentidade(sanitizeLink(contrato.linkDocumentoIdentidade));
                        setLinkArquivoAutorizacao(sanitizeLink(contrato.linkArquivoAutorizacao));
                        setLinkArquivos(sanitizeLink(contrato.linkArquivos));
                        setLinkFotosPadrao(sanitizeLink(contrato.linkFotosPadrao));
                        setLinkPropostaSolarMarket(sanitizeLink(contrato.linkPropostaSolarMarket));
                        setLinkImagensDiversasPadrao(sanitizeLink(contrato.linkImagensDiversasPadrao));
                        setLinkDocumento(sanitizeLink(contrato.LinkDocumento));
                        setLinkComprovanteEnderecoFaturamento(
                          sanitizeLink(contrato.linkComprovanteEnderecoFaturamento)
                        );
                        setLinkComprovanteEnderecoInstalacao(
                          sanitizeLink(contrato.linkComprovanteEnderecoInstalacao)
                        );
                        setLinkFotosPadraoColetivo(sanitizeLink(contrato.linkFotosPadraoColetivo));
              
                        console.log("Estados de links atualizados.");
                      } else {
                        console.error("Erro ao buscar links:", response.data.message);
                      }
                    } catch (err) {
                      console.error("Erro ao buscar links:", err);
                    }
                  };
              
                  if (idDadosContrato) {
                    fetchLinks();
                  }
                }, [idDadosContrato, auth.token]);
                       
        
              const handleModeloModuloChange = (event) => {
                const selectedModelo = event.target.value;
                setModeloModulo(selectedModelo);
                if (selectedModelo === "Outro") {
                  setMostrarOutroModelo(true);
                } else {
                  setMostrarOutroModelo(false);
                  setOutroModeloModulo("");
                }
              }; 
                const handleOrigemChange = (event) => {
                    const selectedOrigem = event.target.value;
                    setOrigemOportunidade(selectedOrigem);
                
        
                    if (selectedOrigem === "Pré Vendas (BDR/SDR)") {
                    setMostrarCampoPreVendedor(true);
                    } else {
                    setMostrarCampoPreVendedor(false);
                    setPreVendedor(""); 
                    }
                };

                const obterDataAtual = () => {
                  const hoje = new Date();
                  const dia = String(hoje.getDate()).padStart(2, '0');
                  const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0, por isso somamos 1
                  const ano = hoje.getFullYear();
                  return `${dia}/${mes}/${ano}`;
                };

                const adicionarInversor2 = () => {
                    setMostrarInversor2(true);
                  };
                const adicionarInversor3 = () => {
                    setMostrarInversor3(true);
                  };
                const removerInversor2 = () => {
                    setMostrarInversor2(false);
                    setQuantidadeInversor2("");
                    setModeloInversor2("");
                    // Também remover Inversor 3 se estiver mostrado
                    if (mostrarInversor3) {
                      removerInversor3();
                    }
                  };       
                const removerInversor3 = () => {
                    setMostrarInversor3(false);
                    setQuantidadeInversor3("");
                    setModeloInversor3("");
                  };
                  


                const limparCamposDePagamento = () => {
                    setValorBoleto("");
                    setValorCartao("");
                    setValorFinanciamento("");
                    setValorJurosCartao("");
                    setDescricaoFormaPagamentoBoleto("");
                    setFormaPagamentoBoleto("");  
                    setFormaPagamentoCartao("");   
                    setValorJurosCartao("");       
                    setBancoFinanciamento("");     
                    setOutroBancoFinanciamento(""); 
                };


                const definirTipoFaturamento = () => {
                  if (tipoPagamento === "Boleto") {
                      setTipoFaturamento("À MULTILUZ ENGENHARIA E SERVICOS LTDA, o valor correspondente à 20% do estabelecido. À MULTILUZ SOLAR IMPORTADORA & COMERCIO LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 80% do estabelecido.");
                  } else if (tipoPagamento === "Cartão de Crédito") {
                      setTipoFaturamento("À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 100% do estabelecido.");
                  } else if (tipoPagamento === "Financiamento") {
                      if (bancoFinanciamento === "Banco do Brasil" || bancoFinanciamento === "Sicredi Plataforma") {
                          setTipoFaturamento("À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 100% do estabelecido.");
                      } else if (bancoFinanciamento === "BV") {
                          setTipoFaturamento("À MULTILUZ ENGENHARIA E SERVICOS LTDA, o valor correspondente à 20% do estabelecido. À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 80% do estabelecido.");
                      } else {
                          setTipoFaturamento("À MULTILUZ ENGENHARIA E SERVICOS LTDA, o valor correspondente à 20% do estabelecido. À MULTILUZ SOLAR IMPORTADORA & COMERCIO LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 80% do estabelecido.");
                      }
                  } else if (tipoPagamento === "Boleto e Cartão de Crédito") {
                      setTipoFaturamento("À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 100% do estabelecido.");
                  } else if (tipoPagamento === "Boleto e Financiamento") {
                      if (bancoFinanciamento === "Banco do Brasil" || bancoFinanciamento === "Sicredi Plataforma") {
                          setTipoFaturamento("À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 100% do estabelecido.");
                      } else if (bancoFinanciamento === "BV") {
                          setTipoFaturamento("À MULTILUZ ENGENHARIA E SERVICOS LTDA, o valor correspondente à 20% do estabelecido. À SANKÓS DISTRIBUIDORA LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 80% do estabelecido.");
                      } else {
                          setTipoFaturamento("À MULTILUZ ENGENHARIA E SERVICOS LTDA, o valor correspondente à 20% do estabelecido. À MULTILUZ SOLAR IMPORTADORA & COMERCIO LTDA, fornecedora dos equipamentos e materiais, o valor correspondente à 80% do estabelecido."
            );
                      }
                  } else {
                      setTipoFaturamento("");
                  }
              };
                          
              const handleConsultorChange = (e) => {
                const selectedConsultor = consultores.find(
                  (consultor) => consultor.nome === e.target.value
                );
                setConsultorResponsavel(e.target.value);
                setEmailConsultor(selectedConsultor ? selectedConsultor.email : "");
                setTelefoneSignatario(selectedConsultor ? selectedConsultor.telefone : "")
                setCPFConsultorResponsavel(selectedConsultor ? selectedConsultor.CPF : "")
              };
        
              const handlePreVendedorChange = (e) => {
                setPreVendedor(e.target.value);
              };
            
              const handleInversorChange = (e) => {
                setModeloInversor(e.target.value);
              };
        
              const handleMarcaInversoresChange = (e) => {
                setMarcaInversores(e.target.value);
              };
              
              const handleMarcaModuloChange = (e) => {
                setMarcaModulo(e.target.value);
              };
       
              const handleCepChange = (e) => {
                const newCep = e.target.value.replace(/\D/g, ""); 
                setCep(newCep);
            
                if (newCep.length === 8) {
               
                  axios
                    .get(`https://viacep.com.br/ws/${newCep}/json/`)
                    .then((response) => {
                      const { logradouro, bairro, localidade, uf } = response.data;
                      setLogradouro(logradouro);
                      setBairro(bairro);
                      setCidadeUf(`${localidade} / ${uf}`);
                    })
                    .catch((error) => {
                      console.error("Erro ao buscar o CEP:", error);
                    });
                }
              };

              const handleCepInstalacaoChange = (e) => {
                const newCep = e.target.value.replace(/\D/g, ''); 
                setCepInstalacao(newCep);
            
                if (newCep.length === 8) {
               
                  axios
                    .get(`https://viacep.com.br/ws/${newCep}/json/`)
                    .then((response) => {
                      if (!response.data.erro) {
                        const { logradouro, bairro, localidade, uf } = response.data;
                        setLogradouroInstalacao(logradouro || '');
                        setBairroInstalacao(bairro || '');
                        setCidadeUfInstalacao(`${localidade} / ${uf}` || '');
                      } else {
             
                        setLogradouroInstalacao('');
                        setBairroInstalacao('');
                        setCidadeUfInstalacao('');
                      }
                    })
                    .catch((error) => {
         
                      setLogradouroInstalacao('');
                      setBairroInstalacao('');
                      setCidadeUfInstalacao('');
                    });
                }
              };
            
              const handlePadraoChange = (e) => {
                setPadrao(e.target.value);
              };
            
              const numeroParaExtenso = (valor) => {
                const unidades = [
                  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
                ];
                const dezenas = [
                  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa",
                ];
                const centenas = [
                  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos",
                ];
              
                const escalas = ["", "mil", "milhão", "bilhão", "trilhão"];
                
                // Função para converter grupo de até 3 dígitos para extenso
                const grupoParaExtenso = (grupo) => {
                  let extenso = "";
              
                  if (grupo === 100) {
                    return "cem";
                  }
              
                  if (grupo >= 100) {
                    extenso += centenas[Math.floor(grupo / 100)];
                    grupo %= 100;
                  }
              
                  if (grupo >= 20) {
                    if (extenso) extenso += " e ";
                    extenso += dezenas[Math.floor(grupo / 10)];
                    grupo %= 10;
                  }
              
                  if (grupo > 0) {
                    if (extenso) extenso += " e ";
                    extenso += unidades[grupo];
                  }
              
                  return extenso;
                };
              
                // Separando a parte inteira e os centavos
                const [inteira, decimal] = valor.toFixed(2).split('.').map(Number);
              
                // Quebra a parte inteira em grupos de três dígitos
                const grupos = [];
                let inteiraTemp = inteira;
                while (inteiraTemp > 0) {
                  grupos.push(inteiraTemp % 1000);
                  inteiraTemp = Math.floor(inteiraTemp / 1000);
                }
              
                // Convertendo cada grupo de três dígitos para extenso
                let extensoInteiro = grupos
                  .map((grupo, i) => {
                    if (grupo === 0) return "";
                    let escala = escalas[i];
                    if (grupo > 1 && escala === "milhão") escala = "milhões";
                    if (grupo > 1 && escala === "bilhão") escala = "bilhões";
                    return `${grupoParaExtenso(grupo)} ${escala}`.trim();
                  })
                  .filter(Boolean) // Remove entradas vazias
                  .reverse() // Reverte para a ordem correta
                  .join(" e ");
              
                // Tratamento especial para a palavra "real" ou "reais"
                if (inteira === 1) {
                  extensoInteiro += " real";
                } else if (inteira > 1) {
                  extensoInteiro += " reais";
                }
              
                // Convertendo a parte decimal para extenso (centavos)
                let extensoCentavos = "";
                if (decimal > 0) {
                  extensoCentavos = grupoParaExtenso(decimal);
                  if (decimal === 1) {
                    extensoCentavos += " centavo";
                  } else {
                    extensoCentavos += " centavos";
                  }
                }
              
                // Retornando a parte inteira e a parte dos centavos (se houver)
                if (extensoCentavos) {
                  return `${extensoInteiro} e ${extensoCentavos}`;
                } else {
                  return extensoInteiro;
                }
              };
              
              const handleModalidadeChange = (e) => {
                const selectedValue = e.target.value;
                setModalidadeCompensacao(selectedValue);
            
                if (selectedValue === 'Autoconsumo Local (FAST TRACK)') {
                  setMostrarCamposAdicionais(true);
                } else {
                  setMostrarCamposAdicionais(false);
                }
              };
              
              const handleFilesChange = async (e, tipoArquivo) => {
                const files = e.target.files;
                console.log(`Tipo de arquivo selecionado: ${tipoArquivo}`);
                console.log(`Número de arquivos selecionados: ${files.length}`);
              
                if (files.length > 0) {
                  const formData = new FormData();
                  formData.append('file', files[0]);
              
                  try {
                    console.log("Enviando arquivo para o backend...");
                    const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/v1/api/upload` || `http://localhost:${port}/v1/api/upload`, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-api-key': import.meta.env.VITE_API_KEY, // Adicionando a chave de API aqui
                      },
                    });
              
                    console.log("Resposta do upload:", response.data);
              
                    if (response.status === 200) {
                      const fileLink = response.data.link;
                      console.log(`Link recebido: ${fileLink}`);
              
                      switch (tipoArquivo) {
                        case "documentoIdentidade":
                          setLinkDocumentoIdentidade((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        case "comprovanteEnderecoFaturamento":
                          setLinkComprovanteEnderecoFaturamento((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        case "comprovanteEnderecoInstalacao":
                          setLinkComprovanteEnderecoInstalacao((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        case "fotosPadrao":
                          setLinkFotosPadrao((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        case "arquivoAutorizacao":
                          setLinkArquivoAutorizacao((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        case "ImagensDiversasPadrao":
                          setLinkImagensDiversasPadrao((prevLinks) => [...prevLinks, fileLink]);
                          break;
                        default:
                          console.error("Tipo de arquivo desconhecido:", tipoArquivo);
                      }
              
                      console.log("Link adicionado ao estado:", fileLink);
                    }
                  } catch (error) {
                    console.error('Erro ao enviar o arquivo:', error);
                    alert('Erro ao enviar o arquivo.');
                  }
                }
              };
                  
              const handleTipoPagamentoChange = (e) => {
                const selectedValue = e.target.value;
                setTipoPagamento(selectedValue);
              
              
                if (selectedValue === 'Outros') {
                  setMostrarCamposOutros(true);
                } else {
                  setMostrarCamposOutros(false);
                  setDescricaoFormaPagamento('');
                  setArquivoAutorizacao(null);
                }
              };
        
              const handleArquivoChange = (e) => {
                setArquivoAutorizacao(e.target.files[0]);
              };
        
              const handleMesmoResponsavelChange = (isChecked) => {
                if (isChecked) {
                    setTipoTitularProjeto(tipoCliente);
                    setNomeTitularProjeto(nomeCompletoResponsavel);
                    setCpfTitularProjeto(cpfCliente);
                    setCnpjTitularProjeto(cnpjCliente); 
                    setEstadoCivilTitularConcessionaria(estadoCivil);
                    setTelefoneResponsavelHomologacao(telefoneResponsavel)
                    if (tipoCliente === 'PJ') {
                      setRazaoSocialTitularConc(razaoSocial);
                      setNomeResponsavelTitularProjeto(nomeCompletoResponsavel);
                      setCpfResponsavelTitularProjeto(cpfCliente);
                      setNomeCompletoResponsavel(nomeCompletoResponsavel);
                      profissaoResponsavelTitularConcessionaria(outrosCargo);
                      
                  } else if (tipoCliente === 'PF') {
                      setProfissaoTitularConcessionaria(profissao); // Pessoa Física
                  }
                  
                } else {
                    setNomeTitularProjeto('');
                    setCpfTitularProjeto('');
                    setCnpjTitularProjeto('');
                    setEstadoCivilTitularConcessionaria('');
                    setProfissaoTitularConcessionaria('');
                    setTelefoneResponsavelHomologacao('');
                }
            };
        
            const handleMesmoEnderecoChange = (isChecked) => {
              if (isChecked) {
                  setCepInstalacao(cep);
                  setLogradouroInstalacao(logradouro);
                  setNumeroInstalacao(numero);
                  setComplementoInstalacao(complemento);
                  setBairroInstalacao(bairro);
                  setCidadeUfInstalacao(cidadeUf);
              } else {
                  setCepInstalacao('');
                  setLogradouroInstalacao('');
                  setNumeroInstalacao('');
                  setComplementoInstalacao('');
                  setBairroInstalacao('');
                  setCidadeUfInstalacao('');
              }
          };

          const handleValorFinanciamentoChange = (e) => {
            const valor = e.target.value;
            setValorFinanciamento(valor); // Armazena o valor original
          };
          
          const handleValorBoletoChange = (e) => {
            const valor = e.target.value;
            setValorBoleto(valor);
          };
        
          const handleValorCartaoChange = (e) => {
            const valor = e.target.value;
            setValorCartao(valor);
          };
          
          const handleValorBrutoChange = (e) => {
            const valor = e.target.value;
            setValorBrutoUsina(valor);
          };
              
          const handleTipoClienteChange = (valor) => {
            setTipoCliente(valor);
          
            // Limpa os campos dependendo do tipo selecionado
            if (valor === "PF") {
              // Limpa os campos de PJ
              setRazaoSocial("");
              setCnpjCliente("");
              setFinalidadeEmpresa("");
              setCargoResp("");
              setOutrosCargo("");
            } else if (valor === "PJ") {
              // Limpa os campos de PF
              setCpfCliente("");
              setEstadoCivil("");
              setProfissao("");
            }
          };
                 
          const handleTipoTitularProjetoChange = (valor) => {
            setTipoTitularProjeto(valor);
          
            // Limpa os campos dependendo do tipo selecionado
            if (valor === "PJ") {
              // Limpa os campos de PF
              setNomeTitularProjeto(""); 
              setEstadoCivilTitularConcessionaria(""); 
              setProfissaoTitularConcessionaria(""); 
              setCpfTitularProjeto(""); 
            } else if (valor === "PF") {
              // Limpa os campos de PJ
              setRazaoSocialTitularConc("");
              setFinalidadeEmpresaTitularConc("");
              setCnpjTitularProjeto("");
              setNomeResponsavelTitularProjeto("");
              setProfissaoResponsavelTitularConcessionaria("");
              setCpfResponsavelTitularProjeto("");
            }
          };

          const handleSubmit = async (event) => {
            event.preventDefault();
            setIsSubmitting(true); 
        
            try {

              
        
              const formaPagamentoCartaoFinal = formaPagamentoCartao === "Outros" 
                ? descricaoFormaPagamentoCartao 
                : formaPagamentoCartao;
        
              const dadosFormulario = {
                // Dados do consultor
                IdDadosContrato: idDadosContrato, // Substituído de existingId
                ClienteRelacionado,
        
                consultorResponsavel,
                CPFconsultorResponsavel,
                emailConsultor,
                origemOportunidade,
                preVendedor: origemOportunidade === "Pré Vendas (BDR/SDR)" ? preVendedor : "",
        
                // Dados da oportunidade
                tipoCompensacao,
                expansaoUsina,
                observacoesVistoria,
        
                // Dados do responsável
                nomeCompletoResponsavel,
                emailResponsavel,
                telefoneResponsavel,
        
                // Dados do cliente (PF ou PJ)
                tipoCliente,
                razaoSocial: tipoCliente === "PJ" ? razaoSocial : "",
                cnpjCliente: tipoCliente === "PJ" ? cnpjCliente : "",
        
                finalidadeEmpresa,
                estadoCivil,
                profissao,
                cpfCliente,
        
                // Endereço do cliente
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidadeUf,
        
                // Dados da proposta
                numeroPropostaSolarMarket,
                valorTotalContrato,
                valorTotalContratoExtenso,
                valorBrutoUsina,
                potenciaTotalProjeto:potenciaTotalProjeto,
                potenciaExistente,
                potenciaIncrementada,
                tipoEstrutura,
        
                // Dados do padrão
                padrao,
                tipoPadrao,
                correntePadrao,
                quantidadeFasesDisjuntor,
                alteracaoPadrao,
                observacoesPadrao,
                descricaoAlteracao,
                padraoMultiluz,
                valorPadrao,
        
                // Dados do titular do projeto na concessionária
                tipoTitularProjeto,
                nomeTitularProjeto,
                cpfTitularProjeto: tipoTitularProjeto === "PF" ? cpfTitularProjeto : "",
                cnpjTitularProjeto: tipoTitularProjeto === "PJ" ? cnpjTitularProjeto : "",
        
                nomeResponsavelTitularProjeto,
                profissaoResponsavelTitularConcessionaria,
                cpfResponsavelTitularProjeto,
                razaoSocialTitularConc,
                finalidadeEmpresaTitularConc,
        
                estadoCivilTitularConcessionaria,
                profissaoTitularConcessionaria,
                modalidadeCompensacao,
        
                cepInstalacao,
                logradouroInstalacao,
                numeroInstalacao,
                complementoInstalacao,
                bairroInstalacao,
                cidadeUfInstalacao,
                valorBoleto: valorBoletoFormatado,
                valorCartao: valorCartaoFormatado,
                valorFinanciamento: valorFinanciamentoFormatado,
        
                // Dados dos módulos e inversores
                quantidadeModulos,
                modeloModulo: modeloModulo === "Outro" ? outroModeloModulo : modeloModulo,
                quantidadeTotalInversores:quantidadeTotalInversores,
                potenciaTotalInversores,
                marcaInversor,
                marcaInversores,
                quantidadeInversor1,
                modeloInversor1,  
                quantidadeInversor2: mostrarInversor2 ? quantidadeInversor2 : "",
                modeloInversor2: mostrarInversor2 ? modeloInversor2 : "",
                quantidadeInversor3: mostrarInversor3 ? quantidadeInversor3 : "",
                modeloInversor3: mostrarInversor3 ? modeloInversor3 : "",
        
                // Dados de pagamento
                tipoPagamento,
                descricaoFormaPagamento: tipoPagamento === 'Outros' ? descricaoFormaPagamento : "",
                arquivoAutorizacao: tipoPagamento === 'Outros' ? arquivoAutorizacao : "",
                descricaoFormaPagamentoBoleto,
                formaPagamentoBoleto: ["Boleto", "Boleto e Cartão de Crédito", "Boleto e Financiamento"].includes(tipoPagamento)
                    ? (formaPagamentoBoleto === "Outros" ? descricaoFormaPagamentoBoleto : formaPagamentoBoleto)
                    : "",
                formaPagamentoCartao: ["Cartão de Crédito", "Boleto e Cartão de Crédito"].includes(tipoPagamento) 
                    ? formaPagamentoCartaoFinal 
                    : "",
                valorJurosCartao: valorJurosCartaoFormatado,
                bancoFinanciamento: bancoFinanciamentoFormatado, 
                tipoFaturamento,
                aditivos,
                nfAntecipada: tipoPagamento.includes("Financiamento") ? nfAntecipada : "",
        
                // Dados do projeto aprovado
                projetoAprovado,
                nomeParecerAprovado: projetoAprovado === "Sim" ? nomeParecerAprovado : "",
        
                // Outros dados
                linkInstalacaoUsina,
                observacoes,
                dataContrato,
        
                // Dados do signatário
                EmailSignatario,
                TelefoneSignatario,
                CPFSignatario,
                NomeSignatario,
        
                // Dados dos anexos
                fotosPadrao,
                arquivos,
                linkArquivos: arquivos,
        
                // Dados dos links
                 linkPropostaSolarMarket,
        
                linkArquivoAutorizacao,
                linkDocumentoIdentidade,
                linkComprovanteEnderecoFaturamento,
                linkComprovanteEnderecoInstalacao,
                linkFotosPadrao,
                linkFotosPadraoColetivo,
                linkImagensDiversasPadrao,
        
                verificadorContrato,
                emailVerificadorContrato,
                telefoneverificadorContrato,
                telefoneResponsavelHomologacao,
                
                bancoFinanciamentoFinal,
                cargoResp,

        
                QuantidadePadroes,
                TipoConexaoPadrao,
                CorrenteDisjuntor,
                FavorOuContraRede,
                ServicoAlvenaria,
               
        
                possuiAditivos,
                selectedArea,
                areasAtuacao,
                DescricaoPadrao,
              };
        
              const headers = {
                "x-api-key": import.meta.env.VITE_API_KEY,
                "Content-Type": "application/json",
              };
        
              // Verificar se o IdDadosContrato está definido
              if (!idDadosContrato) {
                throw new Error("IdDadosContrato não está definido.");
              }
        
              // Enviar para o banco de dados (inserir ou atualizar)
              const response = await axios.post(
                 `http://localhost:${port}/v1/api/enviarFormulario`,
                dadosFormulario, 
                { headers }
              );
        
              console.log("Resposta da API:", response.data);
              alert(response.data.mensagem);
        
            } catch (error) {
              console.error("Erro ao enviar o formulário:", error);
              if (error.response && error.response.data && error.response.data.erro) {
                alert(`Erro: ${error.response.data.erro}\nDetalhes: ${error.response.data.detalhes}`);
              } else {
                alert("Erro ao enviar o formulário");
              }
            } finally {
              navigate(`/visualizacao/${IdCliente}`);
              setIsSubmitting(false); 
            }
          };

          if(isInit)
            return;
    
            useEffect(() => {
              
                if (tipoCliente !== "PJ") {
                  setRazaoSocial("");
                  setCnpjCliente("");
                }
            }, [tipoCliente]);

            useEffect(() => {
            
              const total = 
                Number(quantidadeInversor1) + 
                (mostrarInversor2 ? Number(quantidadeInversor2) : 0) + 
                (mostrarInversor3 ? Number(quantidadeInversor3) : 0);
            
              setQuantidadeTotalInversores(total.toString()); // Garantindo que seja uma string
            }, [quantidadeInversor1, quantidadeInversor2, quantidadeInversor3, mostrarInversor2, mostrarInversor3]);
            
            useEffect(() => {
              
              limparCamposDePagamento(); 
            }, [tipoPagamento,]); 

            useEffect(() => {
              
                definirTipoFaturamento();
            }, [tipoPagamento, bancoFinanciamento,]);


            useEffect(() => {
              const headers = {
                "x-api-key": import.meta.env.VITE_API_KEY,
                "Content-Type": "application/json", 
              };
            
              const fetchData = async () => {
                try {
                  const [
                    consultoresResponse,
                    prevendedoresResponse,
                    inversoresResponse,
                    marcasInversoresResponse,
                    modelosModulosResponse,
                    areasAtuacaoResponse
                  ] = await Promise.all([
                    fetch("https://api.multiluzsolar.com.br/app4000/consultores", { headers }),
                    fetch("https://api.multiluzsolar.com.br/app4000/prevendedores", { headers }),
                    fetch("https://api.multiluzsolar.com.br/app4000/inversores", { headers }),
                    fetch("https://api.multiluzsolar.com.br/app4000/marcas-inversores", { headers }),
                    fetch("https://api.multiluzsolar.com.br/app4000/modelos-modulos", { headers }),
                    fetch("https://api.multiluzsolar.com.br/app4000/areas-atuacao", { headers })
                  ]);
            
                  const consultoresData = await consultoresResponse.json();
                  const prevendedoresData = await prevendedoresResponse.json();
                  const inversoresData = await inversoresResponse.json();
                  const marcasInversoresData = await marcasInversoresResponse.json();
                  const modelosModulosData = await modelosModulosResponse.json();
                  const areasAtuacaoData = await areasAtuacaoResponse.json();
            
                  setConsultores(consultoresData);
                  setPreVendedores(prevendedoresData);
                  setInversores(inversoresData);
                  setMarcasInversores(marcasInversoresData);
                  setModelosModulos(modelosModulosData);
                  setAreasAtuacao(areasAtuacaoData);
            
                  console.log("Todos os dados foram carregados com sucesso.");
                } catch (error) {
                  console.error("Erro ao carregar os dados:", error);
                }
              };
            
              fetchData();
            }, []);
              
            useEffect(() => {
            
              if (valorTotalContrato) {
                const valorNumerico = parseFloat(valorTotalContrato);
                setValorTotalContratoExtenso(numeroParaExtenso(valorNumerico));
              } else {
                setValorTotalContratoExtenso("");
              }
            }, [valorTotalContrato]);
      
            useEffect(() => {
            
              setDataContrato(obterDataAtual());
            }, []);
          
            useEffect(() => {
           
              const total = parseFloat(potenciaExistente) + parseFloat(potenciaIncrementada);
              setPotenciaTotalProjeto(total.toString()); // Convertendo para string
            }, [potenciaExistente, potenciaIncrementada]);
            
            useEffect(() => {
              

              // Extraia IdCliente dos parâmetros da rota
              const { IdCliente } = params;
          
              // Extraia o estado passado na navegação, se existir
              const clientePassado = location.state && location.state.cliente ? location.state.cliente.IdCliente : null;
          
              if (clientePassado) {
                setClienteRelacionado(clientePassado);
              } else if (IdCliente) {
                setClienteRelacionado(IdCliente);
              }
            }, [params, location.state]);

        
            console.log('originalValues:', originalValues);
        return (
        
        <main className="bg-white pt-20 pr-30">
          <section className="container mx-auto flex flex-col items-center justify-center px-4 md:px-0 md:h-auto">
            <div className="flex justify-center items-center min-h-screen">
        
              <div
                data-aos="fade-left"
                data-aos-duration="400"
                data-aos-once="true"
                className="mx-auto max-w-full p-4"
              >
                <div className="order-1">
                  <p className="text-xl text-black">
                  INFORMAÇÕES PARA CONTRATO
                  </p>
                  <form onSubmit={handleSubmit} className="custom-form space-y-6">
           
                    <div className="mx-auto max-w-full p-4 grid grid-cols-1 gap-3">
                    
        
                    <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                    <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
        
                        <legend className="text-xl font-bold text-gray-700 mb-4">Dados do Consultor</legend>
        

                        <div >
                                <label htmlFor="selectedArea" className="block text-lg text-white">
                                Área de Atuação
                                </label>
                                <select
                                    
                                    id="selectedArea"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={selectedArea}  
                                    onChange={(e) => setSelectedArea(e.target.value)}  
                                >
                                    <option value="">Escolha uma área</option>
                                    {areasAtuacao.map((marca, index) => (
                                    <option key={index} value={marca}>
                                        {marca}
                                    </option>
                                    ))}
                                </select>
                          </div>

        
                        <div>
                          <label htmlFor="consultorResponsavel" className="text-lg text-gray-700">
                            Consultor Responsável
                          </label>
                          <select
                            id="consultorResponsavel"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={consultorResponsavel}
                            onChange={handleConsultorChange}
                            disabled={!selectedArea} // Desabilitar se nenhuma área estiver selecionada
                          >
                            <option value="">Selecione o consultor</option>
                            {consultores
                              .filter((consultor) => consultor.atuacao === selectedArea) // Filtrar os consultores
                              .map((consultor, index) => (
                                <option key={index} value={consultor.nome}>
                                  {consultor.nome}
                                </option>
                              ))}
                          </select>
                        </div>
        
                        {/* Linha 2: Email do Consultor */}
                        {emailConsultor && (
                          <div >
                            <label htmlFor="emailConsultor" className="text-lg text-gray-700">
                              Email do Consultor
                            </label>
                            <input
                              type="email"
                              id="emailConsultor"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={emailConsultor}
                              readOnly
                            />
                          </div>
                        )}
        
                        {/* Linha 3: CPF do Consultor */}
                        <div >
                          <label htmlFor="CPFconsultorResponsavel" className="text-lg text-gray-700">
                            CPF do Consultor Responsável*
                          </label>
                          <InputMask
                            mask="999.999.999-99"
                            id="CPFconsultorResponsavel"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={CPFconsultorResponsavel}
                            
                            placeholder="Digite o CPF"
                          />
                        </div>
        
                        {/* Linha 4: Telefone do Consultor */}
                        <div >
                          <label htmlFor="TelefoneSignatario" className="text-lg text-gray-700">
                            Telefone do Consultor*
                          </label>
                          <InputMask
                            mask="(99) 99999-9999"
                            type="tel"
                            id="TelefoneSignatario"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={TelefoneSignatario}
                            
                          />
                        </div>
                      </fieldset>
                    </div>
        
                    <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                      <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                        <legend className="text-xl font-bold text-gray-700 mb-4">Informações do Cliente Responsável Contratualmente</legend>
                            <div >
                                <label htmlFor="tipoCliente" className="block text-lg text-white">
                                    Tipo de Cliente*
                                </label>
                                <select
                                    id="tipoCliente"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={tipoCliente}
                                    onChange={(e) => handleTipoClienteChange(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione o tipo de cliente</option>
                                    <option value="PF">PF</option>
                                    <option value="PJ">PJ</option>
                                </select>
                            </div>
                            <div >
                                <label htmlFor="nomeCompletoResponsavel" className="block text-lg text-white">
                                    Nome Completo do Responsável*
                                </label>
                                <input
                                    type="text"
                                    id="nomeCompletoResponsavel"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={nomeCompletoResponsavel}
                                    onChange={(e) => setNomeCompletoResponsavel(e.target.value.toUpperCase())} // Converte para maiúsculas
                                    //required
                                />
                            </div>
                                <div >
                                <label htmlFor="emailResponsavel" className="block text-lg text-white">
                                    E-mail*
                                </label>
                                <input
                                    type="email"
                                    id="emailResponsavel"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={emailResponsavel}
                                    onChange={(e) => setEmailResponsavel(e.target.value)}
                                    //required
                                />
                                </div>
        
                                <div >
                                <label htmlFor="telefoneResponsavel" className="block text-lg text-white">
                                    Telefone*
                                </label>
                                <InputMask
                                    mask="99999999999"
                                    type="tel"
                                    id="telefoneResponsavel"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={telefoneResponsavel}
                                    onChange={(e) => setTelefoneResponsavel(e.target.value)}
                                    //required
                                />
                                </div>
        
                             
        
                                  <div >
                                    <label htmlFor="cpfCliente" className="block text-lg text-white">
                                        CPF do Responsável*
                                    </label>
                                    <InputMask
                                        mask="999.999.999-99"
                                        id="cpfCliente"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={cpfCliente}
                                        onChange={(e) => setCpfCliente(e.target.value)}
                                        placeholder="Digite o CPF"
                                        //required
                                    />
                                    </div>
        
                                {tipoCliente === "PJ" && (
                                <>
                                    <div >
                                    <label htmlFor="razaoSocial" className="block text-lg text-white">
                                        Razão Social*
                                    </label>
                                    <input
                                        type="text"
                                        id="razaoSocial"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={razaoSocial}
                                        onChange={(e) => setRazaoSocial(e.target.value.toUpperCase())}
                                        //required
                                    />
                                    </div>
                                    
                                    <div >
                                        <label htmlFor="cnpjCliente" className="block text-lg text-white">
                                            CNPJ da Empresa*
                                        </label>
                                        <InputMask
                                            mask="99.999.999/9999-99"
                                            value={cnpjCliente}
                                            onChange={(e) => setCnpjCliente(e.target.value)}
                                        >
                                            {() => (
                                            <input
                                                type="text"
                                                id="cnpjCliente"
                                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                //required
                                            />
                                            )}
                                        </InputMask>
                                    </div>
        
                                    <div >
                                          <label htmlFor="finalidadeEmpresa" className="block text-lg text-white">
                                              Finalidade da Empresa*
                                          </label>
                                          <select
                                              id="finalidadeEmpresa"
                                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              value={finalidadeEmpresa}
                                              onChange={(e) => setFinalidadeEmpresa(e.target.value)}
                                              //required
                                          >
                                              <option value="">Selecione uma opção</option>
                                              <option value="Pessoa Jurídica de direito privado">Pessoa Jurídica de direito privado</option>
                                              <option value="Pessoa Jurídica de direito privado, sem fins lucrativos">Pessoa Jurídica de direito privado, sem fins lucrativos</option>
                                              <option value="Sociedade Cooperativa">Sociedade Cooperativa</option>
                                              <option value="Pessoa Jurídica de direito público">Pessoa Jurídica de direito público</option>
                                          </select>
                                      </div>
                                      <div > 
                                        <label htmlFor="cargoResp" className="block text-lg text-white">
                                        Cargo do Responsável*
                                        </label>
                                        <input
                                            type="text"
                                            id="cargoResp"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={cargoResp}
                                            onChange={(e) => setCargoResp(e.target.value.toUpperCase())}
                                            //required
                                        />
                                      </div>
                                        
                                </>
                            )}
        
                            {tipoCliente === "PF" && (
                            <>
                                    <div >
                                    <label htmlFor="estadoCivil" className="block text-lg text-white">
                                            Estado Civil do Responsável*
                                        </label>
                                        <select
                                            id="estadoCivil"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={estadoCivil}
                                            onChange={(e) => setEstadoCivil(e.target.value)}
                                            //required
                                        >
                                            <option value="">Selecione o estado civil</option>
                                            <option value="Solteiro(a)">Solteiro(a)</option>
                                            <option value="Casado(a)">Casado(a)</option>
                                            <option value="Divorciado(a)">Divorciado(a)</option>
                                            <option value="Viúvo(a)">Viúvo(a)</option>
                                            <option value="União Estável">União Estável</option>
                                        </select>
                                        </div>
        
                                    <div > 
                                    <label htmlFor="profissao" className="block text-lg text-white">
                                        Profissão do Responsável*
                                    </label>
                                    <input
                                        type="text"
                                        id="profissao"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={profissao}
                                        onChange={(e) => setProfissao(e.target.value.toUpperCase())}
                                        //required
                                    />
                                    </div>
                            </>
                            )}
        
        
        
        <div>                       
                                <label htmlFor="documentoIdentidade" className="block text-lg text-black">
                                Anexar Documento de Identidade (RG, CNH ou CIN)*
                                </label>
                                <input
                                type="file"
                                id="documentoIdentidade"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                onChange={(e) => handleFilesChange(e, "documentoIdentidade")}
                                multiple
                                //required
                                />
                                {linkDocumentoIdentidade.length > 0 && (
                                <div>
                                    <p>Documentos enviados:</p>
                                    <ul>
                                    {linkDocumentoIdentidade.map((link, index) => (
                                        <li key={index}>
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            Visualizar Documento {index + 1}
                                        </a>
                                        </li>
                                    ))}
                                    </ul>
                                </div>
                                )}
        
        
        
                            </div>
        
                      </fieldset>
                    </div>
        
        
                    <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                      <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                        <legend className="text-xl font-bold text-gray-700 mb-4">Endereço de Faturamento</legend>
                          <div >
                            <label htmlFor="cep" className="block text-lg text-white">
                                CEP*
                            </label>
                            <InputMask
                                mask="99999-999"
                                value={cep}
                                onChange={handleCepChange}
                            >
                                {() => (
                                <input
                                    type="text"
                                    id="cep"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o CEP"
                                    //required
                                />
                                )}
                            </InputMask>
                            </div>
        
                            <div >
                                <label htmlFor="logradouro" className="block text-lg text-white">
                                Logradouro*
                                </label>
                                <input
                                type="text"
                                id="logradouro"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={logradouro}
                                onChange={(e) => setLogradouro(e.target.value)}
                                //required
                                />
                            </div>
                           
                      
                            <div >
                                <label htmlFor="bairro" className="block text-lg text-white">
                                Bairro*
                                </label>
                                <input
                                type="text"
                                id="bairro"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={bairro}
                                onChange={(e) => setBairro(e.target.value)}
                                //required
                                />
                            </div>
        
                   
                            <div >
                                <label htmlFor="cidadeUf" className="block text-lg text-white">
                                Cidade/UF*
                                </label>
                                <input
                                type="text"
                                id="cidadeUf"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={cidadeUf}
                                onChange={(e) => setCidadeUf(e.target.value)}
                                //required
                                />
                            </div>
        
                            <div >
                                <label htmlFor="numero" className="block text-lg text-white">
                                Número*
                                </label>
                                <input
                                type="text"
                                id="numero"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                //required
                                />
                            </div>
        
                         
                            <div > 
                                <label htmlFor="complemento" className="block text-lg text-white">
                                Complemento
                                </label>
                                <input
                                type="text"
                                id="complemento"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={complemento}
                                onChange={(e) => setComplemento(e.target.value)}
                                />
                            </div>
        
                            <div>
                            <label htmlFor="comprovanteEnderecoFaturamento" className="block text-lg text-black">
                              Anexar Comprovante de Endereço de Faturamento*
                            </label>
                            <input
                              type="file"
                              id="comprovanteEnderecoFaturamento"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                              onChange={(e) => handleFilesChange(e, "comprovanteEnderecoFaturamento")}
                              multiple
                              //required
                            />
                            {linkComprovanteEnderecoFaturamento.length > 0 && (
                              <div>
                                <p>Comprovantes enviados:</p>
                                <ul>
                                  {linkComprovanteEnderecoFaturamento.map((link, index) => (
                                    <li key={index}>
                                      <a href={link} target="_blank" rel="noopener noreferrer">
                                        Visualizar Comprovante {index + 1}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            </div>
        
                          </fieldset>
                        </div>
        
                    <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                      <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                        <legend className="text-xl font-bold text-gray-700 mb-4">Endereço de Instalação</legend>
                          <div className="flex flex-col space-y-4 mt-4">
        
              <label className="text-lg">
              Endereço de Instalação é o Mesmo Contratual?
              </label>
              <div className="flex items-center space-x-4">
                <label htmlFor="mesmoEnderecoSim" className="flex items-center text-lg">
                  <input
                    type="radio"
                    id="mesmoEnderecoSim"
                    name="mesmoEndereco"
                    value="sim"
                    onChange={(e) => handleMesmoEnderecoChange(e.target.checked)}
                    className="mr-2"
                  />
                  Sim
                </label>
        
                <label htmlFor="mesmoEnderecoNao" className="flex items-center text-lg">
                  <input
                    type="radio"
                    id="mesmoEnderecoNao"
                    name="mesmoEndereco"
                    value="nao"
                    className="mr-2"
                  />
                  Não
                </label>
              </div>
        
                          <div>
                            <label htmlFor="cepInstalacao" className="block text-lg text-gray-700">
                              CEP de Instalação*
                            </label>
                            <InputMask
                              mask="99999-999"
                              id="cepInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={cepInstalacao}
                              onChange={handleCepInstalacaoChange}
                              placeholder="Digite o CEP"
                              //required
                            />
                          </div>
        
                          <div>
                            <label htmlFor="logradouroInstalacao" className="block text-lg text-gray-700">
                              Logradouro da Instalação*
                            </label>
                            <input
                              type="text"
                              id="logradouroInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={logradouroInstalacao}
                              onChange={(e) => setLogradouroInstalacao(e.target.value)}
                              //required
                            />
                          </div>
        
                          <div>
                            <label htmlFor="bairroInstalacao" className="block text-lg text-gray-700">
                              Bairro da Instalação*
                            </label>
                            <input
                              type="text"
                              id="bairroInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={bairroInstalacao}
                              onChange={(e) => setBairroInstalacao(e.target.value)}
                              //required
                            />
                          </div>
        
                          <div>
                            <label htmlFor="cidadeUfInstalacao" className="block text-lg text-gray-700">
                              Cidade/UF da Instalação*
                            </label>
                            <input
                              type="text"
                              id="cidadeUfInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={cidadeUfInstalacao}
                              onChange={(e) => setCidadeUfInstalacao(e.target.value)}
                              //required
                            />
                          </div>
        
                          <div>
                            <label htmlFor="numeroInstalacao" className="block text-lg text-gray-700">
                              Número da Instalação*
                            </label>
                            <input
                              type="text"
                              id="numeroInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={numeroInstalacao}
                              onChange={(e) => setNumeroInstalacao(e.target.value)}
                              //required
                            />
                          </div>
        
                          <div>
                            <label htmlFor="complementoInstalacao" className="block text-lg text-gray-700">
                              Complemento da Instalação
                            </label>
                            <input
                              type="text"
                              id="complementoInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={complementoInstalacao}
                              onChange={(e) => setComplementoInstalacao(e.target.value)}
                            />
                          </div>
                      </div>
        
                      <div>
                          <label htmlFor="linkInstalacaoUsina" className="block text-lg text-white">
                            Link do Local de Instalação da Usina*
                          </label>
                          <input
                            type="url"
                            id="linkInstalacaoUsina"
                            placeholder="Link copiado no Google Maps"
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={linkInstalacaoUsina}
                            onChange={(e) => setLinkInstalacaoUsina(e.target.value)}
                            //required
                          />

                          
                        </div>
        
        
                      <div>
                            <label htmlFor="comprovanteEnderecoInstalacao" className="block text-lg text-black">
                              Anexar Comprovante de Endereço da Instalação*
                            </label>
                            <input
                              type="file"
                              id="comprovanteEnderecoInstalacao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                              onChange={(e) => handleFilesChange(e, "comprovanteEnderecoInstalacao")}
                              multiple
                              //required
                            />
                            {linkComprovanteEnderecoInstalacao.length > 0 && (
                              <div>
                                <p>Comprovantes enviados:</p>
                                <ul>
                                  {linkComprovanteEnderecoInstalacao.map((link, index) => (
                                    <li key={index}>
                                      <a href={link} target="_blank" rel="noopener noreferrer">
                                        Visualizar Comprovante {index + 1}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            </div>
        
                  </fieldset>
                </div>
        
                  <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                      <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                        <legend className="text-xl font-bold text-gray-700 mb-4">Informações da Proposta Comercial</legend>
        
                        <div >
                            <label htmlFor="origemOportunidade" className="block text-lg text-white">
                                Origem do Lead
                            </label>
                            <select
                                id="origemOportunidade"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={origemOportunidade}
                                onChange={handleOrigemChange}
                                //required
                            >
                                <option value="">Selecione a origem do lead</option>
                                <option value="Contato do Cliente">Contato do Cliente</option>
                                <option value="Evento">Evento</option>
                                <option value="Indicação">Indicação</option>
                                <option value="Prospecção Ativa">Prospecção Ativa</option>
                                <option value="Pré Vendas (BDR/SDR)">Pré Vendas (BDR/SDR)</option>
                            </select>
                            </div>
        
               
                            {mostrarCampoPreVendedor && (
                            <div >
                                <label htmlFor="preVendedor" className="block text-lg text-white">
                                Pré-Vendedor
                                </label>
                                <select
                                id="preVendedor"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={preVendedor}
                                onChange={handlePreVendedorChange}
                            >
                                <option value="">Selecione o pré-vendedor</option>
                                {preVendedores.map((preVendedor, index) => (
                                <option key={index} value={preVendedor}>
                                    {preVendedor}
                                </option>
                                ))}
                            </select>
                            </div>
                            )}
        
                          <div >
                            <label htmlFor="numeroPropostaSolarMarket" className="block text-lg text-white">
                                Número da Proposta SolarMarket ou Promocional*
                            </label>
                            <input
                                type="text"
                                id="numeroPropostaSolarMarket"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={numeroPropostaSolarMarket}
                                onChange={(e) => setNumeroPropostaSolarMarket(e.target.value)}
                                //required
                            />
                            </div>
        
        
        
                            <div >
                            <label htmlFor="quantidadeModulos" className="block text-lg text-white">
                                Quantidade de Módulos*
                            </label>
                            <input
                                type="number"
                                id="quantidadeModulos"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={quantidadeModulos}
                                onChange={(e) => setQuantidadeModulos(e.target.value)}
                                //required
                            />
                            </div>
        
                            <div >
                            <label htmlFor="modeloModulo" className="block text-lg text-white">
                                Modelo do Módulo*
                            </label>
                            <select
                                id="modeloModulo"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={modeloModulo}
                                onChange={handleModeloModuloChange}
                            >
                                <option value="">Selecione o modelo do módulo</option>
                                {modelosModulos.map((modelo, index) => (
                                <option key={index} value={modelo}>
                                    {modelo}
                                </option>
                                ))}
                            </select>
                            </div>
        
        
        
                            {mostrarOutroModelo && (
                            <div >
                                <label htmlFor="outroModeloModulo" className="block text-lg text-white">
                                Especifique o outro modelo do módulo*
                                </label>
                                <input
                                type="text"
                                id="outroModeloModulo"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={outroModeloModulo}
                                onChange={(e) => setOutroModeloModulo(e.target.value)}
                                //required
                                />
                            </div>
                            )}
                          <div >
                                <label htmlFor="marcaInversores" className="block text-lg text-white">
                                    Marca dos Inversores*
                                </label>
                                <select
                                    
                                    id="marcaInversores"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={marcaInversores}  
                                    onChange={(e) => setMarcaInversores(e.target.value)}  
                                >
                                    <option value="">Selecione a marca do inversor</option>
                                    {marcasInversores.map((marca, index) => (
                                    <option key={index} value={marca}>
                                        {marca}
                                    </option>
                                    ))}
                                </select>
                          </div>
                           
        
                            <div >
                            <label htmlFor="quantidadeInversor1" className="block text-lg text-white">
                                Quantidade de Inversores (1)*
                            </label>
                            <input
                                type="number"
                                id="quantidadeInversor1"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={quantidadeInversor1}
                                onChange={(e) => setQuantidadeInversor1(e.target.value)}
                                //required
                            />
                            </div>
        
                            
        
                            <div >
                                <label htmlFor="modeloInversor1" className="block text-lg text-white">
                                    Modelo Inversor (1)*
                                </label>
                                <select
                                    id="modeloInversor1"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={modeloInversor1}  // Updated state
                                    onChange={(e) => setModeloInversor1(e.target.value)}  // Independent handler
                                >
                                    <option value="">Selecione o modelo do inversor</option>
                                    {inversores.map((inversor, index) => (
                                    <option key={index} value={inversor}>
                                        {inversor}
                                    </option>
                                    ))}
                                </select>
                            </div>
        
                            {!mostrarInversor2 && (
                              <button
                        type="button"
                        onClick={adicionarInversor2}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                            >
                                Adicionar Inversor 2
                            </button>
                            )}
                            {mostrarInversor2 && (
                            <>
                                <div >
                                <label htmlFor="quantidadeInversor2" className="block text-lg text-white">
                                    Quantidade de Inversores (2)*
                                </label>
                                <input
                                    type="number"
                                    id="quantidadeInversor2"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={quantidadeInversor2}
                                    onChange={(e) => setQuantidadeInversor2(e.target.value)}
                                    //required
                                />
                                </div>
        
                                <div >
                                  <label htmlFor="modeloInversor2" className="block text-lg text-white">
                                      Modelo Inversor (2)*
                                  </label>
                                  <div className="flex items-center">
                                      <select
                                          id="modeloInversor2"
                                          className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          value={modeloInversor2}
                                          onChange={(e) => setModeloInversor2(e.target.value)}
                                      >
                                          <option value="">Selecione o modelo do inversor</option>
                                          {inversores.map((inversor, index) => (
                                              <option key={index} value={inversor}>
                                                  {inversor}
                                              </option>
                                          ))}
                                      </select>
        
        
                                      <button
                                          type="button"
                                          onClick={removerInversor2}
                                          className="ml-2 px-2 py-1  text-white rounded-md  transition-colors duration-200"
                                          title="Remover Inversor 2"
                                      >
                                          ✖
                                      </button>
                                  </div>
                              </div>
        
                              {!mostrarInversor3 && (
                                <button
                                    type="button"
                                    onClick={adicionarInversor3}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                                >
                                    Adicionar Inversor 3
                                </button>
                                )}
                            </>
                            )}
                            {mostrarInversor3 && (
                            <>
                                <div >
                                <label htmlFor="quantidadeInversor3" className="block text-lg text-white">
                                    Quantidade de Inversores (3)*
                                </label>
                                <input
                                    type="number"
                                    id="quantidadeInversor3"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={quantidadeInversor3}
                                    onChange={(e) => setQuantidadeInversor3(e.target.value)}
                                    //required
                                />
                                </div>
        
                                <div >
                                  <label htmlFor="modeloInversor3" className="block text-lg text-white">
                                      Modelo Inversor (3)*
                                  </label>
                                  <div className="flex items-center">
                                      <select
                                          id="modeloInversor3"
                                          className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          value={modeloInversor3}
                                          onChange={(e) => setModeloInversor3(e.target.value)}
                                      >
                                          <option value="">Selecione o modelo do inversor</option>
                                          {inversores.map((inversor, index) => (
                                              <option key={index} value={inversor}>
                                                  {inversor}
                                              </option>
                                          ))}
                                      </select>
        
        
                                      <button
                                          type="button"
                                          onClick={removerInversor3}
                                           className="ml-2 px-2 py-1  text-white rounded-md  transition-colors duration-200"
                                          title="Remover Inversor 3"
                                      >
                                          ✖
                                      </button>
                                  </div>
                              </div>
                            </>
                            )}
        
        
                          <div >
                            <label htmlFor="quantidadeTotalInversores" className="block text-lg text-white">
                                Quantidade Total de Inversores*
                            </label>
                            <input
                                type="number"
                                id="quantidadeTotalInversores"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={quantidadeTotalInversores}
                                onChange={(e) => setQuantidadeTotalInversores(e.target.value)}
                                //required
                            />
                          </div>
        
        
        
                            
                          <div >
                              <label htmlFor="valorBrutoUsina" className="block text-lg text-white">
                                Valor da Proposta*
                              </label>
                              <input
                                type="text"
                                id="valorBrutoUsina"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formatarValor(valorBrutoUsina)}
                                onChange={handleValorBrutoChange}
                                //required
                              />
                          </div>
        
        
                  </fieldset>
                </div>
        
        
        
        
                <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                    <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                      <legend className="text-xl font-bold text-gray-700 mb-4">Informações Financeiras do Projeto</legend>
        
                      <div >
                              <label htmlFor="valorTotalContrato" className="block text-lg text-white">
                                Valor Total do Contrato*
                              </label>
                              <input
                                type="number"
                                id="valorTotalContrato"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={valorTotalContrato}
                                onChange={(e) => setValorTotalContrato(e.target.value)}
                                //required
                              />
                            </div>
        
                       
                            <div >
                                <label htmlFor="valorTotalContratoExtenso" className="block text-lg text-white">
                                Valor Total do Contrato por Extenso*
                                </label>
                                <input
                                type="text"
                                id="valorTotalContratoExtenso"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={valorTotalContratoExtenso}
                                readOnly
                                />
                            </div>
        
                      <div >
                                  <label htmlFor="tipoPagamento" className="block text-lg text-white">
                                    Forma de Pagamento*
                                  </label>
                                  <select
                                    id="tipoPagamento"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={tipoPagamento}
                                    onChange={handleTipoPagamentoChange}
                                  >
                                    <option value="">Selecione o Tipo de Pagamento</option>
                                    <option value="Boleto">Boleto</option>
                                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                                    <option value="Financiamento">Financiamento</option>
                                    <option value="Boleto e Financiamento">Boleto e Financiamento</option>
                                    <option value="Boleto e Cartão de Crédito">Boleto e Cartão de Crédito</option>
                                  </select>
                                </div>
        
                                <div className="mt-4">
                                {tipoPagamento === 'Boleto e Financiamento' ? (
                                  <>
                                    <div>
                                      <label htmlFor="valorBoleto" className="block text-lg text-white">
                                        Valor em Boleto*
                                      </label>
                                      <input
                                        type="text"
                                        id="valorBoleto"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                        value={formatarValor(valorBoleto)}
                                        onChange={handleValorBoletoChange}
                                        placeholder="Digite o valor do boleto"
                                      />
                                      <p className="text-white mt-2">
                                        {valorBoleto && `no valor total de ${formatarValor(valorBoleto)} reais em boleto`}
                                      </p>
                                      <label htmlFor="valorFinanciamento" className="block text-lg text-white mt-4">
                                        Valor no Financiamento*
                                      </label>
                                      <input
                                        type="text"
                                        id="valorFinanciamento"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                        value={formatarValor(valorFinanciamento)}  // Aplica a formatação na exibição
                                        onChange={handleValorFinanciamentoChange}  // Manipula o valor sem formatação
                                        placeholder="Digite o valor do financiamento"
                                      />
                                      <p className="text-white mt-2">
                                        {valorFinanciamento && `no valor total de ${formatarValor(valorFinanciamento)} reais no financiamento`}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Caso contrário, não exibe nada */}
                                  </>
                                )}
                              </div>
          
                                    <div className="mt-4">
                                  {tipoPagamento === 'Boleto e Cartão de Crédito' ? (
                                    <>
                                    <div>
                                      <label htmlFor="valorBoleto" className="block text-lg text-white">
                                        Valor em Boleto*
                                      </label>
                                      <input
                                        type="text"
                                        id="valorBoleto"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                        value={formatarValor(valorBoleto)}
                                        onChange={handleValorBoletoChange}
                                        placeholder="Digite o valor do boleto"
                                      />
                                      <p className="text-white mt-2">
                                        {valorBoleto && `no valor total de ${formatarValor(valorBoleto)} reais em boleto`}
                                      </p>
        
                                      <label htmlFor="valorCartao" className="block text-lg text-white mt-4">
                                              Valor no Cartão*
                                      </label>
                                          <input
                                              type="text"
                                              id="valorCartao"
                                              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                              value={formatarValor(valorCartao)}
                                              onChange={handleValorCartaoChange}
                                              placeholder="Digite o valor no Cartão"
                                          />
                                            <p className="text-white mt-2">
                                              {valorCartao && `No valor total de ${formatarValor(valorCartao)} reais`}
                                      </p>
                                    </div>
                                    </>
                                  ) : 
                                    <>                       
                                    </>
                                  }
                                </div>
         
                                
                                
        
                                {mostrarCamposOutros && (
                                  <div>
                                    <div>
                                      <label htmlFor="descricaoFormaPagamento" className="block text-lg text-white">
                                        Descrição da Forma de Pagamento*
                                      </label>
                                      <textarea
                                        id="descricaoFormaPagamento"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={descricaoFormaPagamento}
                                        onChange={(e) => setDescricaoFormaPagamento(e.target.value)}
                                        //required
                                      />
                                    </div>
        
                                   
        
        
        
                                  </div>
        
        
        
        
                                )}
        
        
        
                            {(tipoPagamento === "Boleto" || tipoPagamento === "Boleto e Cartão de Crédito" || tipoPagamento === "Boleto e Financiamento") && (
                            <div>
                                <label htmlFor="formaPagamentoBoleto" className="block text-lg text-white">
                                Forma de Pagamento - Boleto*
                                </label>
                                <select
                                id="formaPagamentoBoleto"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formaPagamentoBoleto}
                                onChange={(e) => setFormaPagamentoBoleto(e.target.value)}
                                //required
                                >
                                <option value="">Selecione a forma de pagamento</option>
                                <option value="O boleto será pago com 100% à vista">100% à vista</option>
                                <option value="O boleto será pago com 90% à vista e 10% em 30 dias">90% à vista e 10% em 30 dias</option>
                                <option value="O boleto será pago com 80% à vista e 20% em 30 dias">80% à vista e 20% em 30 dias</option>
                                <option value="O boleto será pago com 80% à vista, 10% em 30 dias e 10% em 60 dias">80% à vista, 10% em 30 dias e 10% em 60 dias</option>
                                <option value="O boleto será pago com 80% à vista, 6,66% em 30 dias, 6,66% em 60 dias e 6,67% em 90 dias">
                                    80% à vista, 6,66% em 30 dias, 6,66% em 60 dias e 6,67% em 90 dias
                                </option>
                                <option value="O boleto será pago com 80% à vista e 20% em 60 dias">80% à vista e 20% em 60 dias</option>
                                <option value="O boleto será pago com 80% à vista, 20% em 90 dias">80% à vista, 20% em 90 dias</option>
                                <option value="O boleto será pago com 80% à vista, 20% após a instalação da usina">80% à vista, 20% após a instalação da usina</option>
                                <option value="Outros">Outros</option>
                                </select>
                            </div>
                            )}
        
                              {formaPagamentoBoleto === "Outros" && (
                                <div className="mt-4">
                                <label htmlFor="descricaoFormaPagamentoBoleto" className="block text-lg text-white">
                                  Descrição da forma de pagamento Boleto*
                                </label>
                                <input
                                  type="text"
                                  id="descricaoFormaPagamentoBoleto"
                                  className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={`${descricaoFormaPagamentoBoleto}`}
                                  onChange={(e) => setDescricaoFormaPagamentoBoleto(e.target.value.replace(/^Sendo\s*/, ''))}
                                  //required
                                />
                              </div>
                                )}
        
        {(tipoPagamento === "Cartão de Crédito" || tipoPagamento === "Boleto e Cartão de Crédito") && (
                        <>
                            <div>
                                <label htmlFor="formaPagamentoCartao" className="block text-lg text-white">
                                    Forma de Pagamento - Cartão*
                                </label>
                                <select
                                    id="formaPagamentoCartao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formaPagamentoCartao}
                                    onChange={(e) => setFormaPagamentoCartao(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione a forma de pagamento</option>
                                    {[...Array(21)].map((_, i) => (
                                        <option key={i + 1} value={`O cartão pago em ${i + 1}x`}>{`${i + 1}x`}</option>
                                    ))}
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
        
                            {formaPagamentoCartao === "Outros" && (
                                <div>
                                    <label htmlFor="descricaoFormaPagamentoCartao" className="block text-lg text-white">
                                        Especifique a Forma de Pagamento*
                                    </label>
                                    <input
                                        type="text"
                                        id="descricaoFormaPagamentoCartao"
                                        placeholder="Digite a forma de pagamento"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={descricaoFormaPagamentoCartao}
                                        onChange={(e) => setDescricaoFormaPagamentoCartao(e.target.value)}
                                        //required
                                    />
                                </div>
                            )}
        
                            <div>
                                <label htmlFor="valorJurosCartao" className="block text-lg text-white">
                                    Valor do Juros no Cartão de Crédito*
                                </label>
                                <input
                                    type="text"
                                    id="valorJurosCartao"
                                    placeholder="Ex: 00.000,00"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={valorJurosCartao}
                                    onChange={(e) => setValorJurosCartao(e.target.value)}
                                    //required
                                />
                                <p className="text-white mt-2">
                                    {valorJurosCartao && `Sendo ${valorJurosCartao} reais de juros do cartão`}
                                </p>
                            </div>
                        </>
                    )}
        
                            {tipoPagamento.includes("Financiamento") && (
                            <>
                            <div>
                              <label htmlFor="bancoFinanciamento" className="block text-lg text-white">
                                Banco do Financiamento*
                              </label>
                              <select
                                id="bancoFinanciamento"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={bancoFinanciamento}
                                onChange={(e) => setBancoFinanciamento(e.target.value)}
                                //required
                              >
                                <option value="">Selecione o banco</option>
                                <option value="Banco do Brasil">Banco do Brasil</option>
                                <option value="Bradesco">Bradesco</option>
                                <option value="BV">BV</option>
                                <option value="Santander">Santander</option>
                                <option value="Sicoob">Sicoob</option>
                                <option value="Sicredi Agência">Sicredi Agência</option>
                                <option value="Sicredi Plataforma">Sicredi Plataforma</option>
                                <option value="Outro">Outro</option>
                              </select>
                            </div>
        
                            {bancoFinanciamento && bancoFinanciamento !== "" && (
                              <p className="text-white mt-2">
                                Sendo o banco responsável pelo financiamento: {bancoFinanciamento === "Outro" ? outroBancoFinanciamento : bancoFinanciamento}
                              </p>
                            )}
        
                            {bancoFinanciamento === "Outro" && (
                              <div>
                                <label htmlFor="outroBancoFinanciamento" className="block text-lg text-white">
                                  Especifique o Nome do Banco*
                                </label>
                                <input
                                  type="text"
                                  id="outroBancoFinanciamento"
                                  className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={outroBancoFinanciamento}
                                  onChange={(e) => setOutroBancoFinanciamento(e.target.value)}
                                  //required
                                />
                              </div>
                            )}
                            </>
                            )}
        
                            <div >
                            <label htmlFor="tipoFaturamento" className="block text-lg text-white">
                                Tipo de Faturamento*
                            </label>
                            <input
                                type="text"
                                id="tipoFaturamento"
                                className="w-full p-2 mt-2 border  rounded-md "
                                value={tipoFaturamento}
                                readOnly
                 
                            />
                            </div>
        
                            {(tipoPagamento === "Financiamento" || tipoPagamento === "Boleto e Financiamento") && (
                            <>
        
                          <div>
                                <label htmlFor="nfAntecipada" className="block text-lg text-white">
                                    É necessário Emitir NF Antecipada no Financiamento?*
                                </label>
                                <select
                                    id="nfAntecipada"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={nfAntecipada}
                                    onChange={(e) => setNfAntecipada(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione</option>
                                    <option value="Sim">Sim</option>
                                    <option value="Não">Não</option>
                                </select>
                                </div>
                            </>
                            )}
                          
        
                          <div>
                                      <label htmlFor="arquivoAutorizacao" className="block text-lg text-black">
                                      Anexar Autorização do Supervisor(se necessário)
                                      </label>
                                      <input
                                        type="file"
                                        id="arquivoAutorizacao"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                        onChange={(e) => handleFilesChange(e, "arquivoAutorizacao")}
                                        multiple
                                        ////required
                                      />
                                      {linkArquivoAutorizacao.length > 0 && (
                                        <div>
                                          <p>Comprovantes enviados:</p>
                                          <ul>
                                            {linkArquivoAutorizacao.map((link, index) => (
                                              <li key={index}>
                                                <a href={link} target="_blank" rel="noopener noreferrer">
                                                  Visualizar Autorização {index + 1}
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                    </fieldset>
                  </div>
        
                  <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                    <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                        <legend className="text-xl font-bold text-gray-700 mb-4">Informações Básicas do Projeto</legend>
                        
        
                            <div >
                                <label htmlFor="expansaoUsina" className="block text-lg text-white">
                                    O Cliente Está Expandindo uma Usina já Existente?*
                                </label>
                                <select
                                    id="expansaoUsina"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={expansaoUsina}
                                    onChange={(e) => setExpansaoUsina(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione uma opção</option>
                                    <option value="Sim">Sim</option>
                                    <option value="Não">Não</option>
                                </select>
                            </div>
        
                                                
                            {expansaoUsina === "Sim" && (
                              <div className="mt-4">
                                <div >
                                  <label htmlFor="potenciaExistente" className="block text-lg text-white">
                                    Potência Existente (kW)*
                                  </label>
                                  <input
                                    type="number"
                                    id="potenciaExistente"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={potenciaExistente}
                                    onChange={(e) => setPotenciaExistente(e.target.value)}
                                    
                                  />
                                </div>
        
                                <div >
                                  <label htmlFor="potenciaIncrementada" className="block text-lg text-white">
                                    Potência Incrementada (kW)*
                                  </label>
                                  <input
                                    type="number"
                                    id="potenciaIncrementada"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={potenciaIncrementada}
                                    onChange={(e) => setPotenciaIncrementada(e.target.value)}
                                    
                                  />
                                </div> 
                              </div>
                            )}
                                <div >
                                          <label htmlFor="potenciaTotalProjeto" className="block text-lg text-white">
                                            Potência Total (kW)*
                                          </label>
                                          <input
                                              type="number"
                                              id="potenciaTotalProjeto"
                                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              value={potenciaTotalProjeto}
                                              onChange={(e) => setPotenciaTotalProjeto(e.target.value)}
                                              //required
                                          />
                                </div>
        
                            <div> 
                                <label htmlFor="tipoEstrutura" className="block text-lg text-white">
                                    Tipo de Estrutura para Instalação dos Módulos*
                                </label>
                                <select
                                    id="tipoEstrutura"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={tipoEstrutura}
                                    onChange={(e) => setTipoEstrutura(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione o tipo de estrutura</option>
                                    <option value="para telhado Metálico">para telhado Metálico</option>
                                    <option value="para telhado Cerâmico">para telhado Cerâmico</option>
                                    <option value="para Solo">para Solo</option>
                                    <option value="Carport">Carport</option>
                                    <option value="para Fibrocimento">para Fibrocimento</option>
                                    <option value="para Fibromadeira">para Fibromadeira</option>
                                    <option value="para Laje">para Laje</option>
                                </select>
                            </div>
        
                            <div >
                                <label htmlFor="modalidadeCompensacao" className="block text-lg text-white">
                                    Modalidade de Compensação*
                                    </label>
                                    <select
                                    id="modalidadeCompensacao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={modalidadeCompensacao}
                                    onChange={handleModalidadeChange}
                                    //required
                                    >
                                    <option value="">Selecione a modalidade</option>
                                    <option value="Autoconsumo Remoto">Autoconsumo Remoto</option>
                                    <option value="Autoconsumo Local (FAST TRACK)">Autoconsumo Local (FAST TRACK)</option>
                                    <option value="EMUC">EMUC</option>
                                    </select>
                                </div>
        
        
                                {mostrarCamposAdicionais && (
                                    <div >
                                    <div className="w-full max-w-md p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 break-words">
                                        <p>
                                        Usinas com potência nominal de até 7,5 kW (3 micros ou 1 inversor de 7k),
                                        em que o cliente não pode enviar créditos para outra instalação, toda
                                        energia excedente só pode ser consumida no local em que a usina está instalada.
                                        </p>
                                    </div>
        
                                    <div className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 break-words">
                                         <p>
                                        É necessário gerar e assinar o termo
                                        </p>
                                    </div>
                                    </div>
                                )}
                    
        
                            {modalidadeCompensacao != 'Autoconsumo Local (FAST TRACK)' && (
                              <div >
                                <label htmlFor="tipoCompensacao" className="block text-lg text-white">
                                    Cliente Enviará Compensação a Outras Instalações?*
                                </label>
                                <select
                                    id="tipoCompensacao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={tipoCompensacao}
                                    onChange={(e) => setTipoCompensacao(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione uma opção</option>
                                    <option value="Não enviará compensação para outro local">
                                    Não enviará compensação para outro local
                                    </option>
                                    <option value="Cliente vai compensar créditos em outra instalação">
                                    Cliente vai compensar créditos em outra instalação
                                    </option>
                                </select>
                            </div>
        
                            )}
                            {modalidadeCompensacao === 'Autoconsumo Local (FAST TRACK)' && (
                              tipoCompensacao == "Não enviará compensação para outro local"
                            )}
        
        
                            <div>
                                <label htmlFor="observacoesVistoria" className="block text-lg text-white">
                                Observações Necessárias para VISTORIA TÉCNICA*
                                </label>
                                <textarea
                                    id="observacoesVistoria"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={observacoesVistoria}
                                    onChange={(e) => setObservacoesVistoria(e.target.value)}
                                    //required
                                />
                            </div>
        
        
        
        
                            </fieldset>
                          </div>
        
                          
        
                          <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                            <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                              <legend className="text-xl font-bold text-gray-700 mb-4">Informações Sobre o Padrão Atual</legend>
        
        
                              <div >
                                <label htmlFor="padrao" className="block text-lg text-white">
                                Tipo de Padrão*
                                </label>
                                <select
                                id="padrao"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={padrao}
                                onChange={handlePadraoChange}
                                //required
                                >
                                <option value="">Selecione o padrão</option>
                                <option value="Individual">Individual</option>
                                <option value="Coletivo">Coletivo</option>
                                </select>
                            </div>
                            
        
                          
                            <div >
                                <label htmlFor="correntePadrao" className="block text-lg text-white">
                                    Corrente do Padrão*
                                </label>
                                <input
                                    type="text"
                                    id="correntePadrao"
                                    placeholder="Ex: 63A"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={correntePadrao}
                                    onChange={(e) => setCorrentePadrao(e.target.value)}
                                    //required
                                />
                            </div>
        
        
                            <div >
                                <label htmlFor="tipoPadrao" className="block text-lg text-white">
                                Quantidade de Fases do Disjuntor Atual*
                                </label>
                                <select
                                    id="tipoPadrao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={tipoPadrao}
                                    onChange={(e) => setTipoPadrao(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione o tipo de padrão</option>
                                    <option value="Monofásico">Monofásico</option>
                                    <option value="Bifásico">Bifásico</option>
                                    <option value="Trifásico">Trifásico</option>
                                </select>
                            </div>
                   
                          <div >
                            <label htmlFor="fotosPadrao" className="block text-lg text-black">
                              Anexar Fotos do Padrão*
                            </label>
                            <input
                              type="file"
                              id="fotosPadrao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                              onChange={(e) => handleFilesChange(e, "fotosPadrao")}
                              multiple
                              //required
                            />
                            {linkFotosPadrao.length > 0 && (
                              <div>
                                <p>Fotos enviadas:</p>
                                <ul>
                                  {linkFotosPadrao.map((link, index) => (
                                    <li key={index}>
                                      <a href={link} target="_blank" rel="noopener noreferrer">
                                        Visualizar Foto {index + 1}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
        
        
                          </div>
                             
        
                                             
                          <div>
                              <label htmlFor="Descrição" className="block text-lg text-white">
                              Descrição Sobre Padrão:
                              </label>
                                <textarea
                                      id="Descrição"
                                      className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={DescricaoPadrao}
                                      onChange={(e) => setDescricaoPadrao(e.target.value)}
                                      
                                ></textarea>
                          </div>
        
        
                          <div >
                            <label htmlFor="ImagensDiversasPadrao" className="block text-lg text-black">
                            Imagens Necessárias Ramal de Entrada, Disjuntor, Medidor de Energia, Caixa de Medição (Imagem Ampla e Aproximada)*
                            </label>
                            <input
                              type="file"
                              id="ImagensDiversasPadrao"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                              onChange={(e) => handleFilesChange(e, "ImagensDiversasPadrao")}
                              multiple
                              //required
                            />
                            {linkImagensDiversasPadrao.length > 0 && (
                              <div>
                                <p>Fotos enviadas:</p>
                                <ul>
                                  {linkImagensDiversasPadrao.map((link, index) => (
                                    <li key={index}>
                                      <a href={link} target="_blank" rel="noopener noreferrer">
                                        Visualizar Foto {index + 1}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
        
        
                          {/* parte do guilherme */}
        
        
                          <div>
                              <label htmlFor="QuantidadePadroes" className="block text-lg text-white">
                              Quantidade de Padrões*
                              </label>
                                <textarea
                                      id="QuantidadePadroes"
                                      className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={QuantidadePadroes}
                                      onChange={(e) => setQuantidadePadroes(e.target.value)}
                                      
                                ></textarea>
                          </div>
        
                          <div >
                                <label htmlFor="TipoConexaoPadrao" className="block text-lg text-white">
                                Tipo de Conexão*
                                </label>
                                <select
                                    id="TipoConexaoPadrao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={TipoConexaoPadrao}
                                    onChange={(e) => setTipoConexaoPadrao(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione o tipo de padrão</option>
                                    <option value="bifásico">Bifásico</option>
                                    <option value="trifásico">Trifásico</option>
                                </select>
                            </div>
        
                            <div >
                                <label htmlFor="CorrenteDisjuntor" className="block text-lg text-white">
                                Corrente do Disjuntor em (A)*
                                </label>
                                <select
                                    id="CorrenteDisjuntor"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={CorrenteDisjuntor}
                                    onChange={(e) => setCorrenteDisjuntor(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione a Corrente do Disjuntor</option>
                                    <option value="63A">63A</option>
                                    <option value="80A">80A</option>
                                    <option value="100A">100A</option>
                                    <option value="125A">125A</option>
                                    <option value="150A">150A</option>
                                    <option value="175A">175A</option>
                                    <option value="200A">200A</option>
                                    
                                </select>
                            </div>
        
                            <div >
                                <label htmlFor="FavorOuContraRede" className="block text-lg text-white">
                                Local do Padrão em Relação a Rede da Concessionária*
                                </label>
                                <select
                                    id="FavorOuContraRede"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={FavorOuContraRede}
                                    onChange={(e) => setFavorOuContraRede(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione o Local do Padrão em Relação a Rede da Concessionária</option>
                                    <option value="a favor da rede">A Favor da Rede da Concessionária</option>
                                    <option value="contra a rede">Contra a Rede da Concessionária</option>
                                </select>
                            </div>
        
                            <div >
                                <label htmlFor="ServicoAlvenaria" className="block text-lg text-white">
                                Terá Serviço de Alvenaria?*
                                </label>
                                <select
                                    id="ServicoAlvenaria"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={ServicoAlvenaria}
                                    onChange={(e) => setServicoAlvenaria(e.target.value)}
                                    //required
                                >
                                    <option value="">Selecione se Terá Serviço de Alvenaria ou Não</option>
                                    <option value="sem serviço de">Sem Serviço de Alvenaria</option>
                                    <option value="com serviço de">Com Serviço de Alvenaria</option>
                                </select>
                            </div>
        
        
        
                            </fieldset>
                          </div>
        
                          <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                            <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                              <legend className="text-xl font-bold text-gray-700 mb-4">Informações Serviços Adicionais</legend>
                              <div >
                            <label htmlFor="possuiAditivos" className="block text-lg text-white">
                                Possui Serviços Adicionais?*
                            </label>
                            <select
                                id="possuiAditivos"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={possuiAditivos}
                                onChange={(e) => setPossuiAditivos(e.target.value)}
                                //required
                            >
                                <option value="">Selecione</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            </div>
        
        
                            {possuiAditivos === "Sim" && (
                            <div >
                            <label htmlFor="aditivos" className="block text-lg text-white">
                                Qual Serviço Adicional?*
                            </label>
                            <textarea
                                id="aditivos"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={aditivos}
                                onChange={(e) => setAditivos(e.target.value)}
                                //required
                            />
                            </div>
                            )}
        
                              <div >
                                <label htmlFor="padraoMultiluz" className="block text-lg text-white">
                                  Padrão VENDIDO e INSTALADO pela Multiluz?*
                                </label>
                                  <select
                                  id="padraoMultiluz"
                                  className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={padraoMultiluz}
                                  onChange={(e) => setPadraoMultiluz(e.target.value)}
                                  //required
                                >
                                  <option value="">Selecione uma opção</option>
                                  <option value="Sim">Sim</option>
                                  <option value="Não">Não</option>
                                </select>
                              </div>
        
                              {padraoMultiluz === 'Sim' && (
                                <div >
                                  <label htmlFor="valorPadrao" className="block text-lg text-white">
                                    Valor do Padrão*
                                  </label>
                                  <input
                                    type="number"
                                    id="valorPadrao"
                                    className="w-full p-2 mt-2 border border-gray-300 rounded-md"
                                    value={valorPadrao}
                                    onChange={(e) => setValorPadrao(e.target.value)}
                                    placeholder="Insira o valor do padrão"
                                  />
                                </div>
                              )}
        
                            </fieldset>
                          </div>
        
        
        
        
                        <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                        <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                            <legend className="text-xl font-bold text-gray-700 mb-4">Informações para Solicitação de Acesso a Concessionária de Energia (Homologação)</legend>
             
                           
                            <div className="flex flex-col space-y-4 mt-4">
                                      <label className="text-lg">
                                        O Titular do Contrato é o Mesmo Titular do Projeto na Concessionária?
                                      </label>
        
                                      <div className="flex items-center space-x-4">
                                        <label htmlFor="mesmoResponsavelSim" className="flex items-center text-lg">
                                          <input
                                            type="radio"
                                            id="mesmoResponsavelSim"
                                            name="mesmoResponsavel"
                                            value="sim"
                                            onChange={(e) => handleMesmoResponsavelChange(e.target.checked)}
                                            className="mr-2"
                                          />
                                          Sim
                                        </label>
        
                                        <label htmlFor="mesmoResponsavelNao" className="flex items-center text-lg">
                                          <input
                                            type="radio"
                                            id="mesmoResponsavelNao"
                                            name="mesmoResponsavel"
                                            value="nao"
                                            className="mr-2"
                                          />
                                          Não
                                        </label>
                                      </div>
                                    </div>
        
                                    {/* Tipo do Titular */}
                                    <div className="mt-4">
                                      <label htmlFor="tipoTitularProjeto" className="block text-lg text-gray-700">
                                        Tipo do titular do Projeto na Concessionária*
                                      </label>
                                      <select
                                        id="tipoTitularProjeto"
                                        className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={tipoTitularProjeto}
                                        onChange={(e) => handleTipoTitularProjetoChange(e.target.value)}
                                        //required
                                      >
                                        <option value="">Selecione o tipo do titular</option>
                                        <option value="PF">PF</option>
                                        <option value="PJ">PJ</option>
                                      </select>
                                    </div>
        
                                    {/* Campos para PJ */}
                                    {tipoTitularProjeto === "PJ" && (
                                      <div className="flex flex-col space-y-4 mt-4">
                                        <div>
                                          <label htmlFor="razaoSocialTitularConc" className="block text-lg text-gray-700">
                                            Razão Social Titular do Projeto*
                                          </label>
                                          <input
                                            type="text"
                                            id="razaoSocialTitularConc"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={razaoSocialTitularConc}
                                            onChange={(e) => setRazaoSocialTitularConc(e.target.value.toUpperCase())}
                                            //required
                                          />
                                        </div>
        
                                        <div>
                                          <label htmlFor="finalidadeEmpresaTitularConc" className="block text-lg text-gray-700">
                                            Finalidade da Empresa Titular do Projeto*
                                          </label>
                                          <select
                                            id="finalidadeEmpresaTitularConc"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={finalidadeEmpresaTitularConc}
                                            onChange={(e) => setFinalidadeEmpresaTitularConc(e.target.value)}
                                            //required
                                          >
                                            <option value="">Selecione uma opção</option>
                                            <option value="Pessoa Jurídica de direito privado">
                                              Pessoa Jurídica de direito privado
                                            </option>
                                            <option value="Pessoa Jurídica de direito privado, sem fins lucrativos">
                                              Pessoa Jurídica de direito privado, sem fins lucrativos
                                            </option>
                                            <option value="Sociedade Cooperativa">Sociedade Cooperativa</option>
                                            <option value="Pessoa Jurídica de direito público">
                                              Pessoa Jurídica de direito público
                                            </option>
                                          </select>
                                        </div>
        
                                        <div>
                                          <label htmlFor="cnpjTitularProjeto" className="block text-lg text-gray-700">
                                            CNPJ do Projeto na Concessionária*
                                          </label>
                                          <InputMask
                                            mask="99.999.999/9999-99"
                                            id="cnpjTitularProjeto"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={cnpjTitularProjeto}
                                            onChange={(e) => setCnpjTitularProjeto(e.target.value)}
                                            //required
                                          />
                                        </div>
        
                                        <div>
                                          <label htmlFor="nomeResponsavelTitularProjeto" className="block text-lg text-gray-700">
                                            Responsável pela Empresa no Contrato Social*
                                          </label>
                                          <input
                                            type="text"
                                            id="nomeResponsavelTitularProjeto"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={nomeResponsavelTitularProjeto}
                                            onChange={(e) => setNomeResponsavelTitularProjeto(e.target.value.toUpperCase())}
                                            //required
                                          />
                                        </div>
        
                                        <div>
                                          <label
                                            htmlFor="profissaoResponsavelTitularConcessionaria"
                                            className="block text-lg text-gray-700"
                                          >
                                            Cargo do Responsável pela Empresa*
                                          </label>
                                          <input
                                            type="text"
                                            id="profissaoResponsavelTitularConcessionaria"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={profissaoResponsavelTitularConcessionaria}
                                            onChange={(e) =>
                                              setProfissaoResponsavelTitularConcessionaria(e.target.value.toUpperCase())
                                            }
                                            //required
                                          />
                                        </div>
        
                                        <div>
                                          <label htmlFor="cpfResponsavelTitularProjeto" className="block text-lg text-gray-700">
                                            CPF do Responsável pela Empresa Titular do Projeto na Concessionária*
                                          </label>
                                          <InputMask
                                            mask="999.999.999-99"
                                            id="cpfResponsavelTitularProjeto"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={cpfResponsavelTitularProjeto}
                                            onChange={(e) => setCpfResponsavelTitularProjeto(e.target.value)}
                                            //required
                                          />
                                        </div>
                                      </div>
                                    )}
                                          <div>
                                          <label htmlFor="telefoneResponsavelHomologacao" className="block text-lg text-gray-700">
                                            Telefone do Responsável na Concessionária*
                                          </label>
                                          <input
                                            type="text"
                                            id="telefoneResponsavelHomologacao"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={telefoneResponsavelHomologacao}
                                            onChange={(e) => setTelefoneResponsavelHomologacao(e.target.value.toUpperCase())}
                                            //required
                                          />
                                        </div>
                                    {/* Campos para PF */}
                                    {tipoTitularProjeto === "PF" && (
                                      <div className="flex flex-col space-y-4 mt-4">
                                        <div>
                                          <label htmlFor="nomeTitularProjeto" className="block text-lg text-gray-700">
                                            Nome do Responsável na Concessionária*
                                          </label>
                                          <input
                                            type="text"
                                            id="nomeTitularProjeto"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={nomeTitularProjeto}
                                            onChange={(e) => setNomeTitularProjeto(e.target.value.toUpperCase())}
                                            //required
                                          />
                                        </div>
        
                                       
        
                                        <div>
                                          <label htmlFor="estadoCivilTitularConcessionaria" className="block text-lg text-gray-700">
                                            Estado Civil do Titular na Concessionária*
                                          </label>
                                          <select
                                            id="estadoCivilTitularConcessionaria"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={estadoCivilTitularConcessionaria}
                                            onChange={(e) => setEstadoCivilTitularConcessionaria(e.target.value)}
                                            //required
                                          >
                                            <option value="">Selecione o estado civil</option>
                                            <option value="Solteiro(a)">Solteiro(a)</option>
                                            <option value="Casado(a)">Casado(a)</option>
                                            <option value="Divorciado(a)">Divorciado(a)</option>
                                            <option value="Viúvo(a)">Viúvo(a)</option>
                                            <option value="União Estável">União Estável</option>
                                          </select>
                                        </div>
        
                                        <div>
                                          <label htmlFor="profissaoTitularConcessionaria" className="block text-lg text-gray-700">
                                            Profissão do Titular na Concessionária*
                                          </label>
                                          <input
                                            type="text"
                                            id="profissaoTitularConcessionaria"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={profissaoTitularConcessionaria}
                                            onChange={(e) => setProfissaoTitularConcessionaria(e.target.value.toUpperCase())}
                                            //required
                                          />
                                        </div>
        
                                        <div>
                                          <label htmlFor="cpfTitularProjeto" className="block text-lg text-gray-700">
                                            CPF do Titular do Projeto na Concessionária*
                                          </label>
                                          <InputMask
                                            mask="999.999.999-99"
                                            id="cpfTitularProjeto"
                                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={cpfTitularProjeto}
                                            onChange={(e) => setCpfTitularProjeto(e.target.value)}
                                            //required
                                          />
                                        </div>
                                      </div>
                                    )}
        
                                   
        
        
                                  
                            <div>
                            <label htmlFor="projetoAprovado" className="block text-lg text-white">
                                Cliente já Possui Projeto Aprovado?*
                            </label>
                            <select
                                id="projetoAprovado"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={projetoAprovado}
                                onChange={(e) => setProjetoAprovado(e.target.value)}
                                //required
                            >
                                <option value="">Selecione</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            </div>
        
          
                            {projetoAprovado === "Sim" && (
                            <div>
                                <label htmlFor="nomeParecerAprovado" className="block text-lg text-white">
                                Nome Vinculado ao Parecer de Acesso Aprovado*
                                </label>
                                <input
                                type="text"
                                id="nomeParecerAprovado"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={nomeParecerAprovado}
                                onChange={(e) => setNomeParecerAprovado(e.target.value.toUpperCase())}
                                //required
                                />
                            </div>
                            )}
        
        
                          
                            <div >
                            <label htmlFor="alteracaoPadrao" className="block text-lg text-white">
                                Terá Alteração no Padrão?*
                            </label>
                            <select
                                id="alteracaoPadrao"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={alteracaoPadrao}
                                onChange={(e) => setAlteracaoPadrao(e.target.value)}
                                //required
                            >
                                <option value="">Selecione uma opção</option>
                                <option value="Sim">Sim</option>
                                <option value="Não">Não</option>
                            </select>
                            </div>
        
                            {alteracaoPadrao === 'Sim' && (
                            <div className="mt-4">
                              <div>
                                <label htmlFor="descricaoAlteracao" className="block text-lg text-white">
                                Informação Sobre a Alteração:?*
                                </label>
                                <textarea
                                  id="descricaoAlteracao"
                                  className="w-full p-1 mt-1 border border-gray-300 rounded-md"
                                  value={descricaoAlteracao}
                                  onChange={(e) => setDescricaoAlteracao(e.target.value)}
                                  placeholder="Em casos onde será necessária a alteração de carga, é necessário descrever a relação de alteração conforme exemplo abaixo: 
                                  1 x 40A para 2 x 63A 
                                  2 x 63A para 3 x 100A 
                                  P.S: 1 para monofásico, 2 para bifásico e 3 para trifásico."
                                  style={{ minHeight: '160px' }}
                                />
                              </div>                   
                            </div>
                          )}
        
                          <div>
                            <label htmlFor="observacoesPadrao" className="block text-lg text-white">
                                Observações sobre o Padrão
                            </label>
                            <textarea
                                id="observacoesPadrao"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={observacoesPadrao}
                                onChange={(e) => setObservacoesPadrao(e.target.value)}
                                
                            />
                          </div>
        
                          <div >
                            <label htmlFor="potenciaTotalInversores" className="block text-lg text-white">
                                Potência Total dos Inversores (kW)*
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="potenciaTotalInversores"
                                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={potenciaTotalInversores}
                                onChange={(e) => setPotenciaTotalInversores(e.target.value)}
                                //required
                            />
                          </div>
        
        
                            </fieldset>
                          </div>
        
        
                           
                            <div>
                              <label htmlFor="observacoes" className="block text-lg text-white">
                                  Observações Finais
                              </label>
                                <textarea
                                      id="observacoes"
                                      className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={observacoes}
                                      onChange={(e) => setObservacoes(e.target.value)}
                                      
                                ></textarea>
                            </div>
        
                            <div>
                            <label htmlFor="dataContrato" className="block text-lg text-white">
                                Data do Contrato*
                            </label>
                            <InputMask
                              mask="99/99/9999"
                              id="dataContrato"
                              placeholder="dd/mm/aaaa"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={dataContrato}
                              onChange={(e) => setDataContrato(e.target.value)}
                              readOnly
                              //required
                            />
                            </div>
        
        
                          <div className="bg-white rounded-lg shadow-md px-2 py-4 w-full">
                          <fieldset className="border border-gray-300 rounded-lg px-2 py-4 shadow-sm w-full">
                              <legend className="text-xl font-bold text-gray-700 mb-4">Dados do Verificador do Contrato</legend>
                            
        
                          <div className="mt-4">
                            <label htmlFor="verificadorContrato" className="block text-lg text-white">
                              Nome do Verificador do Contrato
                            </label>
                            <input
                              type="text"
                              id="verificadorContrato"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={verificadorContrato}
                           
                              //required
                            />
                          </div>
        
                          
                          <div className="mt-4">
                            <label htmlFor="emailVerificadorContrato" className="block text-lg text-white">
                              Email do Verificador do Contrato
                            </label>
                            <input
                              type="email"
                              id="emailVerificadorContrato"
                              className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={emailVerificadorContrato}
                            
                              //required
                            />
                          </div>
                          </fieldset>
                        </div>
        
                        </div>
        
                        <button
                          type="submit"
                          className={`w-full rounded-md border-2 border-green-800 bg-green-600 px-6 py-3 text-white text-xl transition-colors duration-300 hover:bg-green-400 mt-4 ${
                            isSubmitting ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Enviando..." : "Enviar"}
                        </button>
                      </form>
        
        
                      
                    </div>
                  </div>
                </div>
              </section>
            </main>
            
          );
        };
        
        export default Forms;