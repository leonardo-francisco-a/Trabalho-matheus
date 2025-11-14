process.env.NODE_ENV = 'test';


process.env.PORT = '0'; 


process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.DB_HOST = '';
process.env.DB_USER = '';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = '';
process.env.DB_PORT = '';


process.env.JWT_SECRET = 'test-jwt-secret-super-secure-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';


process.env.LOG_LEVEL = 'error';
process.env.SEQUELIZE_LOGGING = 'false';


process.env.TEST_TIMEOUT = '30000';
process.env.DISABLE_REAL_DATABASE = 'true';


process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

console.log('🧪 Ambiente de teste configurado');