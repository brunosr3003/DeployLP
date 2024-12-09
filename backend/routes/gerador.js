//gerador.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';
import fetch from 'node-fetch'; 
import 'dotenv/config';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

const bigquery = new BigQuery({
  projectId: 'sd-gestao', 
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});
const auth = new google.auth.GoogleAuth({ 

  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json' ,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
function obterDataHoraBrasilia() {
  const now = new Date();

  // Obtém o horário UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // Ajusta para UTC-3 (Brasília)
  const brasiliaTime = new Date(utc - 3 * 60 * 60 * 1000);

  // Formata como "YYYY-MM-DD HH:MM:SS.SSSSSS"
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  const hours = String(brasiliaTime.getHours()).padStart(2, '0');
  const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');
  const seconds = String(brasiliaTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(brasiliaTime.getMilliseconds()).padStart(3, '0');

  // Adiciona três zeros para completar seis dígitos de frações de segundos
  const microseconds = milliseconds + '000';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
}


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token de autenticação não fornecido.');
    return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token inválido:', err);
      return res.status(403).json({ success: false, message: 'Token inválido.' });
    }
    console.log('Usuário autenticado:', user);
    req.user = user;
    next();
  });
};

// Middleware para verificar o cargo do usuário
const checkRole = (role) => (req, res, next) => {
  const userRole = req.user.Cargo || req.user.cargo; // Considera ambas as capitalizações
  console.log(`Verificando cargo. Esperado: ${role}, Recebido: ${userRole}`);
  if (
    userRole &&
    userRole.toUpperCase() === role.toUpperCase()
  ) {
    next();
  } else {
    console.log('Permissão insuficiente para o usuário:', req.user);
    res.status(403).json({ success: false, message: 'Acesso negado. Permissão insuficiente.' });
  }
};


  

const authenticateApiKey = (req, res, next) => {
  // Obter a chave de API do cabeçalho 'x-api-key'
  const apiKey = req.headers['x-api-key'];

  // Verificar se a chave de API está presente
  if (!apiKey) {
    return res.status(401).json({ error: 'Chave de API ausente' });
  }

  // Verificar se a chave de API é válida
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Chave de API inválida' });
  }

  // Chave de API válida, prosseguir para o próximo middleware ou rota
  next();
};

function sanitizeData(data) {
  const sanitizedData = {};

  Object.keys(data).forEach((key) => {
    let value = data[key];

    if (value === null || value === undefined) {
      sanitizedData[key] = '';
    } else if (Array.isArray(value)) {
      sanitizedData[key] = value.join(','); // Converte arrays em strings separadas por vírgula
    } else if (typeof value === 'object') {
      sanitizedData[key] = JSON.stringify(value); // Converte objetos em strings JSON
    } else {
      sanitizedData[key] = String(value); // Converte outros valores para string
    }
  });

  return sanitizedData;
}

