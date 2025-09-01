const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARES ============
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// ============ ROTAS DE TESTE ============
app.get('/', (req, res) => {
  res.json({ 
    message: '🍽️ Backend Sistema de Cardápio funcionando!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'cardapio-backend',
    timestamp: new Date().toISOString()
  });
});

// ============ ROTAS DE AUTH SIMPLES ============
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 POST /api/auth/login', req.body);
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Email e senha são obrigatórios' }]
      });
    }
    
    // Tentar usar controller real primeiro
    try {
      const { Usuario } = require('./models');
      
      const usuario = await Usuario.findOne({ 
        where: { email, ativo: true } 
      });
      
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const senhaValida = await usuario.verificarSenha(senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const token = 'jwt-token-real-' + Date.now();
      
      res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      });
      
    } catch (modelError) {
      console.warn('⚠️ Erro ao usar modelos, usando mock:', modelError.message);
      
      // Mock login
      if (email === 'admin@cardapio.com' && senha === 'admin123') {
        res.json({
          message: 'Login realizado com sucesso',
          token: 'mock-jwt-token-123',
          usuario: {
            id: 1,
            nome: 'Administrador',
            email: 'admin@cardapio.com',
            tipo: 'admin'
          }
        });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 POST /api/auth/register', req.body);
    const { nome, email, senha, telefone } = req.body;
    
    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Nome, email e senha são obrigatórios' }]
      });
    }
    
    if (nome.length < 2) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Nome deve ter pelo menos 2 caracteres' }]
      });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Senha deve ter pelo menos 6 caracteres' }]
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Email inválido' }]
      });
    }
    
    // Tentar usar modelo real primeiro
    try {
      const { Usuario } = require('./models');
      
      // Verificar se email já existe
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email já cadastrado',
          details: [{ msg: 'Este email já está sendo usado' }]
        });
      }
      
      // Criar usuário
      const usuario = await Usuario.create({
        nome,
        email,
        senha,
        telefone: telefone || null,
        tipo: 'admin' // Por padrão criar como admin
      });
      
      const token = 'jwt-token-real-' + Date.now();
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      });
      
    } catch (modelError) {
      console.warn('⚠️ Erro ao usar modelos, simulando criação:', modelError.message);
      
      // Mock register
      const usuario = {
        id: Date.now(),
        nome,
        email,
        tipo: 'admin'
      };
      
      res.status(201).json({
        message: 'Usuário criado com sucesso (modo demo)',
        token: 'mock-jwt-token-' + Date.now(),
        usuario
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// ============ ROTA DE TESTE SIMPLES PARA CATEGORIAS ============
app.get('/api/cardapio/categorias', async (req, res) => {
  try {
    console.log('📂 GET /api/cardapio/categorias - Teste simples');
    
    // Primeiro tentar importar e usar modelos reais
    try {
      const { Categoria } = require('./models');
      console.log('✅ Modelos importados com sucesso');
      
      const categorias = await Categoria.findAll({
        where: { ativo: true },
        order: [['nome', 'ASC']]
      });
      
      console.log(`✅ ${categorias.length} categorias encontradas no banco`);
      res.json(categorias);
      
    } catch (modelError) {
      console.warn('⚠️ Erro ao usar modelos, retornando dados mockados:', modelError.message);
      
      // Fallback para dados mockados se modelos falharem
      const categoriasMock = [
        { id: 1, nome: 'Lanches', descricao: 'Hambúrguers e sanduíches', ativo: true },
        { id: 2, nome: 'Pizzas', descricao: 'Pizzas tradicionais', ativo: true },
        { id: 3, nome: 'Bebidas', descricao: 'Refrigerantes e sucos', ativo: true },
        { id: 4, nome: 'Sobremesas', descricao: 'Doces e sobremesas', ativo: true }
      ];
      
      res.json(categoriasMock);
    }
    
  } catch (error) {
    console.error('❌ Erro na rota /api/cardapio/categorias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ ROTA DE TESTE SIMPLES PARA CARDAPIO ============
app.get('/api/cardapio', async (req, res) => {
  try {
    console.log('🍕 GET /api/cardapio');
    
    // Tentar usar modelos reais
    try {
      const { Cardapio, Categoria } = require('./models');
      const { categoria_id } = req.query;
      
      const where = {};
      if (categoria_id && categoria_id !== 'all') where.categoria_id = categoria_id;

      const itens = await Cardapio.findAll({
        where,
        include: [{
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nome']
        }],
        order: [['nome', 'ASC']]
      });

      res.json({
        itens,
        total: itens.length
      });
      
    } catch (modelError) {
      console.warn('⚠️ Erro ao usar modelos para cardápio, usando dados mockados');
      
      // Dados mockados
      const produtos = [
        {
          id: 1,
          nome: 'X-Burger Clássico',
          descricao: 'Hambúrguer com carne 180g, queijo, alface, tomate e maionese',
          preco: 18.90,
          categoria_id: 1,
          disponivel: true,
          tempo_preparo: 15,
          categoria: { id: 1, nome: 'Lanches' }
        },
        {
          id: 2,
          nome: 'Pizza Margherita',
          descricao: 'Molho de tomate, mussarela de búfala e manjericão fresco',
          preco: 35.00,
          categoria_id: 2,
          disponivel: true,
          tempo_preparo: 25,
          categoria: { id: 2, nome: 'Pizzas' }
        }
      ];
      
      res.json({
        itens: produtos,
        total: produtos.length
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na rota /api/cardapio:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// ============ 404 HANDLER ============
app.use('*', (req, res) => {
  console.log('❌ 404:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/cardapio/categorias',
      'GET /api/cardapio'
    ]
  });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📡 Backend: http://localhost:3001`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/cardapio/categorias`);
  console.log(`   GET  /api/cardapio`);
});

module.exports = app;