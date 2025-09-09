process.env.NODE_ENV = 'test';

// Configurações de porta para evitar conflitos
process.env.PORT = '0'; // Porta dinâmica

// Configurações de banco de dados para teste
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.DB_HOST = '';
process.env.DB_USER = '';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = '';
process.env.DB_PORT = '';

// JWT para testes
process.env.JWT_SECRET = 'test-jwt-secret-super-secure-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';

// Desabilitar logs durante testes
process.env.LOG_LEVEL = 'error';
process.env.SEQUELIZE_LOGGING = 'false';

// Configurações específicas para teste
process.env.TEST_TIMEOUT = '30000';
process.env.DISABLE_REAL_DATABASE = 'true';

// Mock de configurações AWS (se necessário)
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

console.log('🧪 Ambiente de teste configurado');