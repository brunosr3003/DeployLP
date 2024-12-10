// routes/auth.js
import express from 'express'; 
import { BigQuery } from '@google-cloud/bigquery';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const router = express.Router();

// Conecta ao BigQuery usando credenciais da variável de ambiente
const bigquery = new BigQuery({
  projectId: 'sd-gestao',
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const JWT_SECRET = process.env.JWT_SECRET;

// Rota de Login
router.post('/api/login', async (req, res) => {
  const { email, password } = req.body; 

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
  }
  try {
    const query = `
      SELECT * FROM \`sd-gestao.Deploy.CadUsuario\`
      WHERE Email = @Email
      LIMIT 1
    `;

    const options = {
      query: query,
      params: { Email: email },
    };

    // Executar a query
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} iniciado.`);

    // Obter os resultados
    const [rows] = await job.getQueryResults();

    if (rows.length > 0) {
      const user = rows[0];
      // Comparar a senha
      const passwordMatch = await bcrypt.compare(password, user.Senha);
      if (passwordMatch) {
        const token = jwt.sign(
          { id: user.IdUsuario, email: user.Email, Cargo: user.Cargo }, // Inclui 'Cargo'
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        res.json({ success: true, message: 'Login bem-sucedido.', token });
      } else {
        // Senha incorreta
        res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
      }
    } else {
      // Usuário não encontrado
      res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
    }
  } catch (error) {
    console.error('Erro ao consultar BigQuery:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  // Obter token do header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.status(401).json({ success: false, message: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido ou expirado.' });
    req.user = user; // { id, email, Cargo }
    next();
  });
};

// Endpoint /api/me
router.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT Nome, Email, Cargo, Unidade
      FROM \`sd-gestao.Deploy.CadUsuario\`
      WHERE IdUsuario = @IdUsuario
      LIMIT 1
    `;
    const options = {
      query: query,
      params: { IdUsuario: req.user.id },
    };
    const [rows] = await bigquery.query(options);

    if (rows.length > 0) {
      const user = rows[0];
      res.status(200).json({ user });
    } else {
      res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
  }
});

// Rota de Teste
router.get('/api/teste', (req, res) => {
  res.json({ mensagem: 'Backend funcionando!' });
});

// Exemplo de rota protegida
router.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esta é uma rota protegida.', user: req.user });
});

export default router;
