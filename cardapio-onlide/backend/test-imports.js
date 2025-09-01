// backend/test-imports.js
// Script para testar se todos os imports estão funcionando

console.log('🔄 Testando imports...');

try {
  console.log('1. Testando config/database...');
  const sequelize = require('./src/config/database');
  console.log('✅ Database config OK');

  console.log('2. Testando models...');
  const models = require('./src/models');
  console.log('✅ Models OK:', Object.keys(models));

  console.log('3. Testando controllers...');
  const cardapioController = require('./src/controllers/cardapioController');
  console.log('✅ Cardapio Controller OK:', Object.keys(cardapioController));

  console.log('4. Testando middleware...');
  const errorHandler = require('./src/middleware/errorHandler');
  console.log('✅ Error Handler OK');

  console.log('5. Testando routes...');
  const authRoutes = require('./src/routes/auth');
  const cardapioRoutes = require('./src/routes/cardapio');
  console.log('✅ Routes OK');

  console.log('🎉 Todos os imports funcionando!');
  
} catch (error) {
  console.error('❌ Erro nos imports:', error.message);
  console.error('Stack:', error.stack);
  
  // Tentar identificar o problema específico
  if (error.message.includes('Cannot find module')) {
    console.error('🔍 Módulo não encontrado. Verifique se todos os arquivos existem.');
  }
  if (error.message.includes('sequelize')) {
    console.error('🔍 Problema com Sequelize. Verifique conexão do banco.');
  }
}

process.exit(0);