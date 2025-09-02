const request = require('supertest');
const app = require('../../src/app');

describe('Health Check', () => {
  it('deve responder OK na rota raiz', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.message).toContain('funcionando');
    expect(response.body.status).toBe('OK');
  });

  it('deve responder OK na rota de health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.service).toBe('cardapio-backend');
  });
});
