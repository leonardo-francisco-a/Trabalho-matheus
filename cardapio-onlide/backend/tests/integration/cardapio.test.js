const request = require('supertest');
const app = require('../../src/app');
const { Usuario, Categoria, Cardapio } = require('../../src/models');

describe('Cardapio Endpoints', () => {
  let authToken;
  let categoria;

  beforeEach(async () => {
    // Limpar dados
    await Cardapio.destroy({ where: {} });
    await Categoria.destroy({ where: {} });
    await Usuario.destroy({ where: {} });

    // Criar usuário admin
    await Usuario.create({
      nome: 'Admin',
      email: 'admin@teste.com',
      senha: '123456',
      tipo: 'admin'
    });

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@teste.com',
        senha: '123456'
      });

    authToken = loginResponse.body.token;

    // Criar categoria
    categoria = await Categoria.create({
      nome: 'Lanches',
      descricao: 'Hambúrguers e sanduíches'
    });
  });

  describe('GET /api/cardapio/categorias', () => {
    it('deve listar categorias (endpoint público)', async () => {
      const response = await request(app)
        .get('/api/cardapio/categorias')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].nome).toBe('Lanches');
    });
  });

  describe('GET /api/cardapio', () => {
    beforeEach(async () => {
      // Criar alguns itens para teste
      await Cardapio.bulkCreate([
        {
          nome: 'X-Burger',
          descricao: 'Hambúrguer simples',
          preco: 15.90,
          categoria_id: categoria.id,
          disponivel: true
        },
        {
          nome: 'X-Bacon',
          descricao: 'Hambúrguer com bacon',
          preco: 18.90,
          categoria_id: categoria.id,
          disponivel: false
        }
      ]);
    });

    it('deve listar todos os itens (endpoint público)', async () => {
      const response = await request(app)
        .get('/api/cardapio')
        .expect(200);

      expect(response.body.itens).toBeDefined();
      expect(response.body.total).toBe(2);
      expect(response.body.itens.length).toBe(2);
    });

    it('deve filtrar por categoria', async () => {
      const response = await request(app)
        .get(`/api/cardapio?categoria_id=${categoria.id}`)
        .expect(200);

      expect(response.body.itens.length).toBe(2);
      response.body.itens.forEach(item => {
        expect(item.categoria_id).toBe(categoria.id);
      });
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

      const response = await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.message).toBe('Item criado com sucesso');
      expect(response.body.item.nome).toBe(itemData.nome);

      // Verificar se foi salvo no banco
      const item = await Cardapio.findOne({ where: { nome: itemData.nome } });
      expect(item).not.toBeNull();
    });

    it('deve rejeitar acesso sem token', async () => {
      const itemData = {
        nome: 'Pizza Margherita',
        preco: 35.00
      };

      await request(app)
        .post('/api/cardapio')
        .send(itemData)
        .expect(401);
    });

    it('deve validar dados obrigatórios', async () => {
      // Nome ausente
      await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preco: 35.00,
          categoria_id: categoria.id
        })
        .expect(400);

      // Preço ausente
      await request(app)
        .post('/api/cardapio')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Pizza Test',
          categoria_id: categoria.id
        })
        .expect(400);
    });
  });
});