// routes/cadCliente.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import padraoAtividadeRoutes from './padraoAtividade.js';
import { formatarData, obterDataHoraBrasilia } from '../utils/helpers.js';
import bigquery from '../utils/bigquery.js';



dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;



// Middleware para verificar token
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

// Middleware para verificar se o usuário é Administrador
const isAdmin = (req, res, next) => {
  if (req.user && req.user.cargo === 'ADMINISTRADOR') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Acesso negado. Administradores apenas.' });
  }
};

// **Rotas do Backend**

/**
 * @route   POST /api/clientes
 * @desc    Cadastrar um novo cliente e criar a atividade inicial
 * @access  Autenticado
 */
router.post('/api/clientes', async (req, res) => {
    // Extrair todos os campos do corpo da requisição
    const {
      Nome,
      Email,
      Telefone,
      CEP,
      Logradouro,
      Bairro,
      Cidade,
      Estado,
      Numero,
      Complemento,
      Valor,
      Temperatura
    } = req.body;
  
    const UsuarioRelacionado = req.user.id;
  
    // Log para verificar o ID do usuário relacionado
    console.log(`Tentando criar cliente para UsuarioRelacionado: ${UsuarioRelacionado}`);
  
    // Validação dos campos obrigatórios
    if (!Nome || !Email || !Telefone || !CEP || !Logradouro || !Bairro || !Cidade || !Estado || !Numero) {
      console.log('Campos obrigatórios faltando:', { Nome, Email, Telefone, CEP, Logradouro, Bairro, Cidade, Estado, Numero });
      return res.status(400).json({ success: false, message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
  
    // Validação para o campo 'Valor' (float)
    if (Valor === undefined || isNaN(parseFloat(Valor))) {
      console.log('Campo Valor inválido ou não fornecido:', Valor);
      return res.status(400).json({ success: false, message: 'O campo Valor é obrigatório e deve ser um número.' });
    }
  
    // Validação para o campo 'Temperatura'
    const temperaturasValidas = ['FRIO', 'MORNO', 'ON FIRE'];
    if (!temperaturasValidas.includes(Temperatura)) {
      console.log('Temperatura inválida:', Temperatura);
      return res.status(400).json({ success: false, message: 'O campo Temperatura é obrigatório e deve ser FRIO, MORNO ou ON FIRE.' });
    }
  
    try {
      const IdCliente = uuidv4();
      const Data = obterDataHoraBrasilia();
      const StatusNumInicial = 0;
  
      // Concatenar os componentes do endereço na ordem padrão do Google Maps
      const EnderecoCompleto = `${Logradouro}, ${Numero}${Complemento ? ', ' + Complemento : ''}, ${Bairro}, ${Cidade} - ${Estado}, CEP: ${CEP}`;
  
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
        console.error(`Nenhum status encontrado com StatusNum = ${StatusNumInicial}.`);
        return res.status(400).json({ success: false, message: `Status inicial com StatusNum = ${StatusNumInicial} não encontrado.` });
      }
  
      const StatusRelacionado = statusRows[0].IdStatus;
      const StatusGeralRelacionado = statusRows[0].StatusGeral;
  
      // Verificar se StatusGeralRelacionado não é nulo
      if (!StatusGeralRelacionado) {
        console.error('StatusGeralRelacionado é nulo ou indefinido.');
        return res.status(400).json({ success: false, message: 'StatusGeralRelacionado não pode ser nulo.' });
      }
  
      // Consulta para inserir o novo cliente com os campos de status preenchidos
      const insertQuery = `
        INSERT INTO \`sd-gestao.CRM.CadCliente\`
        (IdCliente, UsuarioRelacionado, Data, Nome, Email, Telefone, CEP, Logradouro, Bairro, Cidade, Estado, Numero, Complemento, Endereco, Valor, Temperatura, StatusGeralRelacionado, StatusRelacionado)
        VALUES
        (@IdCliente, @UsuarioRelacionado, @Data, @Nome, @Email, @Telefone, @CEP, @Logradouro, @Bairro, @Cidade, @Estado, @Numero, @Complemento, @EnderecoCompleto, @Valor, @Temperatura, @StatusGeralRelacionado, @StatusRelacionado)
      `;
  
      const insertOptions = {
        query: insertQuery,
        params: {
          IdCliente,
          UsuarioRelacionado,
          Data,
          Nome,
          Email,
          Telefone,
          CEP,
          Logradouro,
          Bairro,
          Cidade,
          Estado,
          Numero,
          Complemento: Complemento || null, 
          EnderecoCompleto, 
          Valor: parseFloat(Valor),
          Temperatura,
          StatusGeralRelacionado,
          StatusRelacionado, 
        },
        types: {
          Complemento: 'STRING',
          // Adicione outros campos que podem ser null aqui
        },
      };
  
      await bigquery.query(insertOptions);
  
      console.log(`Cliente ${IdCliente} cadastrado com sucesso.`);
  
      // **Registrar histórico de criação do cliente**
      // Buscar o Nome do Usuário a partir do CadUsuario
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptions = {
        query: usuarioQuery,
        params: { IdUsuario: UsuarioRelacionado },
      };
      const [usuarioRows] = await bigquery.query(usuarioOptions);
  
      console.log('Resultado da consulta CadUsuario:', usuarioRows);
  
      const NomeUsuario = usuarioRows.length > 0 ? usuarioRows[0].Nome : 'Usuário Desconhecido';
  
      // Registrar o histórico da criação do cliente
      const IdHistorico = uuidv4();
      const HistoricoStatus = 'Cliente criado';
      const HistoricoStatusGeral = StatusRelacionado; // Incluindo StatusRelacionado no histórico
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoOptions = {
        query: insertHistoricoQuery,
        params: {
          IdHistorico,
          IdCliente,
          IdUsuario: UsuarioRelacionado,
          NomeUsuario,
          Data,
          HistoricoStatus,
          HistoricoStatusGeral,
        },
        types: {
          IdHistorico: 'STRING',
          IdCliente: 'STRING',
          IdUsuario: 'STRING',
          NomeUsuario: 'STRING',
          Data: 'DATETIME',
          HistoricoStatus: 'STRING',
          HistoricoStatusGeral: 'STRING',
        },
      };
  
      await bigquery.query(insertHistoricoOptions);
  
      console.log(`Histórico de criação do cliente ${IdCliente} registrado por ${NomeUsuario}.`);
  
      // **Criar a Atividade Inicial com a PadraoAtividade de menor AtividadeNum**
      const padraoAtividadeQuery = `
        SELECT IdPadraoAtividade, Nome, Descricao, AtividadeNum
        FROM \`sd-gestao.CRM.PadraoAtividade\`
        ORDER BY AtividadeNum ASC
        LIMIT 1
      `;
      const padraoAtividadeOptions = {
        query: padraoAtividadeQuery,
        params: {},
      };
      const [padraoAtividadeRows] = await bigquery.query(padraoAtividadeOptions);
  
      if (padraoAtividadeRows.length === 0) {
        console.error('Nenhuma atividade padrão encontrada para associar ao cliente.');
        return res.status(400).json({ success: false, message: 'Atividade padrão inicial não encontrada.' });
      }
  
      const padraoAtividade = padraoAtividadeRows[0];
  
      // Definir DateTimeInicio como agora e DateTimePrevisao como daqui a 1 dia útil
      const now = new Date();
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Adiciona 1 dia em milissegundos
      const formattedDateTimeInicio = formatarData(now); // "YYYY-MM-DDTHH:mm:ss"
      const formattedDateTimePrevisao = formatarData(oneDayLater); // "YYYY-MM-DDTHH:mm:ss"
  
      // Criar a nova atividade
      const IdAtividade = uuidv4();
  
      const insertAtividadeQuery = `
        INSERT INTO \`sd-gestao.CRM.Atividades\`
        (IdAtividade, ClienteRelacionado, Descricao, Nome, DateTimeInicio, DateTimePrevisao, DateTimeConclusao, StatusAtividade, StatusRelacionado)
        VALUES
        (@IdAtividade, @ClienteRelacionado, @Descricao, @Nome, @DateTimeInicio, @DateTimePrevisao, @DateTimeConclusao, @StatusAtividade, @StatusRelacionado)
      `;
      const insertAtividadeOptionsFinal = {
        query: insertAtividadeQuery,
        params: {
          IdAtividade,
          ClienteRelacionado: IdCliente,
          Descricao: padraoAtividade.Descricao,
          Nome: padraoAtividade.Nome,
          DateTimeInicio: formattedDateTimeInicio,
          DateTimePrevisao: formattedDateTimePrevisao,
          DateTimeConclusao: null,
          StatusAtividade: 'Aberta',
          StatusRelacionado,
        },
        types: {
          DateTimeConclusao: 'DATETIME',
          // Adicione outros campos que podem ser null aqui, se necessário
        },
      };
  
      await bigquery.query(insertAtividadeOptionsFinal);
  
      console.log(`Atividade inicial ${IdAtividade} criada para o cliente ${IdCliente}.`);
  
      // **Registrar histórico da criação da atividade**
      const insertHistoricoAtividadeQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoAtividadeOptions = {
        query: insertHistoricoAtividadeQuery,
        params: {
          IdHistorico: uuidv4(),
          IdCliente,
          IdUsuario: UsuarioRelacionado,
          NomeUsuario,
          Data: obterDataHoraBrasilia(),
          HistoricoStatus: `Atividade inicial "${padraoAtividade.Nome}" criada.`,
          HistoricoStatusGeral: StatusRelacionado,
        },
        types: {
          IdHistorico: 'STRING',
          IdCliente: 'STRING',
          IdUsuario: 'STRING',
          NomeUsuario: 'STRING',
          Data: 'DATETIME',
          HistoricoStatus: 'STRING',
          HistoricoStatusGeral: 'STRING',
        },
      };
  
      await bigquery.query(insertHistoricoAtividadeOptions);
  
      console.log(`Histórico da atividade inicial registrada para o cliente ${IdCliente}.`);
  
      // **Retornar os dados do cliente criado e da atividade inicial**
      res.status(201).json({
        success: true,
        message: 'Cliente cadastrado com sucesso.',
        cliente: {
          IdCliente,
          Nome,
          Email,
          Telefone,
          CEP,
          Logradouro,
          Bairro,
          Cidade,
          Estado,
          Numero,
          Complemento,
          Endereco: EnderecoCompleto, // Campo concatenado
          StatusGeralRelacionado,
          StatusRelacionado,
          Valor,
          Temperatura,
          NomeUsuario,
        },
        atividadeInicial: {
          IdAtividade,
          ClienteRelacionado: IdCliente,
          Descricao: padraoAtividade.Descricao,
          Nome: padraoAtividade.Nome,
          DateTimeInicio: formattedDateTimeInicio,
          DateTimePrevisao: formattedDateTimePrevisao,
          DateTimeConclusao: null,
          StatusAtividade: 'Aberta',
          StatusRelacionado,
        },
      });
    } catch (error) {
      console.error('Erro ao inserir cliente no BigQuery:', error);
  
      // Adiciona detalhes do erro em ambiente de desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        res.status(500).json({ success: false, message: 'Erro interno do servidor.', error: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Erro interno do servidor. Por favor, tente novamente.' });
      }
    }
  });
  
  
  
  
  /**
   * @route   GET /api/statusgerais
   * @desc    Obter lista de StatusGeral (Funis)
   * @access  Autenticado
   */
  router.get('/api/statusgerais', async (req, res) => {
    try {
      const query = `
        SELECT DISTINCT StatusGeral
        FROM \`sd-gestao.CRM.Status\`
        ORDER BY StatusGeral ASC
      `;
  
      const options = {
        query: query,
        params: {},
      };
  
      const [rows] = await bigquery.query(options);
  
      const statusGeral = rows.map(row => row.StatusGeral);
  
      res.json({ success: true, statusGeral });
    } catch (error) {
      console.error('Erro ao buscar StatusGerais no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  /**
   * @route   GET /api/kanban/:statusGeral
   * @desc    Obter dados do Kanban baseado em StatusGeral
   * @access  Autenticado
   */
  
  router.get('/api/kanban', authenticateToken, async (req, res) => {
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
    const UsuarioRelacionado = req.user.id;
  
    try {
      // Buscar todos os StatusGeral
      const statusGeralQuery = `SELECT DISTINCT StatusGeral FROM \`sd-gestao.CRM.Status\``;
      const [statusGeralRows] = await bigquery.query(statusGeralQuery);
  
      const kanbanData = {};
  
      for (const statusGeral of statusGeralRows) {
        const currentStatusGeral = statusGeral.StatusGeral;
  
        // Buscar os Status relacionados a este StatusGeral
        const statusQuery = `
          SELECT * FROM \`sd-gestao.CRM.Status\` WHERE StatusGeral = @StatusGeral
        `;
        const statusOptions = {
          query: statusQuery,
          params: { StatusGeral: currentStatusGeral },
        };
        const [statusRows] = await bigquery.query(statusOptions);
  
        // Definir a consulta de clientes com base no papel do usuário
        let kanbanQuery = '';
        let kanbanOptions = {};
  
        if (userRole === 'ADMINISTRADOR') {
          // Administrador pode ver todos os clientes
          kanbanQuery = `
            SELECT cc.*, cu.Nome AS NomeUsuario
            FROM \`sd-gestao.CRM.CadCliente\` cc
            JOIN \`sd-gestao.CRM.CadUsuario\` cu
              ON cc.UsuarioRelacionado = cu.IdUsuario
            WHERE cc.StatusGeralRelacionado = @StatusGeral
          `;
          kanbanOptions = {
            query: kanbanQuery,
            params: { StatusGeral: currentStatusGeral },
          };
        } else if (userRole === 'SUPERVISOR') {
          // Supervisor vê clientes de usuários da mesma unidade
          kanbanQuery = `
            SELECT cc.*, cu.Nome AS NomeUsuario
            FROM \`sd-gestao.CRM.CadCliente\` cc
            JOIN \`sd-gestao.CRM.CadUsuario\` cu
              ON cc.UsuarioRelacionado = cu.IdUsuario
            WHERE cc.StatusGeralRelacionado = @StatusGeral
              AND cu.Unidade = @Unidade
          `;
          kanbanOptions = {
            query: kanbanQuery,
            params: { StatusGeral: currentStatusGeral, Unidade: userUnit },
          };
        } else {
          // Vendedor vê apenas seus próprios clientes
          kanbanQuery = `
            SELECT cc.*, cu.Nome AS NomeUsuario
            FROM \`sd-gestao.CRM.CadCliente\` cc
            JOIN \`sd-gestao.CRM.CadUsuario\` cu
              ON cc.UsuarioRelacionado = cu.IdUsuario
            WHERE cc.StatusGeralRelacionado = @StatusGeral
              AND cc.UsuarioRelacionado = @UsuarioRelacionado
          `;
          kanbanOptions = {
            query: kanbanQuery,
            params: { StatusGeral: currentStatusGeral, UsuarioRelacionado },
          };
        }
  
        const [kanbanRows] = await bigquery.query(kanbanOptions);
  
        // Organizar os clientes por StatusRelacionado dentro deste StatusGeral
        const kanbanPorStatus = {};
        statusRows.forEach((status) => {
          kanbanPorStatus[status.IdStatus] = [];
        });
        kanbanRows.forEach((cliente) => {
          if (kanbanPorStatus[cliente.StatusRelacionado]) {
            kanbanPorStatus[cliente.StatusRelacionado].push(cliente);
          } else {
            kanbanPorStatus[cliente.StatusRelacionado] = [cliente];
          }
        });
  
        kanbanData[currentStatusGeral] = {
          statuses: statusRows,
          kanban: kanbanPorStatus,
        };
      }
  
      res.json({
        success: true,
        kanbanData,
      });
  
    } catch (error) {
      console.error('Erro ao buscar dados do Kanban:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar dados do Kanban.' });
    }
  });
  
  
  router.get('/api/kanban/:statusGeral', authenticateToken, async (req, res) => {
    const statusGeral = req.params.statusGeral;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
    const UsuarioRelacionado = req.user.id;
  
    try {
      // Definir a consulta de clientes com base no papel do usuário
      let kanbanQuery = '';
      let kanbanOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        // Administrador pode ver todos os clientes
        kanbanQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
            ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.StatusGeralRelacionado = @StatusGeral
        `;
        kanbanOptions = {
          query: kanbanQuery,
          params: { StatusGeral: statusGeral },
        };
      } else if (userRole === 'SUPERVISOR') {
        // Supervisor vê clientes de usuários da mesma unidade
        kanbanQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
            ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.StatusGeralRelacionado = @StatusGeral
            AND cu.Unidade = @Unidade
        `;
        kanbanOptions = {
          query: kanbanQuery,
          params: { StatusGeral: statusGeral, Unidade: userUnit },
        };
      } else {
        // Vendedor vê apenas seus próprios clientes
        kanbanQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
            ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.StatusGeralRelacionado = @StatusGeral
            AND cc.UsuarioRelacionado = @UsuarioRelacionado
        `;
        kanbanOptions = {
          query: kanbanQuery,
          params: { StatusGeral: statusGeral, UsuarioRelacionado },
        };
      }
  
      const [kanbanRows] = await bigquery.query(kanbanOptions);
  
      // Consulta para obter todos os statuses pertencentes ao StatusGeral
      const statusQuery = `
        SELECT * FROM \`sd-gestao.CRM.Status\`
        WHERE StatusGeral = @StatusGeral
      `;
      const statusOptions = {
        query: statusQuery,
        params: { StatusGeral: statusGeral },
      };
      const [statusRows] = await bigquery.query(statusOptions);
  
      // Organizar os clientes por StatusRelacionado
      const kanbanData = {};
      statusRows.forEach((status) => {
        kanbanData[status.IdStatus] = [];
      });
      kanbanRows.forEach((cliente) => {
        if (kanbanData[cliente.StatusRelacionado]) {
          kanbanData[cliente.StatusRelacionado].push(cliente);
        } else {
          kanbanData[cliente.StatusRelacionado] = [cliente];
        }
      });
  
      res.json({
        success: true,
        statuses: statusRows,
        kanban: kanbanData,
      });
  
    } catch (error) {
      console.error('Erro ao buscar dados do Kanban:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar dados do Kanban.' });
    }
  });
  /**
   * @route   PUT /api/clientes/:id/status
   * @desc    Atualizar o StatusRelacionado de um cliente
   * @access  Autenticado
   */
  
  router.get('/api/usuarios', authenticateToken, async (req, res) => {
    try {
      const usuariosQuery = `
        SELECT IdUsuario, Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
      `;
      const [usuariosRows] = await bigquery.query(usuariosQuery);
      
      res.json({
        success: true,
        usuarios: usuariosRows,
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar usuários.' });
    }
  });
  router.put('/api/clientes/:id/status', authenticateToken, async (req, res) => {
    const clienteId = req.params.id;
    const { status } = req.body;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
  
    if (!status) {
      console.log(`Requisição PUT para cliente ${clienteId} falhou: campo status ausente.`);
      return res.status(400).json({ success: false, message: 'O campo status é obrigatório.' });
    }
  
    console.log(`Requisição PUT recebida para atualizar o cliente: ${clienteId} para o status: ${status}`);
  
    try {
      // Verificar se o cliente existe e se o usuário tem permissão para atualizar
      let clienteQuery = '';
      let clienteOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        clienteQuery = `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE IdCliente = @IdCliente
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId },
        };
      } else if (userRole === 'SUPERVISOR') {
        clienteQuery = `
          SELECT cc.*
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
            ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, Unidade: userUnit },
        };
      } else {
        clienteQuery = `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE IdCliente = @IdCliente AND UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, UsuarioRelacionado: req.user.id },
        };
      }
  
      const [clienteRows] = await bigquery.query(clienteOptions);
  
      if (clienteRows.length === 0) {
        console.log(`Cliente com ID ${clienteId} não encontrado ou acesso negado para o usuário ${req.user.id}.`);
        return res.status(404).json({ success: false, message: 'Cliente não encontrado ou acesso negado.' });
      }
  
      const cliente = clienteRows[0];
      const currentStatusId = cliente.StatusRelacionado;
      const currentStatusGeralId = cliente.StatusGeralRelacionado;
  
      // Buscar o nome do status atual
      const currentStatusNameQuery = `
        SELECT Status
        FROM \`sd-gestao.CRM.Status\`
        WHERE IdStatus = @IdStatus
        LIMIT 1
      `;
      const currentStatusNameOptions = {
        query: currentStatusNameQuery,
        params: { IdStatus: currentStatusId },
      };
      const [currentStatusNameRows] = await bigquery.query(currentStatusNameOptions);
  
      if (currentStatusNameRows.length === 0) {
        console.error(`Status atual com IdStatus ${currentStatusId} não encontrado.`);
        return res.status(400).json({ success: false, message: 'Status atual não encontrado.' });
      }
  
      const currentStatusName = currentStatusNameRows[0].Status;
  
      // Buscar o novo status e verificar seu StatusGeral
      const statusQuery = `
        SELECT IdStatus, Status, StatusGeral
        FROM \`sd-gestao.CRM.Status\`
        WHERE IdStatus = @IdStatus
        LIMIT 1
      `;
      const statusOptions = {
        query: statusQuery,
        params: { IdStatus: status },
      };
      const [statusRows] = await bigquery.query(statusOptions);
  
      if (statusRows.length === 0) {
        console.log(`Status informado inválido: ${status}`);
        return res.status(400).json({ success: false, message: 'Status informado inválido.' });
      }
  
      const newStatusGeralId = statusRows[0].StatusGeral;
      const newStatusNome = statusRows[0].Status;
  
      // Verificar se o StatusGeral do novo status é igual ao StatusGeralRelacionado do cliente
      if (newStatusGeralId !== currentStatusGeralId) {
        console.log(`StatusGeral do novo status (${newStatusGeralId}) não corresponde ao StatusGeralRelacionado do cliente (${currentStatusGeralId}).`);
        return res.status(400).json({ success: false, message: 'O novo status não pertence ao mesmo funil.' });
      }
  
      // **Implementação da condição adicional**
      // Verificar se o cliente tem pelo menos uma atividade concluída no status atual
      const atividadesQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.Atividades\`
        WHERE ClienteRelacionado = @IdCliente
          AND StatusRelacionado = @StatusRelacionado
          AND StatusAtividade = 'Concluída'
      `;
      const atividadesOptions = {
        query: atividadesQuery,
        params: {
          IdCliente: clienteId,
          StatusRelacionado: currentStatusId,
        },
      };
      const [atividadesRows] = await bigquery.query(atividadesOptions);
  
      if (atividadesRows.length === 0) {
        console.log(`Cliente ${clienteId} não possui atividades concluídas no status atual (${currentStatusId}).`);
        return res.status(400).json({
          success: false,
          message: 'Não é possível avançar para o próximo status sem concluir pelo menos uma atividade no status atual.',
        });
      }
  
      // **Continuação do código existente para atualizar o status do cliente**
  
      // Atualizar o StatusRelacionado do cliente com base no papel do usuário
      let updateQuery = '';
      let updateOptions = {};
  
      if (userRole === 'ADMINISTRADOR' || userRole === 'SUPERVISOR') {
        updateQuery = `
          UPDATE \`sd-gestao.CRM.CadCliente\`
          SET StatusRelacionado = @StatusRelacionado
          WHERE IdCliente = @IdCliente
        `;
        updateOptions = {
          query: updateQuery,
          params: { StatusRelacionado: status, IdCliente: clienteId },
        };
      } else {
        updateQuery = `
          UPDATE \`sd-gestao.CRM.CadCliente\`
          SET StatusRelacionado = @StatusRelacionado
          WHERE IdCliente = @IdCliente AND UsuarioRelacionado = @UsuarioRelacionado
        `;
        updateOptions = {
          query: updateQuery,
          params: { StatusRelacionado: status, IdCliente: clienteId, UsuarioRelacionado: req.user.id },
        };
      }
  
      await bigquery.query(updateOptions);
  
      // Confirmar a atualização
      const [updatedClienteRows] = await bigquery.query({
        query: `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE IdCliente = @IdCliente
          LIMIT 1
        `,
        params: { IdCliente: clienteId },
      });
  
      if (updatedClienteRows.length === 0) {
        console.log(`Falha na atualização: Cliente com ID ${clienteId} não encontrado após a tentativa de atualização.`);
        return res.status(500).json({ success: false, message: 'Falha na atualização do cliente.' });
      }
  
      // Buscar o Nome do Usuário a partir do CadUsuario
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptionsHist = {
        query: usuarioQuery,
        params: { IdUsuario: req.user.id },
      };
      const [usuarioRows] = await bigquery.query(usuarioOptionsHist);
  
      console.log('Resultado da consulta CadUsuario:', usuarioRows);
  
      const NomeUsuario = usuarioRows.length > 0 ? usuarioRows[0].Nome : 'Usuário Desconhecido';
  
      // Registrar o histórico da mudança de status com nomes em vez de IDs
      const IdHistorico = uuidv4();
      const Data = obterDataHoraBrasilia();
      const HistoricoStatus = `De "${currentStatusName}" para "${newStatusNome}"`;
      const HistoricoStatusGeral = ''; // Como o StatusGeral não mudou, pode ser vazio
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoOptions = {
        query: insertHistoricoQuery,
        params: {
          IdHistorico,
          IdCliente: clienteId,
          IdUsuario: req.user.id,
          NomeUsuario,
          Data,
          HistoricoStatus,
          HistoricoStatusGeral,
        },
      };
  
      await bigquery.query(insertHistoricoOptions);
  
      console.log(`Status do cliente ${clienteId} atualizado para ${newStatusNome}. Histórico registrado por ${NomeUsuario}.`);
  
      // Retornar o cliente atualizado com os dados atualizados e NomeUsuario
      const clienteAtualizado = { ...updatedClienteRows[0], NomeUsuario };
  
      console.log(`Retornando cliente atualizado: ${JSON.stringify(clienteAtualizado)}`);
      res.json({ success: true, message: 'Status do cliente atualizado com sucesso.', cliente: clienteAtualizado });
    } catch (error) {
      console.error('Erro ao atualizar status do cliente no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  /**
   * @route   PUT /api/clientes/:id/statusgeral
   * @desc    Atualizar o StatusGeralRelacionado e StatusRelacionado de um cliente
   * @access  Autenticado
   */
  router.put('/api/clientes/:id/statusgeral', authenticateToken, async (req, res) => {
    const clienteId = req.params.id;
    const { statusGeral } = req.body;
  
    console.log(`Recebida requisição PUT para atualizar Status Geral do cliente: ${clienteId}`);
    console.log(`Novo StatusGeral: ${statusGeral}`);
  
    if (!statusGeral) {
      console.log('Campo statusGeral ausente no corpo da requisição.');
      return res.status(400).json({ success: false, message: 'O campo statusGeral é obrigatório.' });
    }
  
    try {
      // 1. Verificar se o cliente existe
      const clienteQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.CadCliente\`
        WHERE IdCliente = @IdCliente
        LIMIT 1
      `;
      const clienteOptions = {
        query: clienteQuery,
        params: { IdCliente: clienteId },
      };
      const [clienteRows] = await bigquery.query(clienteOptions);
  
      if (clienteRows.length === 0) {
        console.log(`Cliente com ID ${clienteId} não encontrado.`);
        return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
      }
  
      const clienteAtual = clienteRows[0];
  
      // 2. Buscar o status com StatusGeral = statusGeral e StatusNum = 1
      const statusQuery = `
        SELECT IdStatus, Status, StatusGeral
        FROM \`sd-gestao.CRM.Status\`
        WHERE StatusGeral = @StatusGeral AND StatusNum = 1
        LIMIT 1
      `;
      const statusOptions = {
        query: statusQuery,
        params: { StatusGeral: statusGeral },
      };
      const [statusRows] = await bigquery.query(statusOptions);
  
      if (statusRows.length === 0) {
        console.log(`StatusGeral informado inválido ou StatusNum=1 não encontrado para StatusGeral = ${statusGeral}`);
        return res.status(400).json({ success: false, message: 'StatusGeral informado inválido ou Status inicial não encontrado.' });
      }
  
      const newStatusGeralId = statusRows[0].StatusGeral;
      const newStatusId = statusRows[0].IdStatus;
      const newStatusNome = statusRows[0].Status;
  
      // 3. Verificar se o cliente tem pelo menos uma atividade concluída no status atual
      // Primeiro, buscar todos os IdStatus que pertencem ao StatusGeralRelacionado atual
      const statusRelacionadosQuery = `
        SELECT IdStatus
        FROM \`sd-gestao.CRM.Status\`
        WHERE StatusGeral = @StatusGeralRelacionado
      `;
      const statusRelacionadosOptions = {
        query: statusRelacionadosQuery,
        params: { StatusGeralRelacionado: clienteAtual.StatusGeralRelacionado },
      };
      const [statusRelacionadosRows] = await bigquery.query(statusRelacionadosOptions);
  
      const statusRelacionadosIds = statusRelacionadosRows.map(row => row.IdStatus);
  
      if (statusRelacionadosIds.length === 0) {
        console.log(`Nenhum status encontrado para StatusGeralRelacionado = ${clienteAtual.StatusGeralRelacionado}.`);
        return res.status(400).json({ success: false, message: 'Nenhum status encontrado para o StatusGeral atual do cliente.' });
      }
  
      // Agora, verificar se existe pelo menos uma atividade concluída no status atual
      const atividadesConclusaoQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.Atividades\`
        WHERE ClienteRelacionado = @IdCliente
          AND StatusRelacionado IN UNNEST(@StatusIds)
          AND StatusAtividade = 'Concluída'
        LIMIT 1
      `;
      const atividadesConclusaoOptions = {
        query: atividadesConclusaoQuery,
        params: {
          IdCliente: clienteId,
          StatusIds: statusRelacionadosIds,
        },
      };
      const [atividadesConclusaoRows] = await bigquery.query(atividadesConclusaoOptions);
  
      if (atividadesConclusaoRows.length === 0) {
        console.log(`Cliente ${clienteId} não possui atividades concluídas no status atual (${clienteAtual.StatusRelacionado}).`);
        return res.status(400).json({
          success: false,
          message: 'Não é possível atualizar o Status Geral sem concluir pelo menos uma atividade no status atual.',
        });
      }
  
      // 4. Atualizar o cliente com o novo StatusGeralRelacionado e StatusRelacionado
      const updateQuery = `
        UPDATE \`sd-gestao.CRM.CadCliente\`
        SET StatusGeralRelacionado = @StatusGeralRelacionado, StatusRelacionado = @StatusRelacionado, Data = @Data
        WHERE IdCliente = @IdCliente
      `;
      const Data = obterDataHoraBrasilia();
  
      const updateOptions = {
        query: updateQuery,
        params: {
          StatusGeralRelacionado: newStatusGeralId,
          StatusRelacionado: newStatusId,
          Data,
          IdCliente: clienteId,
        },
      };
  
      await bigquery.query(updateOptions);
  
      // 5. Registrar histórico da mudança de status
      // Buscar o Nome do Usuário a partir do CadUsuario
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptions = {
        query: usuarioQuery,
        params: { IdUsuario: req.user.id },
      };
      const [usuarioRows] = await bigquery.query(usuarioOptions);
  
      console.log('Resultado da consulta CadUsuario:', usuarioRows);
  
      const NomeUsuario = usuarioRows.length > 0 ? usuarioRows[0].Nome : 'Usuário Desconhecido';
  
      // Registrar o histórico da mudança de status APÓS a atualização bem-sucedida
      const IdHistorico = uuidv4();
      const HistoricoStatus = `Status Geral atualizado para "${newStatusNome}"`;
      const HistoricoStatusGeral = newStatusGeralId; // Pode ajustar conforme necessário
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoOptions = {
        query: insertHistoricoQuery,
        params: {
          IdHistorico,
          IdCliente: clienteId,
          IdUsuario: req.user.id,
          NomeUsuario,
          Data,
          HistoricoStatus,
          HistoricoStatusGeral,
        },
      };
  
      await bigquery.query(insertHistoricoOptions);
  
      console.log(`Status Geral do cliente ${clienteId} atualizado para ${newStatusNome}. Histórico registrado por ${NomeUsuario}.`);
  
      // 6. Retornar o cliente atualizado
      const clienteAtualizado = { 
        ...clienteAtual, 
        StatusGeralRelacionado: newStatusGeralId, 
        StatusRelacionado: newStatusId, 
        NomeUsuario 
      };
  
      console.log(`Retornando cliente atualizado: ${JSON.stringify(clienteAtualizado)}`);
      res.json({ success: true, message: 'Status Geral atualizado com sucesso.', cliente: clienteAtualizado });
  
    } catch (error) {
      console.error('Erro ao atualizar Status Geral:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  
  /**
   * @route   GET /api/statuses
   * @desc    Buscar todos os status
   * @access  Autenticado
   */
  router.get('/api/statuses', authenticateToken, async (req, res) => {
    try {
      const query = `
        SELECT IdStatus, Status, StatusNum, StatusGeral
        FROM \`sd-gestao.CRM.Status\`
        ORDER BY StatusNum ASC
      `;
  
      const options = {
        query: query,
        params: {},
      };
  
      const [rows] = await bigquery.query(options);
  
      res.json({ success: true, statuses: rows });
    } catch (error) {
      console.error('Erro ao buscar status no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  /**
   * @route   GET /api/clientes
   * @desc    Buscar todos os clientes
   * @access  Autenticado
   */
  router.get('/api/clientes', authenticateToken, async (req, res) => {
    const UsuarioRelacionado = req.user.id;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
  
    try {
      let query = '';
      let params = {};
  
      if (userRole === 'ADMINISTRADOR') {
        // Administrador vê todos os clientes
        query = `
          SELECT * FROM \`sd-gestao.CRM.CadCliente\`
          ORDER BY Nome
        `;
        params = {};
      } else if (userRole === 'SUPERVISOR') {
        // Supervisor vê clientes de usuários da mesma unidade
        query = `
          SELECT cc.*
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
          ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cu.Unidade = @Unidade
          ORDER BY cc.Nome
        `;
        params = { Unidade: userUnit };
      } else {
        // Vendedor vê apenas seus próprios clientes
        query = `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE UsuarioRelacionado = @UsuarioRelacionado
          ORDER BY Nome
        `;
        params = { UsuarioRelacionado };
      }
  
      const options = {
        query: query,
        params: params,
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
  
  
  /**
   * @route   DELETE /api/clientes/:clientId
   * @desc    Remover um cliente
   * @access  Autenticado
   */
  router.delete('/api/clientes/:clientId', authenticateToken, async (req, res) => {
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
  
  /**
   * @route   PUT /api/clientes/:id
   * @desc    Atualizar os detalhes de um cliente
   * @access  Autenticado
   */
  router.put('/api/clientes/:id', authenticateToken, async (req, res) => {
    const clienteId = req.params.id;
    const {
      Nome,
      Email,
      Telefone,
      CEP,
      Logradouro,
      Bairro,
      Cidade,
      Estado,
      Numero,
      Complemento,
      Valor,
      Temperatura
    } = req.body;
  
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
    const UsuarioRelacionado = req.user.id;
  
    // Validação dos campos obrigatórios
    if (!Nome || !Email || !Telefone || !CEP || !Logradouro || !Bairro || !Cidade || !Estado || !Numero) {
      console.log('Campos obrigatórios faltando:', { Nome, Email, Telefone, CEP, Logradouro, Bairro, Cidade, Estado, Numero });
      return res.status(400).json({ success: false, message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
  
    // Validação para o campo 'Valor' (float)
    if (Valor === undefined || isNaN(parseFloat(Valor))) {
      console.log('Campo Valor inválido ou não fornecido:', Valor);
      return res.status(400).json({ success: false, message: 'O campo Valor é obrigatório e deve ser um número.' });
    }
  
    // Validação para o campo 'Temperatura'
    const temperaturasValidas = ['FRIO', 'MORNO', 'ON FIRE'];
    if (!temperaturasValidas.includes(Temperatura)) {
      console.log('Temperatura inválida:', Temperatura);
      return res.status(400).json({ success: false, message: 'O campo Temperatura é obrigatório e deve ser FRIO, MORNO ou ON FIRE.' });
    }
  
    try {
      // Verificar se o cliente existe e se o usuário tem permissão para atualizar
      let clienteQuery = '';
      let clienteOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        clienteQuery = `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE IdCliente = @IdCliente
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId },
        };
      } else if (userRole === 'SUPERVISOR') {
        clienteQuery = `
          SELECT cc.*
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
          ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, Unidade: userUnit },
        };
      } else {
        clienteQuery = `
          SELECT *
          FROM \`sd-gestao.CRM.CadCliente\`
          WHERE IdCliente = @IdCliente AND UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, UsuarioRelacionado: req.user.id },
        };
      }
  
      const [clienteRows] = await bigquery.query(clienteOptions);
  
      if (clienteRows.length === 0) {
        console.log(`Cliente com ID ${clienteId} não encontrado ou acesso negado para o usuário ${req.user.id}.`);
        return res.status(404).json({ success: false, message: 'Cliente não encontrado ou acesso negado.' });
      }
  
      const clienteAtual = clienteRows[0];
  
      // Prepare os dados que serão atualizados
      const updatedData = {};
      const editableFields = [
        'Nome',
        'Email',
        'Telefone',
        'CEP',
        'Logradouro',
        'Bairro',
        'Cidade',
        'Estado',
        'Numero',
        'Complemento',
        'Valor',
        'Temperatura'
      ];
  
      editableFields.forEach(field => {
        if (field === 'Valor') {
          updatedData[field] = parseFloat(req.body[field]) || 0;
        } else {
          updatedData[field] = req.body[field];
        }
      });
  
      // Identificar quais campos foram alterados
      const changedFields = [];
      editableFields.forEach(field => {
        const oldValue = clienteAtual[field] !== undefined ? clienteAtual[field] : '';
        const newValue = updatedData[field] !== undefined ? updatedData[field] : '';
        if (oldValue !== newValue) {
          changedFields.push({
            field,
            oldValue,
            newValue
          });
        }
      });
  
      // Gerar descrição detalhada das mudanças
      let historicoDescricao = 'Cliente atualizado: ';
  
      if (changedFields.length > 0) {
        const mudanças = changedFields.map(change => {
          return `${change.field} de "${change.oldValue}" para "${change.newValue}"`;
        });
        historicoDescricao += mudanças.join(', ');
      } else {
        historicoDescricao += 'Nenhuma alteração detectada.';
      }
  
      // Concatenar os componentes do endereço na ordem padrão do Google Maps
      const EnderecoCompleto = `${Logradouro}, ${Numero}${Complemento ? ', ' + Complemento : ''}, ${Bairro}, ${Cidade} - ${Estado}, CEP: ${CEP}`;
  
      // Atualizar os campos do cliente
      const updateQuery = `
        UPDATE \`sd-gestao.CRM.CadCliente\`
        SET
          Nome = @Nome,
          Email = @Email,
          Telefone = @Telefone,
          CEP = @CEP,
          Logradouro = @Logradouro,
          Bairro = @Bairro,
          Cidade = @Cidade,
          Estado = @Estado,
          Numero = @Numero,
          Complemento = @Complemento,
          Endereco = @EnderecoCompleto,
          Valor = @Valor,
          Temperatura = @Temperatura,
          Data = @Data
        WHERE IdCliente = @IdCliente
      `;
      const Data = obterDataHoraBrasilia();
  
      const updateOptions = {
        query: updateQuery,
        params: {
          Nome,
          Email,
          Telefone,
          CEP,
          Logradouro,
          Bairro,
          Cidade,
          Estado,
          Numero,
          Complemento: Complemento || null,
          EnderecoCompleto, // Campo concatenado
          Valor: parseFloat(Valor),
          Temperatura,
          Data,
          IdCliente: clienteId,
        },
      };
  
      await bigquery.query(updateOptions);
  
      console.log(`Cliente ${clienteId} atualizado com sucesso.`);
  
      // Registrar o histórico da atualização
      const IdHistorico = uuidv4();
      const HistoricoStatus = historicoDescricao; // Descrição detalhada das mudanças
      const HistoricoStatusGeral = ''; // Pode ser ajustado conforme necessário
  
      // Buscar o Nome do Usuário a partir do CadUsuario
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptions = {
        query: usuarioQuery,
        params: { IdUsuario: UsuarioRelacionado },
      };
      const [usuarioRows] = await bigquery.query(usuarioOptions);
  
      const NomeUsuario = usuarioRows.length > 0 ? usuarioRows[0].Nome : 'Usuário Desconhecido';
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoOptions = {
        query: insertHistoricoQuery,
        params: {
          IdHistorico,
          IdCliente: clienteId,
          IdUsuario: UsuarioRelacionado,
          NomeUsuario,
          Data,
          HistoricoStatus,
          HistoricoStatusGeral,
        },
      };
  
      await bigquery.query(insertHistoricoOptions);
  
      console.log(`Histórico de atualização do cliente ${clienteId} registrado por ${NomeUsuario}.`);
  
      // Retornar os dados do cliente atualizado
      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso.',
        cliente: {
          IdCliente: clienteId,
          Nome,
          Email,
          Telefone,
          CEP,
          Logradouro,
          Bairro,
          Cidade,
          Estado,
          Numero,
          Complemento,
          Endereco: EnderecoCompleto, // Campo concatenado
          Valor,
          Temperatura,
          NomeUsuario,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  /**
   * @route   GET /api/clientes/:id
   * @desc    Buscar detalhes do cliente com histórico
   * @access  Autenticado
   */
  router.get('/api/clientes/:id', authenticateToken, async (req, res) => {
    const clienteId = req.params.id;
    const UsuarioRelacionado = req.user.id;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
  
    try {
      // Definir a consulta do cliente com base no cargo do usuário
      let clienteQuery = '';
      let clienteOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        // Administrador pode ver qualquer cliente
        clienteQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          LEFT JOIN \`sd-gestao.CRM.CadUsuario\` cu
          ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId },
        };
      } else if (userRole === 'SUPERVISOR') {
        // Supervisor pode ver clientes de usuários da mesma unidade
        clienteQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
          ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, Unidade: userUnit },
        };
      } else {
        // Vendedor vê apenas seus próprios clientes
        clienteQuery = `
          SELECT cc.*, cu.Nome AS NomeUsuario
          FROM \`sd-gestao.CRM.CadCliente\` cc
          LEFT JOIN \`sd-gestao.CRM.CadUsuario\` cu
          ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente AND cc.UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        clienteOptions = {
          query: clienteQuery,
          params: { IdCliente: clienteId, UsuarioRelacionado },
        };
      }
  
      const [clienteRows] = await bigquery.query(clienteOptions);
  
      if (clienteRows.length === 0) {
        console.log(`Cliente com ID ${clienteId} não encontrado ou acesso negado para o usuário ${UsuarioRelacionado}.`);
        return res.status(404).json({ success: false, message: 'Cliente não encontrado ou acesso negado.' });
      }
  
      const cliente = clienteRows[0];
  
      // Buscar histórico de status do cliente com nomes dos usuários
      const historicoQuery = `
        SELECT hc.*, cu.Nome AS NomeUsuario
        FROM \`sd-gestao.CRM.HistoricoCliente\` hc
        LEFT JOIN \`sd-gestao.CRM.CadUsuario\` cu
        ON hc.IdUsuario = cu.IdUsuario
        WHERE hc.IdCliente = @IdCliente
        ORDER BY hc.Data DESC
      `;
      const historicoOptions = {
        query: historicoQuery,
        params: { IdCliente: clienteId },
      };
  
      const [historicoRows] = await bigquery.query(historicoOptions);
  
      res.json({ success: true, cliente, historico: historicoRows });
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  /**
   * @route   GET /api/clientes/duplicados
   * @desc    Buscar clientes duplicados (exemplo específico)
   * @access  Autenticado
   */
  router.get('/api/clientes/duplicados', authenticateToken, async (req, res) => {
    try {
      const fechamentoQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.CadCliente\`
        WHERE StatusRelacionado = @StatusRelacionado AND StatusGeralRelacionado = 'Vendas'
      `;
      const fechamentoOptions = {
        query: fechamentoQuery,
        params: { StatusRelacionado: 'Fechamento' },
      };
  
      const [fechamentoClientes] = await bigquery.query(fechamentoOptions);
  
      res.json({ success: true, clientesDuplicados: fechamentoClientes });
    } catch (error) {
      console.error('Erro ao buscar clientes duplicados:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  /**
   * @route   POST /api/clientes
   * @desc    Cadastrar um novo cliente (Redefinição caso tenha sido duplicado)
   * @access  Autenticado
   */
  // Caso haja necessidade, esta rota já está definida acima.
  
  /**
   * @route   GET /api/statusgeral
   * @desc    Obter StatusGeral com StatusNum = 0
   * @access  Autenticado
   */
  router.get('/api/statusgeral', authenticateToken, async (req, res) => {
    try {
      const query = `
        SELECT StatusGeral, IdStatus
        FROM \`sd-gestao.CRM.Status\`
        WHERE StatusNum = 0
      `;
      const options = {
        query: query,
        location: 'us-central1',
      };
  
      const [rows] = await bigquery.query(options);
      res.json({ success: true, statuses: rows });
    } catch (error) {
      console.error('Erro ao buscar StatusGeral com StatusNum = 0:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  router.get('/api/clientes/:id/atividades', authenticateToken, async (req, res) => {
    const clienteId = req.params.id;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
    const UsuarioRelacionado = req.user.id;
  
    try {
      // Verificar se o usuário tem acesso ao cliente
      let acessoQuery = '';
      let acessoOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        acessoQuery = `SELECT * FROM \`sd-gestao.CRM.CadCliente\` WHERE IdCliente = @IdCliente LIMIT 1`;
        acessoOptions = { query: acessoQuery, params: { IdCliente: clienteId } };
      } else if (userRole === 'SUPERVISOR') {
        acessoQuery = `
          SELECT cc.*
          FROM \`sd-gestao.CRM.CadCliente\` cc
          JOIN \`sd-gestao.CRM.CadUsuario\` cu
            ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE cc.IdCliente = @IdCliente AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        acessoOptions = { query: acessoQuery, params: { IdCliente: clienteId, Unidade: userUnit } };
      } else {
        // Correção aqui: verificar se o cliente pertence ao vendedor
        acessoQuery = `
          SELECT cc.*
          FROM \`sd-gestao.CRM.CadCliente\` cc
          WHERE cc.IdCliente = @IdCliente AND cc.UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        acessoOptions = { query: acessoQuery, params: { IdCliente: clienteId, UsuarioRelacionado } };
      }
  
      const [acessoRows] = await bigquery.query(acessoOptions);
  
      if (acessoRows.length === 0) {
        return res.status(403).json({ success: false, message: 'Acesso negado ao cliente.' });
      }
  
      // Buscar atividades relacionadas ao cliente
      const atividadesQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.Atividades\`
        WHERE ClienteRelacionado = @ClienteRelacionado
        ORDER BY DateTimeInicio DESC
      `;
      const atividadesOptions = {
        query: atividadesQuery,
        params: { ClienteRelacionado: clienteId },
      };
  
      const [atividadesRows] = await bigquery.query(atividadesOptions);
  
      // Como os campos DATETIME são retornados como strings, simplesmente passamos
      const atividadesFormatadas = atividadesRows.map((atividade) => ({
        ...atividade,
        DateTimeInicio: atividade.DateTimeInicio, // "YYYY-MM-DDTHH:mm:ss"
        DateTimePrevisao: atividade.DateTimePrevisao,
        DateTimeConclusao: atividade.DateTimeConclusao, // Pode ser null
        Nome: atividade.Nome, // Novo campo
        StatusAtividade: atividade.StatusAtividade, // Novo campo
      }));
  
      res.json({ success: true, atividades: atividadesFormatadas });
    } catch (error) {
      console.error('Erro ao buscar atividades no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  
  
  
  /**
   * @route   POST /api/atividades
   * @desc    Criar uma nova atividade e registrar no histórico
   * @access  Autenticado
   */
  router.post('/api/atividades', authenticateToken, async (req, res) => {
    const { ClienteRelacionado, Nome, Descricao, DateTimeInicio, DateTimePrevisao } = req.body;
    const UsuarioRelacionado = req.user.id; // ID do usuário autenticado
  
    try {
      // 1. Validar os campos obrigatórios
      if (!ClienteRelacionado || !Nome || !Descricao) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios não preenchidos.' });
      }
  
      // 2. Recuperar StatusRelacionado do cliente
      const clienteQuery = `
        SELECT StatusRelacionado
        FROM \`sd-gestao.CRM.CadCliente\`
        WHERE IdCliente = @IdCliente
        LIMIT 1
      `;
      const clienteOptions = {
        query: clienteQuery,
        params: { IdCliente: ClienteRelacionado },
      };
      const [clienteRows] = await bigquery.query(clienteOptions);
  
      if (clienteRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cliente relacionado não encontrado.' });
      }
  
      const StatusRelacionado = clienteRows[0].StatusRelacionado;
  
      // 3. Preparar os dados para inserção com formatação correta das datas
      const IdAtividade = uuidv4();
      const DateTimeInicioFormatted = formatarData(DateTimeInicio) || obterDataHoraBrasilia();
      const DateTimePrevisaoFormatted = formatarData(DateTimePrevisao);
  
      if (!DateTimePrevisaoFormatted) {
        return res.status(400).json({ success: false, message: 'Data de previsão inválida ou não fornecida.' });
      }
  
      // 4. Inserir a nova atividade no BigQuery
      const insertAtividadeQuery = `
        INSERT INTO \`sd-gestao.CRM.Atividades\`
        (IdAtividade, ClienteRelacionado, Nome, Descricao, DateTimeInicio, DateTimePrevisao, DateTimeConclusao, StatusAtividade, DescricaoConclusao, StatusRelacionado)
        VALUES
        (@IdAtividade, @ClienteRelacionado, @Nome, @Descricao, @DateTimeInicio, @DateTimePrevisao, @DateTimeConclusao, @StatusAtividade, @DescricaoConclusao, @StatusRelacionado)
      `;
      const insertAtividadeParams = {
        IdAtividade,
        ClienteRelacionado,
        Nome,
        Descricao,
        DateTimeInicio: DateTimeInicioFormatted, // Formato 'YYYY-MM-DD HH:mm:ss'
        DateTimePrevisao: DateTimePrevisaoFormatted, // Formato 'YYYY-MM-DD HH:mm:ss'
        DateTimeConclusao: null,
        StatusAtividade: 'Aberta',
        DescricaoConclusao: null,
        StatusRelacionado,
      };
  
      const insertAtividadeTypes = {
        DateTimeConclusao: 'DATETIME',
        DescricaoConclusao: 'STRING',
      };
  
      const insertAtividadeOptions = {
        query: insertAtividadeQuery,
        params: insertAtividadeParams,
        types: insertAtividadeTypes,
      };
  
      await bigquery.query(insertAtividadeOptions);
  
      console.log(`Atividade ${IdAtividade} criada com sucesso para o cliente ${ClienteRelacionado}.`);
  
      // 5. Registrar o histórico da criação
      const IdHistorico = uuidv4();
      const Data = obterDataHoraBrasilia();
  
      // Buscar o Nome do Usuário
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptionsHist = {
        query: usuarioQuery,
        params: { IdUsuario: UsuarioRelacionado },
      };
      const [usuarioRowsHist] = await bigquery.query(usuarioOptionsHist);
  
      const NomeUsuario = usuarioRowsHist.length > 0 ? usuarioRowsHist[0].Nome : 'Usuário Desconhecido';
  
      const HistoricoStatus = `Atividade "${Nome}" criada.`;
      const HistoricoStatusGeral = StatusRelacionado;
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoParams = {
        IdHistorico,
        IdCliente: ClienteRelacionado,
        IdUsuario: UsuarioRelacionado,
        NomeUsuario,
        Data,
        HistoricoStatus,
        HistoricoStatusGeral,
      };
  
      const insertHistoricoTypes = {
        IdHistorico: 'STRING',
        IdCliente: 'STRING',
        IdUsuario: 'STRING',
        NomeUsuario: 'STRING',
        Data: 'DATETIME',
        HistoricoStatus: 'STRING',
        HistoricoStatusGeral: 'STRING',
      };
  
      const insertHistoricoOptions = {
        query: insertHistoricoQuery,
        params: insertHistoricoParams,
        types: insertHistoricoTypes,
      };
  
      await bigquery.query(insertHistoricoOptions);
  
      console.log(`Histórico da atividade ${IdHistorico} registrado com sucesso.`);
  
      // 6. Retornar os dados da atividade criada
      res.status(201).json({
        success: true,
        message: 'Atividade criada com sucesso.',
        atividade: {
          IdAtividade,
          ClienteRelacionado,
          Nome,
          Descricao,
          DateTimeInicio: DateTimeInicioFormatted,
          DateTimePrevisao: DateTimePrevisaoFormatted,
          DateTimeConclusao: null,
          StatusAtividade: 'Aberta',
          DescricaoConclusao: null,
          StatusRelacionado,
          NomeUsuario,
        },
      });
  
    } catch (error) {
      console.error('Erro ao criar atividade no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  
  /**
   * @route   PUT /api/atividades/:id
   * @desc    Editar uma atividade e registrar no histórico
   * @access  Autenticado
   */
  router.put('/api/atividades/:id', authenticateToken, async (req, res) => {
    const atividadeId = req.params.id;
    const { Nome, Descricao, DateTimeInicio, DateTimePrevisao } = req.body;
    const UsuarioRelacionado = req.user.id; // ID do usuário autenticado
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
  
    try {
      // 1. Verificar se a atividade existe e se o usuário tem permissão para editar
      let atividadeQuery = '';
      let atividadeOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        // Administrador pode editar qualquer atividade
        atividadeQuery = `
          SELECT *
          FROM \`sd-gestao.CRM.Atividades\`
          WHERE IdAtividade = @IdAtividade
          LIMIT 1
        `;
        atividadeOptions = { query: atividadeQuery, params: { IdAtividade: atividadeId } };
      } else if (userRole === 'SUPERVISOR') {
        // Supervisor pode editar atividades de clientes da mesma unidade
        atividadeQuery = `
          SELECT a.*
          FROM \`sd-gestao.CRM.Atividades\` a
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON a.ClienteRelacionado = cc.IdCliente
          JOIN \`sd-gestao.CRM.CadUsuario\` cu ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE a.IdAtividade = @IdAtividade AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        atividadeOptions = { query: atividadeQuery, params: { IdAtividade: atividadeId, Unidade: userUnit } };
      } else if (userRole === 'VENDEDOR') {
        // Vendedor pode editar apenas suas próprias atividades
        atividadeQuery = `
          SELECT a.*
          FROM \`sd-gestao.CRM.Atividades\` a
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON a.ClienteRelacionado = cc.IdCliente
          WHERE a.IdAtividade = @IdAtividade AND cc.UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        atividadeOptions = { query: atividadeQuery, params: { IdAtividade: atividadeId, UsuarioRelacionado } };
      } else {
        // Outros cargos não têm permissão
        return res.status(403).json({ success: false, message: 'Acesso negado.' });
      }
  
      const [atividadeRows] = await bigquery.query(atividadeOptions);
  
      if (atividadeRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Atividade não encontrada ou acesso negado.' });
      }
  
      const atividade = atividadeRows[0];
  
      // 2. Determinar quais campos serão atualizados
      const camposAtualizar = {};
      if (Nome && Nome !== atividade.Nome) camposAtualizar.Nome = Nome;
      if (Descricao && Descricao !== atividade.Descricao) camposAtualizar.Descricao = Descricao;
      if (DateTimeInicio && DateTimeInicio !== atividade.DateTimeInicio) camposAtualizar.DateTimeInicio = DateTimeInicio;
      if (DateTimePrevisao && DateTimePrevisao !== atividade.DateTimePrevisao) camposAtualizar.DateTimePrevisao = DateTimePrevisao;
  
      if (Object.keys(camposAtualizar).length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhuma alteração detectada.' });
      }
  
      // 3. Atualizar a atividade no BigQuery
      const updateQuery = `
        UPDATE \`sd-gestao.CRM.Atividades\`
        SET ${Object.keys(camposAtualizar).map(campo => `${campo} = @${campo}`).join(', ')}
        WHERE IdAtividade = @IdAtividade
      `;
      const updateParams = { ...camposAtualizar, IdAtividade: atividadeId };
  
      // Definir tipos dinamicamente
      const updateTypes = Object.keys(camposAtualizar).reduce((acc, campo) => {
        if (campo === 'DateTimeInicio' || campo === 'DateTimePrevisao') {
          acc[campo] = 'DATETIME';
        } else {
          acc[campo] = 'STRING';
        }
        return acc;
      }, {});
  
      updateTypes['IdAtividade'] = 'STRING';
  
      await bigquery.query({
        query: updateQuery,
        params: updateParams,
        types: updateTypes,
      });
  
      // 4. Registrar o histórico das alterações
      // Gerar uma descrição detalhada das mudanças
      const changedFields = Object.keys(camposAtualizar).map(campo => {
        return `${campo} de "${atividade[campo]}" para "${camposAtualizar[campo]}"`;
      }).join(', ');
  
      const historicoDescricao = `Atividade atualizada: ${changedFields}`;
  
      // Buscar o Nome do Usuário a partir do CadUsuario
      const usuarioQuery = `
        SELECT Nome
        FROM \`sd-gestao.CRM.CadUsuario\`
        WHERE IdUsuario = @IdUsuario
        LIMIT 1
      `;
      const usuarioOptionsHist = {
        query: usuarioQuery,
        params: { IdUsuario: UsuarioRelacionado },
      };
      const [usuarioRowsHist] = await bigquery.query(usuarioOptionsHist);
  
      const NomeUsuario = usuarioRowsHist.length > 0 ? usuarioRowsHist[0].Nome : 'Usuário Desconhecido';
  
      const IdHistorico = uuidv4();
      const Data = obterDataHoraBrasilia();
  
      const insertHistoricoQuery = `
        INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
        (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
        VALUES
        (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
      `;
      const insertHistoricoParams = {
        IdHistorico,
        IdCliente: atividade.ClienteRelacionado,
        IdUsuario: UsuarioRelacionado,
        NomeUsuario,
        Data,
        HistoricoStatus: historicoDescricao,
        HistoricoStatusGeral: '', // Pode ser ajustado conforme necessário
      };
  
      await bigquery.query({
        query: insertHistoricoQuery,
        params: insertHistoricoParams,
      });
  
      console.log(`Histórico de atualização da atividade ${atividadeId} registrado por ${NomeUsuario}.`);
  
      // 5. Retornar os dados da atividade atualizada
      // Buscar a atividade atualizada
      const [atividadeAtualizadaRows] = await bigquery.query({
        query: `
          SELECT *
          FROM \`sd-gestao.CRM.Atividades\`
          WHERE IdAtividade = @IdAtividade
          LIMIT 1
        `,
        params: { IdAtividade: atividadeId },
      });
  
      const atividadeAtualizada = atividadeAtualizadaRows.length > 0 ? atividadeAtualizadaRows[0] : null;
  
      res.json({
        success: true,
        message: 'Atividade atualizada com sucesso.',
        atividade: atividadeAtualizada,
      });
  
    } catch (error) {
      console.error('Erro ao editar atividade no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  /**
   * @route   GET /api/atividades/:id
   * @desc    Buscar uma atividade específica
   * @access  Autenticado
   */
  router.get('/api/atividades/:id', authenticateToken, async (req, res) => {
    const atividadeId = req.params.id;
    try {
      // Buscar a atividade no BigQuery
      const query = `
        SELECT *
        FROM \`sd-gestao.CRM.Atividades\`
        WHERE IdAtividade = @IdAtividade
        LIMIT 1
      `;
      const options = {
        query: query,
        params: { IdAtividade: atividadeId },
      };
  
      const [rows] = await bigquery.query(options);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Atividade não encontrada.' });
      }
  
      const atividade = rows[0];
  
      // Formatar as datas para 'yyyy-MM-dd HH:mm:ss'
      const formatarData = (dateTime) => {
        const date = new Date(dateTime);
        return isNaN(date) ? null : format(date, 'yyyy-MM-dd HH:mm:ss');
      };
  
      res.json({
        success: true,
        atividade: {
          ...atividade,
          DateTimeInicio: formatarData(atividade.DateTimeInicio),
          DateTimePrevisao: formatarData(atividade.DateTimePrevisao),
        },
      });
    } catch (error) {
      console.error('Erro ao buscar atividade no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  
  
  /**
   * @route   GET /api/padraoatividades
   * @desc    Obter atividades pré-definidas
   * @access  Autenticado
   */
  router.get('/api/padraoatividades', authenticateToken, async (req, res) => {
    try {
      const query = `
        SELECT IdPadraoAtividade, Nome, Descricao, AtividadeNum
        FROM \`sd-gestao.CRM.PadraoAtividade\`
        ORDER BY AtividadeNum ASC
      `;
      const options = {
        query: query,
        location: 'us-central1', // Ajuste conforme sua localização
      };
  
      const [rows] = await bigquery.query(options);
  
      res.json({ success: true, padraoAtividades: rows });
    } catch (error) {
      console.error('Erro ao buscar atividades pré-definidas no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  /**
   * @route   PUT /api/atividades/:id/concluir
   * @desc    Concluir uma atividade adicionando DescricaoConclusao e atualizando o StatusAtividade
   * @access  Autenticado
   */
  router.put('/api/atividades/:id/concluir',authenticateToken, async (req, res) => {
    const atividadeId = req.params.id;
    const { DescricaoConclusao } = req.body;
    const UsuarioRelacionado = req.user.id;
  
    // Validação do campo DescricaoConclusao
    if (!DescricaoConclusao || DescricaoConclusao.trim() === '') {
      return res.status(400).json({ success: false, message: 'A descrição da conclusão é obrigatória.' });
    }
  
    try {
      // 1. Verificar se a atividade existe e se o usuário tem permissão para concluir
      let acessoQuery = '';
      let acessoOptions = {};
  
      const userRole = req.user.cargo;
      const userUnit = req.user.unidade;
  
      if (userRole === 'ADMINISTRADOR') {
        // Administrador pode acessar qualquer atividade
        acessoQuery = `SELECT * FROM \`sd-gestao.CRM.Atividades\` WHERE IdAtividade = @IdAtividade LIMIT 1`;
        acessoOptions = { query: acessoQuery, params: { IdAtividade: atividadeId } };
      } else if (userRole === 'SUPERVISOR') {
        // Supervisor pode acessar atividades de clientes da mesma unidade
        acessoQuery = `
          SELECT a.*
          FROM \`sd-gestao.CRM.Atividades\` a
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON a.ClienteRelacionado = cc.IdCliente
          JOIN \`sd-gestao.CRM.CadUsuario\` cu ON cc.UsuarioRelacionado = cu.IdUsuario
          WHERE a.IdAtividade = @IdAtividade AND cu.Unidade = @Unidade
          LIMIT 1
        `;
        acessoOptions = { query: acessoQuery, params: { IdAtividade: atividadeId, Unidade: userUnit } };
      } else if (userRole === 'VENDEDOR') {
        // Vendedor pode acessar apenas suas próprias atividades
        acessoQuery = `
          SELECT a.*
          FROM \`sd-gestao.CRM.Atividades\` a
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON a.ClienteRelacionado = cc.IdCliente
          WHERE a.IdAtividade = @IdAtividade AND cc.UsuarioRelacionado = @UsuarioRelacionado
          LIMIT 1
        `;
        acessoOptions = { query: acessoQuery, params: { IdAtividade: atividadeId, UsuarioRelacionado } };
      } else {
        // Outros cargos não têm permissão
        return res.status(403).json({ success: false, message: 'Acesso negado.' });
      }
  
      const [acessoRows] = await bigquery.query(acessoOptions);
  
      if (acessoRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Atividade não encontrada ou acesso negado.' });
      }
  
      const atividade = acessoRows[0];
      const IdCliente = atividade.ClienteRelacionado;
  
      // 2. Atualizar a atividade no BigQuery
      const DateTimeConclusaoFormatted = formatarData(new Date());
  
      const updateAtividadeQuery = `
        UPDATE \`sd-gestao.CRM.Atividades\`
        SET DescricaoConclusao = @DescricaoConclusao,
            StatusAtividade = @StatusAtividade,
            DateTimeConclusao = @DateTimeConclusao
        WHERE IdAtividade = @IdAtividade
      `;
      const updateAtividadeParams = {
        DescricaoConclusao,
        StatusAtividade: 'Concluída',
        DateTimeConclusao: DateTimeConclusaoFormatted,
        IdAtividade: atividadeId,
      };
  
      await bigquery.query({
        query: updateAtividadeQuery,
        params: updateAtividadeParams,
        types: {
          DescricaoConclusao: 'STRING',
          StatusAtividade: 'STRING',
          DateTimeConclusao: 'STRING',
          IdAtividade: 'STRING',
        },
      });
  
      // 3. Registrar o histórico da conclusão
      const IdHistorico = uuidv4();
      const Data = obterDataHoraBrasilia();
  
      // Buscar o Nome do Usuário
      const usuarioQuery = `SELECT Nome FROM \`sd-gestao.CRM.CadUsuario\` WHERE IdUsuario = @IdUsuario LIMIT 1`;
      const usuarioOptionsHist = {
        query: usuarioQuery,
        params: { IdUsuario: UsuarioRelacionado },
        types: { IdUsuario: 'STRING' },
      };
  
      const [usuarioRowsHist] = await bigquery.query(usuarioOptionsHist);
  
      const NomeUsuario = usuarioRowsHist.length > 0 ? usuarioRowsHist[0].Nome : 'Usuário Desconhecido';
  
      const HistoricoStatus = `Atividade concluída com descrição: "${DescricaoConclusao}"`;
      const HistoricoStatusGeral = atividade.StatusRelacionado || '';
  
      await bigquery.query({
        query: `
          INSERT INTO \`sd-gestao.CRM.HistoricoCliente\`
          (IdHistorico, IdCliente, IdUsuario, NomeUsuario, Data, HistoricoStatus, HistoricoStatusGeral)
          VALUES
          (@IdHistorico, @IdCliente, @IdUsuario, @NomeUsuario, @Data, @HistoricoStatus, @HistoricoStatusGeral)
        `,
        params: {
          IdHistorico,
          IdCliente,
          IdUsuario: UsuarioRelacionado,
          NomeUsuario,
          Data,
          HistoricoStatus,
          HistoricoStatusGeral,
        },
        types: {
          IdHistorico: 'STRING',
          IdCliente: 'STRING',
          IdUsuario: 'STRING',
          NomeUsuario: 'STRING',
          Data: 'STRING',
          HistoricoStatus: 'STRING',
          HistoricoStatusGeral: 'STRING',
        },
      });
  
      console.log(`Atividade ${atividadeId} concluída por ${NomeUsuario}. Histórico registrado.`);
  
      // 4. Recuperar a atividade atualizada para retornar ao frontend
      const selectAtividadeAtualizadaQuery = `
        SELECT *
        FROM \`sd-gestao.CRM.Atividades\`
        WHERE IdAtividade = @IdAtividade
        LIMIT 1
      `;
      const selectAtividadeAtualizadaParams = { IdAtividade: atividadeId };
  
      const [atividadeAtualizadaRows] = await bigquery.query({
        query: selectAtividadeAtualizadaQuery,
        params: selectAtividadeAtualizadaParams,
      });
  
      const atividadeAtualizada = atividadeAtualizadaRows.length > 0 ? atividadeAtualizadaRows[0] : null;
  
      if (!atividadeAtualizada) {
        return res.status(404).json({ success: false, message: 'Atividade não encontrada após atualização.' });
      }
  
      res.json({
        success: true,
        message: 'Atividade concluída com sucesso.',
        atividade: atividadeAtualizada,
      });
  
    } catch (error) {
      console.error('Erro ao concluir atividade no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });
  
  
  
  /**
   * @route   GET /api/clientes/:id/historico
   * @desc    Buscar o histórico de movimentação de um cliente
   * @access  Autenticado
   */
  router.get('/api/clientes/:IdCliente/historico', authenticateToken, async (req, res) => {
    const { IdCliente } = req.params;
    const userRole = req.user.cargo;
    const userUnit = req.user.unidade;
    const UsuarioRelacionado = req.user.id;
  
    try {
      let historicoQuery = '';
      let historicoOptions = {};
  
      if (userRole === 'ADMINISTRADOR') {
        historicoQuery = `
          SELECT hc.*, cu.Nome AS NomeUsuario, s.Status AS StatusNome, s.StatusGeral AS StatusGeralNome
          FROM \`sd-gestao.CRM.HistoricoCliente\` hc
          LEFT JOIN \`sd-gestao.CRM.CadUsuario\` cu ON hc.IdUsuario = cu.IdUsuario
          LEFT JOIN \`sd-gestao.CRM.Status\` s ON hc.HistoricoStatusGeral = s.IdStatus
          WHERE hc.IdCliente = @IdCliente
          ORDER BY hc.Data DESC
        `;
        historicoOptions = { query: historicoQuery, params: { IdCliente } };
      } else if (userRole === 'SUPERVISOR') {
        historicoQuery = `
          SELECT hc.*, cu.Nome AS NomeUsuario, s.Status AS StatusNome, s.StatusGeral AS StatusGeralNome
          FROM \`sd-gestao.CRM.HistoricoCliente\` hc
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON hc.IdCliente = cc.IdCliente
          JOIN \`sd-gestao.CRM.CadUsuario\` cu ON cc.UsuarioRelacionado = cu.IdUsuario
          LEFT JOIN \`sd-gestao.CRM.Status\` s ON hc.HistoricoStatusGeral = s.IdStatus
          WHERE hc.IdCliente = @IdCliente AND cu.Unidade = @Unidade
          ORDER BY hc.Data DESC
        `;
        historicoOptions = { query: historicoQuery, params: { IdCliente, Unidade: userUnit } };
      } else {
        historicoQuery = `
          SELECT hc.*, cu.Nome AS NomeUsuario, s.Status AS StatusNome, s.StatusGeral AS StatusGeralNome
          FROM \`sd-gestao.CRM.HistoricoCliente\` hc
          JOIN \`sd-gestao.CRM.Atividades\` a ON hc.IdCliente = a.ClienteRelacionado
          JOIN \`sd-gestao.CRM.CadCliente\` cc ON a.ClienteRelacionado = cc.IdCliente
          JOIN \`sd-gestao.CRM.CadUsuario\` cu ON cc.UsuarioRelacionado = cu.IdUsuario
          LEFT JOIN \`sd-gestao.CRM.Status\` s ON hc.HistoricoStatusGeral = s.IdStatus
          WHERE cc.UsuarioRelacionado = @UsuarioRelacionado AND hc.IdCliente = @IdCliente
          ORDER BY hc.Data DESC
        `;
        historicoOptions = { query: historicoQuery, params: { UsuarioRelacionado, IdCliente } };
      }
  
      const [historicoRows] = await bigquery.query(historicoOptions);
  
      res.json({
        success: true,
        historico: historicoRows,
      });
  
    } catch (error) {
      console.error('Erro ao buscar histórico de cliente no BigQuery:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  });

// Exportar o roteador
export default router;
