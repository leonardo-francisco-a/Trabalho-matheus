const request = require('supertest');
const app = require('../src/app');
const { Usuario } = require('../src/models');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await Usuario.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('deve criar um novo usuário admin', async () => {
      const userData = {
        nome: 'Admin Teste',
        email: 'admin@teste.com',
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
      expect(response.body.usuario.tipo).toBe('admin');
    });

    it('deve retornar erro para email inválido', async () => {
      const userData = {
        nome: 'Admin Teste',
        email: 'email-invalido',
        senha: '123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Dados inválidos');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await Usuario.create({
        nome: 'Admin Teste',
        email: 'admin@teste.com',
        senha: '123456',
        tipo: 'admin'
      });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: 'admin@teste.com',
        senha: '123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login realizado com sucesso');
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.email).toBe(loginData.email);
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      const loginData = {
        email: 'admin@teste.com',
        senha: 'senha-errada'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Credenciais inválidas');
    });
  });
});