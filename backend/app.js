// backend/app.js
import express from 'express'; 
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './middleware/auth.js';
import usuarioRoutes from './routes/usuario.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Montar os roteadores na rota /v1
app.use('/v1', authRoutes);
app.use('/v1', usuarioRoutes);

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

// Exporta o aplicativo Express para o Vercel
export default app;
