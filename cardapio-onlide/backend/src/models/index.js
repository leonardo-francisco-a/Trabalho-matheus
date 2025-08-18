const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Cardapio = require('./Cardapio');
const Pedido = require('./Pedido');
const ItemPedido = require('./ItemPedido');

// Relacionamentos
Categoria.hasMany(Cardapio, { foreignKey: 'categoria_id', as: 'itens' });
Cardapio.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

Pedido.hasMany(ItemPedido, { foreignKey: 'pedido_id', as: 'itens' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });

Cardapio.hasMany(ItemPedido, { foreignKey: 'cardapio_id', as: 'pedidos' });
ItemPedido.belongsTo(Cardapio, { foreignKey: 'cardapio_id', as: 'produto' });

// Sincronizar modelos (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true })
    .then(() => console.log('📊 Modelos sincronizados com banco'))
    .catch(err => console.error('❌ Erro ao sincronizar modelos:', err));
}

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Cardapio,
  Pedido,
  ItemPedido
};