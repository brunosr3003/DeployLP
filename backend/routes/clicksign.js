// clicksign.js

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config';
import multer from 'multer';
import jwt from 'jsonwebtoken'; // Para autenticação
import { google } from 'googleapis';
import { BigQuery } from '@google-cloud/bigquery';
import { Readable } from 'stream';

const router = express.Router();

// Aqui definimos o mapeamento
let signerToDocumentMap = {};

function findDocumentKeyBySignerKey(signerKey) {
  return signerToDocumentMap[signerKey] || null;
}


// Configuração de upload com multer
const upload = multer({ storage: multer.memoryStorage() });

// Autenticação e API Key
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ success: false, message: 'Acesso negado. Chave de API inválida.' });
  }
  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido.' });
    req.user = user;
    next();
  });
};

// Inicializa o cliente do BigQuery
const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

// Configuração da autenticação com o Google APIs
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive',
  ],
});

const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

// Armazenar signatários por documentKey
let documentosSignatarios = {};

// Funções de Manipulação de Eventos

async function handleAddSigner(data) {
  const { signers } = data;

  if (!signers || !Array.isArray(signers)) {
    console.error('Signers inválidos no evento add_signer:', signers);
    return;
  }

  for (const signer of signers) {
    const { key, email, name } = signer;

    if (!key) {
      console.error('Signatário sem key:', signer);
      continue;
    }

    // Encontrar o document_key associado ao signer_key
    const document_key = findDocumentKeyBySignerKey(key);

    if (!document_key) {
      console.error(`Não foi encontrado o document_key para signer_key: ${key}`);
      continue;
    }

    try {
      // Atualizar o status no BigQuery
      await bigquery.query({
        query: `
          UPDATE \`sd-gestao.CRM.CadDadosSign\`
          SET 
            SignerStatus1 = IF(IdSignatario1 = @signerKey, 'ESPERANDO ASSINATURA', SignerStatus1),
            SignerStatus2 = IF(IdSignatario2 = @signerKey, 'ESPERANDO ASSINATURA', SignerStatus2),
            SignerStatus3 = IF(IdSignatario3 = @signerKey, 'ESPERANDO ASSINATURA', SignerStatus3),
            SignerStatus4 = IF(IdSignatario4 = @signerKey, 'ESPERANDO ASSINATURA', SignerStatus4)
          WHERE IdDocSign = @documentKey
        `,
        params: {
          signerKey: key,
          documentKey: document_key
        },
      });

      // Atualizar o mapeamento
      signerToDocumentMap[key] = document_key;

      // Atualizar a estrutura in-memory
      if (documentosSignatarios[document_key]) {
        documentosSignatarios[document_key].push({
          request_signature_key: null, // Pode ser necessário obter este valor
          signer_key: key,
          name: name,
          email: email,
        });
      }

      console.log(`Signatário ${email} adicionado ao documento ${document_key}.`);
    } catch (error) {
      console.error(`Erro ao atualizar o status no BigQuery para o signatário ${email}:`, error);
    }
  }
}


async function handleSign(data) {
  const { signer } = data;

  console.log('----- Processando Evento sign -----');
  console.log('Dados do Signer:', JSON.stringify(signer, null, 2));

  if (!signer || !signer.key) {
    console.error('Dados do signer inválidos:', signer);
    return;
  }

  const document_key = findDocumentKeyBySignerKey(signer.key);

  if (!document_key) {
    console.error(`Não foi encontrado o document_key para signer_key: ${signer.key}`);
    return;
  }

  console.log(`Atualizando status para o documento: ${document_key}`);

  try {
    // Atualizar o status do signatário para 'ASSINADO'
    await bigquery.query({
      query: `
        UPDATE \`sd-gestao.CRM.CadDadosSign\`
        SET 
          SignerStatus1 = IF(IdSignatario1 = @signerKey, 'ASSINADO', SignerStatus1),
          SignerStatus2 = IF(IdSignatario2 = @signerKey, 'ASSINADO', SignerStatus2),
          SignerStatus3 = IF(IdSignatario3 = @signerKey, 'ASSINADO', SignerStatus3),
          SignerStatus4 = IF(IdSignatario4 = @signerKey, 'ASSINADO', SignerStatus4)
        WHERE IdDocSign = @documentKey
      `,
      params: {
        signerKey: signer.key,
        documentKey: document_key
      },
    });

    console.log(`Signatário ${signer.email} assinou o documento ${document_key}.`);

    // Verificar se todos os signatários válidos assinaram
    const checkQuery = `
      SELECT 
        SignerStatus1, 
        SignerStatus2, 
        SignerStatus3, 
        SignerStatus4,
        IdSignatario1,
        IdSignatario2,
        IdSignatario3,
        IdSignatario4
      FROM \`sd-gestao.CRM.CadDadosSign\`
      WHERE IdDocSign = @documentKey
    `;
    const checkOptions = {
      query: checkQuery,
      params: { documentKey: document_key },
    };

    const [statusRows] = await bigquery.query(checkOptions);

    if (statusRows.length === 0) {
      console.error(`Nenhum registro encontrado na CadDadosSign para document_key: ${document_key}`);
      return;
    }

    const status = statusRows[0];

    // Mapeamento dos status e das chaves dos signatários
    const signers = [
      { status: status.SignerStatus1, key: status.IdSignatario1 },
      { status: status.SignerStatus2, key: status.IdSignatario2 },
      { status: status.SignerStatus3, key: status.IdSignatario3 },
      { status: status.SignerStatus4, key: status.IdSignatario4 },
    ];

    // Filtrar apenas os signatários válidos (com chave não vazia ou não nula)
    const validSigners = signers.filter(signer => signer.key && signer.key.trim() !== '');

    // Verificar se todos os signatários válidos têm status 'ASSINADO'
    const allSigned = validSigners.every(signer => signer.status === 'ASSINADO');

    if (allSigned) {
      // Atualizar StatusDocumento para 'FECHADO'
      const updateStatusQuery = `
        UPDATE \`sd-gestao.CRM.CadDadosSign\`
        SET StatusDocSign = 'FECHADO',
            StatusDocumento = 'FECHADO'
        WHERE IdDocSign = @documentKey
      `;
      const updateStatusOptions = {
        query: updateStatusQuery,
        params: { documentKey: document_key },
      };

      await bigquery.query(updateStatusOptions);

      console.log(`StatusDocumento do documento ${document_key} foi atualizado para 'FECHADO'.`);
    }
  } catch (error) {
    console.error(`Erro ao atualizar o status no BigQuery para o signatário ${signer.email}:`, error);
  }
}




