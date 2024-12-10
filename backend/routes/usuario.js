// backend/routes/usuario.js

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Importa uuid para gerar IDs

const router = express.Router();

// Configuração do BigQuery
const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

// Rota GET para listar usuários de uma empresa específica
router.get('/api/usuario', async (req, res) => {
  const { empresa } = req.query;

  console.log(`Recebido parâmetro empresa: ${empresa}`); // Log para depuração

  if (!empresa) {
    return res.status(400).json({ error: 'Parâmetro "empresa" é obrigatório.' });
  }

  try {
    const query = `SELECT * FROM \`sd-gestao.Deploy.CadUsuario\` WHERE EmpresaRelacionada = @EmpresaRelacionada`;
    const options = {
      query,
      params: { EmpresaRelacionada: empresa },
    };
    const [rows] = await bigquery.query(options);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Falha ao buscar usuários.' });
  }
});

router.post('/api/usuario', async (req, res) => {
  const { Nome, Email, Telefone, Senha, Cargo, Unidade, EmpresaRelacionada, CPF } = req.body;

  try {
    // Validações necessárias
    if (!Nome || !Email || !Telefone || !Senha || !Cargo || !Unidade || !EmpresaRelacionada || !CPF) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Criptografar a senha antes de armazenar
    const hashedSenha = await bcrypt.hash(Senha, 10);

    const insertQuery = `
      INSERT INTO \`sd-gestao.Deploy.CadUsuario\` (IdUsuario, Nome, Email, Telefone, Senha, Cargo, Unidade, EmpresaRelacionada, CPF)
      VALUES (@IdUsuario, @Nome, @Email, @Telefone, @Senha, @Cargo, @Unidade, @EmpresaRelacionada, @CPF)
    `;
    const options = {
      query: insertQuery,
      params: {
        IdUsuario: uuidv4(), // Gerar um UUID para IdUsuario
        Nome,
        Email,
        Telefone,
        Senha: hashedSenha,
        Cargo,
        Unidade,
        EmpresaRelacionada,
        CPF // Incluindo CPF
      },
    };

    await bigquery.query(options);
    res.status(201).json({ message: 'Usuário criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Falha ao criar usuário.' });
  }
});

// Rota GET para obter um usuário específico
router.get('/api/usuario/:IdUsuario', async (req, res) => {
  const { IdUsuario } = req.params;

  try {
    const query = `SELECT * FROM \`sd-gestao.Deploy.CadUsuario\` WHERE IdUsuario = @IdUsuario LIMIT 1`;
    const options = {
      query,
      params: { IdUsuario },
    };

    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Falha ao buscar usuário.' });
  }
});

// Rota PUT para atualizar um usuário
router.put('/api/usuario/:IdUsuario', async (req, res) => {
  const { IdUsuario } = req.params;
  const { Nome, Email, Telefone, Senha, Cargo, Unidade, CPF } = req.body;

  console.log(`Recebendo atualização para o usuário: ${IdUsuario}`);
  console.log('Dados recebidos:', req.body);

  try {
    // Verifica se o usuário existe
    const usuarioQuery = `SELECT * FROM \`sd-gestao.Deploy.CadUsuario\` WHERE IdUsuario = @IdUsuario LIMIT 1`;
    const [usuarioRows] = await bigquery.query({
      query: usuarioQuery,
      params: { IdUsuario },
    });
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Preparar os campos a serem atualizados
    let updateFields = '';
    const params = { IdUsuario };

    if (Nome) {
      updateFields += 'Nome = @Nome, ';
      params.Nome = Nome;
    }
    if (Email) {
      updateFields += 'Email = @Email, ';
      params.Email = Email;
    }
    if (Telefone) {
      updateFields += 'Telefone = @Telefone, ';
      params.Telefone = Telefone;
    }
    if (Cargo) {
      updateFields += 'Cargo = @Cargo, ';
      params.Cargo = Cargo;
    }
    if (Unidade) {
      updateFields += 'Unidade = @Unidade, ';
      params.Unidade = Unidade;
    }
    if (Senha) {
      const hashedSenha = await bcrypt.hash(Senha, 10);
      updateFields += 'Senha = @Senha, ';
      params.Senha = hashedSenha;
    }
    if (CPF) {
      const cpfNormalizado = CPF.replace(/\D/g, ''); // Remove pontos e traços
      updateFields += 'CPF = @CPF, ';
      params.CPF = cpfNormalizado;
    }

    // Remover a última vírgula e espaço
    updateFields = updateFields.slice(0, -2);

    const updateQuery = `
      UPDATE \`sd-gestao.Deploy.CadUsuario\`
      SET ${updateFields}
      WHERE IdUsuario = @IdUsuario
    `;
    const options = {
      query: updateQuery,
      params: params,
    };

    await bigquery.query(options);

    // Buscar os dados atualizados do usuário
    const [updatedRows] = await bigquery.query({
      query: `SELECT * FROM \`sd-gestao.Deploy.CadUsuario\` WHERE IdUsuario = @IdUsuario LIMIT 1`,
      params: { IdUsuario },
    });

    res.status(200).json(updatedRows[0]); // Retorna os dados atualizados
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Falha ao atualizar usuário.' });
  }
});


// Rota DELETE para deletar um usuário
router.delete('/api/usuario/:IdUsuario', async (req, res) => {
  const { IdUsuario } = req.params;

  try {
    // Verifica se o usuário existe
    const usuarioQuery = `SELECT * FROM \`sd-gestao.Deploy.CadUsuario\` WHERE IdUsuario = @IdUsuario LIMIT 1`;
    const [usuarioRows] = await bigquery.query({
      query: usuarioQuery,
      params: { IdUsuario },
    });
    if (usuarioRows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const deleteQuery = `DELETE FROM \`sd-gestao.Deploy.CadUsuario\` WHERE IdUsuario = @IdUsuario`;
    const options = {
      query: deleteQuery,
      params: { IdUsuario },
    };

    await bigquery.query(options);
    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Falha ao deletar usuário.' });
  }
});

export default router;
