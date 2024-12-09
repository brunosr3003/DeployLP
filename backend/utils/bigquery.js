// bigquery.js
import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || '../bigquery-key.json',
});

export default bigquery;