async function handleRefusal(data) {
  const { document_key, signer } = data; // Ajuste conforme a estrutura do webhook

  await bigquery.query({
    query: `
      UPDATE \`sd-gestao.CRM.CadDadosSign\`
      SET 
        SignerStatus1 = IF(IdSignatario1 = @signerKey, 'Refused', SignerStatus1),
        SignerStatus2 = IF(IdSignatario2 = @signerKey, 'Refused', SignerStatus2),
        SignerStatus3 = IF(IdSignatario3 = @signerKey, 'Refused', SignerStatus3),
        SignerStatus4 = IF(IdSignatario4 = @signerKey, 'Refused', SignerStatus4)
      WHERE IdDocSign = @documentKey
    `,
    params: {
      signerKey: signer.key,
      documentKey: document_key
    },
  });

  console.log(`Signatário ${signer.email} recusou o documento ${document_key}.`);
}

async function handleAutoClose(data) {
  const { document_id } = data;

  const [rows] = await bigquery.query({
    query: `
      SELECT signers
      FROM \`sd-gestao.CRM.CadDadosDoc\`
      WHERE IdDadosContrato = @document_id
    `,
    params: {
      document_id,
    },
  });

  if (rows.length > 0) {
    const signers = rows[0].signers;
    const allSigned = signers.every(signer => signer.status === 'ASSINADO');

    let newStatus = '';
    let descricao = '';

    if (allSigned) {
      newStatus = 'TODOS ASSINARAM';
      descricao = 'Todos os signatários assinaram o documento.';
    } else {
      newStatus = 'SIGNATÁRIOS PENDENTES';
      descricao = 'Ainda há signatários pendentes para assinar.';
    }

    await bigquery.query({
      query: `
        UPDATE \`sd-gestao.CRM.CadDadosDoc\`
        SET StatusAutorizacao = @newStatus, DescricaoStatus = @descricao
        WHERE IdDadosContrato = @document_id
      `,
      params: {
        newStatus,
        descricao,
        document_id,
      },
    });

    console.log(`Documento ${document_id} atualizado para status: ${newStatus}`);
  }
}

async function handleDeadline(data) {
  const { document_id } = data;

  // Lógica para lidar com o deadline atingido
  // Por exemplo, cancelar o documento se ainda houver signatários pendentes
  const [rows] = await bigquery.query({
    query: `
      SELECT signers
      FROM \`sd-gestao.CRM.CadDadosDoc\`
      WHERE IdDadosContrato = @document_id
    `,
    params: {
      document_id,
    },
  });

  if (rows.length > 0) {
    const signers = rows[0].signers;
    const pending = signers.some(signer => signer.status === 'ESPERANDO ASSINATURA');

    if (pending) {
      await bigquery.query({
        query: `
          UPDATE \`sd-gestao.CRM.CadDadosDoc\`
          SET StatusAutorizacao = 'Cancelled', DescricaoStatus = 'Prazo de assinatura atingido.'
          WHERE IdDadosContrato = @document_id
        `,
        params: {
          document_id,
        },
      });

      console.log(`Prazo de assinatura atingido. Documento ${document_id} foi cancelado.`);
    }
  }
}

async function handleDocumentClosed(data) {
  const { document_id } = data;

  await bigquery.query({
    query: `
      UPDATE \`sd-gestao.CRM.CadDadosDoc\`
      SET StatusAutorizacao = 'Document Ready for Download', DescricaoStatus = 'Documento finalizado e pronto para download.'
      WHERE IdDadosContrato = @document_id
    `,
    params: {
      document_id,
    },
  });

  console.log(`Documento ${document_id} está pronto para download.`);
}

async function handleClose(data) {
  const { document_id } = data;

  await bigquery.query({
    query: `
      UPDATE \`sd-gestao.CRM.CadDadosDoc\`
      SET StatusAutorizacao = 'Document Manually Closed', DescricaoStatus = 'Documento finalizado manualmente.'
      WHERE IdDadosContrato = @document_id
    `,
    params: {
      document_id,
    },
  });

  console.log(`Documento ${document_id} foi finalizado manualmente.`);
}

async function handleUpdateDeadline(data) {
  const { document_id, new_deadline } = data;

  await bigquery.query({
    query: `
      UPDATE \`sd-gestao.CRM.CadDadosDoc\`
      SET deadline = @new_deadline, DescricaoStatus = 'Prazo de assinatura atualizado.'
      WHERE IdDadosContrato = @document_id
    `,
    params: {
      document_id,
      new_deadline,
    },
  });

  console.log(`Prazo de assinatura do documento ${document_id} foi atualizado para ${new_deadline}.`);
}

// Função para criar um documento a partir de um template
async function criarDocumentoAPartirDeTemplate(templateId, nomeDoNovoDocumento, dados, folderId) {
  try {
    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: nomeDoNovoDocumento,
        parents: [folderId],
      },
    });

    const novoDocumentoId = response.data.id;

    console.log(`Documento criado com ID: ${novoDocumentoId}`);

    await substituirVariaveisNoDocumento(novoDocumentoId, dados);

    return novoDocumentoId;
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error;
  }
}

