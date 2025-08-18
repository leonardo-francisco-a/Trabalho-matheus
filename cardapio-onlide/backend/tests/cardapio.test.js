const request = require('supertest');
const app = require('../src/app');
const { Cardapio, Categoria, Usuario } = require('../src/models');

describe('Cardapio Routes', () => {
  let authToken;
  let categoriaId;

  beforeEach(async () => {
    // Limpar dados
    await Cardapio.destroy({ where: {} });
    await Categoria.destroy({ where: {} });
    await Usuario.destroy({ where: {} });

    // Criar usuário admin
    const admin = await Usuario.create({
      nome: 'Admin',
      email: 'admin@teste.com',
      senha: '123456',
      tipo: 'admin'
    });

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: '123456' });
    
    authToken = loginResponse.body.token;

    // Criar categoria
    const categoria = await Categoria.create({
      nome: 'Lanches',
      descricao: 'Hambúrguers e sanduíches'
    });
    categoriaId = categoria.id;
  });

  describe('GET /api/cardapio', () => {
    it('deve listar itens do cardápio', async () => {
      await Cardapio.create({
        nome: 'X-Burger',
        descricao: 'Hambúrguer simples',
        preco: 18.90,
        categoria_id: categoriaId
      });

      const response = await request(app)
        .get('/api/cardapio')
        .expect(200);

      expect(response.body.itens).toHaveLength(1);
      expect(response.body.itens[0].nome).toBe('X-Burger');
    });
  });

  describe('POST /api/cardapio', () => {
    it('deve criar um novo item (admin)', async () => {
      const itemData = {
        nome: 'Pizza Margherita',
        descricao: 'Pizza tradicional',
        preco: 35.00,
        categoria_id: categoriaId
      };

      const response = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.message).toBe('Item criado com sucesso');
      expect(response.body.item.nome).toBe(itemData.nome);
    });

    it('deve negar acesso sem token', async () => {
      const itemData = {
        nome: 'Pizza Margherita',
        preco: 35.00
      };

      await request(app)
        .post('/api/cardapio')
        .send(itemData)
        .expect(401);
    });
  });
});