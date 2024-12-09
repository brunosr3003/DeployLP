// backend/routes/empresa.js

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configuração do BigQuery
const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

// Função auxiliar para garantir que o campo existe e é do tipo esperado
const ensureArray = (field) => {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.error(`Erro ao parsear campo JSON: ${error}`);
      return [];
    }
  }
  return [];
};

// Endpoint para obter todas as empresas
router.get('/api/empresa', async (req, res) => {
  try {
    const query = `SELECT * FROM \`sd-gestao.CRM.Empresa\``;
    const [rows] = await bigquery.query({ query });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Falha ao buscar empresas.' });
  }
});

// Endpoint para obter uma empresa específica
router.get('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;

  try {
    const query = `SELECT * FROM \`sd-gestao.CRM.Empresa\` WHERE IdEmpresa = @IdEmpresa LIMIT 1`;
    const options = {
      query,
      params: { IdEmpresa },
    };
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const empresa = rows[0];
    console.log('Dados da empresa recebidos do BigQuery:', empresa);

    // Garantir que os campos são arrays de objetos ou strings
    empresa.Unidades = ensureArray(empresa.Unidades);
    empresa.PontosLogisticos = ensureArray(empresa.PontosLogisticos);
    empresa.PontosVenda = ensureArray(empresa.PontosVenda);

    res.status(200).json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Falha ao buscar empresa.' });
  }
});

// Endpoint para criar uma nova empresa
router.post('/api/empresa', async (req, res) => {
  const { RazaoSocial, CNPJ, Responsavel, Unidades, PontosLogisticos, PontosVenda } = req.body;

  try {
    // Verificar se já existe uma empresa
    const checkQuery = `SELECT * FROM \`sd-gestao.CRM.Empresa\``;
    const [empresas] = await bigquery.query(checkQuery);

    if (empresas.length >= 1) {
      return res.status(400).json({ error: 'Já existe uma empresa cadastrada.' });
    }

    // Validações necessárias
    if (!RazaoSocial || !CNPJ || !Responsavel || !Unidades || Unidades.length === 0) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios e deve haver pelo menos uma unidade.' });
    }

    // Inserir a empresa
    const insertQuery = `
      INSERT INTO \`sd-gestao.CRM.Empresa\` (IdEmpresa, RazaoSocial, CNPJ, Responsavel, Unidades, PontosLogisticos, PontosVenda)
      VALUES (@IdEmpresa, @RazaoSocial, @CNPJ, @Responsavel, @Unidades, @PontosLogisticos, @PontosVenda)
    `;
    const options = {
      query: insertQuery,
      params: { 
        IdEmpresa: uuidv4(), // Gerar um UUID para IdEmpresa
        RazaoSocial, 
        CNPJ, 
        Responsavel, 
        Unidades, // ARRAY<STRING>, diretamente
        PontosLogisticos: PontosLogisticos || [], // ARRAY<STRUCT>, sem stringify
        PontosVenda: PontosVenda || [], // ARRAY<STRUCT>, sem stringify
      },
    };

    await bigquery.query(options);
    res.status(201).json({ message: 'Empresa cadastrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    res.status(500).json({ error: 'Falha ao cadastrar empresa.' });
  }
});

// Endpoint para atualizar uma empresa
router.put('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;
  const { RazaoSocial, CNPJ, Responsavel, Unidades, PontosLogisticos, PontosVenda } = req.body;

  console.log(`Recebendo atualização para a empresa: ${IdEmpresa}`);
  console.log('Dados recebidos:', req.body);

  try {
    const query = `
      UPDATE \`sd-gestao.CRM.Empresa\`
      SET 
        RazaoSocial = @RazaoSocial,
        CNPJ = @CNPJ,
        Responsavel = @Responsavel,
        Unidades = @Unidades,
        PontosLogisticos = @PontosLogisticos,
        PontosVenda = @PontosVenda
      WHERE IdEmpresa = @IdEmpresa
    `;

    const options = {
      query: query,
      params: {
        RazaoSocial,
        CNPJ,
        Responsavel,
        Unidades, // ARRAY<STRING>, diretamente
        PontosLogisticos: PontosLogisticos || [], // ARRAY<STRUCT>, sem stringify
        PontosVenda: PontosVenda || [], // ARRAY<STRUCT>, sem stringify
        IdEmpresa,
      },
    };

    const [job] = await bigquery.createQueryJob(options);
    await job.promise();

    res.status(200).json({ message: 'Empresa atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Falha ao atualizar empresa.' });
  }
});

