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

// ============ ROTAS DE HEALTH ============
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

// ============ ROTAS REAIS ============
try {
  // Importar e usar rotas reais se modelos estiverem disponíveis
  const authRoutes = require('./routes/auth');
  const cardapioRoutes = require('./routes/cardapio');
  const pedidosRoutes = require('./routes/pedidos');
  const dashboardRoutes = require('./routes/dashboard');

  app.use('/api/auth', authRoutes);
  app.use('/api/cardapio', cardapioRoutes);
  app.use('/api/pedidos', pedidosRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  console.log('✅ Rotas reais carregadas');

} catch (error) {
  console.warn('⚠️ Rotas reais indisponíveis, usando fallback:', error.message);

  // ============ FALLBACK ROUTES ============
  // Auth routes
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

      // Mock login básico
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

      // Mock register
      const usuario = {
        id: Date.now(),
        nome,
        email,
        tipo: 'admin'
      };
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token: 'mock-jwt-token-' + Date.now(),
        usuario
      });
      
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message 
      });
    }
  });

  // Cardapio routes
  app.get('/api/cardapio/categorias', async (req, res) => {
    try {
      console.log('📂 GET /api/cardapio/categorias');
      
      const categoriasMock = [
        { id: 1, nome: 'Lanches', descricao: 'Hambúrguers e sanduíches', ativo: true },
        { id: 2, nome: 'Pizzas', descricao: 'Pizzas tradicionais', ativo: true },
        { id: 3, nome: 'Bebidas', descricao: 'Refrigerantes e sucos', ativo: true },
        { id: 4, nome: 'Sobremesas', descricao: 'Doces e sobremesas', ativo: true }
      ];
      
      res.json(categoriasMock);
      
    } catch (error) {
      console.error('❌ Erro na rota /api/cardapio/categorias:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });

  app.get('/api/cardapio', async (req, res) => {
    try {
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
        }
      ];

      // Aplicar filtro de disponibilidade se fornecido
      let filteredProducts = produtos;
      if (req.query.disponivel !== undefined) {
        const isAvailable = req.query.disponivel === 'true';
        filteredProducts = produtos.filter(produto => produto.disponivel === isAvailable);
      }
      
      res.json({
        itens: filteredProducts,
        total: filteredProducts.length
      });
      
    } catch (error) {
      console.error('❌ Erro na rota /api/cardapio:', error);
      res.status(500).json({ 
        error: error.message 
      });
    }
  });

  // POST route for cardapio (authenticated)
  app.post('/api/cardapio', async (req, res) => {
    try {
      console.log('➕ POST /api/cardapio', req.body);
      
      // Check for authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }

      const { nome, preco, categoria_id } = req.body;
      
      // Validate required fields
      if (!nome) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: [{ msg: 'Nome é obrigatório' }]
        });
      }
      
      if (!preco) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: [{ msg: 'Preço é obrigatório' }]
        });
      }

      // Mock creation
      const novoItem = {
        id: Date.now(),
        nome,
        preco: parseFloat(preco),
        categoria_id,
        disponivel: true,
        tempo_preparo: 15,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json({
        message: 'Item criado com sucesso',
        item: novoItem
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar item:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: error.message 
      });
    }
  });

  // ✅ NOVA ROTA FALLBACK PARA PEDIDOS
  app.post('/api/pedidos', async (req, res) => {
    try {
      console.log('🛒 POST /api/pedidos (fallback)', req.body);
      
      const { cliente_nome, cliente_telefone, tipo_entrega, endereco_entrega, itens } = req.body;
      
      // Validações básicas
      if (!cliente_nome || cliente_nome.trim().length < 2) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: [{ msg: 'Nome do cliente deve ter pelo menos 2 caracteres' }]
        });
      }
      
      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: [{ msg: 'Pedido deve ter pelo menos um item' }]
        });
      }
      
      const tiposValidos = ['delivery', 'retirada', 'balcao'];
      if (!tiposValidos.includes(tipo_entrega)) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: [{ msg: 'Tipo de entrega deve ser: delivery, retirada ou balcao' }]
        });
      }
      
      // Validar endereço para delivery
      if (tipo_entrega === 'delivery' && (!endereco_entrega || endereco_entrega.trim().length < 5)) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: [{ msg: 'Endereço é obrigatório para delivery' }]
        });
      }
      
      // Validar estrutura dos itens
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        if (!item.cardapio_id || isNaN(parseInt(item.cardapio_id))) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: [{ msg: `Item ${i + 1}: ID do produto inválido` }]
          });
        }
        if (!item.quantidade || isNaN(parseInt(item.quantidade)) || parseInt(item.quantidade) < 1) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: [{ msg: `Item ${i + 1}: Quantidade deve ser pelo menos 1` }]
          });
        }
      }
      
      // Calcular total mock (usando preços fixos)
      const precosMock = {
        1: 18.90, // X-Burger
        2: 35.00, // Pizza
        3: 5.00,  // Coca-Cola
        4: 8.50   // Pudim
      };
      
      let total = 0;
      const itensPedido = itens.map(item => {
        const preco = precosMock[item.cardapio_id] || 10.00;
        const quantidade = parseInt(item.quantidade);
        const subtotal = preco * quantidade;
        total += subtotal;
        
        return {
          id: Date.now() + Math.random(),
          cardapio_id: item.cardapio_id,
          quantidade: quantidade,
          preco_unitario: preco,
          observacoes: item.observacoes || null,
          // Dados do produto para exibição
          nome: item.cardapio_id === 1 ? 'X-Burger Clássico' :
                item.cardapio_id === 2 ? 'Pizza Margherita' :
                item.cardapio_id === 3 ? 'Coca-Cola 350ml' :
                item.cardapio_id === 4 ? 'Pudim de Leite' : 'Produto'
        };
      });
      
      // Criar pedido mock
      const numeroPedido = `PED${Date.now().toString().slice(-6)}`;
      const pedidoMock = {
        id: Date.now(),
        numero_pedido: numeroPedido,
        cliente_nome: cliente_nome.trim(),
        cliente_telefone: cliente_telefone || null,
        cliente_email: req.body.cliente_email || null,
        tipo_entrega: tipo_entrega,
        endereco_entrega: tipo_entrega === 'delivery' ? endereco_entrega.trim() : null,
        observacoes: req.body.observacoes || null,
        status: 'recebido',
        total: total.toFixed(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itens: itensPedido
      };
      
      console.log('✅ Pedido mock criado:', pedidoMock);
      
      res.status(201).json({
        message: 'Pedido criado com sucesso',
        pedido: pedidoMock
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar pedido (fallback):', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });

  // ✅ ROTA FALLBACK PARA LISTAR PEDIDOS
  app.get('/api/pedidos', async (req, res) => {
    try {
      console.log('📋 GET /api/pedidos (fallback)');
      
      // Check for authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }
      
      // Mock de pedidos para demonstração
      const pedidosMock = [
        {
          id: 1,
          numero_pedido: 'PED001',
          cliente_nome: 'João Silva',
          cliente_telefone: '(11) 99999-9999',
          status: 'preparando',
          total: '23.90',
          tipo_entrega: 'delivery',
          createdAt: new Date().toISOString(),
          itens: [
            { id: 1, nome: 'X-Burger Clássico', quantidade: 1, preco_unitario: 18.90 },
            { id: 2, nome: 'Coca-Cola 350ml', quantidade: 1, preco_unitario: 5.00 }
          ]
        }
      ];
      
      res.json({
        pedidos: pedidosMock,
        pagination: {
          total: pedidosMock.length,
          page: 1,
          limit: 20,
          pages: 1
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao listar pedidos (fallback):', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });

  // ✅ ROTA FALLBACK PARA OBTER PEDIDO ESPECÍFICO
  app.get('/api/pedidos/:id', async (req, res) => {
    try {
      console.log(`📋 GET /api/pedidos/${req.params.id} (fallback)`);
      
      const pedidoMock = {
        id: parseInt(req.params.id),
        numero_pedido: `PED${req.params.id.padStart(3, '0')}`,
        cliente_nome: 'Cliente Teste',
        cliente_telefone: '(11) 99999-9999',
        status: 'recebido',
        total: '18.90',
        tipo_entrega: 'delivery',
        createdAt: new Date().toISOString(),
        itens: [
          { id: 1, nome: 'X-Burger Clássico', quantidade: 1, preco_unitario: 18.90 }
        ]
      };
      
      res.json(pedidoMock);
      
    } catch (error) {
      console.error('❌ Erro ao obter pedido (fallback):', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });

  // ✅ ROTA FALLBACK PARA ATUALIZAR STATUS DO PEDIDO
  app.put('/api/pedidos/:id/status', async (req, res) => {
    try {
      console.log(`📋 PUT /api/pedidos/${req.params.id}/status (fallback)`, req.body);
      
      // Check for authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }
      
      const { status } = req.body;
      const statusValidos = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado'];
      
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: [{ msg: 'Status inválido' }]
        });
      }
      
      res.json({
        message: 'Status do pedido atualizado com sucesso',
        pedido: {
          id: parseInt(req.params.id),
          numero_pedido: `PED${req.params.id.padStart(3, '0')}`,
          status: status
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status (fallback):', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  });
}

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
      'GET /api/cardapio',
      'POST /api/cardapio',
      'POST /api/pedidos',
      'GET /api/pedidos',
      'GET /api/pedidos/:id',
      'PUT /api/pedidos/:id/status'
    ]
  });
});

// ============ ERROR HANDLER ============
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// ============ START SERVER ============
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:3000`);
    console.log(`📡 Backend: http://localhost:3001`);
    console.log(`📋 Rotas disponíveis:`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/register`);
    console.log(`   GET  /api/cardapio/categorias`);
    console.log(`   GET  /api/cardapio`);
    console.log(`   POST /api/cardapio`);
    console.log(`   POST /api/pedidos`);
    console.log(`   GET  /api/pedidos`);
    console.log(`   GET  /api/pedidos/:id`);
    console.log(`   PUT  /api/pedidos/:id/status`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, fechando servidor...');
    server.close(() => {
      console.log('✅ Servidor fechado');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, fechando servidor...');
    server.close(() => {
      console.log('✅ Servidor fechado');
      process.exit(0);
    });
  });
}

module.exports = app;