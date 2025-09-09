const request = require('supertest');
const app = require('../../src/app');

describe('Health Check', () => {
  it('deve responder OK na rota raiz', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.message).toContain('funcionando');
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  it('deve responder OK na rota de health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.service).toBe('cardapio-backend');
    expect(response.body.timestamp).toBeDefined();
  });

  it('deve retornar 404 para rota inexistente', async () => {
    const response = await request(app)
      .get('/api/rota-inexistente')
      .expect(404);

    expect(response.body.error).toBe('Rota não encontrada');
    expect(response.body.path).toBe('/api/rota-inexistente');
    expect(response.body.availableRoutes).toBeDefined();
  });
});