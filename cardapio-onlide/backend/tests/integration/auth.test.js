const request = require('supertest');
const app = require('../../src/app');
const { Usuario } = require('../../src/models');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await Usuario.destroy({ where: {} });
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

      // Verificar se foi salvo no banco
      const usuario = await Usuario.findOne({ where: { email: userData.email } });
      expect(usuario).not.toBeNull();
    });

    it('deve validar email duplicado', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456'
      };

      // Criar primeiro usuário
      await Usuario.create(userData);

      // Tentar criar segundo com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Maria Silva',
          email: 'joao@teste.com',
          senha: '654321'
        })
        .expect(409);

      expect(response.body.error).toContain('já cadastrado');
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
    beforeEach(async () => {
      // Criar usuário para testes de login
      await Usuario.create({
        nome: 'Test User',
        email: 'test@teste.com',
        senha: '123456',
        tipo: 'admin'
      });
    });

    it('deve fazer login com credenciais válidas', async () => {
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
      expect(response.body.usuario.senha).toBeUndefined(); // Não deve retornar senha
    });

    it('deve rejeitar credenciais inválidas', async () => {
      // Email inexistente
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inexistente@teste.com',
          senha: '123456'
        })
        .expect(401);

      // Senha incorreta
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