async function inserirNoBigQuery(dados) {
  // Sanitizar os dados
  const sanitizedData = sanitizeData(dados);

  // Construir a consulta INSERT INTO com todas as colunas e parâmetros
  const query = `
    INSERT INTO \`sd-gestao.CRM.CadDadosDoc\` (
      IdDadosContrato,    
      consultorResponsavel,
      CPFconsultorResponsavel,
      emailConsultor,
      origemOportunidade,
      preVendedor,
      tipoCompensacao,
      expansaoUsina,
      observacoesVistoria,
      nomeCompletoResponsavel,
      emailResponsavel,
      telefoneResponsavel,
      tipoCliente,
      razaoSocial,
      cnpjCliente,
      finalidadeEmpresa,
      estadoCivil,
      profissao,
      cpfCliente,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidadeUf,
      numeroPropostaSolarMarket,
      valorTotalContrato,
      valorTotalContratoExtenso,
      valorBrutoUsina,
      potenciaTotalProjeto,
      potenciaExistente,
      potenciaIncrementada,
      tipoEstrutura,
      padrao,
      tipoPadrao,
      correntePadrao,
      quantidadeFasesDisjuntor,
      alteracaoPadrao,
      observacoesPadrao,
      descricaoAlteracao,
      padraoMultiluz,
      valorPadrao,
      tipoTitularProjeto,
      nomeTitularProjeto,
      cpfTitularProjeto,
      cnpjTitularProjeto,
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
      valorBoleto,
      valorCartao,
      valorFinanciamento,
      quantidadeModulos,
      modeloModulo,
      quantidadeTotalInversores,
      potenciaTotalInversores,
      marcaInversor,
      marcaInversores,
      quantidadeInversor1,
      modeloInversor1,  
      quantidadeInversor2,
      modeloInversor2,
      quantidadeInversor3,
      modeloInversor3,
      tipoPagamento,
      descricaoFormaPagamento,
      arquivoAutorizacao,
      descricaoFormaPagamentoBoleto,
      formaPagamentoBoleto,
      formaPagamentoCartao,
      valorJurosCartao,
      bancoFinanciamento, 
      tipoFaturamento,
      aditivos,
      nfAntecipada,
      projetoAprovado,
      nomeParecerAprovado,
      linkInstalacaoUsina,
      observacoes,
      dataContrato,
      EmailSignatario,
      TelefoneSignatario,
      CPFSignatario,
      NomeSignatario,
      fotosPadrao,
      arquivos,
      linkArquivos,
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
      ClienteRelacionado,
      possuiAditivos,
      selectedArea,
      areasAtuacao,
      DescricaoPadrao,
      StatusAutorizacao,
      DescricaoStatus
    )
    VALUES (
      @IdDadosContrato,    
      @consultorResponsavel,
      @CPFconsultorResponsavel,
      @emailConsultor,
      @origemOportunidade,
      @preVendedor,
      @tipoCompensacao,
      @expansaoUsina,
      @observacoesVistoria,
      @nomeCompletoResponsavel,
      @emailResponsavel,
      @telefoneResponsavel,
      @tipoCliente,
      @razaoSocial,
      @cnpjCliente,
      @finalidadeEmpresa,
      @estadoCivil,
      @profissao,
      @cpfCliente,
      @cep,
      @logradouro,
      @numero,
      @complemento,
      @bairro,
      @cidadeUf,
      @numeroPropostaSolarMarket,
      @valorTotalContrato,
      @valorTotalContratoExtenso,
      @valorBrutoUsina,
      @potenciaTotalProjeto,
      @potenciaExistente,
      @potenciaIncrementada,
      @tipoEstrutura,
      @padrao,
      @tipoPadrao,
      @correntePadrao,
      @quantidadeFasesDisjuntor,
      @alteracaoPadrao,
      @observacoesPadrao,
      @descricaoAlteracao,
      @padraoMultiluz,
      @valorPadrao,
      @tipoTitularProjeto,
      @nomeTitularProjeto,
      @cpfTitularProjeto,
      @cnpjTitularProjeto,
      @nomeResponsavelTitularProjeto,
      @profissaoResponsavelTitularConcessionaria,
      @cpfResponsavelTitularProjeto,
      @razaoSocialTitularConc,
      @finalidadeEmpresaTitularConc,
      @estadoCivilTitularConcessionaria,
      @profissaoTitularConcessionaria,
      @modalidadeCompensacao,
      @cepInstalacao,
      @logradouroInstalacao,
      @numeroInstalacao,
      @complementoInstalacao,
      @bairroInstalacao,
      @cidadeUfInstalacao,
      @valorBoleto,
      @valorCartao,
      @valorFinanciamento,
      @quantidadeModulos,
      @modeloModulo,
      @quantidadeTotalInversores,
      @potenciaTotalInversores,
      @marcaInversor,
      @marcaInversores,
      @quantidadeInversor1,
      @modeloInversor1,  
      @quantidadeInversor2,
      @modeloInversor2,
      @quantidadeInversor3,
      @modeloInversor3,
      @tipoPagamento,
      @descricaoFormaPagamento,
      @arquivoAutorizacao,
      @descricaoFormaPagamentoBoleto,
      @formaPagamentoBoleto,
      @formaPagamentoCartao,
      @valorJurosCartao,
      @bancoFinanciamento, 
      @tipoFaturamento,
      @aditivos,
      @nfAntecipada,
      @projetoAprovado,
      @nomeParecerAprovado,
      @linkInstalacaoUsina,
      @observacoes,
      @dataContrato,
      @EmailSignatario,
      @TelefoneSignatario,
      @CPFSignatario,
      @NomeSignatario,
      @fotosPadrao,
      @arquivos,
      @linkArquivos,
      @linkPropostaSolarMarket,       
      @linkArquivoAutorizacao,
      @linkDocumentoIdentidade,
      @linkComprovanteEnderecoFaturamento,
      @linkComprovanteEnderecoInstalacao,
      @linkFotosPadrao,
      @linkFotosPadraoColetivo,
      @linkImagensDiversasPadrao,   
      @verificadorContrato,
      @emailVerificadorContrato,
      @telefoneverificadorContrato,
      @telefoneResponsavelHomologacao,     
      @bancoFinanciamentoFinal,
      @cargoResp,
      @QuantidadePadroes,
      @TipoConexaoPadrao,
      @CorrenteDisjuntor,
      @FavorOuContraRede,
      @ServicoAlvenaria,
      @ClienteRelacionado,
      @possuiAditivos,
      @selectedArea,
      @areasAtuacao,
      @DescricaoPadrao,
      @StatusAutorizacao,
      @DescricaoStatus
    )
  `;

  const options = {
    query: query,
    params: sanitizedData,
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job de inserção iniciado: ${job.id}`);
    await job.getQueryResults();
    console.log('Dados inseridos com sucesso no BigQuery.');
  } catch (error) {
    console.error('Erro ao inserir dados no BigQuery:', error);
    throw error;
  }
}




router.get('/api/contrato/:IdDadosContrato', authenticateToken, async (req, res) => {
  const { IdDadosContrato } = req.params;

  if (!IdDadosContrato) {
    return res.status(400).json({ success: false, message: 'IdDadosContrato é obrigatório.' });
  }

  const query = `
    SELECT *
    FROM \`sd-gestao.CRM.CadDadosDoc\`
    WHERE IdDadosContrato = @IdDadosContrato
    LIMIT 1
  `;

  const options = {
    query: query,
    params: { IdDadosContrato },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
    }

    const contrato = rows[0];

    // Dividir os links por vírgula
    const processedContrato = {
      ...contrato,
      linkDocumentoIdentidade: contrato.linkDocumentoIdentidade ? contrato.linkDocumentoIdentidade.split(',') : [],
      linkArquivoAutorizacao: contrato.linkArquivoAutorizacao ? contrato.linkArquivoAutorizacao.split(',') : [],
      linkArquivos: contrato.linkArquivos ? contrato.linkArquivos.split(',') : [],
      linkFotosPadrao: contrato.linkFotosPadrao ? contrato.linkFotosPadrao.split(',') : [],
      linkPropostaSolarMarket: contrato.linkPropostaSolarMarket ? contrato.linkPropostaSolarMarket.split(',') : [],
      linkImagensDiversasPadrao: contrato.linkImagensDiversasPadrao ? contrato.linkImagensDiversasPadrao.split(',') : [],
      LinkDocumento: contrato.LinkDocumento ? contrato.LinkDocumento.split(',') : [],
      linkComprovanteEnderecoFaturamento: contrato.linkComprovanteEnderecoFaturamento ? contrato.linkComprovanteEnderecoFaturamento.split(',') : [],
      linkComprovanteEnderecoInstalacao: contrato.linkComprovanteEnderecoInstalacao ? contrato.linkComprovanteEnderecoInstalacao.split(',') : [],
      linkFotosPadraoColetivo: contrato.linkFotosPadraoColetivo ? contrato.linkFotosPadraoColetivo.split(',') : []
    };

    return res.status(200).json({ success: true, contrato: processedContrato });
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar contrato.' });
  }
});

