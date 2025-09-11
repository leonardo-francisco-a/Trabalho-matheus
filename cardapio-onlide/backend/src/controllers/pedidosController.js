const { Pedido, ItemPedido, Cardapio, Categoria } = require('../models');
const { sequelize } = require('../models');

const criarPedido = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      cliente_nome,
      cliente_telefone,
      cliente_email,
      observacoes,
      tipo_entrega,
      endereco_entrega,
      itens
    } = req.body;

    // Calcular total
    let total = 0;
    const itensComPreco = [];

    for (const item of itens) {
      const produto = await Cardapio.findByPk(item.cardapio_id);
      if (!produto) {
        await transaction.rollback();
        return res.status(400).json({ error: `Produto ID ${item.cardapio_id} não encontrado` });
      }
      
      if (!produto.disponivel) {
        await transaction.rollback();
        return res.status(400).json({ error: `Produto ${produto.nome} não está disponível` });
      }

      const subtotal = parseFloat(produto.preco) * item.quantidade;
      total += subtotal;

      itensComPreco.push({
        cardapio_id: item.cardapio_id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
        observacoes: item.observacoes
      });
    }

    // Criar pedido
    const pedido = await Pedido.create({
      cliente_nome,
      cliente_telefone,
      cliente_email,
      observacoes,
      tipo_entrega,
      endereco_entrega,
      total: total.toFixed(2)
    }, { transaction });

    // Criar itens do pedido
    for (const item of itensComPreco) {
      await ItemPedido.create({
        pedido_id: pedido.id,
        ...item
      }, { transaction });
    }

    await transaction.commit();

    // Buscar pedido completo
    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [{
        model: ItemPedido,
        as: 'itens',
        include: [{
          model: Cardapio,
          as: 'produto',
          include: [{
            model: Categoria,
            as: 'categoria'
          }]
        }]
      }]
    });

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      pedido: pedidoCompleto
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

const listarPedidos = async (req, res) => {
  try {
    const { status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    
    if (data_inicio && data_fim) {
      where.createdAt = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: pedidos } = await Pedido.findAndCountAll({
      where,
      include: [{
        model: ItemPedido,
        as: 'itens',
        include: [{
          model: Cardapio,
          as: 'produto'
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      pedidos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obterPedido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedido = await Pedido.findByPk(id, {
      include: [{
        model: ItemPedido,
        as: 'itens',
        include: [{
          model: Cardapio,
          as: 'produto',
          include: [{
            model: Categoria,
            as: 'categoria'
          }]
        }]
      }]
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    await pedido.update({ status });

    res.json({
      message: 'Status do pedido atualizado com sucesso',
      pedido: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        status: pedido.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  criarPedido,
  listarPedidos,
  obterPedido,
  atualizarStatusPedido
};