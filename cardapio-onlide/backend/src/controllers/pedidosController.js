const { Pedido, ItemPedido, Cardapio, Categoria } = require('../models');
const { sequelize } = require('../models');

const criarPedido = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('📋 Dados recebidos para criar pedido:', req.body);
    
    const {
      cliente_nome,
      cliente_telefone,
      cliente_email,
      observacoes,
      tipo_entrega,
      endereco_entrega,
      itens
    } = req.body;

    // Validações básicas
    if (!cliente_nome || cliente_nome.trim() === '') {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Nome do cliente é obrigatório' }]
      });
    }

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Pedido deve ter pelo menos um item' }]
      });
    }

    // Validar tipo de entrega
    const tiposValidos = ['delivery', 'retirada', 'balcao'];
    if (!tiposValidos.includes(tipo_entrega)) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Tipo de entrega inválido' }]
      });
    }

    // Se delivery, endereço é obrigatório
    if (tipo_entrega === 'delivery' && (!endereco_entrega || endereco_entrega.trim() === '')) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Endereço é obrigatório para delivery' }]
      });
    }

    // Calcular total e validar produtos
    let total = 0;
    const itensComPreco = [];

    for (const item of itens) {
      // Validar estrutura do item
      if (!item.cardapio_id || !item.quantidade) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: [{ msg: 'Cada item deve ter cardapio_id e quantidade' }]
        });
      }

      // Buscar produto no banco
      const produto = await Cardapio.findByPk(item.cardapio_id);
      if (!produto) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Produto não encontrado',
          details: [{ msg: `Produto ID ${item.cardapio_id} não existe` }]
        });
      }
      
      if (!produto.disponivel) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Produto indisponível',
          details: [{ msg: `Produto ${produto.nome} não está disponível` }]
        });
      }

      const quantidade = parseInt(item.quantidade);
      if (quantidade <= 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: [{ msg: 'Quantidade deve ser maior que zero' }]
        });
      }

      const subtotal = parseFloat(produto.preco) * quantidade;
      total += subtotal;

      itensComPreco.push({
        cardapio_id: item.cardapio_id,
        quantidade: quantidade,
        preco_unitario: produto.preco,
        observacoes: item.observacoes || null
      });
    }

    console.log('💰 Total calculado:', total);
    console.log('🛒 Itens processados:', itensComPreco);

    // Criar pedido
    const pedido = await Pedido.create({
      cliente_nome: cliente_nome.trim(),
      cliente_telefone: cliente_telefone || null,
      cliente_email: cliente_email || null,
      observacoes: observacoes || null,
      tipo_entrega: tipo_entrega,
      endereco_entrega: tipo_entrega === 'delivery' ? endereco_entrega.trim() : null,
      total: total.toFixed(2)
    }, { transaction });

    console.log('📋 Pedido criado:', pedido.id);

    // Criar itens do pedido
    for (const item of itensComPreco) {
      await ItemPedido.create({
        pedido_id: pedido.id,
        ...item
      }, { transaction });
    }

    await transaction.commit();
    console.log('✅ Transação confirmada');

    // Buscar pedido completo com relacionamentos
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

    console.log('🎉 Pedido criado com sucesso:', pedidoCompleto.numero_pedido);

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      pedido: pedidoCompleto
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro ao criar pedido:', error);
    
    // Se for erro de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors.map(e => ({ msg: e.message }))
      });
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const listarPedidos = async (req, res) => {
  try {
    const { status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status && status !== 'todos') {
      where.status = status;
    }
    
    if (data_inicio && data_fim) {
      where.createdAt = {
        [require('sequelize').Op.between]: [new Date(data_inicio), new Date(data_fim)]
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
    console.error('❌ Erro ao listar pedidos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
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
    console.error('❌ Erro ao obter pedido:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['recebido', 'preparando', 'pronto', 'entregue', 'cancelado'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Status inválido' }]
      });
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
    console.error('❌ Erro ao atualizar status:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

module.exports = {
  criarPedido,
  listarPedidos,
  obterPedido,
  atualizarStatusPedido
};