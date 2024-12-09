// backend/routes/status.js

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';


const router = express.Router();

const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});


router.get('/api/status', async (req, res) => {
  try {
    const query = `SELECT * FROM \`sd-gestao.CRM.Status\``;
    const [rows] = await bigquery.query({ query });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ error: 'Falha ao buscar status.' });
  }
});

// Endpoint para obter um Status específico
router.get('/api/status/:IdStatus', async (req, res) => {
  const { IdStatus } = req.params;

  try {
    const query = `SELECT * FROM \`sd-gestao.CRM.Status\` WHERE IdStatus = @IdStatus LIMIT 1`;
    const options = {
      query,
      params: { IdStatus },
    };
    const [rows] = await bigquery.query(options);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Status não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar Status:', error);
    res.status(500).json({ error: 'Falha ao buscar Status.' });
  }
});

// Endpoint para criar um novo Status
router.post('/api/status', async (req, res) => {
  const { Status, StatusGeral, StatusNum } = req.body;

  try {
    // Validações necessárias
    if (!Status || !StatusGeral || StatusNum === undefined) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Inserir o Status
    const insertQuery = `
      INSERT INTO \`sd-gestao.CRM.Status\` (IdStatus, Status, StatusGeral, StatusNum)
      VALUES (@IdStatus, @Status, @StatusGeral, @StatusNum)
    `;
    const options = {
      query: insertQuery,
      params: { 
        IdStatus: uuidv4(), // Gerar um UUID para IdStatus
        Status, 
        StatusGeral, 
        StatusNum 
      },
    };

    await bigquery.query(options);
    res.status(201).json({ message: 'Status criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao criar Status:', error);
    res.status(500).json({ error: 'Falha ao criar Status.' });
  }
});

// Endpoint para atualizar um Status
router.put('/api/status/:IdStatus', async (req, res) => {
  const { IdStatus } = req.params;
  const { Status, StatusGeral, StatusNum } = req.body;

  try {
    // Verificar se o Status existe
    const checkQuery = `SELECT * FROM \`sd-gestao.CRM.Status\` WHERE IdStatus = @IdStatus LIMIT 1`;
    const [checkRows] = await bigquery.query({
      query: checkQuery,
      params: { IdStatus },
    });
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Status não encontrado.' });
    }

    // Preparar os campos a serem atualizados
    let updateFields = '';
    const params = { IdStatus };

    if (Status) {
      updateFields += 'Status = @Status, ';
      params.Status = Status;
    }
    if (StatusGeral) {
      updateFields += 'StatusGeral = @StatusGeral, ';
      params.StatusGeral = StatusGeral;
    }
    if (StatusNum !== undefined) {
      updateFields += 'StatusNum = @StatusNum, ';
      params.StatusNum = StatusNum;
    }

    // Remover a última vírgula e espaço
    updateFields = updateFields.slice(0, -2);

    const updateQuery = `
      UPDATE \`sd-gestao.CRM.Status\`
      SET ${updateFields}
      WHERE IdStatus = @IdStatus
    `;
    const options = {
      query: updateQuery,
      params: params,
    };

    await bigquery.query(options);
    res.status(200).json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar Status:', error);
    res.status(500).json({ error: 'Falha ao atualizar Status.' });
  }
});

// Endpoint para deletar um Status
router.delete('/api/status/:IdStatus', async (req, res) => {
  const { IdStatus } = req.params;

  try {
    // Verificar se o Status existe
    const checkQuery = `SELECT * FROM \`sd-gestao.CRM.Status\` WHERE IdStatus = @IdStatus LIMIT 1`;
    const [checkRows] = await bigquery.query({
      query: checkQuery,
      params: { IdStatus },
    });
    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Status não encontrado.' });
    }

    const deleteQuery = `DELETE FROM \`sd-gestao.CRM.Status\` WHERE IdStatus = @IdStatus`;
    const options = {
      query: deleteQuery,
      params: { IdStatus },
    };

    await bigquery.query(options);
    res.status(200).json({ message: 'Status deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar Status:', error);
    res.status(500).json({ error: 'Falha ao deletar Status.' });
  }
});

// Função para obter DataHora no fuso horário de Brasília
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

// **Observação Importante:**
// No seu código original, você tem duas definições para a rota `/api/kanban/:statusGeral`.
// Isso pode causar conflitos. Decidi manter apenas a versão aprimorada que inclui `DadosCliente`.
// Se precisar da versão anterior, você pode ajustá-la conforme necessário.

