import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import custoRoutes from './custo.js';

dotenv.config();

const router = express.Router();

router.use('/api/custos', custoRoutes);

const datasetId = process.env.DATASET_ID || 'Calculadora';
const tableId = process.env.TABLE_ID || 'CalculadoraDados';

const JWT_SECRET = process.env.JWT_SECRET ;

// Conecta ao BigQuery usando credenciais
const bigquery = new BigQuery({
  projectId: 'sd-gestao', // Substitua pelo seu ID de projeto
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

// Função auxiliar para gerar combinações
const getCombinations = (array, k) => {
  const results = [];

  const helper = (start, combo) => {
    if (combo.length === k) {
      results.push(combo);
      return;
    }
    for (let i = start; i < array.length; i++) {
      helper(i + 1, combo.concat(array[i]));
    }
  };

  helper(0, []);
  return results;
};

const getCombinationsWithRepetition = (array, k) => {
  const results = [];

  const helper = (combo, start) => {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(combo, i); // Permite repetição passando 'i' em vez de 'i + 1'
      combo.pop();
    }
  };

  helper([], 0);
  return results;
};

// Função para organizar as porcentagens por OndeAfeta
const organizarPorcentagens = (custosRows) => {
  const porcentagensPorAfetacao = custosRows.reduce((acc, row) => {
    const ondeAfeta = row.OndeAfeta;
    const porcentagem = parseFloat(row.Porcentagem);
    if (!acc[ondeAfeta]) {
      acc[ondeAfeta] = 0;
    }
    acc[ondeAfeta] += porcentagem;
    return acc;
  }, {});

  // Converter as porcentagens para decimais
  for (const key in porcentagensPorAfetacao) {
    porcentagensPorAfetacao[key] = porcentagensPorAfetacao[key] / 100;
  }

  return porcentagensPorAfetacao;
};

// Função para obter todas as combinações válidas
const obterTodasCombinacoes = async (
  maxModulesParaleloNum,
  maxOverloadNum,
  faseInversor,
  moduloFiltro = null,
  porcentagensPorAfetacao
) => {
  // Buscar as porcentagens de custos adicionais
  const [custosRows] = await bigquery.query({
    query: `
      SELECT Porcentagem, OndeAfeta
      FROM \`sd-gestao.Calculadora.CadCusto\`
    `,
  });

  // Verificar se existem dados retornados
  if (!custosRows || custosRows.length === 0) {
    throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
  }

  // Organizar as porcentagens por OndeAfeta
  const porcentagens = organizarPorcentagens(custosRows);

  // Buscar todos os módulos
  let modulosQuery = `
    SELECT 
      m.Produto AS nomeModulo,
      m.Potencia AS potenciaModulo,
      m.Tensao AS tensao,
      m.TensaoOperacaoVmp AS tensaoOperacaoVmp,
      m.CorrenteOperacaoImp AS correnteOperacaoImp,
      m.TensaoCircuitoAbertoVoc AS tensaoCircuitoAbertoVoc,
      m.CorrenteCurtoCircuitoIsc AS correnteCurtoCircuitoIsc,
      m.Eficiencia AS eficiencia,
      m.IdTry AS idTryModulo,
      m.Marca AS marca,
      m.Preco AS precoModulo,
      m.Custo AS custoModulo
    FROM \`sd-gestao.Calculadora.CadModulos\` AS m
    WHERE 1=1
  `;

  const [modulosRows] = await bigquery.query({ query: modulosQuery });
  let modulos = modulosRows.map(row => ({
    id: uuidv4(), // Adiciona um ID único para cada módulo
    nomeModulo: row.nomeModulo,
    potencia: parseFloat(row.potenciaModulo),
    tensao: parseFloat(row.tensao),
    tensaoOperacaoVmp: parseFloat(row.tensaoOperacaoVmp),
    correnteOperacaoImp: parseFloat(row.correnteOperacaoImp),
    tensaoCircuitoAbertoVoc: parseFloat(row.tensaoCircuitoAbertoVoc),
    correnteCurtoCircuitoIsc: parseFloat(row.correnteCurtoCircuitoIsc),
    eficiencia: parseFloat(row.eficiencia),
    idTry: row.idTryModulo,
    marca: row.marca,
    preco: parseFloat(row.precoModulo),
    custo: parseFloat(row.custoModulo),
  }));

  // Aplicar filtro de módulo, se fornecido
  if (moduloFiltro) {
    modulos = modulos.filter(modulo => modulo.nomeModulo === moduloFiltro);
  }

  // Buscar todos os inversores
  let inversoresQuery = `
    SELECT 
      i.Produto AS nomeInversor,
      i.PotenciaNominal AS potenciaNominal,
      i.PotenciaMaxima AS potenciaMaxima,
      i.MPPTs AS mppts,
      i.TensaoMaxima AS tensaoMaxima,
      i.TensaoMinimaMppt AS tensaoMinimaMppt,
      i.TensaoMaximaMppt AS tensaoMaximaMppt,
      i.CorrenteMaximaMppt AS correnteMaximaMppt,
      i.TensaoLinha AS tensaoLinha,
      i.Eficiencia AS eficienciaInversor,
      i.Fases AS fases,
      i.IdTry AS idTryInversor,
      i.Entradas AS entradas,
      i.Overload AS overload,
      i.Preco AS precoInversor,
      i.Custo AS custoInversor,
      i.TipoInversor AS tipoInversor
    FROM \`sd-gestao.Calculadora.CadInversores\` AS i
    WHERE 1=1
  `;

  // Ajuste na comparação de 'Fases'
  if (faseInversor === 'Bifásico') {
    inversoresQuery += ` AND LOWER(i.Fases) IN ('bifasico', 'bifásico') `;
  } else if (faseInversor === 'Trifásico') {
    inversoresQuery += ` AND LOWER(i.Fases) IN ('bifasico', 'bifásico', 'trifasico', 'trifásico') `;
  }

  const [inversoresRows] = await bigquery.query({ query: inversoresQuery });
  const inversores = inversoresRows.map(row => ({
    nomeInversor: row.nomeInversor,
    potenciaNominal: parseFloat(row.potenciaNominal),
    potenciaMaxima: parseFloat(row.potenciaMaxima),
    mppts: parseInt(row.mppts, 10),
    tensaoMaxima: parseFloat(row.tensaoMaxima),
    tensaoMinimaMppt: parseFloat(row.tensaoMinimaMppt),
    tensaoMaximaMppt: parseFloat(row.tensaoMaximaMppt),
    correnteMaximaMppt: parseFloat(row.correnteMaximaMppt),
    tensaoLinha: parseFloat(row.tensaoLinha),
    eficiencia: parseFloat(row.eficienciaInversor),
    fases: row.fases,
    idTry: row.idTryInversor,
    entradas: parseInt(row.entradas, 10),
    overload: parseFloat(row.overload),
    preco: parseFloat(row.precoInversor),
    custo: parseFloat(row.custoInversor),
  }));

  console.log(`Fase Inversor Selecionada: ${faseInversor}`);
  console.log(`Inversores Filtrados:`, inversores);

  const combinacoesValidas = [];

  // Iterar sobre todos os pares de módulo e inversor
  for (const modulo of modulos) {
    for (const inversor of inversores) {
      // Determina o overload efetivo a ser usado
      const effectiveOverload = Math.min(maxOverloadNum, inversor.overload);

      // Calcular a potência máxima do inversor com o overload efetivo
      const potenciaMaximaInversorComOverload = inversor.potenciaNominal * (1 + effectiveOverload / 100);

      // Calcular o número máximo de módulos permitidos
      const maxTotalModulos = Math.floor(potenciaMaximaInversorComOverload / modulo.potencia);
      if (maxTotalModulos < 1) continue; // Pula se nenhum módulo puder ser alocado

      // Calcular o número mínimo e máximo de módulos em série
      const minModulosSerie = Math.ceil(inversor.tensaoMinimaMppt / modulo.tensaoOperacaoVmp);
      const maxModulosSerie = Math.floor(inversor.tensaoMaximaMppt / modulo.tensaoCircuitoAbertoVoc);
      if (minModulosSerie > maxModulosSerie) continue; // Pula se não houver configuração válida de série

      // Extrair a menor corrente máxima dos MPPTs
      let correnteMaximaMppt = inversor.correnteMaximaMppt;

      // Calcular o número máximo de módulos em paralelo
      const maxModulosParaleloCalc = Math.floor(correnteMaximaMppt / modulo.correnteOperacaoImp);
      const maxModulesParaleloFinal = Math.min(maxModulesParaleloNum, maxModulosParaleloCalc);
      if (maxModulesParaleloFinal < 1) continue; // Pula se nenhum módulo puder ser alocado em paralelo

      // Calcular o número máximo de módulos permitidos (limitando a 270 para evitar sobrecarga)
      const calculoTotalModulos = Math.min(maxTotalModulos, 270);
      if (calculoTotalModulos < 1) continue;

      // Inicializar a distribuição de módulos
      const configuracoesMPPT = [];

      /**
       * Função para gerar todas as configurações possíveis para um MPPT
       */
      const generateConfigurations = (minSerie, maxSerie, maxParalelo, modulo) => {
        const configs = [];
        for (let nSerie = minSerie; nSerie <= maxSerie; nSerie++) {
          for (let nParalelo = 1; nParalelo <= maxParalelo; nParalelo++) {
            const totalModulos = nSerie * nParalelo;
            const tensaoTotal = nSerie * modulo.tensaoOperacaoVmp;
            const correnteTotalMppt = nParalelo * modulo.correnteOperacaoImp;

            if (
              tensaoTotal >= inversor.tensaoMinimaMppt &&
              tensaoTotal <= inversor.tensaoMaximaMppt &&
              correnteTotalMppt <= correnteMaximaMppt
            ) {
              configs.push({
                modulosEmSerie: nSerie,
                modulosEmParalelo: nParalelo,
                totalDeModulos: totalModulos,
              });
            }
          }
        }
        return configs;
      };

      /**
       * Função para encontrar a melhor combinação usando Programação Dinâmica
       */
      const findBestCombination = (allConfigs, target) => {
        const dp = Array(allConfigs.length + 1).fill(null).map(() => Array(target + 1).fill(false));
        dp[0][0] = true;

        const path = Array(allConfigs.length + 1).fill(null).map(() => Array(target + 1).fill(null));

        for (let i = 1; i <= allConfigs.length; i++) {
          for (let j = 0; j <= target; j++) {
            for (const config of allConfigs[i - 1]) {
              if (j >= config.totalDeModulos && dp[i - 1][j - config.totalDeModulos]) {
                dp[i][j] = true;
                path[i][j] = config;
              }
            }
          }
        }

        let bestTotal = 0;
        for (let j = target; j >= 0; j--) {
          if (dp[allConfigs.length][j]) {
            bestTotal = j;
            break;
          }
        }

        const selectedConfigs = [];
        let current = bestTotal;
        for (let i = allConfigs.length; i >= 1; i--) {
          const config = path[i][current];
          if (config) {
            selectedConfigs.unshift(config);
            current -= config.totalDeModulos;
          } else {
            selectedConfigs.unshift(null);
          }
        }

        return { total: bestTotal, configs: selectedConfigs };
      };

      // Gerar todas as possíveis configurações para cada MPPT
      const allMPPTConfigs = [];
      for (let i = 0; i < inversor.mppts; i++) {
        const configs = generateConfigurations(minModulosSerie, maxModulosSerie, maxModulesParaleloFinal, modulo);
        if (configs.length === 0) {
          // Se não há configurações possíveis para este MPPT, pula esta combinação
          break;
        }
        allMPPTConfigs.push(configs);
      }

      if (allMPPTConfigs.length !== inversor.mppts) {
        continue; // Pula se algum MPPT não tiver configurações válidas
      }

      // Encontrar a melhor combinação usando Programação Dinâmica
      const { total, configs: selectedConfigs } = findBestCombination(allMPPTConfigs, calculoTotalModulos);

      if (total === 0) {
        continue; // Pula se não for possível alocar módulos
      }

      // Construir as configurações com MPPT número
      for (let i = 0; i < selectedConfigs.length; i++) {
        const config = selectedConfigs[i];
        if (config) {
          configuracoesMPPT.push({
            mpptNumero: i + 1,
            modulosEmSerie: config.modulosEmSerie,
            modulosEmParalelo: config.modulosEmParalelo,
            totalDeModulos: config.totalDeModulos,
          });
        } else {
          configuracoesMPPT.push({
            mpptNumero: i + 1,
            modulosEmSerie: 0,
            modulosEmParalelo: 0,
            totalDeModulos: 0,
          });
        }
      }

      // Calcular a potência total dos módulos
      const totalModulosAtribuidos = configuracoesMPPT.reduce((sum, config) => sum + config.totalDeModulos, 0);
      const potenciaTotalModulos = totalModulosAtribuidos * modulo.potencia;

      // Cálculo do preço total do kit
      const precoBaseKit = (totalModulosAtribuidos * modulo.preco) + inversor.preco;

      // Aplicar as porcentagens específicas com base em OndeAfeta
      const porcentagemModulo = porcentagensPorAfetacao['Módulo'] || 0;
      const porcentagemInversor = porcentagensPorAfetacao['Inversor'] || 0;
      const porcentagemTotalKit = porcentagensPorAfetacao['Total Kit'] || 0;
      const porcentagemEstrutura = porcentagensPorAfetacao['Estrutura'] || 0; // Para uso futuro na estrutura
      const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0; // Novo tipo de custo

      // Cálculo dos custos adicionais
      const custoAdicionalModulo = (totalModulosAtribuidos * modulo.preco) * porcentagemModulo;
      const custoAdicionalInversor = inversor.preco * porcentagemInversor;
      const custoAdicionalTotalKit = precoBaseKit * porcentagemTotalKit;

      // Preço total do kit após adicionar os custos adicionais
      const precoTotalKit = precoBaseKit + custoAdicionalModulo + custoAdicionalInversor + custoAdicionalTotalKit;

      // Preparar a combinação de resultado
      const resultadoCompatibilidade = {
        id: uuidv4(), // Gerar um ID único para cada combinação
        nomeModulo: modulo.nomeModulo,
        idTryModulo: modulo.idTry,
        nomeInversor: inversor.nomeInversor,
        idTryInversor: inversor.idTry,
        totalModulos: totalModulosAtribuidos,
        maximoModulosPermitido: maxTotalModulos,
        mpptsUtilizados: inversor.mppts,
        potenciaTotalModulos: potenciaTotalModulos,
        potenciaMaximaInversor: potenciaMaximaInversorComOverload,
        precoBaseKit: precoBaseKit,
        porcentagemAdicionalModulo: porcentagemModulo * 100, // Em porcentagem
        porcentagemAdicionalInversor: porcentagemInversor * 100, // Em porcentagem
        porcentagemAdicionalTotalKit: porcentagemTotalKit * 100, // Em porcentagem
        custoAdicionalModulo: custoAdicionalModulo,
        custoAdicionalInversor: custoAdicionalInversor,
        custoAdicionalTotalKit: custoAdicionalTotalKit,
        precoTotalKit: precoTotalKit,
        configuracoesMPPT: configuracoesMPPT,
        maximoModulosSerie: maxModulosSerie,
        minimoModulosSerie: minModulosSerie,
        overloadUtilizado: effectiveOverload, // Atualizado para usar o overload efetivo
        potencia: modulo.potencia,
        precoModulo: modulo.preco, // Adiciona o preço do módulo
        precoInversor: inversor.preco, // Adiciona o preço do inversor
      };

      // Garantir que a soma total de módulos não exceda o máximo permitido
      if (totalModulosAtribuidos > maxTotalModulos) {
        continue; // Pula esta combinação se exceder
      }

      // Adiciona a combinação válida à lista
      combinacoesValidas.push(resultadoCompatibilidade);
    }
  }

  return combinacoesValidas;
};

// Função para obter todas as combinações válidas para microinversores
const obterCombinacoesMicroInversor = async (
  maxOverloadNum,
  necessidadeEnergeticaNum,
  faseInversor,
  tipoTelhado,
  cidade,
  nomeModulo = null,
  porcentagensPorAfetacao // Novo parâmetro
) => {
  // Buscar as porcentagens de custos adicionais
  const [custosRows] = await bigquery.query({
    query: `
      SELECT Porcentagem, OndeAfeta
      FROM \`sd-gestao.Calculadora.CadCusto\`
    `,
  });

  // Verificar se existem dados retornados
  if (!custosRows || custosRows.length === 0) {
    throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
  }

  // Organizar as porcentagens por OndeAfeta
  const porcentagens = organizarPorcentagens(custosRows);

  // 1. Buscar todos os microinversores com TipoInversor = 'MICRO'
  let inversoresQuery = `
    SELECT 
      i.Produto AS nomeInversor,
      i.PotenciaNominal AS potenciaNominal,
      i.PotenciaMaxima AS potenciaMaxima,
      i.MPPTs AS mppts,
      i.TensaoMaxima AS tensaoMaxima,
      i.TensaoMinimaMppt AS tensaoMinimaMppt,
      i.TensaoMaximaMppt AS tensaoMaximaMppt,
      i.CorrenteMaximaMppt AS correnteMaximaMppt,
      i.TensaoLinha AS tensaoLinha,
      i.Eficiencia AS eficienciaInversor,
      i.Fases AS fases,
      i.IdTry AS idTryInversor,
      i.Entradas AS entradas,
      i.Overload AS overload,
      i.Preco AS precoInversor,
      i.Custo AS custoInversor,
      i.TipoInversor AS tipoInversor
    FROM \`sd-gestao.Calculadora.CadInversores\` AS i
    WHERE i.TipoInversor = 'MICRO'
  `;

  // Ajuste na comparação de 'Fases'
  if (faseInversor === 'Bifásico') {
    inversoresQuery += ` AND LOWER(i.Fases) IN ('bifasico', 'bifásico') `;
  } else if (faseInversor === 'Trifásico') {
    inversoresQuery += ` AND LOWER(i.Fases) IN ('bifasico', 'bifásico', 'trifasico', 'trifásico') `;
  }

  const [inversoresRows] = await bigquery.query({ query: inversoresQuery });
  const microinversores = inversoresRows.map(row => ({
    nomeInversor: row.nomeInversor,
    potenciaNominal: parseFloat(row.potenciaNominal),
    potenciaMaxima: parseFloat(row.potenciaMaxima),
    mppts: parseInt(row.mppts, 10),
    tensaoMaxima: parseFloat(row.tensaoMaxima),
    tensaoMinimaMppt: parseFloat(row.tensaoMinimaMppt),
    tensaoMaximaMppt: parseFloat(row.tensaoMaximaMppt),
    correnteMaximaMppt: parseFloat(row.correnteMaximaMppt),
    tensaoLinha: parseFloat(row.tensaoLinha),
    eficiencia: parseFloat(row.eficienciaInversor),
    fases: row.fases,
    idTry: row.idTryInversor,
    entradas: parseInt(row.entradas, 10),
    overload: parseFloat(row.overload),
    preco: parseFloat(row.precoInversor),
    custo: parseFloat(row.custoInversor),
  }));

  if (microinversores.length === 0) {
    throw new Error('Nenhum microinversor encontrado com os parâmetros fornecidos.');
  }

  // 2. Buscar todos os módulos, possivelmente filtrados por nomeModulo
  let modulosQuery = `
    SELECT 
      m.Produto AS nomeModulo,
      m.Potencia AS potenciaModulo,
      m.Preco AS precoModulo,
      m.IdTry AS idTryModulo,
      m.CorrenteOperacaoImp AS correnteOperacaoImp, 
      m.TensaoOperacaoVmp AS tensaoOperacaoVmp,     
      m.TensaoCircuitoAbertoVoc AS tensaoCircuitoAbertoVoc 
    FROM \`sd-gestao.Calculadora.CadModulos\` AS m
    WHERE 1=1
  `;

  if (nomeModulo) {
    modulosQuery += ` AND m.Produto = '${nomeModulo}' `;
  }

  const [modulosRows] = await bigquery.query({ query: modulosQuery });

  if (modulosRows.length === 0) {
    throw new Error('Nenhum módulo encontrado com os parâmetros fornecidos.');
  }

  // 3. Mapear os módulos
  const modulos = modulosRows.map(row => ({
    nomeModulo: row.nomeModulo,
    potencia: parseFloat(row.potenciaModulo),
    preco: parseFloat(row.precoModulo),
    idTryModulo: row.idTryModulo,
    correnteOperacaoImp: parseFloat(row.correnteOperacaoImp),
    tensaoOperacaoVmp: parseFloat(row.tensaoOperacaoVmp),
    tensaoCircuitoAbertoVoc: parseFloat(row.tensaoCircuitoAbertoVoc),
  }));

  // Assumir que um único módulo é selecionado
  // Se múltiplos, implementar lógica adicional
  const selectedModulo = modulos[0];

  // 4. Calcular número de módulos necessários
  const modules_needed = Math.ceil(necessidadeEnergeticaNum / selectedModulo.potencia);

  // 5. Selecionar o microinversor com maior capacidade para otimizar
  microinversores.sort((a, b) => b.potenciaNominal - a.potenciaNominal);
  const microinversor = microinversores[0];

  // 6. Calcular quantos módulos cada microinversor pode suportar
  const modules_per_micro = microinversor.entradas;

  if (modules_per_micro < 1) {
    throw new Error('Nenhum microinversor pode suportar um módulo com a potência selecionada.');
  }

  // 7. Calcular o número de microinversores necessários
  const microinversores_needed = Math.ceil(modules_needed / modules_per_micro);

  // 8. Calcular total de módulos alocados
  const total_modules_allocated = microinversores_needed * modules_per_micro;

  // 9. Calcular potência total dos módulos
  const potencia_total_modulos = total_modules_allocated * selectedModulo.potencia;

  // 10. Calcular preço total
  const preco_total_micro = microinversor.preco * microinversores_needed;
  const preco_total_modulos = selectedModulo.preco * total_modules_allocated;

  // Preço base do kit (módulos + inversor)
  const precoBase = preco_total_micro + preco_total_modulos;

  // Aplicar as porcentagens específicas com base em OndeAfeta
  const porcentagemModulo = porcentagensPorAfetacao['Módulo'] || 0;
  const porcentagemInversor = porcentagensPorAfetacao['Inversor'] || 0;
  const porcentagemTotalKit = porcentagensPorAfetacao['Total Kit'] || 0;
  const porcentagemEstrutura = porcentagensPorAfetacao['Estrutura'] || 0; // Para uso futuro na estrutura
  const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0; // Novo tipo de custo

  // Cálculo dos custos adicionais
  const custoAdicionalModulo = preco_total_modulos * porcentagemModulo;
  const custoAdicionalInversor = preco_total_micro * porcentagemInversor;
  const custoAdicionalTotalKit = precoBase * porcentagemTotalKit;

  // Preço total do kit após adicionar os custos adicionais
  const precoTotalKit = precoBase + custoAdicionalModulo + custoAdicionalInversor + custoAdicionalTotalKit;

  // Preparar a configuração de MPPT para cada microinversor
  const configuracoesMicroInversor = [];
  for (let i = 1; i <= microinversores_needed; i++) {
    configuracoesMicroInversor.push({
      microinversorNumero: i,
      modulosEmSerie: 1, 
      modulosEmParalelo: 1,
      totalDeModulos: modules_per_micro,
    });
  }

  const resultado = {
    id: uuidv4(),
    nomeModulo: selectedModulo.nomeModulo,
    idTryModulo: selectedModulo.idTryModulo,
    nomeInversor: microinversor.nomeInversor,
    idTryInversor: microinversor.idTry,
    totalModulos: total_modules_allocated,
    microinversoresUtilizados: microinversores_needed,
    potenciaTotalModulos: potencia_total_modulos,
    potenciaTotal: potencia_total_modulos, // Adicionado
    precoTotalKit: precoTotalKit,
    precoTotal: precoTotalKit, // Inicialmente igual ao precoTotalKit
    potenciaMaximaMicroInversor: microinversor.potenciaNominal * microinversores_needed,
    configuracoesMPPT: configuracoesMicroInversor, // Renomeado para 'configuracoesMPPT'
    maximoModulosSerie: 1,
    minimoModulosSerie: 1,
    overloadUtilizado: maxOverloadNum,
    potencia: selectedModulo.potencia,
    precoModulo: selectedModulo.preco,
    precoInversor: microinversor.preco,
    // Adicionando detalhes dos custos adicionais
    custoAdicionalModulo: custoAdicionalModulo,
    custoAdicionalInversor: custoAdicionalInversor,
    custoAdicionalTotalKit: custoAdicionalTotalKit,
  };

  // Retornar no formato esperado pelo frontend
  return [{
    kits: [resultado],
    potenciaTotal: resultado.potenciaTotal,
    precoTotal: resultado.precoTotal,
    totalModulos: resultado.totalModulos,
  }];
};

const obterKitsCombinacoes = (combinacoesValidas, necessidadeEnergeticaNum) => {
  const maxKits = 5; // Limite de kits combinados
  const resultados = [];

  // Agrupar os kits por nomeModulo
  const kitsPorModulo = {};
  for (const kit of combinacoesValidas) {
    const nomeModulo = kit.nomeModulo;
    if (!kitsPorModulo[nomeModulo]) {
      kitsPorModulo[nomeModulo] = [];
    }
    kitsPorModulo[nomeModulo].push(kit);
  }

  // Para cada grupo de kits com o mesmo módulo
  for (const nomeModulo in kitsPorModulo) {
    const kits = kitsPorModulo[nomeModulo];
    // Gerar combinações com repetição para k de 1 até maxKits
    for (let k = 1; k <= maxKits; k++) {
      const combinacoes = getCombinationsWithRepetition(kits, k);
      for (const combo of combinacoes) {
        const potenciaTotal = combo.reduce((sum, kit) => sum + kit.potenciaTotalModulos, 0);
        const precoTotal = combo.reduce((sum, kit) => sum + kit.precoTotalKit, 0);
        const totalModulos = combo.reduce((sum, kit) => sum + kit.totalModulos, 0);

        if (potenciaTotal >= necessidadeEnergeticaNum) {
          resultados.push({
            kits: combo,
            potenciaTotal: potenciaTotal,
            precoTotal: precoTotal,
            totalModulos: totalModulos,
            nomeModulo: nomeModulo, // Adiciona o nome do módulo para referência
          });
        }
      }
    }
  }

  // Ordenar resultados por precoTotal e excesso de potência
  resultados.sort((a, b) => {
    if (a.precoTotal !== b.precoTotal) {
      return a.precoTotal - b.precoTotal;
    } else {
      return (a.potenciaTotal - necessidadeEnergeticaNum) - (b.potenciaTotal - necessidadeEnergeticaNum);
    }
  });

  // Limitar o número de combinações retornadas
  const limiteResultados = 10;
  return resultados.slice(0, limiteResultados);
};

// Função para obter o melhor kit
const obterMelhorKit = (combinacoesValidas, necessidadeEnergeticaNum) => {
  // Filtrar kits com potenciaTotalModulos >= necessidadeEnergeticaNum
  const kitsPossiveis = combinacoesValidas.filter(kit => kit.potenciaTotalModulos >= necessidadeEnergeticaNum);

  if (kitsPossiveis.length === 0) {
    return null; // Nenhum kit atende à necessidade
  }

  // Encontrar o kit com precoTotalKit mais baixo
  kitsPossiveis.sort((a, b) => a.precoTotalKit - b.precoTotalKit);

  return kitsPossiveis[0];
};

// Função para obter combinações ordenadas por preço
const obterCombinacoesPorPreco = (combinacoesValidas, necessidadeEnergeticaNum) => {
  // Filtrar kits com potenciaTotalModulos >= necessidadeEnergeticaNum
  const kitsPossiveis = combinacoesValidas.filter(kit => kit.potenciaTotalModulos >= necessidadeEnergeticaNum);

  if (kitsPossiveis.length === 0) {
    return []; // Nenhum kit atende à necessidade
  }

  // Ordenar os kits pelo preço total do kit (precoTotalKit)
  kitsPossiveis.sort((a, b) => a.precoTotalKit - b.precoTotalKit);

  return kitsPossiveis;
};

// Rota para obter todas as combinações
router.get('/todas-combinacoes', async (req, res) => {
  try {
    const { maxModulesParalelo, maxOverload, nomeModulo, faseInversor } = req.query;

    // Validação dos parâmetros
    if (maxModulesParalelo === undefined || maxOverload === undefined || faseInversor === undefined) {
      return res.status(400).json({ erro: 'Por favor, forneça maxModulesParalelo, maxOverload e faseInversor.' });
    }

    const maxModulesParaleloNum = parseInt(maxModulesParalelo, 10) || 2;
    const maxOverloadNum = parseFloat(maxOverload);

    if (isNaN(maxModulesParaleloNum) || isNaN(maxOverloadNum)) {
      return res.status(400).json({ erro: 'Os parâmetros devem ser números válidos.' });
    }

    // Buscar as porcentagens de custos adicionais
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    // Organizar as porcentagens por OndeAfeta
    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para obter todas as combinações, passando as porcentagens
    const combinacoesValidas = await obterTodasCombinacoes(
      maxModulesParaleloNum,
      maxOverloadNum,
      faseInversor,
      nomeModulo || null,
      porcentagensPorAfetacao // Passando o parâmetro correto
    );

    res.status(200).json(combinacoesValidas);

  } catch (error) {
    console.error('Erro ao buscar todas as combinações:', error);
    res.status(500).json({ erro: 'Erro ao buscar todas as combinações.' });
  }
});

router.get('/api/combinacoes-necessidade', async (req, res) => {
  try {
    const { maxModulesParalelo, maxOverload, necessidadeEnergetica, faseInversor, tipoTelhado, cidade, nomeModulo } = req.query;

    // Validação dos parâmetros
    if (
      maxModulesParalelo === undefined ||
      maxOverload === undefined ||
      necessidadeEnergetica === undefined ||
      faseInversor === undefined ||
      tipoTelhado === undefined ||
      cidade === undefined
    ) {
      return res.status(400).json({
        erro: 'Por favor, forneça maxModulesParalelo, maxOverload, necessidadeEnergetica, faseInversor, tipoTelhado e cidade.',
      });
    }

    const maxModulesParaleloNum = parseInt(maxModulesParalelo, 10) || 2;
    const maxOverloadNum = parseFloat(maxOverload);
    const necessidadeEnergeticaNum = parseFloat(necessidadeEnergetica);

    if (
      isNaN(maxModulesParaleloNum) ||
      isNaN(maxOverloadNum) ||
      isNaN(necessidadeEnergeticaNum)
    ) {
      return res.status(400).json({
        erro: 'Os parâmetros maxModulesParalelo, maxOverload e necessidadeEnergetica devem ser números válidos.',
      });
    }

    // Obter os custos adicionais e organizar as porcentagens
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para obter todas as combinações, passando as porcentagens
    const combinacoesValidas = await obterTodasCombinacoes(
      maxModulesParaleloNum,
      maxOverloadNum,
      faseInversor,
      nomeModulo || null,
      porcentagensPorAfetacao // Passando o novo parâmetro
    );

    // Obter as combinações de kits que atendem à necessidade energética
    const kitsCombinacoes = obterKitsCombinacoes(combinacoesValidas, necessidadeEnergeticaNum);

    // Para cada combinação, gerar os itens da estrutura, passando as porcentagens
    const kitsCombinacoesComItens = await Promise.all(kitsCombinacoes.map(async (combo) => {
      const totalModulos = combo.totalModulos;
      const { itens, precoTotalEstrutura } = await gerarItensEstrutura(tipoTelhado, totalModulos, porcentagensPorAfetacao);
      const precoTotalCombinado = combo.precoTotal + precoTotalEstrutura;

      // Cálculo do custo adicional de Preço Total
      const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0;
      const custoAdicionalPrecoTotal = precoTotalCombinado * porcentagemPrecoTotal;

      // Preço total final
      const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;

      return {
        ...combo,
        itensEstrutura: itens,
        precoTotalEstrutura: precoTotalEstrutura,
        precoTotalCombinado: precoTotalCombinado,
        custoAdicionalPrecoTotal: custoAdicionalPrecoTotal,
        precoTotal: precoTotalFinal,
      };
    }));

    res.status(200).json(kitsCombinacoesComItens);

  } catch (error) {
    console.error('Erro ao buscar as combinações para a necessidade energética:', error);
    res.status(500).json({ erro: 'Erro ao buscar as combinações para a necessidade energética.' });
  }
});

// Rota para obter o melhor kit que mais se aproxima da necessidade energética
router.get('/melhor-combinacao', async (req, res) => {
  try {
    const { maxModulesParalelo, maxOverload, necessidadeEnergetica, faseInversor, nomeModulo } = req.query;

    // Validação dos parâmetros
    if (maxModulesParalelo === undefined || maxOverload === undefined || necessidadeEnergetica === undefined) {
      return res.status(400).json({ erro: 'Por favor, forneça maxModulesParalelo, maxOverload e necessidadeEnergetica.' });
    }

    const maxModulesParaleloNum = parseInt(maxModulesParalelo, 10);
    const maxOverloadNum = parseFloat(maxOverload);
    const necessidadeEnergeticaNum = parseFloat(necessidadeEnergetica);

    if (isNaN(maxModulesParaleloNum) || isNaN(maxOverloadNum) || isNaN(necessidadeEnergeticaNum)) {
      return res.status(400).json({ erro: 'Os parâmetros devem ser números válidos.' });
    }

    // Obter os custos adicionais e organizar as porcentagens
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para obter todas as combinações, passando as porcentagens
    const combinacoesValidas = await obterTodasCombinacoes(
      maxModulesParaleloNum,
      maxOverloadNum,
      faseInversor || 'Trifásico', // Define um padrão se não for fornecido
      nomeModulo || null,
      porcentagensPorAfetacao // Passando o novo parâmetro
    );

    // Encontrar o kit mais próximo
    const melhorKitBase = obterMelhorKit(combinacoesValidas, necessidadeEnergeticaNum);

    if (!melhorKitBase) {
      return res.status(404).json({ erro: 'Nenhum kit atende à necessidade energética fornecida.' });
    }

    // Gerar itens da estrutura para o melhor kit
    const { itens, precoTotalEstrutura } = await gerarItensEstrutura(
      melhorKitBase.tipoTelhado || 'TipoTelhadoDefault', // Substitua 'TipoTelhadoDefault' pelo valor padrão ou adequado
      melhorKitBase.totalModulos,
      porcentagensPorAfetacao
    );

    // Calcular o custo adicional de "Preço Total"
    const precoTotalCombinado = melhorKitBase.precoTotalKit + precoTotalEstrutura;
    const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0;
    const custoAdicionalPrecoTotal = precoTotalCombinado * porcentagemPrecoTotal;

    // Preço total final
    const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;

    // Construir o objeto final com os custos adicionais
    const melhorKit = {
      ...melhorKitBase,
      itensEstrutura: itens,
      precoTotalEstrutura: precoTotalEstrutura,
      precoTotalCombinado: precoTotalCombinado,
      custoAdicionalPrecoTotal: custoAdicionalPrecoTotal,
      precoTotal: precoTotalFinal,
    };

    res.status(200).json(melhorKit);

  } catch (error) {
    console.error('Erro ao buscar o melhor kit para a necessidade energética:', error);
    res.status(500).json({ erro: 'Erro ao buscar o melhor kit para a necessidade energética.' });
  }
});

// Rota para obter combinações que atendem à necessidade energética e ordenar por preço
router.get('/combinacoes-por-preco', async (req, res) => {
  try {
    const { maxModulesParalelo, maxOverload, necessidadeEnergetica, faseInversor, nomeModulo } = req.query;

    // Validação dos parâmetros
    if (maxModulesParalelo === undefined || maxOverload === undefined || necessidadeEnergetica === undefined) {
      return res.status(400).json({ erro: 'Por favor, forneça maxModulesParalelo, maxOverload e necessidadeEnergetica.' });
    }

    const maxModulesParaleloNum = parseInt(maxModulesParalelo, 10);
    const maxOverloadNum = parseFloat(maxOverload);
    const necessidadeEnergeticaNum = parseFloat(necessidadeEnergetica);

    if (isNaN(maxModulesParaleloNum) || isNaN(maxOverloadNum) || isNaN(necessidadeEnergeticaNum)) {
      return res.status(400).json({ erro: 'Os parâmetros devem ser números válidos.' });
    }

    // Obter os custos adicionais e organizar as porcentagens
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para obter todas as combinações, passando as porcentagens
    const combinacoesValidas = await obterTodasCombinacoes(
      maxModulesParaleloNum,
      maxOverloadNum,
      faseInversor || 'Trifásico', // Define um padrão se não for fornecido
      nomeModulo || null,
      porcentagensPorAfetacao // Passando o novo parâmetro
    );

    // Obter as combinações que atendem à necessidade energética
    const combinacoesPorPreco = obterCombinacoesPorPreco(combinacoesValidas, necessidadeEnergeticaNum);

    // Para cada combinação, gerar os itens da estrutura e aplicar "Preço Total"
    const combinacoesPorPrecoComItens = await Promise.all(combinacoesPorPreco.map(async (combo) => {
      const totalModulos = combo.totalModulos;
      const { itens, precoTotalEstrutura } = await gerarItensEstrutura(tipoTelhado, totalModulos, porcentagensPorAfetacao);
      const precoTotalCombinado = combo.precoTotal + precoTotalEstrutura;

      // Cálculo do custo adicional de Preço Total
      const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0;
      const custoAdicionalPrecoTotal = precoTotalCombinado * porcentagemPrecoTotal;

      // Preço total final
      const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;

      return {
        ...combo,
        itensEstrutura: itens,
        precoTotalEstrutura: precoTotalEstrutura,
        precoTotalCombinado: precoTotalCombinado,
        custoAdicionalPrecoTotal: custoAdicionalPrecoTotal,
        precoTotal: precoTotalFinal,
      };
    }));

    res.status(200).json(combinacoesPorPrecoComItens);

  } catch (error) {
    console.error('Erro ao buscar as combinações por preço:', error);
    res.status(500).json({ erro: 'Erro ao buscar as combinações por preço.' });
  }
});

// Rota para obter combinações com microinversores
router.get('/combinacoes-microinversor', async (req, res) => {
  try {
    const { necessidadeEnergetica, maxOverload, faseInversor, tipoTelhado, cidade, nomeModulo } = req.query;

    // Validação dos parâmetros
    if (
      maxOverload === undefined ||
      necessidadeEnergetica === undefined ||
      faseInversor === undefined ||
      tipoTelhado === undefined ||
      cidade === undefined
    ) {
      return res.status(400).json({
        erro: 'Por favor, forneça maxOverload, necessidadeEnergetica, faseInversor, tipoTelhado e cidade.',
      });
    }

    const maxOverloadNum = parseFloat(maxOverload);
    const necessidadeEnergeticaNum = parseFloat(necessidadeEnergetica);

    if (
      isNaN(maxOverloadNum) ||
      isNaN(necessidadeEnergeticaNum)
    ) {
      return res.status(400).json({
        erro: 'Os parâmetros maxOverload e necessidadeEnergetica devem ser números válidos.',
      });
    }

    // Obter os custos adicionais e organizar as porcentagens
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para obter todas as combinações, passando as porcentagens
    const combinacoesMicroinversor = await obterCombinacoesMicroInversor(
      maxOverloadNum, 
      necessidadeEnergeticaNum, 
      faseInversor, 
      tipoTelhado, 
      cidade, 
      nomeModulo,
      porcentagensPorAfetacao // Passando o novo parâmetro
    );

    console.log('Combinacoes Microinversor:', JSON.stringify(combinacoesMicroinversor, null, 2)); // Log para depuração

    // Para cada combinação, gerar os itens da estrutura e calcular precoTotal
    const combinacoesMicroComItens = await Promise.all(combinacoesMicroinversor.map(async (combo) => {
      const totalModulos = combo.totalModulos;
      const { itens, precoTotalEstrutura } = await gerarItensEstrutura(tipoTelhado, totalModulos, porcentagensPorAfetacao);
      const precoTotalCombinado = (combo.precoTotal || 0) + (precoTotalEstrutura || 0);

      // Cálculo do custo adicional de Preço Total
      const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0;
      const custoAdicionalPrecoTotal = precoTotalCombinado * porcentagemPrecoTotal;

      // Preço total final
      const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;

      return {
        ...combo,
        itensEstrutura: itens,
        precoTotalEstrutura: precoTotalEstrutura,
        precoTotalCombinado: precoTotalCombinado,
        custoAdicionalPrecoTotal: custoAdicionalPrecoTotal,
        precoTotal: precoTotalFinal, // Soma precoTotalKit com precoTotalEstrutura e custo adicional
      };
    }));

    res.status(200).json(combinacoesMicroComItens);

  } catch (error) {
    console.error('Erro ao calcular combinações com microinversores:', error);
    res.status(500).json({ erro: error.message || 'Erro ao calcular combinações com microinversores.' });
  }
});

// Rota para recalcular a estrutura
router.post('/recalcular-estrutura', async (req, res) => {
  try {
    const { tipoTelhado, totalModulos, precoTotalKit } = req.body; // Receber precoTotalKit

    // Validação dos parâmetros
    if (!tipoTelhado || totalModulos === undefined) {
      return res.status(400).json({ erro: 'Por favor, forneça tipoTelhado e totalModulos.' });
    }

    const totalModulosNum = parseInt(totalModulos, 10);
    if (isNaN(totalModulosNum) || totalModulosNum <= 0) {
      return res.status(400).json({ erro: 'totalModulos deve ser um número válido e maior que 0.' });
    }

    // Obter os custos adicionais e organizar as porcentagens
    const [custosRows] = await bigquery.query({
      query: `
        SELECT Porcentagem, OndeAfeta
        FROM \`sd-gestao.Calculadora.CadCusto\`
      `,
    });

    if (!custosRows || custosRows.length === 0) {
      throw new Error('Nenhum valor de porcentagem encontrado na tabela CadCusto.');
    }

    const porcentagensPorAfetacao = organizarPorcentagens(custosRows);

    // Chamar a função para gerar itens da estrutura, passando as porcentagens
    const { itens, precoTotalEstrutura } = await gerarItensEstrutura(tipoTelhado, totalModulosNum, porcentagensPorAfetacao);

    // Calcular precoTotal combinando precoTotalKit e precoTotalEstrutura
    const precoTotalCombinado = (precoTotalKit || 0) + precoTotalEstrutura;

    // Cálculo do custo adicional de Preço Total
    const porcentagemPrecoTotal = porcentagensPorAfetacao['Preço Total'] || 0;
    const custoAdicionalPrecoTotal = precoTotalCombinado * porcentagemPrecoTotal;

    // Preço total final
    const precoTotalFinal = precoTotalCombinado + custoAdicionalPrecoTotal;

    res.status(200).json({ 
      itensEstrutura: itens, 
      precoTotalEstrutura: precoTotalEstrutura,
      precoTotalCombinado: precoTotalCombinado,
      custoAdicionalPrecoTotal: custoAdicionalPrecoTotal,
      precoTotal: precoTotalFinal 
    });
  } catch (error) {
    console.error('Erro ao recalcular a estrutura:', error);
    res.status(500).json({ erro: 'Erro ao recalcular a estrutura.' });
  }
});

// Função para gerar itens da estrutura
const gerarItensEstrutura = async (tipoTelhado, totalModulos, porcentagensPorAfetacao) => {
  // 1. Obter os módulos disponíveis para o tipo de telhado, ordenados decrescentemente
  const modulosQuery = `
    SELECT DISTINCT Modulos
    FROM \`sd-gestao.Calculadora.CadEstrutura\`
    WHERE Estrutura = @tipoTelhado
    ORDER BY Modulos DESC
  `;
  const options = {
    query: modulosQuery,
    params: { tipoTelhado },
  };
  const [modulosRows] = await bigquery.query(options);
  const availableModuleCounts = modulosRows
    .map(row => parseInt(row.Modulos, 10))
    .sort((a, b) => b - a);

  let remainingModules = totalModulos;
  const kitCounts = {}; // { moduleCount: número de kits usados }

  while (remainingModules > 0) {
    let found = false;
    for (let moduleCount of availableModuleCounts) {
      if (moduleCount <= remainingModules) {
        kitCounts[moduleCount] = (kitCounts[moduleCount] || 0) + 1;
        remainingModules -= moduleCount;
        found = true;
        break; // Recomeça do maior módulo
      }
    }
    if (!found) {
      // Não encontrou um moduleCount <= remainingModules
      // Alocar o menor moduleCount disponível para exceder
      let smallestModuleCount = availableModuleCounts[availableModuleCounts.length - 1];
      kitCounts[smallestModuleCount] = (kitCounts[smallestModuleCount] || 0) + 1;
      remainingModules -= smallestModuleCount; // Pode tornar negativo, o que é aceitável para indicar excedente
    }
  }

  // 3. Para cada moduleCount em kitCounts, obter itens e quantidades
  const allItems = {};
  for (let moduleCountStr in kitCounts) {
    const moduleCount = parseInt(moduleCountStr, 10);
    const count = kitCounts[moduleCountStr];
    const itemsQuery = `
      SELECT ce.Item, ce.IdProduto, ce.Produto, ce.Quantidade, p.Preco
      FROM \`sd-gestao.Calculadora.CadEstrutura\` AS ce
      LEFT JOIN \`sd-gestao.Calculadora.Produtos\` AS p
      ON ce.IdProduto = p.IdProduto
      WHERE ce.Estrutura = @tipoTelhado AND ce.Modulos = @moduleCount
    `;
    const itemsOptions = {
      query: itemsQuery,
      params: { tipoTelhado, moduleCount },
    };
    const [itemRows] = await bigquery.query(itemsOptions);

    // Agregar quantidades e calcular PrecoItem
    for (let row of itemRows) {
      const key = row.IdProduto;
      const quantidadeTotal = row.Quantidade * count;
      const precoUnitario = parseFloat(row.Preco) || 0;
      const precoItem = precoUnitario * quantidadeTotal;

      if (!allItems[key]) {
        allItems[key] = {
          Item: row.Item,
          IdProduto: row.IdProduto,
          Produto: row.Produto,
          Quantidade: quantidadeTotal,
          PrecoUnitario: precoUnitario,
          PrecoItem: precoItem,
        };
      } else {
        allItems[key].Quantidade += quantidadeTotal;
        allItems[key].PrecoItem += precoItem;
      }
    }
  }

  // 4. Calcular o preço total da estrutura
  const precoTotalEstrutura = Object.values(allItems).reduce((sum, item) => sum + item.PrecoItem, 0);

  // 5. Aplicar porcentagens adicionais sobre a estrutura
  const porcentagemEstrutura = porcentagensPorAfetacao['Estrutura'] || 0;
  const custoAdicionalEstrutura = precoTotalEstrutura * porcentagemEstrutura;

  // 6. Preço total da estrutura incluindo custos adicionais
  const precoTotalEstruturaComAdicional = precoTotalEstrutura + custoAdicionalEstrutura;

  // 7. Retornar os itens agregados e o preço total
  return {
    itens: Object.values(allItems),
    precoTotalEstrutura: precoTotalEstruturaComAdicional,
    custoAdicionalEstrutura,
  };
};

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
    if (token == null) {
      console.log('Token não encontrado no cabeçalho.');
      return res.status(401).json({ success: false, message: 'Token de autenticação não encontrado.' });
    }
  
    try {
      const user = jwt.verify(token, JWT_SECRET);
  
      // Buscar o cargo e a unidade do usuário
      const userQuery = `
        SELECT Cargo, Unidade
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const userOptions = {
        query: userQuery,
        params: { IdUsuario: user.id },
      };
      const [userRows] = await bigquery.query(userOptions);
  
      if (userRows.length === 0) {
        return res.status(403).json({ success: false, message: 'Usuário não encontrado.' });
      }
  
      req.user = {
        id: user.id,
        cargo: userRows[0].Cargo,
        unidade: userRows[0].Unidade,
      };
  
      next();
    } catch (err) {
      console.log('Token inválido ou expirado:', err);
      return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    }
  };


// Rota para obter informações do usuário autenticado
router.get('/api/me', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Rota para inserir dados na calculadora
router.post('/api/inserir-calculadora', authenticateToken , async (req, res) => {
  const dados = req.body;

  // Verifica se o IdConsultorRelacionado corresponde ao usuário autenticado
  // Removido: Comparação com req.user.id para permitir IdConsultorRelacionado como null

  // Gerar IdCombinacao se não estiver presente
  if (!dados.IdCombinacao) {
    dados.IdCombinacao = uuidv4();
  }

  // Gerar IDs únicos para cada Kit se não estiverem presentes
  if (Array.isArray(dados.Kits)) {
    dados.Kits = dados.Kits.map(kit => ({
      NomeKit: kit.NomeKit || `Kit-${uuidv4()}`,
      ...kit,
    }));
  }

  console.log('Recebendo dados para inserção:', JSON.stringify(dados, null, 2));

  try {
    await bigquery.dataset(datasetId).table(tableId).insert(dados);
    console.log('Dados inseridos com sucesso no BigQuery.');
    res.status(200).send({ success: true, message: 'Dados inseridos com sucesso.' });
  } catch (error) {
    console.error('Erro ao inserir dados no BigQuery:', error);
    if (error.errors && error.errors.length > 0) {
      res.status(400).send({ success: false, message: 'Erro de esquema no BigQuery.', errors: error.errors });
    } else {
      res.status(500).send({ success: false, message: 'Erro ao inserir dados no BigQuery.', error: error.message });
    }
  }
});

router.get('/api/modulos', async (req, res) => {
  try {
    const modulosQuery = `
      SELECT 
        m.Produto AS nomeModulo,
        m.IdTry AS idTryModulo,
        m.Potencia AS potenciaModulo,
        m.Preco AS precoModulo
      FROM \`sd-gestao.Calculadora.CadModulos\` AS m
      ORDER BY m.Produto
    `;

    const [modulosRows] = await bigquery.query({ query: modulosQuery });
    const modulos = modulosRows.map(row => ({
      value: row.nomeModulo, // Nome do módulo
      label: `${row.nomeModulo} - R$ ${parseFloat(row.precoModulo).toFixed(2)} / ${parseFloat(row.potenciaModulo)}W`, // Rótulo com preço e potência
      idTryModulo: row.idTryModulo, // ID único do módulo
      preco: parseFloat(row.precoModulo),
      potencia: parseFloat(row.potenciaModulo),
    }));

    res.status(200).json(modulos);
  } catch (error) {
    console.error('Erro ao obter módulos:', error);
    res.status(500).json({ erro: 'Erro ao obter módulos.' });
  }
});

