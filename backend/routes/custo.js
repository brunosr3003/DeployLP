// backend/routes/custo.js

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configuração do BigQuery
const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

// Endpoint para obter todos os Custos
router.get('/', async (req, res) => {
  try {
    const query = `SELECT * FROM \`sd-gestao.Calculadora.CadCusto\``;
    const [rows] = await bigquery.query({ query });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar Custos:', error);
    res.status(500).json({ error: 'Falha ao buscar Custos.' });
  }
});

// Endpoint para obter um Custo específico por IdCusto
router.get('/:IdCusto', async (req, res) => {
  const { IdCusto } = req.params;

  try {
    const query = `SELECT * FROM \`sd-gestao.Calculadora.CadCusto\` WHERE IdCusto = @IdCusto LIMIT 1`;
    const options = {
      query,
      params: { IdCusto },
    };
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Custo não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar Custo:', error);
    res.status(500).json({ error: 'Falha ao buscar Custo.' });
  }
});

// Endpoint para criar um novo Custo
router.post('/', async (req, res) => {
  const { Nome, ValorFixo, Porcentagem, Descricao, OndeAfeta } = req.body;

  try {
    // Validações necessárias
    if (!Nome || ValorFixo === undefined || Porcentagem === undefined || !Descricao || !OndeAfeta) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Inserir o Custo
    const insertQuery = `
      INSERT INTO \`sd-gestao.Calculadora.CadCusto\` (IdCusto, Nome, ValorFixo, Porcentagem, Descricao, OndeAfeta)
      VALUES (@IdCusto, @Nome, @ValorFixo, @Porcentagem, @Descricao, @OndeAfeta)
    `;
    const options = {
      query: insertQuery,
      params: { 
        IdCusto: uuidv4(), // Gerar um UUID para IdCusto
        Nome, 
        ValorFixo, 
        Porcentagem, 
        Descricao,
        OndeAfeta, // Novo campo
      },
    };

    await bigquery.query(options);
    res.status(201).json({ 
      IdCusto: options.params.IdCusto, 
      Nome, 
      ValorFixo, 
      Porcentagem, 
      Descricao,
      OndeAfeta, // Novo campo
    });
  } catch (error) {
    console.error('Erro ao criar Custo:', error);
    res.status(500).json({ error: 'Falha ao criar Custo.' });
  }
});

// Endpoint para atualizar um Custo
router.put('/:IdCusto', async (req, res) => {
  const { IdCusto } = req.params;
  const { Nome, ValorFixo, Porcentagem, Descricao, OndeAfeta } = req.body;

  try {
    // Verificar se o Custo existe
    const checkQuery = `SELECT * FROM \`sd-gestao.Calculadora.CadCusto\` WHERE IdCusto = @IdCusto LIMIT 1`;
    const [checkRows] = await bigquery.query({
      query: checkQuery,
      params: { IdCusto },
    });
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Custo não encontrado.' });
    }

    // Atualizar o Custo
    const updateQuery = `
      UPDATE \`sd-gestao.Calculadora.CadCusto\`
      SET 
        Nome = @Nome,
        ValorFixo = @ValorFixo,
        Porcentagem = @Porcentagem,
        Descricao = @Descricao,
        OndeAfeta = @OndeAfeta
      WHERE IdCusto = @IdCusto
    `;
    const options = {
      query: updateQuery,
      params: { 
        Nome, 
        ValorFixo, 
        Porcentagem, 
        Descricao,
        OndeAfeta, // Novo campo
        IdCusto 
      },
    };

    await bigquery.query(options);
    res.status(200).json({ message: 'Custo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar Custo:', error);
    res.status(500).json({ error: 'Falha ao atualizar Custo.' });
  }
});

// Endpoint para deletar um Custo
router.delete('/:IdCusto', async (req, res) => {
  const { IdCusto } = req.params;

  try {
    // Verificar se o Custo existe
    const checkQuery = `SELECT * FROM \`sd-gestao.Calculadora.CadCusto\` WHERE IdCusto = @IdCusto LIMIT 1`;
    const [checkRows] = await bigquery.query({
      query: checkQuery,
      params: { IdCusto },
    });
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Custo não encontrado.' });
    }

    const deleteQuery = `DELETE FROM \`sd-gestao.Calculadora.CadCusto\` WHERE IdCusto = @IdCusto`;
    const options = {
      query: deleteQuery,
      params: { IdCusto },
    };

    await bigquery.query(options);
    res.status(200).json({ message: 'Custo deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar Custo:', error);
    res.status(500).json({ error: 'Falha ao deletar Custo.' });
  }
});

export default router;
