const { Sequelize, DataTypes } = require('sequelize');

// Configurar banco em memória para testes
const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  logging: false
});

// Definir modelo Categoria para teste
const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias'
});

// Definir modelo Cardapio para teste
const Cardapio = sequelize.define('Cardapio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tempo_preparo: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  }
}, {
  tableName: 'cardapio'
});

// Relacionamentos
Categoria.hasMany(Cardapio, { foreignKey: 'categoria_id', as: 'itens' });
Cardapio.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

describe('Cardapio Model', () => {
  let categoria;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar dados
    await Cardapio.destroy({ where: {} });
    await Categoria.destroy({ where: {} });

    // Criar categoria para testes
    categoria = await Categoria.create({
      nome: 'Lanches',
      descricao: 'Hambúrguers e sanduíches'
    });
  });

  it('deve criar um item do cardápio válido', async () => {
    const itemData = {
      nome: 'X-Burger',
      descricao: 'Hambúrguer simples',
      preco: 15.90,
      categoria_id: categoria.id,
      tempo_preparo: 15
    };

    const item = await Cardapio.create(itemData);

    expect(item.nome).toBe(itemData.nome);
    expect(parseFloat(item.preco)).toBe(itemData.preco);
    expect(item.categoria_id).toBe(categoria.id);
    expect(item.disponivel).toBe(true); // Default
  });

  it('deve validar preço mínimo', async () => {
    await expect(Cardapio.create({
      nome: 'Item Inválido',
      preco: -5.00,
      categoria_id: categoria.id
    })).rejects.toThrow();
  });

  it('deve validar campos obrigatórios', async () => {
    // Nome obrigatório
    await expect(Cardapio.create({
      preco: 10.00,
      categoria_id: categoria.id
    })).rejects.toThrow();

    // Preço obrigatório
    await expect(Cardapio.create({
      nome: 'Test Item',
      categoria_id: categoria.id
    })).rejects.toThrow();
  });

  it('deve buscar itens com categoria', async () => {
    await Cardapio.create({
      nome: 'X-Burger',
      preco: 15.90,
      categoria_id: categoria.id
    });

    const item = await Cardapio.findOne({
      include: [{
        model: Categoria,
        as: 'categoria'
      }]
    });

    expect(item.categoria.nome).toBe('Lanches');
  });
});