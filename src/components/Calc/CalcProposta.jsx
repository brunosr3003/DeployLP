// src/components/Calc/CalcProposta.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import EditarMPPT from './EditarMPPT';
import SelecionarInversor from './SelecionarInversor';
import { PencilSquareIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from '../../AuthContext';

const CalcProposta = () => {
  // Função helper para garantir que um valor seja um número válido
  const safeNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const port = import.meta.env.REACT_APP_PORT || 1000; 
  // Estados para os campos do formulário
  const [consumoMedioMensal, setConsumoMedioMensal] = useState('');
  const [maxOverload, setMaxOverload] = useState('30');
  const [faseInversor, setFaseInversor] = useState('Trifásico'); // Padrão como 'Trifásico'
  const [tipoTelhado, setTipoTelhado] = useState('COLONIAL'); // Valor padrão
  const [cidade, setCidade] = useState(null);
  const [listaCidades, setListaCidades] = useState([]);

  // Estado para seleção de módulo
  const [modulo, setModulo] = useState(null);
  const [listaModulos, setListaModulos] = useState([]);
  const [cheapestModuleId, setCheapestModuleId] = useState(null); // ID do módulo mais barato

  // Novo estado para a potência necessária em W
  const [potenciaNecessaria, setPotenciaNecessaria] = useState('');

  // Estados para as combinações de kits e seleção
  const [kitsCombinacoes, setKitsCombinacoes] = useState([]);
  const [erro, setErro] = useState('');
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Estados para personalização e preços
  const [precoAnterior, setPrecoAnterior] = useState(null);
  const [precoNovo, setPrecoNovo] = useState(null);

  // Estados para manipulação de MPPTs e modais
  const [openMPPTKitIds, setOpenMPPTKitIds] = useState([]);
  const [kitParaEditar, setKitParaEditar] = useState(null);
  const [isEditarMPPTOpen, setIsEditarMPPTOpen] = useState(false);
  const [isDistribuirMPPTOpen, setIsDistribuirMPPTOpen] = useState(false);
  const [kitParaDistribuir, setKitParaDistribuir] = useState(null);
  const [isSelecionarInversorOpen, setIsSelecionarInversorOpen] = useState(false);
  const [kitSelecionadoParaTroca, setKitSelecionadoParaTroca] = useState(null);

  // Estados para inversores
  const [inversores, setInversores] = useState([]);
  const [loadingInversores, setLoadingInversores] = useState(false);

  const [usarMicroInversor, setUsarMicroInversor] = useState(false);

  const location = useLocation();
  const { cliente } = location.state || {};

  const { auth } = useContext(AuthContext);

  // Fetch inversores ao montar o componente
  useEffect(() => {
    const fetchInversores = async () => {
      setLoadingInversores(true);
      try {
        const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/inversores` || `http://localhost:${port}/v1/api/inversores`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
          },
        });
        console.log('Inversores Recebidos:', response.data); // Log para depuração
        setInversores(response.data);
      } catch (error) {
        console.error('Erro ao obter todos os inversores:', error);
        setErro(`Erro ao obter inversores: ${error.response ? error.response.data.erro : error.message}`);
      } finally {
        setLoadingInversores(false);
      }
    };

    if (auth.token) {
      fetchInversores();
    }
  }, [auth.token]);

  // Função para carregar as cidades
  const carregarCidades = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/cidades` || `http://localhost:${port}/v1/api/cidades`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
        },
      });
      const cidadesFormatadas = response.data.map((cidade) => ({
        value: cidade.CidadeUF, // Usando CidadeUF como valor
        label: cidade.CidadeUF, // Usando CidadeUF como label
      }));
      setListaCidades(cidadesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar as cidades:', error);
      setErro('Erro ao carregar as cidades.');
    }
  };

  // Carregar as cidades ao montar o componente
  useEffect(() => {
    if (auth.token) {
      carregarCidades();
    }
  }, [auth.token]);

  // Função para carregar os módulos
  const carregarModulos = async () => {
    try {
      const response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/modulos` || `http://localhost:${port}/v1/api/modulos`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
        },
      });
      const modulosFormatados = response.data.map((modulo) => ({
        value: modulo.value, // Nome do módulo
        label: `${modulo.value} - R$ ${modulo.preco.toFixed(2)} / ${modulo.potencia}W`, // Rótulo com preço e potência
        idTryModulo: modulo.idTryModulo, // ID único do módulo
        preco: modulo.preco,
        potencia: modulo.potencia,
        precoPerWatt: modulo.preco / modulo.potencia,
      }));

      // Encontrar o módulo com o menor preço por watt
      let minPrecoPerWatt = Infinity;
      let idCheapestModule = null;
      modulosFormatados.forEach(mod => {
        if (mod.precoPerWatt < minPrecoPerWatt) {
          minPrecoPerWatt = mod.precoPerWatt;
          idCheapestModule = mod.idTryModulo;
        }
      });

      setCheapestModuleId(idCheapestModule);

      setListaModulos(modulosFormatados);
    } catch (error) {
      console.error('Erro ao carregar os módulos:', error);
      setErro('Erro ao carregar os módulos.');
    }
  };

  // Carregar os módulos ao montar o componente
  useEffect(() => {
    if (auth.token) {
      carregarModulos();
    }
  }, [auth.token]);

  // Função para converter consumo médio mensal em kWh para potência necessária em W
  const converterConsumoParaPotencia = (consumo) => {
    const horasSolPico = 5; // Você pode ajustar esse valor ou torná-lo dinâmico
    const potencia = (consumo * 1000) / (horasSolPico * 30); // Multiplica por 1000 para converter kWh para Wh
    return potencia;
  };

  // Atualizar a potência necessária quando o consumo médio mensal mudar
  useEffect(() => {
    if (consumoMedioMensal) {
      const potenciaCalculada = converterConsumoParaPotencia(consumoMedioMensal);
      setPotenciaNecessaria(potenciaCalculada);
    } else {
      setPotenciaNecessaria('');
    }
  }, [consumoMedioMensal]);

  // Definir estilos customizados para react-select
  const customStyles = {
    option: (provided, state) => {
      const isCheapest = state.data.idTryModulo === cheapestModuleId;
      return {
        ...provided,
        backgroundColor: isCheapest ? '#d4edda' : provided.backgroundColor, // Verde claro para o mais barato
        color: isCheapest ? '#155724' : provided.color, // Verde escuro para o texto
        fontWeight: isCheapest ? 'bold' : 'normal',
      };
    },
    control: (provided) => ({
      ...provided,
      borderColor: '#ccc',
      '&:hover': {
        borderColor: '#aaa',
      },
    }),
  };



  // Função para tratar o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setKitsCombinacoes([]);
    setSelectedCombo(null);
    setPrecoAnterior(null);
    setPrecoNovo(null);
    setOpenMPPTKitIds([]);
    setKitParaEditar(null);
    setIsEditarMPPTOpen(false);
    setKitParaDistribuir(null);
    setIsDistribuirMPPTOpen(false);
    setIsSelecionarInversorOpen(false);
    setKitSelecionadoParaTroca(null);
  
    // Validação dos campos do formulário
    if (!consumoMedioMensal || !maxOverload || !faseInversor || !tipoTelhado || !cidade) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
  
    // Verificar se a potência necessária foi calculada
    if (!potenciaNecessaria) {
      setErro('Não foi possível calcular a potência necessária.');
      return;
    }
  
    try {
      let response;
  
      // Definir maxModulesParalelo como 2 por padrão
      const maxModulesParaleloValor = 2;
  
      if (usarMicroInversor) {
        // Se usar microinversor, chamar a nova rota
        const params = {
          necessidadeEnergetica: safeNumber(potenciaNecessaria),
          maxOverload: safeNumber(maxOverload),
          faseInversor,
          tipoTelhado,
          cidade: cidade.value, // Enviar o valor selecionado
        };
  
        if (modulo) {
          params.nomeModulo = modulo.value;
        }
  
        response = await axios.get(`https://api.multiluzsolar.com.br/app1000/api/combinacoes-microinversor` || `http://localhost:${port}/api/combinacoes-microinversor`, {
          params,
          headers: {
            'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
          },
        });
  
      } else {
        // Caso contrário, usar a rota existente
        const params = {
          necessidadeEnergetica: safeNumber(potenciaNecessaria),
          maxModulesParalelo: safeNumber(maxModulesParaleloValor), // Valor fixo
          maxOverload: safeNumber(maxOverload),
          faseInversor,
          tipoTelhado,
          cidade: cidade.value, // Enviar o valor selecionado
        };
  
        if (modulo) {
          params.nomeModulo = modulo.value;
        }
  
        response = await axios.get(`https://api.multiluzsolar.com.br/app1000/v1/api/combinacoes-necessidade` || `http://localhost:${port}/v1/api/combinacoes-necessidade`, {
          params,
          headers: {
            'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
          },
        });
      }
  
      console.log('Resposta da Requisição:', response.data); // Log para depuração
  
      if (response.data.length === 0) {
        setErro('Nenhuma combinação encontrada para os parâmetros selecionados.');
      } else {
        setKitsCombinacoes(response.data);
      }
  
    } catch (error) {
      console.error('Erro ao obter as combinações:', error);
      setErro(error.response?.data?.erro || 'Erro ao obter as combinações.');
    }
  };

  // Função para recalcular a estrutura ao atualizar o combo
  useEffect(() => {
    if (selectedCombo?.totalModulos != null) { // Verifica se não é null ou undefined
      console.log('useEffect acionado. Recalculando estrutura...');
      handleRecalcularEstrutura();
    }
  }, [selectedCombo?.totalModulos]);

  // Função para selecionar uma combinação
  const handleSelectCombo = (combo) => {
    // Mapear os kits para adicionar precoTotalKit sem incluir precoTotalEstrutura
    const kitsComPrecos = combo.kits.map((kit) => ({
      ...kit,
      precoModulo: safeNumber(kit.precoModulo),
      precoInversor: safeNumber(kit.precoInversor),
      totalModulos: safeNumber(kit.totalModulos) || (safeNumber(kit.configuracoesMPPT?.reduce((sum, mppt) => sum + safeNumber(mppt.totalDeModulos), 0))),
      potencia: safeNumber(kit.potencia),
      potenciaTotalModulos: safeNumber(kit.potenciaTotalModulos),
      precoBaseKit: (safeNumber(kit.totalModulos) * safeNumber(kit.precoModulo)) + safeNumber(kit.precoInversor), // Preço base sem porcentagem
      porcentagemAdicionalModulo: safeNumber(kit.porcentagemAdicionalModulo) || 0, // Porcentagem adicional
      porcentagemAdicionalInversor: safeNumber(kit.porcentagemAdicionalInversor) || 0, // Porcentagem adicional
      porcentagemAdicionalTotalKit: safeNumber(kit.porcentagemAdicionalTotalKit) || 0, // Porcentagem adicional
      custoAdicionalModulo: safeNumber(kit.custoAdicionalModulo) || 0, // Custo adicional módulo
      custoAdicionalInversor: safeNumber(kit.custoAdicionalInversor) || 0, // Custo adicional inversor
      custoAdicionalTotalKit: safeNumber(kit.custoAdicionalTotalKit) || 0, // Custo adicional total kit
      precoTotalKit: safeNumber(kit.precoTotalKit) || 0, // Preço total do kit
      // precoTotalCombinado: safeNumber(kit.precoTotalCombinado) || 0, // Remover se não estiver sendo usado aqui
      // custoAdicionalPrecoTotal: safeNumber(kit.custoAdicionalPrecoTotal) || 0, // Remover
      // precoTotal: safeNumber(kit.precoTotal) || 0, // Remover
    }));
  
    // Recalcular os totais do combo
    const updatedCombo = recalculateComboTotals({
      ...combo,
      kits: kitsComPrecos,
    });
  
    console.log('Combo Selecionado:', updatedCombo);
  
    setSelectedCombo(updatedCombo);
    setPrecoNovo(updatedCombo.precoTotal);
    setPrecoAnterior(null);
  };
  

  // Função para abrir o modal de seleção de inversor
  const abrirModalSelecionarInversor = (kit) => {
    setKitSelecionadoParaTroca(kit);
    setIsSelecionarInversorOpen(true);
  };

  const trocarInversorLocal = async (inversorSelecionado) => {
    if (!kitSelecionadoParaTroca || !selectedCombo) return;

    try {
      const moduloId = kitSelecionadoParaTroca.idTryModulo;

      if (!moduloId) {
        setErro('ID do módulo não encontrado no kit.');
        return;
      }

      const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/api/calcular-modulos-serie` || `http://localhost:${port}/api/calcular-modulos-serie`, {
        moduloId,
        inversorId: inversorSelecionado.idTry,
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
        },
      });

      const { minimoModulosSerie, maximoModulosSerie } = response.data;
      console.log('Módulos Série Calculados:', minimoModulosSerie, maximoModulosSerie); // Depuração

      const novoCombo = { ...selectedCombo };
      const kitIndex = novoCombo.kits.findIndex(kit => kit.id === kitSelecionadoParaTroca.id);

      if (kitIndex === -1) {
        setErro('Kit selecionado não encontrado.');
        return;
      }

      const kitAtual = novoCombo.kits[kitIndex];
      console.log('Kit Atual Antes da Troca:', kitAtual); // Depuração

      // **Atualização completa das propriedades do inversor**
      const novoKit = {
        ...kitAtual,
        nomeInversor: inversorSelecionado.nomeInversor,
        idTryInversor: inversorSelecionado.idTry,
        precoInversor: safeNumber(inversorSelecionado.preco),
        precoBaseKit: (safeNumber(kitAtual.totalModulos) * safeNumber(kitAtual.precoModulo)) + safeNumber(inversorSelecionado.preco), // Ajustado para não incluir precoTotalEstrutura
        minimoModulosSerie,
        maximoModulosSerie,
        configuracoesMPPT: [
          ...kitAtual.configuracoesMPPT.slice(0, inversorSelecionado.mppts),
          // Adiciona novos MPPTs se necessário
          ...Array(Math.max(0, inversorSelecionado.mppts - kitAtual.configuracoesMPPT.length)).fill(null).map((_, idx) => ({
            mpptNumero: kitAtual.configuracoesMPPT.length + idx + 1,
            modulosEmSerie: 0,
            modulosEmParalelo: 1,
            totalDeModulos: 0,
            minModulosSerie: minimoModulosSerie,
            maxModulosSerie: maximoModulosSerie,
            minModulosParalelo: 1,
            maxModulosParalelo: 2,
          })),
        ],
      };

      console.log('Novo Kit Após Troca:', novoKit); // Depuração

      novoCombo.kits[kitIndex] = novoKit;

      // Recalcular o preço total e a potência total da combinação
      const novoPrecoTotalKit = novoCombo.kits.reduce((sum, kit) => sum + (kit.precoTotalKit || 0), 0);
      const novoPrecoTotal = novoPrecoTotalKit + safeNumber(novoCombo.precoTotalEstrutura);
      const novaPotenciaTotal = novoCombo.kits.reduce((sum, kit) => sum + (kit.potenciaTotalModulos || 0), 0);

      console.log('Novo Preço Total da Combinação:', novoPrecoTotal); // Depuração
      console.log('Nova Potência Total da Combinação:', novaPotenciaTotal); // Depuração

      setSelectedCombo({
        ...novoCombo,
        precoTotal: novoPrecoTotal,
        potenciaTotal: novaPotenciaTotal,
      });
      setPrecoNovo(novoPrecoTotal);

      setIsSelecionarInversorOpen(false);
      setKitSelecionadoParaTroca(null);
      setKitParaDistribuir(novoKit);
      setIsDistribuirMPPTOpen(true);

    } catch (error) {
      console.error('Erro ao calcular módulos em série:', error);
      setErro(error.response?.data?.erro || 'Erro ao calcular módulos em série.');
    }
  };

  // Função para distribuir os MPPTs após edição
  const distribuirMPPTs = (kitAtualizado) => {
    // Atualizar o kit com a nova configuração de MPPTs distribuídos manualmente
    const novoCombo = { ...selectedCombo };
    const kitIndex = novoCombo.kits.findIndex(kit => kit.id === kitAtualizado.id);

    if (kitIndex !== -1) {
      novoCombo.kits[kitIndex] = kitAtualizado;

      // Recalcular o preço total e a potência total da combinação
      const novoPrecoTotalKit = novoCombo.kits.reduce((sum, kit) => sum + (kit.precoTotalKit || 0), 0);
      const novoPrecoTotal = novoPrecoTotalKit + safeNumber(novoCombo.precoTotalEstrutura);
      const novaPotenciaTotal = novoCombo.kits.reduce((sum, kit) => sum + safeNumber(kit.potenciaTotalModulos || 0), 0);
      const novoTotalModulos = novoCombo.kits.reduce((sum, kit) => sum + safeNumber(kit.totalModulos || 0), 0);

      console.log('Novo Preço Total da Combinação:', novoPrecoTotal); // Depuração
      console.log('Nova Potência Total da Combinação:', novaPotenciaTotal); // Depuração

      setSelectedCombo({
        ...novoCombo,
        precoTotal: novoPrecoTotal,
        potenciaTotal: novaPotenciaTotal,
        totalModulos: novoTotalModulos,
      });
      setPrecoNovo(novoPrecoTotal); // Considerando que o preço anterior é o novo após a atualização
    }

    setIsDistribuirMPPTOpen(false);
    setKitParaDistribuir(null);
  };

  const handleMPPTAtualizado = (kitAtualizado) => {
    const novoCombo = { ...selectedCombo };
    const kitIndex = novoCombo.kits.findIndex(kit => kit.id === kitAtualizado.id);

    if (kitIndex !== -1) {
      // Recalcular os totais do kit
      const totalModulos = kitAtualizado.configuracoesMPPT.reduce((sum, mppt) => sum + safeNumber(mppt.totalDeModulos), 0);
      const potenciaTotalModulos = totalModulos * safeNumber(kitAtualizado.potencia);
      const precoBaseKit = (totalModulos * safeNumber(kitAtualizado.precoModulo)) + safeNumber(kitAtualizado.precoInversor);
      const precoTotalKit = safeNumber(kitAtualizado.precoTotalKit) || 0;

      const updatedKit = {
        ...kitAtualizado,
        totalModulos,
        potenciaTotalModulos,
        precoBaseKit,
        precoTotalKit,
      };

      console.log('Kit Atualizado após MPPT:', updatedKit);

      novoCombo.kits[kitIndex] = updatedKit;

      // Recalcular o preço total e a potência total da combinação
      const novoPrecoTotalKit = novoCombo.kits.reduce((sum, kit) => sum + (kit.precoTotalKit || 0), 0);
      const novoPrecoTotal = novoPrecoTotalKit + safeNumber(novoCombo.precoTotalEstrutura);
      const novaPotenciaTotal = novoCombo.kits.reduce((sum, kit) => sum + safeNumber(kit.potenciaTotalModulos || 0), 0);
      const novoTotalModulos = novoCombo.kits.reduce((sum, kit) => sum + safeNumber(kit.totalModulos || 0), 0);

      console.log('Novo Preço Total da Combinação:', novoPrecoTotal); // Depuração
      console.log('Nova Potência Total da Combinação:', novaPotenciaTotal); // Depuração

      setSelectedCombo({
        ...novoCombo,
        precoTotal: novoPrecoTotal,
        potenciaTotal: novaPotenciaTotal,
        totalModulos: novoTotalModulos,
      });
      setPrecoNovo(novoPrecoTotal); // Considerando que o preço anterior é o novo após a atualização

      // Chamar 'handleRecalcularEstrutura' para atualizar 'itensEstrutura'
      handleRecalcularEstrutura();
    }

    fecharEditarMPPT();
  };

  // Funções para abrir e fechar o modal de edição de MPPTs
  const abrirEditarMPPT = (kit) => {
    setKitParaEditar(kit);
    setIsEditarMPPTOpen(true);
  };

  const fecharEditarMPPT = () => {
    setKitParaEditar(null);
    setIsEditarMPPTOpen(false);
  };

  const recalculateComboTotals = (combo) => {
    const precoTotalKit = combo.kits.reduce((sum, kit) => sum + safeNumber(kit.precoTotalKit), 0);
    const precoTotalEstrutura = safeNumber(combo.precoTotalEstrutura);
    const precoTotal = precoTotalKit + precoTotalEstrutura;
    const potenciaTotal = combo.kits.reduce((sum, kit) => sum + safeNumber(kit.potenciaTotalModulos), 0);
    const totalModulos = combo.kits.reduce((sum, kit) => sum + safeNumber(kit.totalModulos), 0);

    console.log('Recalculando Totais da Combinação:', {
      precoTotal,
      potenciaTotal,
      totalModulos,
    });

    return {
      ...combo,
      precoTotal,
      potenciaTotal,
      totalModulos,
    };
  };

  const handleRecalcularEstrutura = async () => {
    if (!selectedCombo) {
      setErro('Nenhuma combinação selecionada para recalcular a estrutura.');
      return;
    }
  
    const totalModulos = selectedCombo.totalModulos;
  
    try {
      const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/api/recalcular-estrutura` || `http://localhost:${port}/api/recalcular-estrutura`, {
        tipoTelhado,
        totalModulos,
        precoTotalKit: selectedCombo.precoTotalKit, // Incluindo o preço total do kit para cálculo correto no backend
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`, // Inclusão do cabeçalho de autenticação
        },
      });
  
      if (response.data && response.data.itensEstrutura && response.data.precoTotalEstrutura != null) {
        const novoPrecoTotalKit = selectedCombo.kits.reduce((sum, kit) => sum + (kit.precoTotalKit || 0), 0);
        const precoTotalEstrutura = safeNumber(response.data.precoTotalEstrutura);
        const precoTotalCombinado = safeNumber(novoPrecoTotalKit) + precoTotalEstrutura;
        // Remover o custo adicional de Preço Total
        // const custoAdicionalPrecoTotal = safeNumber(response.data.custoAdicionalPrecoTotal) || 0;
        // const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;
        const precoTotalFinal = precoTotalCombinado; // Apenas Kit + Estrutura + Custo Adicional da Estrutura
  
        setSelectedCombo(prevCombo => ({
          ...prevCombo,
          itensEstrutura: response.data.itensEstrutura,
          precoTotalEstrutura: precoTotalEstrutura,
          precoTotalCombinado: precoTotalCombinado,
          // custoAdicionalPrecoTotal: custoAdicionalPrecoTotal, // Remover esta linha
          precoTotal: precoTotalFinal, // Define o preço total como Kit + Estrutura + Custo Adicional da Estrutura
        }));
        setErro('');
      } else {
        setErro('Nenhuma estrutura retornada pelo servidor.');
      }
    } catch (error) {
      console.error('Erro ao recalcular a estrutura:', error);
      setErro(error.response?.data?.erro || 'Erro ao recalcular a estrutura.');
    }
  };
  

  
const handleSalvarDados = async () => {
  console.log('handleSalvarDados chamado');

  if (!selectedCombo) {
    toast.error('Nenhuma combinação selecionada para salvar.');
    return;
  }

  if (!auth.user) {
    toast.error('Usuário não autenticado.');
    return;
  }

  const dados = {
    IdCombinacao: selectedCombo.id || uuidv4(), // Gere um ID único se não existir
    IdClienteRelacionado: cliente?.IdCliente || '',
    IdConsultorRelacionado: auth.user.email , // Obtém diretamente do usuário autenticado
    ConsumoMedio: parseFloat(consumoMedioMensal),
    OverloadUtilizado: parseFloat(maxOverload),
    TipoTelhado: tipoTelhado,
    Cidade: cidade?.value || '',
    PotenciaTotal: parseFloat(potenciaNecessaria),
    PrecoTotal: parseFloat(selectedCombo.precoTotal || 0),
    ModulosTotal: parseInt(selectedCombo.totalModulos || 0, 10),
    Kits: selectedCombo.kits.map((kit) => ({
      NomeKit: `Kit ${kit.id || uuidv4()}`, // Gere um nome único para o kit
      ModuloUtilizado: kit.nomeModulo,
      InversorUtilizado: kit.nomeInversor,
      QuantidadeInversor: usarMicroInversor ? parseInt(kit.microinversoresUtilizados || 1, 10) : 1,
      PrecoKit: parseFloat(kit.precoTotalKit || 0),
      QuantidadeModulos: parseInt(kit.totalModulos || 0, 10),
      // **Adicionando novos campos de custos adicionais**
      PrecoBaseKit: parseFloat(kit.precoBaseKit || 0),
      PorcentagemAdicionalModulo: parseFloat(kit.porcentagemAdicionalModulo || 0),
      CustoAdicionalModulo: parseFloat(kit.custoAdicionalModulo || 0),
      PorcentagemAdicionalInversor: parseFloat(kit.porcentagemAdicionalInversor || 0),
      CustoAdicionalInversor: parseFloat(kit.custoAdicionalInversor || 0),
      PorcentagemAdicionalTotalKit: parseFloat(kit.porcentagemAdicionalTotalKit || 0),
      CustoAdicionalTotalKit: parseFloat(kit.custoAdicionalTotalKit || 0),
      // Remover campos relacionados a Preço Total Combinado e Custo Adicional Preço Total
      // PrecoTotalCombinado: parseFloat(kit.precoTotalCombinado || 0),
      // CustoAdicionalPrecoTotal: parseFloat(kit.custoAdicionalPrecoTotal || 0),
    })),
    ItensEstrutura: selectedCombo.itensEstrutura.map((item) => ({
      NomeItem: item.Produto,
      Quantidade: parseInt(item.Quantidade || 0, 10),
      Preco: parseFloat(item.PrecoItem || 0),
    })),
    PrecoEstrutura: parseFloat(selectedCombo.precoTotalEstrutura || 0),
    // Remover campos relacionados a Preço Total Combinado e Custo Adicional Preço Total
    // PrecoTotalCombinado: parseFloat(selectedCombo.precoTotalCombinado || 0),
    // CustoAdicionalPrecoTotal: parseFloat(selectedCombo.custoAdicionalPrecoTotal || 0),
  };

  console.log('Enviando dados para salvar:', JSON.stringify(dados, null, 2));

  try {
    const response = await axios.post(`https://api.multiluzsolar.com.br/app1000/api/api/inserir-calculadora` || `http://localhost:${port}/api/api/inserir-calculadora`, dados, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      },
    });
    console.log('Resposta da API:', response.data);
    if (response.data.success) {
      toast.success('Dados salvos com sucesso no BigQuery!');
      // Opcional: Resetar o formulário ou redirecionar o usuário
    } else {
      toast.error(response.data.message || 'Erro ao salvar os dados.');
    }
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    toast.error(error.response?.data?.message || 'Erro ao salvar os dados.');
  }
};


  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4 text-black">
      <section className="bg-white p-6 rounded shadow-md w-full max-w-6xl">
        {cliente && auth.user && (
          <div className="mb-6 p-4 border border-gray-300 rounded shadow-sm bg-gray-100 flex flex-col md:flex-row md:space-x-6">
            {/* Cliente Relacionado */}
            <div className="mb-4 md:mb-0 flex-1">
              <h2 className="text-2xl font-bold mb-4">Cliente Relacionado</h2>
              <p><strong>Nome:</strong> {cliente.Nome}</p>
              <p><strong>Email:</strong> {cliente.Email}</p>
              <p><strong>Telefone:</strong> {cliente.Telefone}</p>
              <p><strong>Endereço:</strong> {cliente.Endereco}</p>
              {/* Adicione outros campos que desejar */}
            </div>
            
            {/* Consultor Relacionado */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Consultor Relacionado</h2>
              <p><strong>Email:</strong> {auth.user.Email || 'N/A'}</p>
              <p><strong>Nome:</strong> {auth.user.Nome || 'N/A'}</p>
              <p><strong>Cargo:</strong> {auth.user.Cargo || 'N/A'}</p>
              <p><strong>Unidade:</strong> {auth.user.Unidade || 'N/A'}</p>
              {/* Adicione outros campos que desejar */}
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Calculadora de Proposta</h1>

        {/* Contêiner Flex para Dividir as Seções */}
        <div className="flex flex-col md:flex-row">
          {/* Seção Esquerda: Formulário */}
          <section className="w-full md:w-1/3 p-4">
            <form onSubmit={handleSubmit}>
              {/* Consumo Médio Mensal */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Consumo médio mensal (kWh)
                </label>
                <input
                  type="number"
                  value={consumoMedioMensal}
                  onChange={(e) => setConsumoMedioMensal(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Digite o consumo médio mensal"
                  min="0"
                  required
                />
              </div>

              {/* Potência Necessária */}
              {potenciaNecessaria && (
                <div className="mb-4">
                  <p><strong>Potência necessária estimada:</strong> {potenciaNecessaria.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} W</p>
                </div>
              )}

              {/* Máximo de Overload */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Máximo de overload (%)
                </label>
                <input
                  type="number"
                  value={maxOverload}
                  onChange={(e) => {
                    const value = Math.min(Number(e.target.value), 30); // Garante que o valor não ultrapasse 30
                    setMaxOverload(value.toString()); // Converte para string, pois o estado espera uma string
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Digite o máximo de overload"
                  min="0"
                  max="30" // Define o máximo como 30
                  required
                />
              </div>

              {/* Checkbox para usar somente microinversor */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="usarMicroInversor"
                  checked={usarMicroInversor}
                  onChange={(e) => setUsarMicroInversor(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="usarMicroInversor" className="text-gray-700 font-bold">
                  Calcular usando somente microinversor
                </label>
              </div>

              {/* Seleção de Módulo (Opcional) */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Selecionar Módulo (Opcional)
                </label>
                <Select
                  value={modulo}
                  onChange={(selecionado) => setModulo(selecionado)}
                  options={listaModulos}
                  placeholder="Selecione um módulo ou deixe em branco para todos"
                  isClearable
                  isSearchable
                  styles={customStyles} // Aplica estilos customizados
                />
              </div>

              {/* Fases do Inversor */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Fases do inversor
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Bifásico"
                      checked={faseInversor === 'Bifásico'}
                      onChange={() => setFaseInversor('Bifásico')}
                      className="mr-2"
                    />
                    Bifásico
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Trifásico"
                      checked={faseInversor === 'Trifásico'}
                      onChange={() => setFaseInversor('Trifásico')}
                      className="mr-2"
                    />
                    Trifásico
                  </label>
                </div>
              </div>

              {/* Tipo de Telhado */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Tipo de Telhado
                </label>
                <select
                  value={tipoTelhado}
                  onChange={(e) => setTipoTelhado(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="COLONIAL">COLONIAL</option>
                  <option value="METALICO">METALICO</option>
                  <option value="FIBROMADEIRA">FIBROMADEIRA</option>
                  <option value="FIBROMETAL">FIBROMETAL</option>
                  <option value="MINI TRILHO BAIXO">MINI TRILHO BAIXO</option>
                  <option value="MINI TRILHO ALTO">MINI TRILHO ALTO</option>
                  <option value="ESTRUTURA SOLO">ESTRUTURA SOLO</option>
                  <option value="LAJE">LAJE</option>
                </select>
              </div>

              {/* Cidade */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Cidade
                </label>
                <Select
                  value={cidade}
                  onChange={(selecionada) => setCidade(selecionada)}
                  options={listaCidades}
                  placeholder="Digite para buscar a cidade"
                  isClearable
                  isSearchable
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
              >
                Calcular
              </button>
            </form>
            {erro && (
              <p className="mt-4 text-red-500">{erro}</p>
            )}
          </section>

          {/* Seção Direita: Resultados */}
          <section className="w-full md:w-2/3 p-4 overflow-auto">

            {kitsCombinacoes.length > 0 && !selectedCombo && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Opções de Combinação</h2>
                <ul>
                  {kitsCombinacoes.map((combo, index) => (
                    <li key={index} className="mb-4 p-4 border border-gray-300 rounded shadow-sm bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div className="mb-4">
                          <p><strong>Potência Total:</strong> {combo.potenciaTotal ? combo.potenciaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (combo.potenciaTotalModulos ? combo.potenciaTotalModulos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A')} W</p>
                          <p><strong>Preço Total:</strong> R$ {combo.precoTotal ? combo.precoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (combo.precoTotalKit ? combo.precoTotalKit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (combo.precoTotal ? combo.precoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'))}</p>
                          <p><strong>Total de Módulos:</strong> {combo.totalModulos || 0}</p>
                        </div>
                        <button
                          onClick={() => handleSelectCombo(combo)}
                          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition duration-200"
                        >
                          Selecionar
                        </button>
                      </div>
                      <div className="mt-4">
                        {Array.isArray(combo.kits) && combo.kits.length > 0 ? (
                          combo.kits.map((kit, kitIndex) => (
                            <div key={kit.id || kitIndex} className="mb-4 p-2 border border-gray-200 rounded bg-white">
                              <h3 className="text-lg font-semibold">Kit {kitIndex + 1}</h3>
                              <p><strong>Módulo:</strong> {kit.nomeModulo || 'N/A'}</p>
                              <p><strong>Potência Total dos Módulos:</strong> {kit.potenciaTotalModulos ? kit.potenciaTotalModulos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} W</p>
                              <p><strong>Total de Módulos:</strong> {kit.totalModulos || 0}</p>
                              <p><strong>Preço Total do Kit:</strong> R$ {kit.precoTotalKit ? kit.precoTotalKit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
                              
                              {/* Verificar se o uso de microinversor está ativado */}
                              {usarMicroInversor  ? (
                                <p>
                                  <strong>Inversor:</strong> {kit.nomeInversor || 'N/A'} 
                                  <strong> Quantidade:</strong> {kit.microinversoresUtilizados || 0}
                                </p>
                              ) : (
                                <>
                                  {/* **REMOVIDO: Botões de Edição na Lista de Combinações** */}
                                  {/* Esses botões serão exibidos apenas na seção "Personalizar Combinação" */}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-red-500">Nenhum kit disponível.</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {/* Kit Selecionado para Personalização */}
            {selectedCombo && (
              <div className="mb-6 p-4 border border-gray-300 rounded shadow-sm bg-gray-100 relative">
                {/* Botão para Voltar às Combinações */}
                <div className="mb-4 flex items-center">
                  <button
                    onClick={() => {
                      setSelectedCombo(null);
                      setPrecoAnterior(null);
                      setPrecoNovo(null);
                      setErro('');
                      setOpenMPPTKitIds([]);
                    }}
                    className="flex items-center text-gray-700 hover:text-gray-900 transition duration-200"
                    aria-label="Voltar às Combinações"
                  >
                    <ArrowUturnLeftIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm font-semibold">Voltar</span>
                  </button>
                </div>
                <h2 className="text-2xl font-bold mb-4">Personalizar Combinação</h2>

                <div className="mb-4">
                  <p><strong>Potência Total:</strong> {selectedCombo.potenciaTotal ? selectedCombo.potenciaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} W</p>
                  <p><strong>Preço Total:</strong> R$ {selectedCombo.precoTotal ? selectedCombo.precoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
                  <p><strong>Total de Módulos:</strong> {selectedCombo.totalModulos || 0}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Detalhes dos Kits</h3>
                  {selectedCombo.kits.map((kit, index) => (
                    <div key={kit.id || index} className="mb-4 p-2 border border-gray-200 rounded bg-white">
                      <h4 className="font-medium">Kit {index + 1}</h4>

                      <p><strong>Módulo:</strong> {kit.nomeModulo || 'N/A'}</p>

                      <p>
                        <strong>Potência Total dos Módulos:</strong> {kit.potenciaTotalModulos ? kit.potenciaTotalModulos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} W
                      </p>

                      <p><strong>Total de Módulos:</strong> {kit.totalModulos || 0}</p>

                      {/* **Novos Detalhes de Preço** */}
                      <p>
                        <strong>Preço Base do Kit:</strong> R$ {kit.precoBaseKit ? kit.precoBaseKit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                      <p>
                        <strong>Porcentagem Adicional Módulo:</strong> {kit.porcentagemAdicionalModulo ? `${kit.porcentagemAdicionalModulo}%` : 'N/A'}
                      </p>
                      <p>
                        <strong>Custo Adicional Módulo:</strong> R$ {kit.custoAdicionalModulo ? kit.custoAdicionalModulo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                      <p>
                        <strong>Porcentagem Adicional Inversor:</strong> {kit.porcentagemAdicionalInversor ? `${kit.porcentagemAdicionalInversor}%` : 'N/A'}
                      </p>
                      <p>
                        <strong>Custo Adicional Inversor:</strong> R$ {kit.custoAdicionalInversor ? kit.custoAdicionalInversor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                      <p>
                        <strong>Porcentagem Adicional Total Kit:</strong> {kit.porcentagemAdicionalTotalKit ? `${kit.porcentagemAdicionalTotalKit}%` : 'N/A'}
                      </p>
                      <p>
                        <strong>Custo Adicional Total Kit:</strong> R$ {kit.custoAdicionalTotalKit ? kit.custoAdicionalTotalKit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>
                      {/* **Fim dos Novos Detalhes** */}

                      <p>
                        <strong>Preço Total do Kit:</strong> R$ {kit.precoTotalKit ? kit.precoTotalKit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                      </p>

                      {/* Linha para Inversor e Botão "Trocar Inversor" */}
                      <div className="flex items-center justify-between">
                        <strong>Inversor:</strong> {kit.nomeInversor || 'N/A'}
                        <button
                          onClick={() => abrirModalSelecionarInversor(kit)}
                          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                          aria-label="Trocar Inversor"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          Trocar Inversor
                        </button>
                      </div>

                      {/* Verificar se o uso de microinversor está ativado */}
                      {usarMicroInversor ? (
                        <p className="mt-2"><strong>Total de Microinversores:</strong> {kit.microinversoresUtilizados || 0}</p>
                      ) : (
                        <>
                          <button
                            onClick={() => abrirEditarMPPT(kit)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200 mt-2"
                            aria-label="Editar Configuração do MPPT"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                            Editar configuração de MPPTs
                          </button>
                          {/* O botão "Trocar Inversor" já está na linha do inversor acima */}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Exibição dos Itens da Estrutura */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Itens da Estrutura</h3>
                  {selectedCombo.itensEstrutura && selectedCombo.itensEstrutura.length > 0 ? (
                    <>
                      <ul className="list-disc list-inside">
                        {selectedCombo.itensEstrutura.map((item, index) => (
                          <li key={index} className="mb-1">
                            <p>
                              <strong>{item.Produto}</strong>: {item.Quantidade} x R$ {item.PrecoUnitario.toFixed(2)} = R$ {item.PrecoItem.toFixed(2)}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 font-bold">
                        Preço Total da Estrutura: R$ {selectedCombo.precoTotalEstrutura.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {/* **Remover os campos de Preço Total Combinado e Custo Adicional Preço Total** */}
                      {/* <p className="mt-2 font-bold">
                        Preço Total Combinado (Kit + Estrutura): R$ {selectedCombo.precoTotalCombinado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-2 font-bold text-yellow-600">
                        Custo Adicional Preço Total: R$ {selectedCombo.custoAdicionalPrecoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p> */}
                      {/* **Fim dos Campos Removidos** */}
                      <p className="mt-2 font-bold">
                        <strong>Preço Total da Combinação:</strong> R$ {selectedCombo.precoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-2 font-bold">
                        <strong>Preço Total da Combinação:</strong> R$ {selectedCombo.precoTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </>
                  ) : (
                    <p>Nenhum item de estrutura disponível.</p>
                  )}
                </div>

                <button onClick={handleSalvarDados} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
                  Salvar Dados
                </button>
              </div>
            )}


            {/* Componente EditarMPPT como Modal */}
            {isEditarMPPTOpen && kitParaEditar && (
              <EditarMPPT
                kit={kitParaEditar}
                onClose={fecharEditarMPPT}
                onSave={handleMPPTAtualizado}
              />
            )}

            {/* Componente DistribuirMPPT como Modal */}
            {isDistribuirMPPTOpen && kitParaDistribuir && (
              <EditarMPPT
                kit={kitParaDistribuir}
                onClose={() => setIsDistribuirMPPTOpen(false)}
                onSave={distribuirMPPTs}
              />
            )}

            {/* Componente SelecionarInversor como Modal */}
            {isSelecionarInversorOpen && (
              <SelecionarInversor
                inversores={inversores}
                onSelect={trocarInversorLocal}
                onClose={() => {
                  setIsSelecionarInversorOpen(false);
                  setKitSelecionadoParaTroca(null);
                }}
                minMPPTs={kitSelecionadoParaTroca?.mpptsUtilizados || 0} // Passa o número mínimo de MPPTs
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default CalcProposta;
