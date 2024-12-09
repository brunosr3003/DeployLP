// app.js
import express from 'express'; 
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './middleware/auth.js';
import statusRoutes from './routes/status.js';
import cadClienteRoutes from './routes/cadCliente.js';
import padraoAtividadeRoutes from './routes/padraoAtividade.js';
import custoRoutes from './routes/custo.js';
import documentoRoutes from './routes/documento.js';
import calcRoutes from './routes/calc.js';
import usuarioRoutes from './routes/usuario.js';
import empresaRoutes from './routes/empresa.js';
import geradorRoutes from './routes/gerador.js';
import clicksignRoutes from './routes/clicksign.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 1000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Montar os roteadores na rota /api
app.use('/v1', authRoutes);
app.use('/v1', statusRoutes);
app.use('/v1', cadClienteRoutes);
app.use('/v1', padraoAtividadeRoutes);
app.use('/v1', custoRoutes);
app.use('/v1', documentoRoutes);
app.use('/v1', calcRoutes);
app.use('/v1', usuarioRoutes);
app.use('/v1', empresaRoutes);
app.use('/v1', statusRoutes);
app.use('/v1', geradorRoutes);
app.use('/v1', clicksignRoutes);


// Opcional: Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
});

// Inicializa o servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
});
