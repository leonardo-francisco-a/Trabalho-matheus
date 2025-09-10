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

    // 🔧 CORREÇÃO: Validar tipos de entrega corretos
    const tiposValidos = ['delivery', 'retirada', 'balcao'];
    if (!tiposValidos.includes(tipo_entrega)) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: [{ msg: 'Tipo de entrega deve ser: delivery, retirada ou balcao' }]
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

// ... resto do controller permanece igual

module.exports = {
  criarPedido,
  // ... outras funções
};