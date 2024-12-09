// utils/helpers.js
import { v4 as uuidv4 } from 'uuid';

/**
 * Formata uma data para o padrão 'YYYY-MM-DD HH:mm:ss'.
 * @param {Date|string} dateTime 
 * @returns {string|null}
 */
export const formatarData = (dateTime) => {
  const date = new Date(dateTime);
  if (isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Obtém a data e hora de Brasília no formato 'YYYY-MM-DD HH:mm:ss.SSSSSS'.
 * @returns {string}
 */
export const obterDataHoraBrasilia = () => {
  const now = new Date();

  // Obtém o horário UTC
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // Ajusta para UTC-3 (Brasília)
  const brasiliaTime = new Date(utc - 3 * 60 * 60 * 1000);

  // Formata como "YYYY-MM-DD HH:mm:ss.SSSSSS"
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
};

/**
 * Gera um UUID.
 * @returns {string}
 */
export const gerarUUID = () => uuidv4();

/**
 * Organiza as porcentagens por "OndeAfeta".
 * @param {Array} custosRows 
 * @returns {Object}
 */
export const organizarPorcentagens = (custosRows) => {
  const porcentagensPorAfetacao = custosRows.reduce((acc, row) => {
    const ondeAfeta = row.OndeAfeta;
    const porcentagem = parseFloat(row.Porcentagem);
    if (!acc[ondeAfeta]) {
      acc[ondeAfeta] = 0;
    }
    acc[ondeAfeta] += porcentagem;
    return acc;
  }, {});

  // Converter as porcentagens para decimais
  for (const key in porcentagensPorAfetacao) {
    porcentagensPorAfetacao[key] = porcentagensPorAfetacao[key] / 100;
  }

  return porcentagensPorAfetacao;
};
