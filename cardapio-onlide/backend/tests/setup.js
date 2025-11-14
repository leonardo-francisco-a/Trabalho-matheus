const { Sequelize } = require('sequelize');


const testSequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  logging: false
});

let modelsInitialized = false;

const initializeTestModels = async () => {
  if (modelsInitialized) {
    return testSequelize;
  }

  try {
    
    const Usuario = testSequelize.define('Usuario', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      senha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('cliente', 'admin'),
        defaultValue: 'cliente'
      },
      telefone: Sequelize.STRING,
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    const Categoria = testSequelize.define('Categoria', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: Sequelize.TEXT,
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });

    const Cardapio = testSequelize.define('Cardapio', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descricao: Sequelize.TEXT,
      preco: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        references: {
          model: Categoria,
          key: 'id'
        }
      },
      disponivel: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      tempo_preparo: {
        type: Sequelize.INTEGER,
        defaultValue: 30
      }
    });

    
    Categoria.hasMany(Cardapio, { foreignKey: 'categoria_id', as: 'itens' });
    Cardapio.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

    
    Usuario.prototype.verificarSenha = async function(senha) {
      return this.senha === senha; 
    };

    
    await testSequelize.sync({ force: true });

    
    global.testModels = {
      sequelize: testSequelize,
      Usuario,
      Categoria,
      Cardapio
    };

    modelsInitialized = true;
    

    return testSequelize;

  } catch (error) {
    console.error('❌ Erro ao configurar banco de teste:', error);
    throw error;
  }
};

beforeAll(async () => {
  await initializeTestModels();
  console.log('🧪 Banco de teste configurado');
});

afterAll(async () => {
  if (testSequelize) {
    await testSequelize.close();
    console.log('🧹 Banco de teste limpo');
  }
});

beforeEach(async () => {
  if (global.testModels) {
    
    await global.testModels.Cardapio.destroy({ where: {} });
    await global.testModels.Categoria.destroy({ where: {} });
    await global.testModels.Usuario.destroy({ where: {} });
  }
});

module.exports = {
  testSequelize,
  initializeTestModels
};