router.get('/api/contrato/:IdDadosContrato/links', authenticateToken, async (req, res) => {
  const { IdDadosContrato } = req.params;
  console.log(`Recebido GET /contrato/${IdDadosContrato}/links`);

  if (!IdDadosContrato) {
    console.error('IdDadosContrato não fornecido.');
    return res.status(400).json({ success: false, message: 'IdDadosContrato é obrigatório.' });
  }

  const query = `
    SELECT linkDocumentoIdentidade, linkArquivoAutorizacao, linkArquivos, linkFotosPadrao, 
           linkPropostaSolarMarket, linkImagensDiversasPadrao, LinkDocumento, 
           linkComprovanteEnderecoFaturamento, linkComprovanteEnderecoInstalacao, linkFotosPadraoColetivo
    FROM \`sd-gestao.CRM.CadDadosDoc\`
    WHERE IdDadosContrato = @IdDadosContrato
    LIMIT 1
  `;

  const options = {
    query: query,
    params: { IdDadosContrato },
  };

  try {
    console.log('Executando consulta no BigQuery...');
    const [job] = await bigquery.createQueryJob(options);
    console.log('Consulta iniciada. Job ID:', job.id);

    const [rows] = await job.getQueryResults();
    console.log('Consulta concluída. Número de linhas retornadas:', rows.length);

    if (rows.length === 0) {
      console.warn('Nenhum contrato encontrado com o IdDadosContrato fornecido.');
      return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
    }

    const contrato = rows[0];
    console.log('Contrato encontrado:', contrato);

    // Estrutura de links, dividindo por vírgula
    const links = {
      linkDocumentoIdentidade: contrato.linkDocumentoIdentidade ? contrato.linkDocumentoIdentidade.split(',') : [],
      linkArquivoAutorizacao: contrato.linkArquivoAutorizacao ? contrato.linkArquivoAutorizacao.split(',') : [],
      linkArquivos: contrato.linkArquivos ? contrato.linkArquivos.split(',') : [],
      linkFotosPadrao: contrato.linkFotosPadrao ? contrato.linkFotosPadrao.split(',') : [],
      linkPropostaSolarMarket: contrato.linkPropostaSolarMarket ? contrato.linkPropostaSolarMarket.split(',') : [],
      linkImagensDiversasPadrao: contrato.linkImagensDiversasPadrao ? contrato.linkImagensDiversasPadrao.split(',') : [],
      LinkDocumento: contrato.LinkDocumento ? contrato.LinkDocumento.split(',') : [],
      linkComprovanteEnderecoFaturamento: contrato.linkComprovanteEnderecoFaturamento ? contrato.linkComprovanteEnderecoFaturamento.split(',') : [],
      linkComprovanteEnderecoInstalacao: contrato.linkComprovanteEnderecoInstalacao ? contrato.linkComprovanteEnderecoInstalacao.split(',') : [],
      linkFotosPadraoColetivo: contrato.linkFotosPadraoColetivo ? contrato.linkFotosPadraoColetivo.split(',') : []
    };

    console.log('Links estruturados:', links);

    return res.status(200).json({ success: true, links });
  } catch (error) {
    console.error('Erro ao buscar links do contrato:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar links do contrato.' });
  }
});

