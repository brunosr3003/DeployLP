// workers/mpptWorker.js

import { parentPort, workerData } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Gera um hash único para uma combinação baseada no inversor e nas configurações dos módulos.
 * @param {Object} combinacao - A combinação a ser hashada.
 * @returns {string} - O hash SHA-256 da combinação.
 */
function generateCombinationHash(combinacao) {
  const hash = crypto.createHash('sha256');

  // Ordenar as configurações dos MPPTs para garantir consistência
  const sortedCombinacao = combinacao.combinacao
    .map(mppt => `${mppt.mppt}-${mppt.modulosSerie}-${mppt.modulosParalelo}`)
    .sort()
    .join('|');

  // Concatenar o ID do inversor com as configurações dos MPPTs
  const dataToHash = `${combinacao.inversor_id}-${sortedCombinacao}`;
  hash.update(dataToHash);

  return hash.digest('hex');
}

/**
 * Processa as combinações para um único MPPT.
 * @param {Object} param0 - Objeto contendo os MPPTs a serem processados.
 * @param {Array} param0.mpptCombos - Combinações de módulos para o MPPT.
 * @param {Object} param0.inversor - Dados do inversor.
 * @param {Object} param0.modulo - Dados do módulo.
 * @returns {Array} - Array de combinações válidas.
 */
function processMPPTs({ mpptCombos, inversor, modulo }) {
  const resultados = [];

  mpptCombos.forEach(config => {
    const totalModulos = config.totalModulos;
    const potenciaTotalModulos = config.potenciaTotalModulos;
    const totalPrice = config.totalPrice + inversor.preco;
    const totalCost = config.totalCost + inversor.custo;

    if (potenciaTotalModulos > inversor.potenciaInversorComOverloadSelecionado) {
      return;
    }

    resultados.push({
      id: uuidv4(),
      inversor_id: inversor.idTry,
      combinacao: [
        {
          mppt: config.mppt,
          modulosSerie: config.modulosSerie,
          modulosParalelo: config.modulosParalelo,
          potenciaTotalModulos: config.potenciaTotalModulos,
          totalModulos: config.totalModulos,
          totalPrice: config.totalPrice,
          totalCost: config.totalCost,
        },
        // Adicionar configurações vazias para os outros MPPTs
        ...Array(inversor.mppts - 1).fill({
          mppt: 0,
          modulosSerie: 0,
          modulosParalelo: 0,
          potenciaTotalModulos: 0,
          totalModulos: 0,
          totalPrice: 0,
          totalCost: 0,
        }),
      ],
      totalModulos,
      potenciaTotalModulos,
      potenciaInversor: inversor.potenciaNominal,
      potenciaInversorComOverloadSelecionado: inversor.potenciaInversorComOverloadSelecionado,
      overloadMax: inversor.overload,
      overloadAplicavel: inversor.overloadAplicavel,
      totalPrice,
      totalCost,
    });
  });

  return resultados;
}

// Processar os dados recebidos do main thread
const { mpptData, inversor, modulo } = workerData;

// Processar cada MPPT e coletar os resultados
const processedResults = mpptData.flatMap(mppt => processMPPTs({
  mpptCombos: mppt.mpptCombos,
  inversor,
  modulo,
}));

// Gerar combination_hash para cada combinação (caso ainda não tenha sido feito no worker)
processedResults.forEach(comb => {
  if (!comb.combination_hash) {
    comb.combination_hash = generateCombinationHash(comb);
  }
});

// Enviar os resultados de volta para o main thread
parentPort.postMessage(processedResults);