router.get('/api/inversores', async (req, res) => {
  try {
    const inversorQuery = `
      SELECT 
        Produto AS nomeInversor,
        PotenciaNominal AS potenciaNominal,
        PotenciaMaxima AS potenciaMaxima,
        MPPTs AS mppts,
        TensaoMaxima AS tensaoMaxima,
        TensaoMinimaMppt AS tensaoMinimaMppt,
        TensaoMaximaMppt AS tensaoMaximaMppt,
        CorrenteMaximaMppt AS correnteMaximaMppt,
        TensaoLinha AS tensaoLinha,
        Eficiencia AS eficienciaInversor,
        Fases AS fases,
        IdTry AS idTryInversor,
        Entradas AS entradas,
        Overload AS overload,
        Preco AS precoInversor,
        Custo AS custoInversor
      FROM \`sd-gestao.Calculadora.CadInversores\` AS i
    `;

    const [inversorRows] = await bigquery.query({
      query: inversorQuery,
    });

    const inversores = inversorRows.map(row => ({
      nomeInversor: row.nomeInversor,
      potenciaNominal: parseFloat(row.potenciaNominal),
      potenciaMaxima: parseFloat(row.potenciaMaxima),
      mppts: parseInt(row.mppts, 10),
      tensaoMaxima: parseFloat(row.tensaoMaxima),
      tensaoMinimaMppt: parseFloat(row.tensaoMinimaMppt),
      tensaoMaximaMppt: parseFloat(row.tensaoMaximaMppt),
      correnteMaximaMppt: parseFloat(row.correnteMaximaMppt),
      tensaoLinha: parseFloat(row.tensaoLinha),
      eficiencia: parseFloat(row.eficienciaInversor),
      fases: row.fases,
      idTry: row.idTryInversor,
      entradas: parseInt(row.entradas, 10),
      overload: parseFloat(row.overload),
      preco: parseFloat(row.precoInversor),
      custo: parseFloat(row.custoInversor),
    }));

    res.status(200).json(inversores);

  } catch (error) {
    console.error('Erro ao obter inversores:', error);
    res.status(500).json({ erro: 'Erro ao obter inversores.' });
  }
});

router.get('/api/cidades', async (req, res) => {
  try {
    const [cidadeRows] = await bigquery.query({
      query: `
        SELECT IdCidade, CidadeUF
        FROM \`sd-gestao.CRM.Cidades\`
        WHERE Ativo = 1
        ORDER BY CidadeUF
      `,
    });

    res.status(200).json(cidadeRows);
  } catch (error) {
    console.error('Erro ao obter cidades:', error);
    res.status(500).json({ erro: 'Erro ao obter cidades.' });
  }
});

export default router;