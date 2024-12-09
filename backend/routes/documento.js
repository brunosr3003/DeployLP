// documento.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';
import 'dotenv/config';
import multer from 'multer';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken'; // Para autenticação (se necessário)


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

// Inicializa o cliente do Google Drive
const drive = google.drive({
  version: 'v3',
  auth,
});

// Middleware para verificar o token JWT (opcional, dependendo da sua implementação de autenticação)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido.' });
    req.user = user;
    next();
  });
};

router.get('/api/documentos', authenticateToken, async (req, res) => {
  const { clienteId } = req.query;

  if (!clienteId) {
    return res.status(400).json({ success: false, message: 'clienteId é obrigatório.' });
  }

  const query = `
  SELECT 
    d.IdDadosContrato, 
    d.DataContrato, 
    d.StatusAutorizacao, 
    d.DescricaoStatus, 
    d.nomeCompletoResponsavel,

    ARRAY_AGG(
      STRUCT(
        s.IdDocSign,
        s.FileName,
        s.uploadedTime,
        s.DeadlineTime,
        s.SignerName1,
        s.SignerName2,
        s.SignerName3,
        s.SignerName4,
        s.SignerEmail1,
        s.SignerEmail2,
        s.SignerEmail3,
        s.SignerEmail4,
        s.SignerStatus1,
        s.SignerStatus2,
        s.SignerStatus3,
        s.SignerStatus4,
        s.StatusDocSign
      )
    ) AS CadDadosSign
  FROM \`sd-gestao.CRM.CadDadosDoc\` d
  LEFT JOIN \`sd-gestao.CRM.CadDadosSign\` s 
    ON s.DadosContratoRelacionado = d.IdDadosContrato
  WHERE d.ClienteRelacionado = @clienteId
  GROUP BY 
    d.IdDadosContrato, 
    d.DataContrato, 
    d.StatusAutorizacao, 
    d.DescricaoStatus, 
    d.nomeCompletoResponsavel
  ORDER BY d.DataContrato DESC
`;

  const options = {
    query: query,
    params: { clienteId: clienteId },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    return res.status(200).json({ success: true, documentos: rows });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar documentos.' });
  }
});

// Endpoint POST /documentos
router.post('/api/documentos', authenticateToken, upload.single('documento'), async (req, res) => {
  const { IdDadosContrato, ClienteRelacionado } = req.body;
  const file = req.file;

  // `DataContrato` será definida como a data atual no momento do upload
  const DataContrato = new Date().toISOString();

  if (!IdDadosContrato || !ClienteRelacionado || !file) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Upload do arquivo para o Google Drive
    const fileMetadata = {
      name: file.originalname,
      parents: ['<YOUR_GOOGLE_DRIVE_FOLDER_ID>'], // Substitua pelo ID da pasta no Google Drive onde deseja armazenar os documentos
    };
    const media = {
      mimeType: file.mimetype,
      body: Buffer.from(file.buffer),
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    const fileId = driveResponse.data.id;
    const fileLink = driveResponse.data.webViewLink;

    // Inserir novo documento no BigQuery com status padrão
    const insertQuery = `
    INSERT INTO \`sd-gestao.CRM.CadDadosDoc\` (
      IdDadosContrato, 
      DataContrato, 
      ClienteRelacionado, 
      LinkDocumento,
      StatusAutorizacao,
      StatusDocumento,       // Adicionado
      DescricaoStatus
    )
    VALUES (
      @IdDadosContrato, 
      @DataContrato, 
      @ClienteRelacionado, 
      @LinkDocumento,
      'Necessita Autorização',
      'ABERTO',              // Valor inicial para StatusDocumento
      ''
    )
  `;
  
  const insertOptions = {
    query: insertQuery,
    params: {
      IdDadosContrato,
      DataContrato,
      ClienteRelacionado,
      LinkDocumento: fileLink,
    },
  };
  
  await bigquery.query(insertOptions);
  
  return res.status(201).json({
    success: true,
    message: 'Documento carregado com sucesso.',
    documento: {
      IdDadosContrato,
      DataContrato,
      ClienteRelacionado,
      LinkDocumento: fileLink,
      StatusAutorizacao: 'Necessita Autorização',
      StatusDocumento: 'ABERTO',    // Retornar também no response
      DescricaoStatus: '',
    },
  });
  
  } catch (error) {
    console.error('Erro ao carregar documento:', error);
    return res.status(500).json({ success: false, message: 'Erro ao carregar documento.' });
  }
});


export default router;

