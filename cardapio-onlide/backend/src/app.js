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

// ============ MOCK APIs (TEMPORÁRIO) ============

// GET /api/cardapio/categorias - Listar categorias
app.get('/api/cardapio/categorias', (req, res) => {
  console.log('📂 GET /api/cardapio/categorias');
  res.json([
    { id: 1, nome: 'Lanches', descricao: 'Hambúrguers e sanduíches', ativo: true },
    { id: 2, nome: 'Pizzas', descricao: 'Pizzas tradicionais', ativo: true },
    { id: 3, nome: 'Bebidas', descricao: 'Refrigerantes e sucos', ativo: true },
    { id: 4, nome: 'Sobremesas', descricao: 'Doces e sobremesas', ativo: true }
  ]);
});

// GET /api/cardapio - Listar produtos
app.get('/api/cardapio', (req, res) => {
  console.log('🍕 GET /api/cardapio', req.query);
  
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
    },
    {
      id: 3,
      nome: 'Coca-Cola 350ml',
      descricao: 'Refrigerante gelado',
      preco: 5.00,
      categoria_id: 3,
      disponivel: true,
      tempo_preparo: 2,
      categoria: { id: 3, nome: 'Bebidas' }
    },
    {
      id: 4,
      nome: 'Pudim de Leite',
      descricao: 'Pudim caseiro com calda de caramelo',
      preco: 8.50,
      categoria_id: 4,
      disponivel: true,
      tempo_preparo: 5,
      categoria: { id: 4, nome: 'Sobremesas' }
    },
    {
      id: 5,
      nome: 'Pizza Portuguesa',
      descricao: 'Presunto, ovos, cebola, azeitona e mussarela',
      preco: 42.00,
      categoria_id: 2,
      disponivel: true,
      tempo_preparo: 25,
      categoria: { id: 2, nome: 'Pizzas' }
    }
  ];

  // Filtrar por categoria se fornecida
  const { categoria_id } = req.query;
  const produtosFiltrados = categoria_id 
    ? produtos.filter(p => p.categoria_id == categoria_id)
    : produtos;

  res.json({
    itens: produtosFiltrados,
    total: produtosFiltrados.length
  });
});

// POST /api/auth/login - Mock login
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 POST /api/auth/login', req.body);
  const { email, senha } = req.body;
  
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
});

// POST /api/auth/register - Mock register
app.post('/api/auth/register', (req, res) => {
  console.log('📝 POST /api/auth/register', req.body);
  const { nome, email } = req.body;
  
  res.status(201).json({
    message: 'Usuário criado com sucesso',
    token: 'mock-jwt-token-456',
    usuario: {
      id: 2,
      nome: nome,
      email: email,
      tipo: 'admin'
    }
  });
});

// POST /api/pedidos - Mock criar pedido
app.post('/api/pedidos', (req, res) => {
  console.log('🛒 POST /api/pedidos', req.body);
  
  const pedidoData = req.body;
  const numeroPedido = `PED${Date.now().toString().slice(-6)}`;
  
  res.status(201).json({
    message: 'Pedido criado com sucesso',
    pedido: {
      id: Date.now(),
      numero_pedido: numeroPedido,
      cliente_nome: pedidoData.cliente_nome,
      total: pedidoData.itens.reduce((sum, item) => sum + (item.quantidade * 10), 0),
      status: 'recebido',
      ...pedidoData
    }
  });
});

// ============ 404 HANDLER ============
app.use('*', (req, res) => {
  console.log('❌ 404:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📡 Backend: http://localhost:3001`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   GET  /api/cardapio/categorias`);
  console.log(`   GET  /api/cardapio`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/pedidos`);
});

module.exports = app;