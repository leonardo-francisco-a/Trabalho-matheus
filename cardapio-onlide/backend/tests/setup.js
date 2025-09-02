const { sequelize } = require('../src/models');

beforeAll(async () => {
  // Conectar ao banco de teste
  await sequelize.authenticate();
  
  // Sincronizar modelos (criar tabelas)
  await sequelize.sync({ force: true });
  
  console.log('🧪 Banco de teste configurado');
});

afterAll(async () => {
  // Limpar e fechar conexão
  await sequelize.drop();
  await sequelize.close();
  
  console.log('🧹 Banco de teste limpo');
});