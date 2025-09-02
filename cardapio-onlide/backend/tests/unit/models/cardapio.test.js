const { Cardapio, Categoria } = require('../../../src/models');

describe('Cardapio Model', () => {
  let categoria;

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
