// backend/routes/padraoAtividade.js

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware para verificar se o usuário é Administrador
const isAdmin = (req, res, next) => {
  console.log(`Verificando se usuário ID=${req.user.id} é Administrador.`);
  if (req.user && req.user.cargo === 'ADMINISTRADOR') {
    console.log('Usuário é Administrador.');
    next();
  } else {
    console.log('Acesso negado: Usuário não é Administrador.');
    return res.status(403).json({ success: false, message: 'Acesso negado. Administradores apenas.' });
  }
};

// Inicializar BigQuery (reutilizado do arquivo principal)
const bigquery = new BigQuery({
  projectId: 'sd-gestao', // Certifique-se de que este é o seu ID de projeto
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

/**
 * @route   GET /api/padraoAtividade
 * @desc    Obter todas as atividades padrão
 * @access  Autenticado
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT IdPadraoAtividade, AtividadeNum, Nome, Descricao
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      ORDER BY AtividadeNum ASC
    `;
    const options = {
      query: query,
      location: 'us-central1', // Ajuste conforme a localização do seu dataset
    };

    const [rows] = await bigquery.query(options);
    res.json({ success: true, atividades: rows });
  } catch (error) {
    console.error('Erro ao buscar atividades padrão no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

/**
 * @route   GET /api/padraoAtividade/:id
 * @desc    Obter uma atividade padrão específica por ID
 * @access  Autenticado
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT IdPadraoAtividade, AtividadeNum, Nome, Descricao
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE IdPadraoAtividade = @IdPadraoAtividade
      LIMIT 1
    `;
    const options = {
      query: query,
      params: { IdPadraoAtividade: id },
      location: 'us-central1',
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Atividade padrão não encontrada.' });
    }

    res.json({ success: true, atividade: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar atividade padrão no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

/**
 * @route   POST /api/padraoAtividade
 * @desc    Criar uma nova atividade padrão
 * @access  Autenticado (apenas Administradores)
 */
router.post('/', isAdmin, async (req, res) => {
  let { AtividadeNum, Nome, Descricao } = req.body;

  // Adicionar logs para depuração
  console.log('Recebido POST /api/padraoAtividade com dados:', req.body);
  console.log(`Tipo de AtividadeNum: ${typeof AtividadeNum}, Valor: ${AtividadeNum}`);

  // Coercionar para número
  AtividadeNum = Number(AtividadeNum);
  console.log(`Após coercão, Tipo de AtividadeNum: ${typeof AtividadeNum}, Valor: ${AtividadeNum}`);

  // Validação dos campos obrigatórios
  if (AtividadeNum === undefined || !Nome || !Descricao) {
    console.log('Campos obrigatórios faltando:', { AtividadeNum, Nome, Descricao });
    return res.status(400).json({ success: false, message: 'AtividadeNum, Nome e Descrição são obrigatórios.' });
  }

  // Validação de AtividadeNum (deve ser um número inteiro positivo)
  if (!Number.isInteger(AtividadeNum) || AtividadeNum < 1) {
    console.log(`AtividadeNum inválido: Tipo=${typeof AtividadeNum}, Valor=${AtividadeNum}`);
    return res.status(400).json({ success: false, message: 'AtividadeNum deve ser um número inteiro positivo.' });
  }

  try {
    // Verificar se AtividadeNum já existe
    const checkQuery = `
      SELECT IdPadraoAtividade
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE AtividadeNum = @AtividadeNum
      LIMIT 1
    `;
    const checkOptions = {
      query: checkQuery,
      params: { AtividadeNum },
      location: 'us-central1',
    };

    const [checkRows] = await bigquery.query(checkOptions);

    if (checkRows.length > 0) {
      return res.status(400).json({ success: false, message: 'Já existe uma atividade padrão com este AtividadeNum.' });
    }

    const IdPadraoAtividade = uuidv4();

    const insertQuery = `
      INSERT INTO \`sd-gestao.CRM.PadraoAtividade\`
      (IdPadraoAtividade, AtividadeNum, Nome, Descricao)
      VALUES
      (@IdPadraoAtividade, @AtividadeNum, @Nome, @Descricao)
    `;
    const insertOptions = {
      query: insertQuery,
      params: {
        IdPadraoAtividade,
        AtividadeNum,
        Nome,
        Descricao,
      },
      location: 'us-central1',
    };

    await bigquery.query(insertOptions);

    res.status(201).json({
      success: true,
      message: 'Atividade padrão criada com sucesso.',
      atividade: {
        IdPadraoAtividade,
        AtividadeNum,
        Nome,
        Descricao,
      },
    });
  } catch (error) {
    console.error('Erro ao criar atividade padrão no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

/**
 * @route   PUT /api/padraoAtividade/:id
 * @desc    Atualizar uma atividade padrão existente
 * @access  Autenticado (apenas Administradores)
 */
router.put('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  let { AtividadeNum, Nome, Descricao } = req.body;

  // Adicionar logs para depuração
  console.log(`Recebido PUT /api/padraoAtividade/${id} com dados:`, req.body);
  console.log(`Tipo de AtividadeNum: ${typeof AtividadeNum}, Valor: ${AtividadeNum}`);

  // Coercionar para número
  AtividadeNum = Number(AtividadeNum);
  console.log(`Após coercão, Tipo de AtividadeNum: ${typeof AtividadeNum}, Valor: ${AtividadeNum}`);

  // Validação dos campos obrigatórios
  if (AtividadeNum === undefined || !Nome || !Descricao) {
    console.log('Campos obrigatórios faltando:', { AtividadeNum, Nome, Descricao });
    return res.status(400).json({ success: false, message: 'AtividadeNum, Nome e Descrição são obrigatórios.' });
  }

  // Validação de AtividadeNum (deve ser um número inteiro positivo)
  if (!Number.isInteger(AtividadeNum) || AtividadeNum < 1) {
    console.log(`AtividadeNum inválido: Tipo=${typeof AtividadeNum}, Valor=${AtividadeNum}`);
    return res.status(400).json({ success: false, message: 'AtividadeNum deve ser um número inteiro positivo.' });
  }

  try {
    // Verificar se a atividade padrão existe
    const checkQuery = `
      SELECT IdPadraoAtividade
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE IdPadraoAtividade = @IdPadraoAtividade
      LIMIT 1
    `;
    const checkOptions = {
      query: checkQuery,
      params: { IdPadraoAtividade: id },
      location: 'us-central1',
    };

    const [checkRows] = await bigquery.query(checkOptions);

    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Atividade padrão não encontrada.' });
    }

    // Verificar se o novo AtividadeNum já está em uso por outra atividade
    const duplicateCheckQuery = `
      SELECT IdPadraoAtividade
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE AtividadeNum = @AtividadeNum AND IdPadraoAtividade != @IdPadraoAtividade
      LIMIT 1
    `;
    const duplicateCheckOptions = {
      query: duplicateCheckQuery,
      params: { AtividadeNum, IdPadraoAtividade: id },
      location: 'us-central1',
    };

    const [duplicateCheckRows] = await bigquery.query(duplicateCheckOptions);

    if (duplicateCheckRows.length > 0) {
      return res.status(400).json({ success: false, message: 'Já existe outra atividade padrão com este AtividadeNum.' });
    }

    // Atualizar a atividade padrão
    const updateQuery = `
      UPDATE \`sd-gestao.CRM.PadraoAtividade\`
      SET AtividadeNum = @AtividadeNum, Nome = @Nome, Descricao = @Descricao
      WHERE IdPadraoAtividade = @IdPadraoAtividade
    `;
    const updateOptions = {
      query: updateQuery,
      params: {
        AtividadeNum,
        Nome,
        Descricao,
        IdPadraoAtividade: id,
      },
      location: 'us-central1',
    };

    await bigquery.query(updateOptions);

    res.json({
      success: true,
      message: 'Atividade padrão atualizada com sucesso.',
      atividade: {
        IdPadraoAtividade: id,
        AtividadeNum,
        Nome,
        Descricao,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar atividade padrão no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

/**
 * @route   DELETE /api/padraoAtividade/:id
 * @desc    Deletar uma atividade padrão
 * @access  Autenticado (apenas Administradores)
 */
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se a atividade padrão existe
    const checkQuery = `
      SELECT IdPadraoAtividade
      FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE IdPadraoAtividade = @IdPadraoAtividade
      LIMIT 1
    `;
    const checkOptions = {
      query: checkQuery,
      params: { IdPadraoAtividade: id },
      location: 'us-central1',
    };

    const [checkRows] = await bigquery.query(checkOptions);

    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Atividade padrão não encontrada.' });
    }

    // Deletar a atividade padrão
    const deleteQuery = `
      DELETE FROM \`sd-gestao.CRM.PadraoAtividade\`
      WHERE IdPadraoAtividade = @IdPadraoAtividade
    `;
    const deleteOptions = {
      query: deleteQuery,
      params: { IdPadraoAtividade: id },
      location: 'us-central1',
    };

    await bigquery.query(deleteOptions);

    res.json({
      success: true,
      message: 'Atividade padrão deletada com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao deletar atividade padrão no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

export default router;
