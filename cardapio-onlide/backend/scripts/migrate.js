const { sequelize } = require('../src/models');

async function migrate() {
  try {
    console.log('🔄 Sincronizando modelos com banco de dados...');
    
    await sequelize.sync({ alter: true });
    
    console.log('✅ Modelos sincronizados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
    process.exit(1);
  }
}

migrate();