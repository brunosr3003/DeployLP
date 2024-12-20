// bigquery.js
import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  keyFilename: './Key.json.json',
});

export default bigquery;
