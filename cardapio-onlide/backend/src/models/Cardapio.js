const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  imagem_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tempo_preparo: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Tempo em minutos'
  }
}, {
  tableName: 'cardapio'
});

module.exports = Cardapio;