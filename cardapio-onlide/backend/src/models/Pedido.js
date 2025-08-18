const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cliente_nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  cliente_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('recebido', 'preparando', 'pronto', 'entregue', 'cancelado'),
    allowNull: false,
    defaultValue: 'recebido'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo_entrega: {
    type: DataTypes.ENUM('balcao', 'delivery'),
    allowNull: false,
    defaultValue: 'balcao'
  },
  endereco_entrega: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  numero_pedido: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'pedidos',
  hooks: {
    beforeCreate: async (pedido) => {
      // Gerar número único do pedido
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      pedido.numero_pedido = `PED${timestamp}${random}`;
    }
  }
});

module.exports = Pedido;