// Endpoint para deletar uma empresa
router.delete('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;

  try {
    const query = `DELETE FROM \`sd-gestao.CRM.Empresa\` WHERE IdEmpresa = @IdEmpresa`;
    const options = {
      query,
      params: { IdEmpresa },
    };

    const [job] = await bigquery.createQueryJob(options);
    await job.promise();

    res.status(200).json({ message: 'Empresa deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Falha ao deletar empresa.' });
  }
});

// Endpoint para obter uma empresa específica
router.get('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;

  try {
    const query = `SELECT * FROM \`sd-gestao.CRM.Empresa\` WHERE IdEmpresa = @IdEmpresa LIMIT 1`;
    const options = {
      query,
      params: { IdEmpresa },
    };
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const empresa = rows[0];
    console.log('Dados da empresa recebidos do BigQuery:', empresa);

    // Garantir que os campos são arrays de objetos ou strings
    empresa.Unidades = empresa.Unidades || [];
    empresa.PontosLogisticos = empresa.PontosLogisticos || [];
    empresa.PontosVenda = empresa.PontosVenda || [];

    res.status(200).json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Falha ao buscar empresa.' });
  }
});

router.delete('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;

  try {
    const query = `DELETE FROM \`sd-gestao.CRM.Empresa\` WHERE IdEmpresa = @IdEmpresa`;
    const options = {
      query,
      params: { IdEmpresa },
    };

    const [job] = await bigquery.createQueryJob(options);
    await job.promise();

    res.status(200).json({ message: 'Empresa deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Falha ao deletar empresa.' });
  }
});

// Endpoint para atualizar uma empresa
router.put('/api/empresa/:IdEmpresa', async (req, res) => {
  const { IdEmpresa } = req.params;
  const { RazaoSocial, CNPJ, Responsavel, Unidades, PontosLogisticos, PontosVenda } = req.body;

  console.log(`Recebendo atualização para a empresa: ${IdEmpresa}`);
  console.log('Dados recebidos:', req.body);

  try {
    const query = `
      UPDATE \`sd-gestao.CRM.Empresa\`
      SET 
        RazaoSocial = @RazaoSocial,
        CNPJ = @CNPJ,
        Responsavel = @Responsavel,
        Unidades = @Unidades,
        PontosLogisticos = @PontosLogisticos,
        PontosVenda = @PontosVenda
      WHERE IdEmpresa = @IdEmpresa
    `;

    const options = {
      query: query,
      params: {
        RazaoSocial,
        CNPJ,
        Responsavel,
        Unidades, // ARRAY<STRING>, diretamente
        PontosLogisticos: PontosLogisticos || [], // ARRAY<STRUCT>, sem stringify
        PontosVenda: PontosVenda || [], // ARRAY<STRUCT>, sem stringify
        IdEmpresa,
      },
    };

    const [job] = await bigquery.createQueryJob(options);
    await job.promise();

    res.status(200).json({ message: 'Empresa atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Falha ao atualizar empresa.' });
  }
});

router.get('/api/empresa/:IdEmpresa/pontovenda', async (req, res) => {
  const { IdEmpresa } = req.params;

  if (!IdEmpresa) {
    return res.status(400).json({ error: 'Parâmetro "IdEmpresa" é obrigatório.' });
  }

  try {
    const query = `
      SELECT
        PontosVenda
      FROM
        \`sd-gestao.CRM.Empresa\`
      WHERE
        IdEmpresa = @IdEmpresa
      LIMIT 1
    `;
    const options = {
      query,
      params: { IdEmpresa },
    };
    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    const pontoVendas = rows[0].PontosVenda || [];
    res.status(200).json(pontoVendas);
  } catch (error) {
    console.error('Erro ao buscar PontoVenda:', error);
    res.status(500).json({ error: 'Falha ao buscar PontoVenda.' });
  }
});
export default router;
