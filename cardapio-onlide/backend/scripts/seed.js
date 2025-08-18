const { Usuario, Categoria, Cardapio } = require('../src/models');

async function seed() {
  try {
    console.log('🌱 Executando seeds...');

    // Verificar se já existem dados
    const userCount = await Usuario.count();
    if (userCount > 0) {
      console.log('⚠️ Dados já existem, pulando seeds...');
      return;
    }

    // Criar admin padrão
    await Usuario.create({
      nome: 'Administrador',
      email: 'admin@cardapio.com',
      senha: 'admin123',
      tipo: 'admin'
    });

    console.log('✅ Usuário admin criado: admin@cardapio.com / admin123');

    // Criar categorias
    const categorias = await Categoria.bulkCreate([
      { nome: 'Lanches', descricao: 'Hambúrguers e sanduíches' },
      { nome: 'Pizzas', descricao: 'Pizzas tradicionais e especiais' },
      { nome: 'Bebidas', descricao: 'Refrigerantes e sucos' },
      { nome: 'Sobremesas', descricao: 'Doces e sobremesas' }
    ]);

    console.log('✅ Categorias criadas');

    // Criar itens do cardápio
    await Cardapio.bulkCreate([
      {
        nome: 'X-Burger Clássico',
        descricao: 'Hambúrguer com carne, queijo, alface e tomate',
        preco: 18.90,
        categoria_id: categorias[0].id
      },
      {
        nome: 'Pizza Margherita',
        descricao: 'Pizza com molho, mussarela e manjericão',
        preco: 35.00,
        categoria_id: categorias[1].id
      },
      {
        nome: 'Coca-Cola 350ml',
        descricao: 'Refrigerante gelado',
        preco: 5.00,
        categoria_id: categorias[2].id
      },
      {
        nome: 'Pudim de Leite',
        descricao: 'Pudim caseiro com calda de caramelo',
        preco: 8.50,
        categoria_id: categorias[3].id
      }
    ]);

    console.log('✅ Itens do cardápio criados');
    console.log('🎉 Seeds executados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
  }
}

seed();