const { sequelize } = require('../src/models');

async function testDatabase() {
  try {
    console.log('🔄 Testando conexão com banco...');
    
    
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida');
    
    
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas criadas');
    
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tabelas criadas:', tables);
    
    console.log('🎉 Banco de teste funcionando!');
    
  } catch (error) {
    console.error('❌ Erro no banco:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  testDatabase();
}

module.exports = testDatabase;