// Função para substituir variáveis no documento
async function substituirVariaveisNoDocumento(documentId, dados) {
  try {
    const requests = [];

    for (const [chave, valor] of Object.entries(dados)) {
      const valorString = valor !== undefined ? String(valor) : '';

      requests.push({
        replaceAllText: {
          containsText: {
            text: `{{${chave}}}`,
            matchCase: true,
          },
          replaceText: valorString,
        },
      });
    }

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    console.log('Variáveis substituídas com sucesso!');
  } catch (error) {
    console.error('Erro ao substituir variáveis:', error);
    throw error;
  }
}

// Função para compartilhar o documento com um usuário
async function compartilharDocumento(documentId, email) {
  try {
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: email,
      },
    });

    console.log(`Documento compartilhado com ${email} com sucesso!`);
  } catch (error) {
    console.error('Erro ao compartilhar o documento:', error);
    throw error;
  }
}

// Função para obter o conteúdo do documento em Base64
async function getDriveFileContentAsBase64(fileId) {
  try {
    const response = await drive.files.export(
      {
        fileId: fileId,
        mimeType: 'application/pdf',
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const buffer = Buffer.from(response.data, 'binary');
    return buffer.toString('base64');
  } catch (error) {
    console.error('Erro ao obter o conteúdo do arquivo do Google Drive:', error);
    throw error;
  }
}

// Função para criar signatário
async function criarSignatario(signatario) {
  try {
    const response = await fetch(`https://sandbox.clicksign.com/api/v1/signers?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signer: {
          name: signatario.nome,
          email: signatario.email,
          phone_number: signatario.telefone,
          auths: signatario.auths,
          delivery: signatario.delivery,
          documentation: signatario.cpf || null,
          facial_biometrics_enabled: signatario.facial_biometrics_enabled || false, // Aplicar condicionalmente
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao criar signatário na Clicksign:', errorData);
      throw new Error('Erro ao criar signatário');
    }

    const data = await response.json();
    console.log(`Signatário ${signatario.nome} criado com sucesso:`, data);
    // Removi a linha duplicada
    return data.signer.key;
  } catch (error) {
    console.error('Erro ao criar signatário:', error);
    throw error;
  }
}

// Função para associar signatário ao documento
async function associarSignatarioAoDocumento(documentKey, signerKey, signOrder) {
  try {
    const response = await fetch(`https://sandbox.clicksign.com/api/v1/lists?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        list: {
          document_key: documentKey,
          signer_key: signerKey,
          sign_as: 'sign',
          order: signOrder,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao associar signatário ao documento:', errorData);
      throw new Error('Erro ao associar signatário ao documento');
    }

    const data = await response.json();
    console.log('Signatário associado ao documento com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao associar signatário ao documento:', error);
    throw error;
  }
}

// Função para notificar por WhatsApp
async function notificarPorWhatsApp(requestSignatureKey, signerName) {
  try {
    if (signerName === 'Verificador de Contratos') {
      console.log(`O verificador (${signerName}) não será notificado via Whatssandbox.`);
      return;
    }

    const response = await fetch(`https://sandbox.clicksign.com/api/v1/notify_by_whatsapp?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_signature_key: requestSignatureKey,
      }),
    });

    const responseStatus = response.status;
    const responseText = await response.text();

    console.log(`Status da resposta: ${responseStatus}`);
    console.log(`Texto da resposta: ${responseText}`);

    if (responseStatus === 202) {
      console.log(`Notificação enviada com sucesso para o signatário com chave ${requestSignatureKey}`);
    } else if (responseStatus === 404) {
      console.error('Erro 404: Verifique se o endpoint está correto e se o recurso está disponível no ambiente sandbox.');
      throw new Error('Erro 404: Endpoint não encontrado ou recurso não disponível.');
    } else {
      console.warn('Resposta inesperada ou vazia ao notificar signatário pelo Whatssandbox. Tentando novamente em 3 segundos...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Tentativa adicional
      const retryResponse = await fetch(`https://sandbox.clicksign.com/api/v1/notify_by_whatsapp?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_signature_key: requestSignatureKey,
        }),
      });

      const retryResponseStatus = retryResponse.status;
      const retryResponseText = await retryResponse.text();
      console.log(`Status da resposta na tentativa adicional: ${retryResponseStatus}`);
      console.log(`Texto da resposta na tentativa adicional: ${retryResponseText}`);

      if (retryResponseStatus === 202) {
        console.log(`Notificação enviada com sucesso para o signatário com chave ${requestSignatureKey} na tentativa adicional`);
      } else {
        console.error('Erro ao notificar signatário pelo WhatsApp após a tentativa adicional:', retryResponseText || 'Resposta vazia');
        throw new Error(`Erro ao notificar signatário: ${retryResponseText || 'Resposta vazia'}`);
      }
    }
  } catch (error) {
    console.error('Erro ao notificar signatário pelo WhatsApp:', error);
    throw error;
  }
}