// Endpoint para obter lista de StatusGeral (Funis)
router.get('/api/status/statusgerais', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT StatusGeral
      FROM \`sd-gestao.CRM.Status\`
      ORDER BY StatusGeral
    `;

    const options = {
      query: query,
      // Nenhum parâmetro necessário
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} iniciado para buscar StatusGerais.`);

    const [rows] = await job.getQueryResults();

    // Extrair apenas os valores de StatusGeral
    const statusGeralList = rows.map(row => row.StatusGeral);

    res.json({ success: true, statusGeral: statusGeralList });
  } catch (error) {
    console.error('Erro ao buscar StatusGerais no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint para obter dados do Kanban baseado em StatusGeral
router.get('/api/status/kanban/:statusGeral', async (req, res) => {
  const { statusGeral } = req.params;

  try {
    // Buscar os status correspondentes ao StatusGeral
    const statusQuery = `
      SELECT IdStatus, Status, StatusNum
      FROM \`sd-gestao.CRM.Status\`
      WHERE StatusGeral = @StatusGeral
      ORDER BY StatusNum
    `;

    const statusOptions = {
      query: statusQuery,
      params: { StatusGeral: statusGeral },
    };

    const [statusRows] = await bigquery.query(statusOptions);

    if (statusRows.length === 0) {
      return res.status(400).json({ success: false, message: `Nenhum status encontrado para StatusGeral = ${statusGeral}.` });
    }

    // Buscar clientes com o StatusGeralRelacionado selecionado e seus dados personalizados
    const clientsQuery = `
      SELECT c.*, d.Campo, d.Valor
      FROM \`sd-gestao.CRM.CadCliente\` c
      LEFT JOIN \`sd-gestao.CRM.DadosCliente\` d ON c.IdCliente = d.IdCliente
      WHERE c.StatusGeralRelacionado = @StatusGeral
      ORDER BY c.Nome
    `;

    const clientsOptions = {
      query: clientsQuery,
      params: { StatusGeral: statusGeral },
    };

    const [clientsRows] = await bigquery.query(clientsOptions);

    // Organizar os clientes por StatusRelacionado e agrupar os Dados
    const kanban = {};
    clientsRows.forEach(cliente => {
      const statusId = cliente.StatusRelacionado;
      if (!kanban[statusId]) {
        kanban[statusId] = [];
      }

      // Encontrar se o cliente já existe no array
      const existingCliente = kanban[statusId].find(c => c.IdCliente === cliente.IdCliente);
      if (existingCliente) {
        if (cliente.Campo && cliente.Valor) {
          existingCliente.Dados = existingCliente.Dados || [];
          existingCliente.Dados.push({
            Campo: cliente.Campo,
            Valor: cliente.Valor,
          });
        }
      } else {
        kanban[statusId].push({
          ...cliente,
          Dados: cliente.Campo && cliente.Valor ? [{ Campo: cliente.Campo, Valor: cliente.Valor }] : [],
        });
      }
    });

    res.json({
      success: true,
      statuses: statusRows,  // Array de status com IdStatus, Status, StatusNum
      kanban,                // Clientes organizados por StatusRelacionado (IdStatus)
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Kanban no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint para atualizar o StatusRelacionado de um cliente
router.put('/api/status/kanban/:clientId/status', async (req, res) => {
  const { clientId } = req.params;
  const { statusGeral, status } = req.body;

  if (!statusGeral || !status) {
    return res.status(400).json({ success: false, message: 'StatusGeral e Status são obrigatórios.' });
  }

  try {
    const Data = obterDataHoraBrasilia();
    // **Removido: UsuarioRelacionado = req.user.id**

    // Obter o StatusGeral para o IdStatus fornecido
    const statusCheckQuery = `
      SELECT StatusGeral
      FROM \`sd-gestao.CRM.Status\`
      WHERE IdStatus = @Status
      LIMIT 1
    `;

    const statusCheckOptions = {
      query: statusCheckQuery,
      params: { Status: status },
    };

    const [statusCheckRows] = await bigquery.query(statusCheckOptions);

    if (statusCheckRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Status inválido.' });
    }

    const StatusGeralRelacionado = statusCheckRows[0].StatusGeral;

    // Atualizar o cliente com o novo StatusRelacionado e StatusGeralRelacionado
    const updateQuery = `
      UPDATE \`sd-gestao.CRM.CadCliente\`
      SET StatusRelacionado = @Status,
          StatusGeralRelacionado = @StatusGeral,
          Data = @Data
      WHERE IdCliente = @IdCliente
    `;

    const updateOptions = {
      query: updateQuery,
      params: {
        Status: status,
        StatusGeral: statusGeral,
        Data,
        IdCliente: clientId,
      },
    };

    await bigquery.query(updateOptions);

    res.json({ success: true, message: 'Status do cliente atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar status do cliente no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint para cadastrar um novo cliente
router.post('/api/status /clientes', async (req, res) => {
  const { Nome, Email, Telefone, Endereco } = req.body;
  // **Removido: UsuarioRelacionado = req.user.id**

  // Validação dos campos obrigatórios
  if (!Nome || !Email || !Telefone || !Endereco) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const IdCliente = uuidv4(); // Gera um UUID para o cliente
    const Data = obterDataHoraBrasilia(); // Data atual formatada
    const StatusNumInicial = 0; // Número do status inicial

    // Logs para depuração
    console.log(`IdCliente: ${IdCliente}`);
    console.log(`Data formatada para inserção: ${Data}`);
    console.log(`Nome: ${Nome}`);
    console.log(`Email: ${Email}`);
    console.log(`Telefone: ${Telefone}`);
    console.log(`Endereco: ${Endereco}`);

    // Consulta para obter o IdStatus e StatusGeral correspondente a StatusNum = 0
    const statusQuery = `
      SELECT IdStatus, StatusGeral
      FROM \`sd-gestao.CRM.Status\`
      WHERE StatusNum = @StatusNum
      LIMIT 1
    `;
    const statusOptions = {
      query: statusQuery,
      params: { StatusNum: StatusNumInicial },
    };
    const [statusRows] = await bigquery.query(statusOptions);

    if (statusRows.length === 0) {
      return res.status(400).json({ success: false, message: `Status inicial com StatusNum = ${StatusNumInicial} não encontrado.` });
    }

    const StatusRelacionado = statusRows[0].IdStatus;
    const StatusGeralRelacionado = statusRows[0].StatusGeral;

    // Consulta para inserir o novo cliente com os campos de status preenchidos
    const insertQuery = `
      INSERT INTO \`sd-gestao.CRM.CadCliente\` 
      (IdCliente, Data, Nome, Email, Telefone, Endereco, StatusGeralRelacionado, StatusRelacionado)
      VALUES 
      (@IdCliente, @Data, @Nome, @Email, @Telefone, @Endereco, @StatusGeralRelacionado, @StatusRelacionado)
    `;

    const insertOptions = {
      query: insertQuery,
      params: { 
        IdCliente, 
        Data, 
        Nome, 
        Email, 
        Telefone, 
        Endereco, 
        StatusGeralRelacionado, 
        StatusRelacionado 
      },
    };

    // Executar a query de inserção
    const [job] = await bigquery.createQueryJob(insertOptions);
    console.log(`Job ${job.id} iniciado para inserir cliente.`);

    // Aguardar a conclusão da query
    await job.getQueryResults();

    res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso.' });
  } catch (error) {
    console.error('Erro ao inserir cliente no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint para buscar todos os clientes
router.get('/api/status/clientes', async (req, res) => {
  try {
    const query = `
      SELECT * FROM \`sd-gestao.CRM.CadCliente\`
      ORDER BY Nome
    `;

    const options = {
      query: query,
      // Nenhum parâmetro necessário
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} iniciado para buscar clientes.`);

    const [rows] = await job.getQueryResults();

    res.json({ success: true, clientes: rows });
  } catch (error) {
    console.error('Erro ao buscar clientes no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Endpoint para remover um cliente
router.delete('/api/status/clientes/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM \`sd-gestao.CRM.CadCliente\`
      WHERE IdCliente = @IdCliente
    `;
    
    const deleteOptions = {
      query: deleteQuery,
      params: { IdCliente: clientId },
    };
    
    const [job] = await bigquery.createQueryJob(deleteOptions);
    console.log(`Job ${job.id} iniciado para remover cliente com IdCliente = ${clientId}.`);
    
    await job.getQueryResults();
    
    res.json({ success: true, message: 'Cliente removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover cliente no BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

export default router;

