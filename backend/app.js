// app.js
import express from 'express'; 
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './middleware/auth.js';
import usuarioRoutes from './routes/usuario.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Montar os roteadores na rota /api
app.use('/v1', authRoutes);
app.use('/v1', usuarioRoutes);



// Opcional: Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

// Inicializa o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