async function atualizarNoBigQuery(dados) {
  const query = `
    UPDATE \`sd-gestao.CRM.CadDadosDoc\` 
    SET 
      ClienteRelacionado = @ClienteRelacionado,
      modalidadeCompensacao = @modalidadeCompensacao,
      consultorResponsavel = @consultorResponsavel,
      emailConsultor = @emailConsultor,
      origemOportunidade = @origemOportunidade,
      preVendedor = @preVendedor,
      tipoCompensacao = @tipoCompensacao,
      expansaoUsina = @expansaoUsina,
      observacoesVistoria = @observacoesVistoria,
      nomeCompletoResponsavel = @nomeCompletoResponsavel,
      emailResponsavel = @emailResponsavel,
      telefoneResponsavel = @telefoneResponsavel,
      telefoneResponsavelHomologacao = @telefoneResponsavelHomologacao,
      tipoCliente = @tipoCliente,
      razaoSocial = @razaoSocial,
      cnpjCliente = @cnpjCliente,
      cargoResp = @cargoResp,
      finalidadeEmpresa = @finalidadeEmpresa,
      estadoCivil = @estadoCivil,
      profissao = @profissao,
      cpfCliente = @cpfCliente,
      cep = @cep,
      logradouro = @logradouro,
      numero = @numero,
      complemento = @complemento,
      bairro = @bairro,
      cidadeUf = @cidadeUf,
      numeroPropostaSolarMarket = @numeroPropostaSolarMarket,
      valorTotalContrato = @valorTotalContrato,
      valorTotalContratoExtenso = @valorTotalContratoExtenso,
      valorBrutoUsina = @valorBrutoUsina,
      valorBoleto = @valorBoleto,
      valorCartao = @valorCartao,
      valorFinanciamento = @valorFinanciamento,
      potenciaExistente = @potenciaExistente,
      potenciaIncrementada = @potenciaIncrementada,
      potenciaTotalProjeto = @potenciaTotalProjeto,
      tipoEstrutura = @tipoEstrutura,
      aditivos = @aditivos,
      padrao = @padrao,
      tipoPadrao = @tipoPadrao,
      correntePadrao = @correntePadrao,
      alteracaoPadrao = @alteracaoPadrao,
      observacoesPadrao = @observacoesPadrao,
      descricaoAlteracao = @descricaoAlteracao,
      padraoMultiluz = @padraoMultiluz,
      valorPadrao = @valorPadrao,
      tipoTitularProjeto = @tipoTitularProjeto,
      nomeTitularProjeto = @nomeTitularProjeto,
      cpfTitularProjeto = @cpfTitularProjeto,
      cnpjTitularProjeto = @cnpjTitularProjeto,
      estadoCivilTitularConcessionaria = @estadoCivilTitularConcessionaria,
      profissaoTitularConcessionaria = @profissaoTitularConcessionaria,
      cepInstalacao = @cepInstalacao,
      logradouroInstalacao = @logradouroInstalacao,
      numeroInstalacao = @numeroInstalacao,
      complementoInstalacao = @complementoInstalacao,
      bairroInstalacao = @bairroInstalacao,
      cidadeUfInstalacao = @cidadeUfInstalacao,
      quantidadeModulos = @quantidadeModulos,
      modeloModulo = @modeloModulo,
      quantidadeTotalInversores = @quantidadeTotalInversores,
      potenciaTotalInversores = @potenciaTotalInversores,
      marcaInversor = @marcaInversor,
      marcaInversores = @marcaInversores,
      quantidadeInversor1 = @quantidadeInversor1,
      modeloInversor1 = @modeloInversor1,
      quantidadeInversor2 = @quantidadeInversor2,
      modeloInversor2 = @modeloInversor2,
      quantidadeInversor3 = @quantidadeInversor3,
      modeloInversor3 = @modeloInversor3,
      tipoPagamento = @tipoPagamento,
      linkArquivoAutorizacao = @linkArquivoAutorizacao,
      formaPagamentoBoleto = @formaPagamentoBoleto,
      descricaoFormaPagamentoBoleto = @descricaoFormaPagamentoBoleto,
      formaPagamentoCartao = @formaPagamentoCartao,
      valorJurosCartao = @valorJurosCartao,
      bancoFinanciamento = @bancoFinanciamento,
      tipoFaturamento = @tipoFaturamento,
      nfAntecipada = @nfAntecipada,
      projetoAprovado = @projetoAprovado,
      nomeParecerAprovado = @nomeParecerAprovado,
      linkInstalacaoUsina = @linkInstalacaoUsina,
      observacoes = @observacoes,
      dataContrato = @dataContrato,
      EmailSignatario = @EmailSignatario,
      TelefoneSignatario = @TelefoneSignatario,
      CPFSignatario = @CPFSignatario,
      NomeSignatario = @NomeSignatario,
      linkArquivos = @linkArquivos,
      linkFotosPadrao = @linkFotosPadrao,
      linkPropostaSolarMarket = @linkPropostaSolarMarket,
      linkDocumentoIdentidade = @linkDocumentoIdentidade,
      linkComprovanteEnderecoFaturamento = @linkComprovanteEnderecoFaturamento,
      linkComprovanteEnderecoInstalacao = @linkComprovanteEnderecoInstalacao,
      linkFotosPadraoColetivo = @linkFotosPadraoColetivo,
      verificadorContrato = @verificadorContrato,
      emailVerificadorContrato = @emailVerificadorContrato,
      telefoneverificadorContrato = @telefoneverificadorContrato,
      CPFconsultorResponsavel = @CPFconsultorResponsavel,
      quantidadeFasesDisjuntor = @quantidadeFasesDisjuntor,
      LinkImagensDiversasPadrao = @LinkImagensDiversasPadrao,
      QuantidadePadroes = @QuantidadePadroes,
      TipoConexaoPadrao = @TipoConexaoPadrao,
      CorrenteDisjuntor = @CorrenteDisjuntor,
      FavorOuContraRede = @FavorOuContraRede,
      ServicoAlvenaria = @ServicoAlvenaria,
      possuiAditivos = @possuiAditivos,
      selectedArea = @selectedArea,
      areasAtuacao = @areasAtuacao,
      DescricaoPadrao = @DescricaoPadrao,
      StatusAutorizacao = @StatusAutorizacao,
      DescricaoStatus = @DescricaoStatus,
      cpfResponsavelTitularProjeto = @cpfResponsavelTitularProjeto,
      razaoSocialTitularConc = @razaoSocialTitularConc
    WHERE IdDadosContrato = @IdDadosContrato
  `;
  const sanitizedData = sanitizeData(dados);

  const options = {
    query: query,
    params: sanitizedData,
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job de atualização iniciado: ${job.id}`);
    await job.getQueryResults();
    console.log('Dados atualizados com sucesso no BigQuery.');
  } catch (error) {
    console.error('Erro ao atualizar dados no BigQuery:', error);
    throw error;
  }
}


async function verificarContratoExistente(IdDadosContrato) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`sd-gestao.CRM.CadDadosDoc\`
    WHERE IdDadosContrato = @IdDadosContrato
  `;

  const options = {
    query: query,
    params: { IdDadosContrato },
  };

  try {
    const [rows] = await bigquery.query(options);
    const count = rows[0].count;
    return count > 0;
  } catch (error) {
    console.error('Erro ao verificar existência do contrato:', error);
    throw error;
  }
}

router.post('/api/enviarFormulario', authenticateApiKey, async (req, res) => {
  try {
    const dadosFormulario = req.body;
    console.log('Dados recebidos:', dadosFormulario);

    const { IdDadosContrato, ClienteRelacionado } = dadosFormulario;

    if (!IdDadosContrato) {
      return res.status(400).json({ erro: 'IdDadosContrato é obrigatório.' });
    }

    dadosFormulario.StatusAutorizacao = dadosFormulario.StatusAutorizacao || 'Necessita Autorização';
    dadosFormulario.DescricaoStatus = dadosFormulario.DescricaoStatus || '';

    // Verificar se o contrato já existe
    const existeContrato = await verificarContratoExistente(IdDadosContrato);

    if (existeContrato) {
      await atualizarNoBigQuery(dadosFormulario);
      // Contrato atualizado
      console.log('Contrato atualizado com sucesso.');
    } else {
      await inserirNoBigQuery(dadosFormulario);
      // Contrato inserido
      console.log('Contrato inserido com sucesso.');
    }

    // =========================
    // DUPLICAR O CLIENTE NO FUNIL "Contrato"
    // =========================

    if (!ClienteRelacionado) {
      console.log('ClienteRelacionado não fornecido, não é possível duplicar o card.');
    } else {
      // 1. Buscar dados do cliente original
      const clienteOriginalQuery = `
        SELECT * FROM \`sd-gestao.CRM.CadCliente\`
        WHERE IdCliente = @IdCliente
        LIMIT 1
      `;
      const [clienteOriginalRows] = await bigquery.query({
        query: clienteOriginalQuery,
        params: { IdCliente: ClienteRelacionado },
      });

      if (clienteOriginalRows.length === 0) {
        console.log('Cliente relacionado não encontrado, não é possível duplicar o card.');
      } else {
        const clienteOriginal = clienteOriginalRows[0];

        // 2. Buscar o menor StatusNum para StatusGeral = 'Contrato'
        const statusContratoQuery = `
          SELECT IdStatus, StatusGeral, StatusNum
          FROM \`sd-gestao.CRM.Status\`
          WHERE StatusGeral = 'Contrato'
          ORDER BY StatusNum ASC
          LIMIT 1
        `;

        const [statusContratoRows] = await bigquery.query(statusContratoQuery);

        if (statusContratoRows.length === 0) {
          console.log('Nenhum Status encontrado para StatusGeral = Contrato. Não é possível duplicar o card.');
        } else {
          const { IdStatus: novoStatusId, StatusGeral: novoStatusGeral } = statusContratoRows[0];

          // 3. Inserir o cliente duplicado no funil "Contrato"
          // Usando o mesmo IdCliente
          const Data = obterDataHoraBrasilia();

          const inserirClienteDuplicadoQuery = `
            INSERT INTO \`sd-gestao.CRM.CadCliente\`
            (IdCliente, Data, Nome, Email, Telefone, Endereco, StatusGeralRelacionado, StatusRelacionado, Temperatura, Valor, UsuarioRelacionado)
            VALUES
            (@IdCliente, @Data, @Nome, @Email, @Telefone, @Endereco, @StatusGeralRelacionado, @StatusRelacionado, @Temperatura, @Valor, @UsuarioRelacionado)
          `;

          const inserirOptions = {
            query: inserirClienteDuplicadoQuery,
            params: {
              IdCliente: ClienteRelacionado, // Usando o mesmo IdCliente
              Data: Data,
              Nome: clienteOriginal.Nome || '',
              Email: clienteOriginal.Email || '',
              Telefone: clienteOriginal.Telefone || '',
              Endereco: clienteOriginal.Endereco || '',
              StatusGeralRelacionado: novoStatusGeral,
              StatusRelacionado: novoStatusId,
              Temperatura: clienteOriginal.Temperatura || 'FRIO',
              Valor: clienteOriginal.Valor || 0,
              UsuarioRelacionado: clienteOriginal.UsuarioRelacionado || '', // Ajuste conforme necessário
            },
          };

          await bigquery.query(inserirOptions);
          console.log('Cliente duplicado com sucesso no funil Contrato.');
        }
      }
    }

    res.status(200).json({ mensagem: 'Processamento concluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar o formulário:', error.message);
    res.status(500).json({ erro: 'Erro ao processar o formulário.', detalhes: error.message });
  }
});








router.get('/api/prevendedores',authenticateApiKey, async (req, res) => {
  const query = `
    SELECT Nome
    FROM \`sd-gestao.GestaoUsuario.CadUsuario\`
    WHERE Cargo = 'PREVENDEDOR'
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

  
    const prevendedores = rows.map(row => row.Nome);
    res.status(200).json(prevendedores);
  } catch (error) {
    console.error('Erro ao consultar pré-vendedores:', error);
    res.status(500).json({ erro: 'Erro ao buscar pré-vendedores.' });
  }
});


router.get('/api/consultores', authenticateApiKey, async (req, res) => {
  const query = `
    SELECT Nome, Email, Telefone, CPF, Atuacao
    FROM \`sd-gestao.GestaoUsuario.CadUsuario\`
    WHERE Cargo IN ('VENDEDOR', 'SUPERVISOR')
    ORDER BY Nome ASC
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

    const consultores = rows.map(row => ({ nome: row.Nome, email: row.Email, telefone: row.Telefone, CPF: row.CPF, atuacao: row.Atuacao }));
    res.status(200).json(consultores);
  } catch (error) {
    console.error('Erro ao consultar consultores:', error);
    res.status(500).json({ erro: 'Erro ao buscar consultores.' });
  }
});

router.get('/api/areas-atuacao', authenticateApiKey, async (req, res) => {
  const query = `
    SELECT DISTINCT Atuacao
    FROM \`sd-gestao.GestaoUsuario.CadUsuario\`
    WHERE Atuacao IS NOT NULL
    ORDER BY Atuacao ASC
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

    const areasAtuacao = rows.map(row => row.Atuacao);
    res.status(200).json(areasAtuacao);
  } catch (error) {
    console.error('Erro ao consultar áreas de atuação:', error);
    res.status(500).json({ erro: 'Erro ao buscar áreas de atuação.' });
  }
});

router.get('/api/inversores',authenticateApiKey, async (req, res) => {
  const query = `
    SELECT Modelo
    FROM \`sd-gestao.WebSystem.CadMateriais\`
    WHERE TipoMaterial = 'Inversor'
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

    const inversores = rows.map(row => row.Modelo);
    res.status(200).json(inversores);
  } catch (error) {
    console.error('Erro ao consultar inversores:', error);
    res.status(500).json({ erro: 'Erro ao buscar inversores.' });
  }
});


router.get('/api/marcas-inversores',authenticateApiKey, async (req, res) => {
  const query = `
    SELECT DISTINCT Marca
    FROM \`sd-gestao.WebSystem.CadMateriais\`
    WHERE TipoMaterial = 'Inversor'
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

    
    const marcas = rows.map(row => row.Marca);
    res.status(200).json(marcas);
  } catch (error) {
    console.error('Erro ao consultar marcas de inversores:', error);
    res.status(500).json({ erro: 'Erro ao buscar marcas de inversores.' });
  }
});

router.get('/api/modelos-modulos',authenticateApiKey, async (req, res) => {
  const query = `
    SELECT Modelo
    FROM \`sd-gestao.WebSystem.CadMateriais\`
    WHERE TipoMaterial = 'Módulo'
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });

  
    const modelos = rows.map(row => row.Modelo);
    res.status(200).json(modelos);
  } catch (error) {
    console.error('Erro ao consultar modelos de módulos:', error);
    res.status(500).json({ erro: 'Erro ao buscar modelos de módulos.' });
  }
});

router.get('/api/buscarLinksArquivos',authenticateApiKey, async (req, res) => {
  const query = `
    SELECT link
    FROM \`sd-gestao.WebSystem.LinksArquivos\`
  `;

  try {
    const [rows] = await bigquery.query({
      query: query,
    });


    const links = rows.map(row => row.link);
    res.status(200).json({ links });
  } catch (error) {
    console.error('Erro ao buscar links dos arquivos:', error);
    res.status(500).json({ erro: 'Erro ao buscar links dos arquivos.' });
  }
});


const drive = google.drive({ version: 'v3', auth });

// Função para fazer upload para o Google Drive
async function uploadToDrive(file) {
  try {
    const fileMetadata = {
      name: file.originalname,
      parents: ['12fdHjcVfE2pvih_1MIg6TaPSANCyIE5u'],
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    };

    console.log('Iniciando o upload para o Google Drive...');
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('Upload concluído. ID do arquivo:', response.data.id);
    return `https://drive.google.com/uc?id=${response.data.id}`;
  } catch (error) {
    console.error('Erro ao fazer upload para o Google Drive:', error.response ? error.response.data : error.message);
    throw new Error('Erro ao fazer upload para o Google Drive: ' + error.message);
  }
}


router.post('/api/upload',authenticateApiKey, upload.single('file'), async (req, res) => {
  try {
    console.log('Arquivo recebido:', req.file); 

    if (!req.file) {
      console.error('Nenhum arquivo foi enviado.');
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    // Faz o upload do arquivo para o Google Drive
    const fileLink = await uploadToDrive(req.file);

    res.status(200).json({ mensagem: 'Arquivo enviado com sucesso!', link: fileLink });
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error.message);
    if (error.message.includes('Erro ao fazer upload para o Google Drive')) {
      res.status(500).json({ erro: 'Erro ao fazer upload para o Google Drive.', detalhes: error.message });
    } else {
      res.status(500).json({ erro: 'Erro ao fazer upload do arquivo.', detalhes: error.message });
    }
  }
});

async function atualizarStatusContrato(IdDadosContrato, StatusAutorizacao, DescricaoStatus) {
  const query = `
    UPDATE \`sd-gestao.CRM.CadDadosDoc\` 
    SET 
      StatusAutorizacao = @StatusAutorizacao,
      DescricaoStatus = @DescricaoStatus
    WHERE IdDadosContrato = @IdDadosContrato
  `;

  const options = {
    query: query,
    params: {
      IdDadosContrato,
      StatusAutorizacao,
      DescricaoStatus,
    },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job de atualização iniciado: ${job.id}`);
    await job.getQueryResults();
    console.log('Status atualizado com sucesso no BigQuery.');
  } catch (error) {
    console.error('Erro ao atualizar status no BigQuery:', error);
    throw error;
  }
}

// Endpoint para atualizar o status do contrato
router.post('/api/contrato/:IdDadosContrato/status', authenticateToken, checkRole('SUPERVISOR'), async (req, res) => {
  const { IdDadosContrato } = req.params;
  const { StatusAutorizacao, DescricaoStatus } = req.body; // Removido nomeCompletoResponsavel

  console.log(`Recebendo requisição para atualizar contrato ${IdDadosContrato} para status ${StatusAutorizacao} com descrição: ${DescricaoStatus}`);

  if (!IdDadosContrato || !StatusAutorizacao) { // Removido !nomeCompletoResponsavel
    console.log('Dados incompletos para atualização.');
    return res.status(400).json({ success: false, message: 'IdDadosContrato e StatusAutorizacao são obrigatórios.' });
  }

  try {
    // Atualizar o status no BigQuery
    await atualizarStatusContrato(IdDadosContrato, StatusAutorizacao, DescricaoStatus); // Removido nomeCompletoResponsavel

    console.log(`Contrato ${IdDadosContrato} atualizado para status ${StatusAutorizacao} com descrição: ${DescricaoStatus}`);

    res.status(200).json({ success: true, message: 'Status atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar o status:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar o status.' });
  }
});


export default router;