// Função para notificar por Email
async function notificarPorEmail(requestSignatureKey) {
  try {
    const response = await fetch(`https://sandbox.clicksign.com/api/v1/notifications?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_signature_key: requestSignatureKey,
      }),
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    console.log(`Status da resposta: ${responseStatus}`);
    console.log(`Texto da resposta: ${responseText}`);

    if (responseStatus === 202) {
      console.log(`Notificação por e-mail enviada com sucesso para o signatário com chave ${requestSignatureKey}`);
    } else {
      console.error(`Erro ao notificar signatário por e-mail. Status: ${responseStatus}, Resposta: ${responseText}`);
      throw new Error(`Erro ao notificar signatário por e-mail: ${responseText || 'Resposta vazia'}`);
    }
  } catch (error) {
    console.error('Erro ao notificar signatário por e-mail:', error);
    throw error;
  }
}

// Função para criar ordem de assinatura
// Função para criar ordem de assinatura
async function criarOrdemAssinatura(documentKey, signatarios) {
  try {
    const signerKeys = [];
    const requestSignatureKeys = [];

    for (let i = 0; i < signatarios.length; i++) {
      const signerKey = await criarSignatario(signatarios[i]);
      signerKeys.push(signerKey);
      const associacao = await associarSignatarioAoDocumento(documentKey, signerKey, i + 1);
      requestSignatureKeys.push(associacao.list.request_signature_key);
    }

    documentosSignatarios[documentKey] = requestSignatureKeys.map((key, index) => ({
      request_signature_key: key,
      signer_key: signerKeys[index],
      name: signatarios[index].nome,
      email: signatarios[index].email,
    }));

    // Atualiza o mapeamento signer_key -> document_key
    signerKeys.forEach((key) => {
      signerToDocumentMap[key] = documentKey;
    });

    console.log('Signatários armazenados para o documento:', documentosSignatarios[documentKey]);

    // Notificar primeiro signatário
    if (signatarios[0].nome === 'Verificador de Contratos') {
      await notificarPorEmail(requestSignatureKeys[0]);
      console.log('Notificação por e-mail enviada para o verificador.');
    } else {
      await notificarPorWhatsApp(requestSignatureKeys[0], signatarios[0].nome);
      console.log('Ordem de assinatura criada e primeira notificação enviada com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao criar ordem de assinatura:', error);
    throw error;
  }
}


// Função para obter o próximo signatário
async function getNextSigner(documentKey, currentSignerKey) {
  const docSigners = documentosSignatarios[documentKey];

  if (!docSigners) {
    console.error('Signatários para o documento não encontrados.');
    return null;
  }

  const currentSignerIndex = docSigners.findIndex(signer => signer.signer_key === currentSignerKey);

  if (currentSignerIndex !== -1 && currentSignerIndex < docSigners.length - 1) {
    console.log(`Próximo signatário é: ${docSigners[currentSignerIndex + 1].name}`);
    return docSigners[currentSignerIndex + 1];
  }

  console.log('Nenhum próximo signatário encontrado ou todos já assinaram.');
  return null;
}

// Função para criar documento se necessário
async function criarDocumentoSeNecessario(templateId, nomeDoNovoDocumento, dados, condicao, folderId, signatarios, IdDadosContrato) {
  if (condicao) {
    try {
      // Verifica se o documento já foi criado anteriormente
      console.log(`Criando documento "${nomeDoNovoDocumento}"...`);
      const novoDocumentoId = await criarDocumentoAPartirDeTemplate(templateId, nomeDoNovoDocumento, dados, folderId);
      const base64Content = await getDriveFileContentAsBase64(novoDocumentoId);

      // Enviar o documento para a Clicksign e associar os signatários apenas se ainda não foi enviado
      console.log(`Enviando documento "${nomeDoNovoDocumento}" para Clicksign...`);
      const documentData = await enviarParaClicksign(base64Content, nomeDoNovoDocumento, signatarios, IdDadosContrato);

      return novoDocumentoId;
    } catch (error) {
      console.error(`Erro ao criar o documento "${nomeDoNovoDocumento}":`, error);
      throw error;
    }
  } else {
    console.log(`Condição para criar o documento "${nomeDoNovoDocumento}" não foi satisfeita.`);
  }
}

// Função para enviar documento para ClickSign
async function enviarParaClicksign(base64Content, nomeDocumento, signatarios, IdDadosContrato) {
  try {
    // Ajustar o caminho do documento para começar com "/"
    const caminhoDocumento = nomeDocumento.startsWith('/') ? nomeDocumento : `/${nomeDocumento}`;

    // Adicionar a extensão caso não exista
    const nomeComExtensao = caminhoDocumento.endsWith('.pdf') ? caminhoDocumento : `${caminhoDocumento}.pdf`;

    const response = await fetch(`https://sandbox.clicksign.com/api/v1/documents?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document: {
          path: nomeComExtensao,
          content_base64: `data:application/pdf;base64,${base64Content}`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar o documento para Clicksign:', errorData);
      throw new Error('Erro ao enviar o documento para Clicksign');
    }

    const documentData = await response.json();
    console.log('Documento enviado com sucesso para Clicksign:', documentData);

    const documentKey = documentData.document.key;
    await criarOrdemAssinatura(documentKey, signatarios);

    // Após criar a ordem de assinatura, temos `documentosSignatarios[documentKey]` com o nome e e-mail dos signatários
    const signers = documentosSignatarios[documentKey] || [];
    const signerName1 = signers[0]?.name || '';
    const signerName2 = signers[1]?.name || '';
    const signerName3 = signers[2]?.name || '';
    const signerName4 = signers[3]?.name || '';
    const signerEmail1 = signers[0]?.email || '';
    const signerEmail2 = signers[1]?.email || '';
    const signerEmail3 = signers[2]?.email || '';
    const signerEmail4 = signers[3]?.email || '';

    const IdSignatario1 = signers[0]?.signer_key || '';
    const IdSignatario2 = signers[1]?.signer_key || '';
    const IdSignatario3 = signers[2]?.signer_key || '';
    const IdSignatario4 = signers[3]?.signer_key || '';

    // Inserir os dados no BigQuery
    await bigquery.query({
      query: `
        INSERT INTO \`sd-gestao.CRM.CadDadosSign\`
          (IdDocSign, FileName, uploadedTime, DeadlineTime, SignerName1, SignerName2, SignerName3, SignerName4, StatusDocSign, SignerEmail1, SignerEmail2, SignerEmail3, SignerEmail4, DadosContratoRelacionado, IdSignatario1, IdSignatario2, IdSignatario3, IdSignatario4, SignerStatus1, SignerStatus2, SignerStatus3, SignerStatus4, StatusDocumento)
        VALUES
          (@IdDocSign, @FileName, @uploadedTime, @DeadlineTime, @SignerName1, @SignerName2, @SignerName3, @SignerName4, @StatusDocSign, @SignerEmail1, @SignerEmail2, @SignerEmail3, @SignerEmail4, @DadosContratoRelacionado, @IdSignatario1, @IdSignatario2, @IdSignatario3, @IdSignatario4, 'ESPERANDO ASSINATURA', 'ESPERANDO ASSINATURA', 'ESPERANDO ASSINATURA', 'ESPERANDO ASSINATURA', 'ABERTO')
      `,
      params: {
        IdDocSign: documentData.document.key,
        FileName: documentData.document.filename,
        uploadedTime: documentData.document.uploaded_at,
        DeadlineTime: documentData.document.deadline_at,
        SignerName1: signerName1,
        SignerName2: signerName2,
        SignerName3: signerName3,
        SignerName4: signerName4,
        StatusDocSign: 'ABERTO',
        SignerEmail1: signerEmail1,
        SignerEmail2: signerEmail2,
        SignerEmail3: signerEmail3,
        SignerEmail4: signerEmail4,
        DadosContratoRelacionado: IdDadosContrato,
        IdSignatario1: IdSignatario1,
        IdSignatario2: IdSignatario2,
        IdSignatario3: IdSignatario3,
        IdSignatario4: IdSignatario4,
      },
    });
    

    console.log(`Dados do documento ${documentData.document.filename} inseridos na tabela CadDadosSign com sucesso.`);

    return documentData;
  } catch (error) {
    console.error('Erro ao enviar o documento para Clicksign e inserir dados:', error);
    throw error;
  }
}

