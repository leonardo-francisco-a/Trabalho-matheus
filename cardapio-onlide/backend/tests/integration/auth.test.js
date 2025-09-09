const request = require('supertest');
const app = require('../../src/app');

// Mock simples para não depender do banco real
const mockUsers = new Map();

// Override dos modelos para usar mock
jest.mock('../../src/models', () => {
  return {
    Usuario: {
      findOne: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    }
  };
});

const { Usuario } = require('../../src/models');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();
    mockUsers.clear();
    
    // Setup mock behaviors
    Usuario.destroy.mockResolvedValue(null);
    Usuario.findOne.mockImplementation(({ where }) => {
      const user = Array.from(mockUsers.values()).find(u => u.email === where.email);
      return Promise.resolve(user || null);
    });
    Usuario.create.mockImplementation((userData) => {
      if (mockUsers.has(userData.email)) {
        const error = new Error('Email already exists');
        error.name = 'SequelizeUniqueConstraintError';
        return Promise.reject(error);
      }
      
      const user = {
        id: mockUsers.size + 1,
        ...userData,
        verificarSenha: jest.fn().mockImplementation((senha) => {
          return Promise.resolve(senha === userData.senha);
        })
      };
      mockUsers.set(userData.email, user);
      return Promise.resolve(user);
    });
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456',
        telefone: '11999999999'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Usuário criado com sucesso');
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.email).toBe(userData.email);
      expect(response.body.usuario.nome).toBe(userData.nome);
      expect(Usuario.create).toHaveBeenCalledWith(expect.objectContaining({
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha
      }));
    });

    it('deve validar email duplicado', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      // Simular usuário já existente
      mockUsers.set(userData.email, { ...userData, id: 1 });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Maria Silva',
          email: 'joao@teste.com',
          senha: '654321'
        })
        .expect(500);

      expect(response.body.error).toContain('Email already exists');
    });

    it('deve validar dados obrigatórios', async () => {
      // Nome ausente
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@teste.com',
          senha: '123456'
        })
        .expect(400);

      // Email ausente
      await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          senha: '123456'
        })
        .expect(400);

      // Senha ausente
      await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          email: 'test@teste.com'
        })
        .expect(400);
    });

    it('deve validar formato do email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          email: 'email-invalido',
          senha: '123456'
        })
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
    });

    it('deve validar tamanho mínimo da senha', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Test User',
          email: 'test@teste.com',
          senha: '123'
        })
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      // Criar usuário para testes de login
      const testUser = {
        id: 1,
        nome: 'Test User',
        email: 'test@teste.com',
        senha: '123456',
        tipo: 'admin',
        ativo: true,
        verificarSenha: jest.fn().mockImplementation((senha) => {
          return Promise.resolve(senha === '123456');
        })
      };
      mockUsers.set('test@teste.com', testUser);
    });

    it('deve fazer login com credenciais válidas', async () => {
      Usuario.findOne.mockImplementation(({ where }) => {
        if (where.email === 'test@teste.com') {
          return Promise.resolve(mockUsers.get('test@teste.com'));
        }
        return Promise.resolve(null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@teste.com',
          senha: '123456'
        })
        .expect(200);

      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.email).toBe('test@teste.com');
      expect(response.body.usuario.senha).toBeUndefined();
    });

    it('deve rejeitar credenciais inválidas', async () => {
      Usuario.findOne.mockResolvedValue(null);

      // Email inexistente
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@teste.com',
          senha: '123456'
        })
        .expect(401);

      // Senha incorreta - simular usuário encontrado mas senha errada
      const user = mockUsers.get('test@teste.com');
      user.verificarSenha.mockResolvedValue(false);
      Usuario.findOne.mockResolvedValue(user);

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@teste.com',
          senha: 'senha-errada'
        })
        .expect(401);
    });

    it('deve validar campos obrigatórios', async () => {
      // Email ausente
      await request(app)
        .post('/api/auth/login')
        .send({ senha: '123456' })
        .expect(400);

      // Senha ausente
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@teste.com' })
        .expect(400);
    });
  });
});