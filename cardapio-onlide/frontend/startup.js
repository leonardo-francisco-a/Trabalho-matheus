// Script para verificar a conexão com o backend
import { testConnection } from './src/services/api.js';

const checkBackendConnection = async () => {
  console.log('🔄 Verificando conexão com backend...');
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Backend conectado com sucesso!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('📡 Backend: http://localhost:3001');
  } else {
    console.log('⚠️  Backend offline - usando modo de demonstração');
    console.log('💡 Para conectar o backend, execute:');
    console.log('   cd backend && npm run dev');
  }
  
  console.log('\n🍽️ Sistema de Cardápio iniciado!');
  console.log('📋 Login demo: admin@cardapio.com / admin123');
};

checkBackendConnection();