// Endpoint para criar todos os documentos necessários
router.post('/api/criarDocumentos', authenticateToken, async (req, res) => {
  const { IdDadosContrato } = req.body;

  if (!IdDadosContrato) {
    return res.status(400).json({ erro: 'IdDadosContrato é obrigatório.' });
  }

  try {


    const checkOpenDocumentsQuery = `
      SELECT COUNT(*) AS openCount
      FROM \`sd-gestao.CRM.CadDadosSign\`
      WHERE DadosContratoRelacionado = @IdDadosContrato AND StatusDocSign = 'ABERTO'
    `;

    const checkOpenDocumentsOptions = {
      query: checkOpenDocumentsQuery,
      params: { IdDadosContrato },
    };

    const [checkRows] = await bigquery.query(checkOpenDocumentsOptions);

    if (checkRows.length > 0 && checkRows[0].openCount > 0) {
      return res.status(400).json({ erro: 'Existem documentos abertos para este contrato. Não é possível criar novos documentos até que todos sejam fechados ou cancelados.' });
    }


    
    const contratoQuery = `
      SELECT *
      FROM \`sd-gestao.CRM.CadDadosDoc\`
      WHERE IdDadosContrato = @IdDadosContrato
      LIMIT 1
    `;

    const optionsContrato = {
      query: contratoQuery,
      params: { IdDadosContrato },
    };

    const [contratoRows] = await bigquery.query(optionsContrato);

    if (contratoRows.length === 0) {
      throw new Error('Contrato não encontrado.');
    }

    const contratoData = contratoRows[0];

    const consultantQuery = `
      SELECT Unidade, Nome, Email, Telefone, CPF
      FROM \`sd-gestao.CRM.CadUsuario\`
      WHERE CPF = @CPFconsultorResponsavel
      LIMIT 1
    `;

    const optionsConsultant = {
      query: consultantQuery,
      params: { CPFconsultorResponsavel: contratoData.CPFconsultorResponsavel },
    };

    const [consultantRows] = await bigquery.query(optionsConsultant);

    if (consultantRows.length === 0) {
      throw new Error('Consultor não encontrado no banco de dados.');
    }

    const consultor = consultantRows[0];
    const unidadeConsultor = consultor.Unidade;

    // **Passo 3: Buscar o supervisor dessa unidade**
    const supervisorQuery = `
      SELECT Nome, Email, Telefone, CPF
      FROM \`sd-gestao.CRM.CadUsuario\`
      WHERE Cargo = 'SUPERVISOR' AND Unidade = @unidadeConsultor
      LIMIT 1
    `;

    const optionsSupervisor = {
      query: supervisorQuery,
      params: { unidadeConsultor },
    };

    const [supervisorRows] = await bigquery.query(optionsSupervisor);

    if (supervisorRows.length === 0) {
      throw new Error('Supervisor não encontrado para a unidade do consultor.');
    }

    const supervisor = supervisorRows[0];

    // **Passo 4: Definir a ordem de signatários**
    const signatarios = [
      {
        nome: consultor.Nome,
        email: consultor.Email,
        telefone: consultor.Telefone,
        cpf: consultor.CPF,
        auths: ['whatsapp'],
        delivery: ['email'],
        facial_biometrics_enabled: false, // Não habilitar biometria facial
      },
      {
        nome: supervisor.Nome,
        email: supervisor.Email,
        telefone: supervisor.Telefone,
        cpf: supervisor.CPF,
        auths: ['whatsapp'],
        delivery: ['email'],
        facial_biometrics_enabled: false, // Não habilitar biometria facial
      },
      {
        nome: contratoData.nomeTitularProjeto,
        email: contratoData.emailResponsavel,
        telefone: contratoData.telefoneResponsavel, // Mantém telefoneResponsavel para outros documentos
        cpf: contratoData.cpfCliente,
        auths: ['whatsapp'],
        delivery: ['email'],
        facial_biometrics_enabled: false, // Habilitar biometria facial para o Cliente
      },
      {
        nome: contratoData.verificadorContrato,
        email: contratoData.emailVerificadorContrato,
        telefone: contratoData.telefoneverificadorContrato,
        auths: ['email'],
        delivery: ['email'],
        facial_biometrics_enabled: false, // Não habilitar biometria facial
      },
    ];

    // **Criar uma nova lista de signatários para a Procuração**
    const signatariosProcuracao = [
      {
        nome: contratoData.nomeTitularProjeto,
        email: contratoData.emailResponsavel,
        telefone: contratoData.telefoneResponsavelHomologacao, // Usa telefoneResponsavelHomologacao para a Procuração
        cpf: contratoData.cpfCliente,
        auths: ['whatsapp'],
        delivery: ['email'],
        facial_biometrics_enabled: false, // Habilitar biometria facial para o Cliente na Procuração
      },
    ];

    const folderId = '1ieztIL8idzdTI_fW1hGHChfiBaWgLeoR'; // Substitua pelo ID da sua pasta no Google Drive
    const ContratoPFId = '1VTyDOjeElFI1U2yVKOCrtGyzvCknl6PcXzViWo4qnCI';
    const ContratoPJId = '1diEVHiT8DT8_JItglYWApsCxKLgzrUkBG4NfZ7rY45g';
    const ProcuracaoPFId = '1xGp2KLPS_ZqKLc6OE4Etm3bETeQGVAJZYC1yEE5yreo';
    const ProcuracaoPJId = '1XW2biILf6T4AA-dUZX9Vx5MYA5MDgDo2KCjYsadAYek';
    const TermoId = '1if5ACLiAWpznHwkusD3baS2FsSRLXLC9oAoISCnUDAg';

    // **Criar Documentos com Base nas Condições**

    // Documento Contrato PF
    await criarDocumentoSeNecessario(
      ContratoPFId,
      `Contrato PF - ${contratoData.nomeCompletoResponsavel}`,
      {
        'Nome Completo': contratoData.nomeCompletoResponsavel,
        'Estado Civil': contratoData.estadoCivil,
        'Profissão': contratoData.profissao,
        'CPF': contratoData.cpfCliente,
        'Logradouro': contratoData.logradouro,
        'Número': contratoData.numero,
        'Complemento': contratoData.complemento,
        'Bairro': contratoData.bairro,
        'CidadeUF': contratoData.cidadeUf,
        'CEP': contratoData.cep,
        'Nome do titular do Projeto na Concessionária': contratoData.nomeTitularProjeto,
        'Razão Social titular do Projeto': contratoData.razaoSocialTitularConc,
        'CPF do projeto na concessionária': contratoData.cpfTitularProjeto,
        'CNPJ do projeto na concessionária': contratoData.cnpjTitularProjeto,
        '(KWp)': contratoData.potenciaTotalProjeto,
        'Quantidade de Inversores': contratoData.quantidadeTotalInversores,
        'Marca dos Inversores': contratoData.marcaInversores,
        'Tipo de Estrutura': contratoData.tipoEstrutura,
        'Valor total do contrato': contratoData.valorTotalContrato,
        'Valor total do contrato por Extenso': contratoData.valorTotalContratoExtenso,
        'Tipo de Pagamento': contratoData.tipoPagamento,
        'Forma de Pagamento Boleto': contratoData.formaPagamentoBoleto,
        'Valor do boleto': contratoData.valorBoleto,
        'Forma de PagamentoCartao': contratoData.formaPagamentoCartao,
        'ValorCartao': contratoData.valorJurosCartao,
        'valorCartaoFormatado': contratoData.valorCartao,
        'Banco do Financiamento': contratoData.bancoFinanciamento,
        'Valor do Financiamento': contratoData.valorFinanciamento,
        'Tipo de Faturamento': contratoData.tipoFaturamento,
        'Logradouro da Instalação': contratoData.logradouroInstalacao,
        'Número da residência da instalação': contratoData.numeroInstalacao,
        'Complemento da Instalação': contratoData.complementoInstalacao,
        'Bairro da Instalação': contratoData.bairroInstalacao,
        'CidadeUF da Instalação': contratoData.cidadeUfInstalacao,
        'CEP da Instalação': contratoData.cepInstalacao,
        'Cidade': contratoData.cidadeUf,
        'Data do Contrato': contratoData.dataContrato,
        'NomeCompleto': contratoData.nomeCompletoResponsavel,
        'QuantidadeDePadroes': contratoData.QuantidadePadroes,
        'TipoDeConexãoPadrao': contratoData.TipoConexaoPadrao,
        'CorrenteDisjuntor': contratoData.CorrenteDisjuntor,
        'FavorOuContra': contratoData.FavorOuContraRede,
        'ComOuSem': contratoData.ServicoAlvenaria,
      },
      contratoData.tipoCliente === 'PF',
      folderId,
      signatarios,
      IdDadosContrato 
    );

    // Documento Contrato PJ
    await criarDocumentoSeNecessario(
      ContratoPJId,
      `Contrato PJ - ${contratoData.razaoSocial}`,
      {
        'RazaoSocial': contratoData.razaoSocial,
        'Finalidade da Empresa': contratoData.finalidadeEmpresa,
        'CNPJ': contratoData.cnpjCliente,
        'Logradouro': contratoData.logradouro,
        'Número': contratoData.numero,
        'Complemento': contratoData.complemento,
        'Bairro': contratoData.bairro,
        'CidadeUF': contratoData.cidadeUf,
        'CEP': contratoData.cep,
        'Nome Completo': contratoData.nomeCompletoResponsavel,
        'Cargo': contratoData.cargoResp,
        'CPF': contratoData.cpfCliente,
        'Nome do titular do Projeto na Concessionária': contratoData.nomeTitularProjeto,
        'Razão Social titular do Projeto': contratoData.razaoSocialTitularConc,
        'CPF do projeto na concessionária': contratoData.cpfTitularProjeto,
        'CNPJ do projeto na concessionária': contratoData.cnpjTitularProjeto,
        'Potência do Projeto (KWp)': contratoData.potenciaTotalProjeto,
        'Qndtinv': contratoData.quantidadeTotalInversores,
        'MarcaInv': contratoData.marcaInversores,
        'Tipo de Estrutura': contratoData.tipoEstrutura,
        'Valor total do contrato': contratoData.valorTotalContrato,
        'Valor total do contrato por Extenso': contratoData.valorTotalContratoExtenso,
        'Tipo de Pagamento': contratoData.tipoPagamento,
        'Forma de Pagamento Boleto': contratoData.formaPagamentoBoleto,
        'Valor do boleto': contratoData.valorBoleto,
        'Forma de Pagamento Cartao': contratoData.formaPagamentoCartao,
        'ValorCartao': contratoData.valorJurosCartao,
        'valorCartaoFormatado': contratoData.valorCartao,
        'Banco do Financiamento': contratoData.bancoFinanciamento,
        'Valor do Financiamento': contratoData.valorFinanciamento,
        'Tipo de Faturamento': contratoData.tipoFaturamento,
        'Logradouro da Instalação': contratoData.logradouroInstalacao,
        'Número da residência da instalação': contratoData.numeroInstalacao,
        'Complemento da Instalação': contratoData.complementoInstalacao,
        'Bairro da Instalação': contratoData.bairroInstalacao,
        'Cidade Estado da Instalação': contratoData.cidadeUfInstalacao,
        'CEP da Instalação': contratoData.cepInstalacao,
        'Data do Contrato': contratoData.dataContrato,
        'NomeCompleto': contratoData.nomeCompletoResponsavel,
        'QuantidadeDePadroes': contratoData.QuantidadePadroes,
        'TipoDeConexãoPadrao': contratoData.TipoConexaoPadrao,
        'CorrenteDisjuntor': contratoData.CorrenteDisjuntor,
        'FavorOuContra': contratoData.FavorOuContraRede,
        'ComOuSem': contratoData.ServicoAlvenaria,
      },
      contratoData.tipoCliente === 'PJ',
      folderId,
      signatarios,
      IdDadosContrato 
    );

    // Documento Procuração PF
    await criarDocumentoSeNecessario(
      ProcuracaoPFId, // Substitua pelo ID real do template
      `Procuração PF - ${contratoData.nomeCompletoResponsavel}`,
      {
        'NomeTitularConc': contratoData.nomeTitularProjeto,
        'EstadoCivilTitularConc': contratoData.estadoCivilTitularConcessionaria,
        'ProfissaoCivilTitularConc': contratoData.profissaoTitularConcessionaria,
        'CPFTiltularConc': contratoData.cpfTitularProjeto,
        'LogradouroInst': contratoData.logradouroInstalacao,
        'NumeroInst': contratoData.numeroInstalacao,
        'CompIst': contratoData.complementoInstalacao,
        'BairroInst': contratoData.bairroInstalacao,
        'CidadeUFInst': contratoData.cidadeUfInstalacao,
        'CEPInst': contratoData.cepInstalacao,
        'CidadeUF': contratoData.cidadeUf,
        'DataContrato': contratoData.dataContrato,
        'NomeCompleto': contratoData.nomeTitularProjeto,
      },
      contratoData.tipoTitularProjeto === 'PF',
      folderId,
      signatariosProcuracao,
      IdDadosContrato 
    );

    // Documento Procuração PJ
    await criarDocumentoSeNecessario(
      ProcuracaoPJId, // Substitua pelo ID real do template
      `Procuração PJ - ${contratoData.razaoSocial}`,
      {
        'NomeEmpresa': contratoData.razaoSocialTitularConc,
        'CPNJempresa': contratoData.cnpjTitularProjeto,
        'TipoPessoaJuridica': contratoData.finalidadeEmpresaTitularConc,
        'RuaEmpresa': contratoData.logradouroInstalacao,
        'NumEmpresa': contratoData.numeroInstalacao,
        'BairroEmpresa': contratoData.bairroInstalacao,
        'CidadeEstadoEmpresa': contratoData.cidadeUfInstalacao,
        'CepEmpresa': contratoData.cepInstalacao,
        'NomeResponsavelEmpresa': contratoData.nomeResponsavelTitularProjeto,
        'CargoResponsavel': contratoData.profissaoResponsavelTitularConcessionaria,
        'CPFRespEmpTiltularConc': contratoData.cpfResponsavelTitularProjeto,
        'CidadeUF': contratoData.cidadeUf,
        'DataContrato': contratoData.dataContrato,
        'NomeCompleto': contratoData.nomeResponsavelTitularProjeto,
      },
      contratoData.tipoTitularProjeto === 'PJ',
      folderId,
      signatariosProcuracao,
      IdDadosContrato 
    );

    // Documento Termo de Concordância
    await criarDocumentoSeNecessario(
      TermoId,
      `Termo de Concordância - ${contratoData.nomeCompletoResponsavel}`,
      {
        'NomeCompleto': contratoData.nomeCompletoResponsavel,
        'DataContrato': contratoData.dataContrato,
        'CidadeUF': contratoData.cidadeUf,
      },
      contratoData.modalidadeCompensacao === 'Autoconsumo Local (FAST TRACK)',
      folderId,
      signatarios,
      IdDadosContrato 
    );

    console.log('Todos os documentos foram processados e signatários associados com sucesso.');

    res.status(200).json({ mensagem: 'Documentos processados e enviados para Clicksign com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar os documentos:', error);
    res.status(500).json({ erro: 'Erro ao processar os documentos', detalhes: error.message });
  }
});

// Endpoint para processar webhooks do ClickSign
router.post('/api/webhooks/clicksign', async (req, res) => {
  const event = req.body.event?.name; // Ajuste para obter o nome do evento
  const data = req.body.event?.data; // Ajuste para obter os dados do evento

  console.log(`Recebido evento: ${event}`, data);

  try {
    switch (event) {
      case 'add_signer':
        await handleAddSigner(data);
        break;
      case 'sign':
        await handleSign(data);
        break;
      case 'refusal':
        await handleRefusal(data);
        break;
      case 'auto_close':
        await handleAutoClose(data);
        break;
      case 'deadline':
        await handleDeadline(data);
        break;
      case 'document_closed':
        await handleDocumentClosed(data);
        break;
      case 'close':
        await handleClose(data);
        break;
      case 'update_deadline':
        await handleUpdateDeadline(data);
        break;
      // Adicione outros casos conforme necessário
      default:
        console.warn(`Evento não tratado: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Erro ao processar o evento ${event}:`, error);
    res.status(500).json({ success: false, message: 'Erro ao processar o evento.' });
  }
});

// Endpoint para processar webhook de assinatura (se necessário)
router.post('/api/webhook-signature', async (req, res) => {
  console.log('----- Webhook Signature Recebido -----');
  console.log('Cabeçalhos:', JSON.stringify(req.headers, null, 2));
  console.log('Corpo da Requisição:', JSON.stringify(req.body, null, 2));

  try {
    const { event, document } = req.body;

    if (event && event.name === 'sign' && document) {
      const documentKey = document.key;
      const signerKey = event.data?.signer?.key;

      if (!documentKey || !signerKey) {
        console.error('Chaves do documento ou do signatário faltando.');
        return res.status(400).send('Dados do webhook incompletos.');
      }

      console.log(`Signatário ${signerKey} assinou o documento ${documentKey}`);

      // Obter o próximo signatário
      const nextSigner = await getNextSigner(documentKey, signerKey);

      if (nextSigner) {
        if (nextSigner.name === 'Verificador de Contratos') {
          // Notificar o verificador por e-mail
          await notificarPorEmail(nextSigner.request_signature_key);
          console.log(`Notificação por e-mail enviada para o verificador: ${nextSigner.name}`);
        } else {
          // Notificar o próximo signatário por WhatsApp
          await notificarPorWhatsApp(nextSigner.request_signature_key, nextSigner.name);
          console.log(`Notificação enviada para o próximo signatário: ${nextSigner.name}`);
        }
      } else {
        console.log('Todos os signatários já assinaram ou próximo signatário não encontrado.');
      }
    } else {
      console.error('Estrutura do evento inválida ou faltando informações necessárias no webhook.');
      return res.status(400).send('Estrutura do webhook inválida.');
    }

    res.status(200).send('Webhook recebido com sucesso');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Erro ao processar webhook');
  }
});

async function cancelarDocumento(documentKey) {
  try {
    // **Etapa 1: Cancelar o documento na Clicksign**
    const response = await fetch(`https://sandbox.clicksign.com/api/v1/documents/${documentKey}/cancel?access_token=${process.env.CLICK_SIGN_TOKEN}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Erro ao cancelar documento na Clicksign:', responseData);
      throw new Error(responseData.message || 'Erro ao cancelar documento na Clicksign');
    }

    console.log('Documento cancelado com sucesso na Clicksign:', responseData);

    // **Etapa 2: Recuperar o IdDadosContrato associado ao IdDocSign**
    const selectQuery = `
      SELECT DadosContratoRelacionado
      FROM \`sd-gestao.CRM.CadDadosSign\`
      WHERE IdDocSign = @documentKey
      LIMIT 1
    `;

    const selectOptions = {
      query: selectQuery,
      params: {
        documentKey,
      },
    };

    const [selectRows] = await bigquery.query(selectOptions);

    if (selectRows.length === 0) {
      console.error(`Nenhum contrato relacionado encontrado para documentKey: ${documentKey}`);
      throw new Error('Contrato relacionado não encontrado.');
    }

    const dadosContratoRelacionado = selectRows[0].DadosContratoRelacionado;

  
    const updateStatusDocSignQuery = `
    UPDATE \`sd-gestao.CRM.CadDadosSign\`
    SET StatusDocSign = 'FECHADO',
        StatusDocumento = 'FECHADO'
    WHERE IdDocSign = @documentKey
  `;

  const updateOptions = {
    query: updateStatusDocSignQuery,
    params: {
      documentKey: documentKey,
    },
  };

  await bigquery.query(updateOptions);
    console.log(`Status do documento ${documentKey} atualizado para 'CANCELADO' no BigQuery.`);

    return responseData;
  } catch (error) {
    console.error('Erro ao cancelar documento:', error);
    throw error;
  }
}

router.post('/api/cancelarDocumento', authenticateToken, async (req, res) => {
  console.log('Recebido /api/cancelarDocumento:', req.body);
  const { documentKey } = req.body;

  if (!documentKey) {
    console.error('Erro: documentKey não fornecido.');
    return res.status(400).json({ erro: 'documentKey é obrigatório.' });
  }

  try {
    const result = await cancelarDocumento(documentKey);
    res.status(200).json({ 
      mensagem: 'Documento cancelado com sucesso.', 
      dados: result,
      novoStatusDocumento: 'CANCELADO',
      descricaoStatus: 'Documento cancelado manualmente via API.'
    });
  } catch (error) {
    console.error('Erro ao cancelar o documento:', error);
    res.status(500).json({ erro: 'Erro ao cancelar o documento', detalhes: error.message });
  }
});

// Função para excluir documento na Clicksign
async function excluirDocumento(documentKey) {
  try {
    const response = await fetch(
      `https://sandbox.clicksign.com/api/v1/documents/${documentKey}?access_token=${process.env.CLICK_SIGN_TOKEN}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201) {
      console.log(`Documento ${documentKey} excluído com sucesso da Clicksign.`);
    } else {
      const errorData = await response.json();
      console.error(
        `Erro ao excluir documento ${documentKey} na Clicksign:`,
        errorData
      );
      throw new Error(errorData.message || 'Erro ao excluir documento');
    }
  } catch (error) {
    console.error(`Erro ao excluir documento ${documentKey}:`, error);
    throw error;
  }
}


export default router;