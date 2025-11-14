const sequelize = require('../config/database');
const { Op } = require('sequelize');


const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Cardapio = require('./Cardapio');
const Pedido = require('./Pedido');
const ItemPedido = require('./ItemPedido');


Categoria.hasMany(Cardapio, { 
  foreignKey: 'categoria_id', 
  as: 'itens' 
});
Cardapio.belongsTo(Categoria, { 
  foreignKey: 'categoria_id', 
  as: 'categoria' 
});

Pedido.hasMany(ItemPedido, { 
  foreignKey: 'pedido_id', 
  as: 'itens' 
});
ItemPedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id', 
  as: 'pedido' 
});

Cardapio.hasMany(ItemPedido, { 
  foreignKey: 'cardapio_id', 
  as: 'pedidos' 
});
ItemPedido.belongsTo(Cardapio, { 
  foreignKey: 'cardapio_id', 
  as: 'produto' 
});


const initDatabase = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ 
        alter: true,
        logging: console.log 
      });
      console.log('📊 Modelos sincronizados com banco');
      
      
      await runSeeds();
    } else {
      
      await sequelize.sync({ 
        alter: false,
        logging: false 
      });
      console.log(' Estrutura do banco verificada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Tentando criar estrutura do banco...');
      try {
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Estrutura do banco criada');
        await runSeeds();
      } catch (createError) {
        console.error('❌ Falha ao criar estrutura:', createError);
      }
    }
  }
};


const runSeeds = async () => {
  try {
    
    const userCount = await Usuario.count();
    const categoryCount = await Categoria.count();
    
    if (userCount === 0) {
      console.log('🌱 Criando usuário admin...');
      await Usuario.create({
        nome: 'Administrador',
        email: 'admin@cardapio.com',
        senha: 'admin123',
        tipo: 'admin',
        ativo: true
      });
      console.log('👤 Usuário admin criado: admin@cardapio.com / admin123');
    }
    
    if (categoryCount === 0) {
      console.log('🌱 Criando categorias e produtos...');
      
      
      const categorias = await Categoria.bulkCreate([
        { nome: 'Lanches', descricao: 'Hambúrguers e sanduíches', ativo: true },
        { nome: 'Pizzas', descricao: 'Pizzas tradicionais e especiais', ativo: true },
        { nome: 'Bebidas', descricao: 'Refrigerantes e sucos', ativo: true },
        { nome: 'Sobremesas', descricao: 'Doces e sobremesas', ativo: true },
        { nome: 'Pratos Principais', descricao: 'Refeições completas', ativo: true }
      ], { returning: true });
      
      
      await Cardapio.bulkCreate([
        
        {
          nome: 'X-Burger Clássico',
          descricao: 'Hambúrguer com carne 180g, queijo, alface, tomate e maionese',
          preco: 18.90,
          categoria_id: categorias[0].id,
          disponivel: true,
          tempo_preparo: 15
        },
        {
          nome: 'X-Bacon Especial',
          descricao: 'Hambúrguer com carne 180g, bacon crocante, queijo e salada',
          preco: 22.50,
          categoria_id: categorias[0].id,
          disponivel: true,
          tempo_preparo: 18
        },
        
        
        {
          nome: 'Pizza Margherita',
          descricao: 'Molho de tomate, mussarela de búfala e manjericão fresco',
          preco: 35.00,
          categoria_id: categorias[1].id,
          disponivel: true,
          tempo_preparo: 25
        },
        {
          nome: 'Pizza Portuguesa',
          descricao: 'Presunto, ovos, cebola, azeitona e mussarela',
          preco: 42.00,
          categoria_id: categorias[1].id,
          disponivel: true,
          tempo_preparo: 25
        },
        
        
        {
          nome: 'Coca-Cola 350ml',
          descricao: 'Refrigerante gelado',
          preco: 5.00,
          categoria_id: categorias[2].id,
          disponivel: true,
          tempo_preparo: 2
        },
        {
          nome: 'Suco de Laranja 500ml',
          descricao: 'Suco natural da fruta',
          preco: 8.50,
          categoria_id: categorias[2].id,
          disponivel: true,
          tempo_preparo: 5
        },
        
        
        {
          nome: 'Pudim de Leite',
          descricao: 'Pudim caseiro com calda de caramelo',
          preco: 8.50,
          categoria_id: categorias[3].id,
          disponivel: true,
          tempo_preparo: 5
        },
        {
          nome: 'Brownie com Sorvete',
          descricao: 'Brownie quente com bola de sorvete de baunilha',
          preco: 12.00,
          categoria_id: categorias[3].id,
          disponivel: true,
          tempo_preparo: 8
        },
        
        
        {
          nome: 'Lasanha Bolonhesa',
          descricao: 'Lasanha tradicional com molho bolonhesa e queijo',
          preco: 28.90,
          categoria_id: categorias[4].id,
          disponivel: true,
          tempo_preparo: 30
        },
        {
          nome: 'Frango Grelhado',
          descricao: 'Filé de frango grelhado com arroz e salada',
          preco: 22.50,
          categoria_id: categorias[4].id,
          disponivel: true,
          tempo_preparo: 25
        }
      ]);
      
      console.log('🍽️ Categorias e produtos criados');
    }
    
    console.log('✅ Seeds executados com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
  }
};


const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Conexão com banco encerrada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
};


process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando aplicação...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando aplicação...');
  await closeConnection();
  process.exit(0);
});



initDatabase();


module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Cardapio,
  Pedido,
  ItemPedido,
  Op,
  initDatabase,
  closeConnection
};