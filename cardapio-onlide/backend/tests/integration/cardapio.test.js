const request = require('supertest');
const app = require('../../src/app');

// Mock simples para não depender do banco real (igual ao auth.test.js)
const mockUsers = new Map();
const mockCategorias = new Map();
const mockCardapio = new Map();

// Mock dos modelos seguindo o mesmo padrão do auth.test.js
jest.mock('../../src/models', () => {
  return {
    Usuario: {
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn(),
      findByPk: jest.fn()
    },
    Categoria: {
      create: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn()
    },
    Cardapio: {
      bulkCreate: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn(),
      findByPk: jest.fn()
    }
  };
});

const { Usuario, Categoria, Cardapio } = require('../../src/models');

describe('Cardapio Endpoints', () => {
  let categoria;
  let authToken;

  beforeAll(async () => {
    console.log('🔧 Configurando usuário admin para os testes...');
    
    // Criar usuário admin no mock (igual ao auth.test.js)
    const adminUser = {
      id: 1,
      nome: 'Admin Teste',
      email: 'admin@test.com',
      senha: '123456',
      tipo: 'admin',
      ativo: true,
      verificarSenha: jest.fn().mockImplementation((senha) => {
        return Promise.resolve(senha === '123456');
      })
    };
    mockUsers.set('admin@test.com', adminUser);

    // Configurar mock do Usuario.findOne para login
    Usuario.findOne.mockImplementation(({ where }) => {
      const user = Array.from(mockUsers.values()).find(u => u.email === where.email);
      return Promise.resolve(user || null);
    });

    // Fazer login real para pegar o token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        senha: '123456'
      });

    console.log('🔐 Response do login:', response.status, response.body);
    
    if (response.status === 200) {
      authToken = response.body.token;
      console.log('✅ Token obtido com sucesso:', authToken);
    } else {
      console.error('❌ Falha no login:', response.body);
      throw new Error('Não foi possível fazer login');
    }
  });

  beforeEach(async () => {
    // Limpar mocks
    jest.clearAllMocks();

    // Reconfigurar mock do usuário admin para cada teste
    const adminUser = {
      id: 1,
      nome: 'Admin Teste',
      email: 'admin@test.com',
      senha: '123456',
      tipo: 'admin',
      ativo: true,
      verificarSenha: jest.fn().mockResolvedValue(true)
    };

    // Configurar categoria mock
    categoria = {
      id: 1,
      nome: 'Lanches',
      descricao: 'Hambúrguers e sanduíches',
      ativo: true
    };

    // Setup mocks baseado no padrão do auth.test.js
    Usuario.findOne.mockImplementation(({ where }) => {
      if (where.email === 'admin@test.com') {
        return Promise.resolve(adminUser);
      }
      return Promise.resolve(null);
    });

    Usuario.findByPk.mockImplementation((id) => {
      if (id === 1) {
        return Promise.resolve(adminUser);
      }
      return Promise.resolve(null);
    });

    Usuario.create.mockResolvedValue(adminUser);
    Usuario.destroy.mockResolvedValue(null);
    
    Categoria.create.mockResolvedValue(categoria);
    Categoria.findAll.mockResolvedValue([categoria]);
    Categoria.findByPk.mockResolvedValue(categoria);
    Categoria.destroy.mockResolvedValue(null);
    Cardapio.destroy.mockResolvedValue(null);

    // Mock de produtos
    const mockProdutos = [
      {
        id: 1,
        nome: 'Pizza Margherita',
        descricao: 'Hambúrguer simples',
        preco: 15.90,
        categoria_id: categoria.id,
        disponivel: true,
        tempo_preparo: 15
      },
      {
        id: 2,
        nome: 'X-Bacon',
        descricao: 'Hambúrguer com bacon',
        preco: 18.90,
        categoria_id: categoria.id,
        disponivel: false,
        tempo_preparo: 18
      }
    ];

    Cardapio.bulkCreate.mockResolvedValue(mockProdutos);
    Cardapio.findAll.mockImplementation(({ where } = {}) => {
      if (where && where.disponivel === true) {
        return Promise.resolve(mockProdutos.filter(p => p.disponivel));
      }
      return Promise.resolve(mockProdutos);
    });
    Cardapio.findByPk.mockResolvedValue(mockProdutos[0]);
  });

  describe('GET /api/cardapio/categorias', () => {
    it('deve listar categorias (endpoint público)', async () => {
      const response = await request(app)
        .get('/api/cardapio/categorias')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('nome');
    });
  });

  describe('GET /api/cardapio', () => {
    it('deve listar todos os itens (endpoint público)', async () => {
      const response = await request(app)
        .get('/api/cardapio')
        .expect(200);

      expect(response.body).toHaveProperty('itens');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.itens)).toBe(true);
    });

    it('deve filtrar por categoria', async () => {
      const response = await request(app)
        .get(`/api/cardapio?categoria_id=${categoria.id}`)
        .expect(200);

      expect(response.body.itens).toBeDefined();
      expect(Array.isArray(response.body.itens)).toBe(true);
    });

    it('deve filtrar por disponibilidade', async () => {
      const response = await request(app)
        .get('/api/cardapio?disponivel=true')
        .expect(200);

      expect(response.body.itens.length).toBe(1);
      expect(response.body.itens[0].disponivel).toBe(true);
    });
  });

  describe('POST /api/cardapio', () => {
    it('deve criar item com token válido (admin)', async () => {
      const itemData = {
        nome: 'Pizza Margherita',
        descricao: 'Pizza tradicional',
        preco: 35.00,
        categoria_id: categoria.id,
        tempo_preparo: 25
      };

      // Mock da criação
      const novoItem = { id: 3, ...itemData };
      Cardapio.create.mockResolvedValue(novoItem);

      console.log('🚀 TOKEN COMPLETO:', authToken);
      console.log('🚀 AUTHORIZATION HEADER:', `Bearer ${authToken}`);

      const response = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData);

      console.log('📋 Response status:', response.status);
      console.log('📋 Response body COMPLETO:', JSON.stringify(response.body, null, 2));

      if (response.status !== 201) {
        console.log('❌ ERRO: Resposta inesperada');
        console.log('🔍 Headers enviados:', { Authorization: `Bearer ${authToken}` });
        console.log('🔍 Dados enviados:', itemData);
      }

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Item criado com sucesso');
      expect(response.body.item.nome).toBe(itemData.nome);
    });

    it('deve rejeitar acesso sem token', async () => {
      const itemData = {
        nome: 'Pizza Margherita',
        preco: 35.00
      };

      const response = await request(app)
        .post('/api/cardapio')
        .send(itemData);

      expect(response.status).toBe(401);
    });

    it('deve validar dados obrigatórios', async () => {
      console.log('🔍 Testando validação com token:', authToken ? 'PRESENTE' : 'AUSENTE');
      
      // Nome ausente
      const response1 = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preco: 35.00,
          categoria_id: categoria.id
        });

      console.log('📋 Teste sem nome - Status:', response1.status);
      expect(response1.status).toBe(400);

      // Preço ausente
      const response2 = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Pizza Test',
          categoria_id: categoria.id
        });

      console.log('📋 Teste sem preço - Status:', response2.status);
      expect(response2.status).toBe(400);
    });
  });

  // Debug test para verificar o token
  describe('🔧 Debug Token', () => {
    it('deve verificar se o token foi obtido corretamente', () => {
      console.log('🔐 Verificando token...');
      console.log('🔐 Token presente:', !!authToken);
      console.log('🔐 Tipo do token:', typeof authToken);
      console.log('🔐 Tamanho do token:', authToken ? authToken.length : 0);
      
      expect(authToken).toBeDefined();
      expect(authToken).not.toBe('');
      expect(typeof authToken).toBe('string');
    });

    it('deve testar autenticação isoladamente', async () => {
      console.log('🧪 Teste isolado de autenticação...');
      
      const response = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Teste Isolado',
          preco: 10.00,
          categoria_id: 1
        });

      console.log('🧪 Status:', response.status);
      console.log('🧪 Body:', response.body);
      console.log('🧪 Headers enviados:', { Authorization: `Bearer ${authToken}` });

      // Se ainda der 401, algo está errado com o middleware
      if (response.status === 401) {
        console.log('❌ DIAGNÓSTICO: O middleware não está validando o token');
        console.log('💡 Possíveis causas:');
        console.log('   1. O token expirou');
        console.log('   2. O secret do JWT está diferente');
        console.log('   3. O middleware não está sendo aplicado corretamente');
        console.log('   4. O usuário não está sendo encontrado na validação do token');
      }
    });
  });
});