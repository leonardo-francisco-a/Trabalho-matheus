const express = require('express');
const { Pedido, ItemPedido, Cardapio, Categoria } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Estatísticas gerais
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);

    // Pedidos de hoje
    const pedidosHoje = await Pedido.count({
      where: {
        createdAt: {
          [Op.between]: [inicioHoje, fimHoje]
        }
      }
    });

    // Faturamento de hoje
    const faturamentoHoje = await Pedido.sum('total', {
      where: {
        createdAt: {
          [Op.between]: [inicioHoje, fimHoje]
        },
        status: {
          [Op.notIn]: ['cancelado']
        }
      }
    }) || 0;

    // Pedidos por status
    const pedidosPorStatus = await Pedido.findAll({
      attributes: [
        'status',
        [Pedido.sequelize.fn('COUNT', Pedido.sequelize.col('id')), 'quantidade']
      ],
      group: ['status']
    });

    // Total de itens no cardápio
    const totalItensCardapio = await Cardapio.count({
      where: { disponivel: true }
    });

    // Pedidos pendentes (recebido + preparando)
    const pedidosPendentes = await Pedido.count({
      where: {
        status: {
          [Op.in]: ['recebido', 'preparando']
        }
      }
    });

    res.json({
      pedidos_hoje: pedidosHoje,
      faturamento_hoje: parseFloat(faturamentoHoje).toFixed(2),
      pedidos_pendentes: pedidosPendentes,
      total_itens_cardapio: totalItensCardapio,
      pedidos_por_status: pedidosPorStatus.map(p => ({
        status: p.status,
        quantidade: parseInt(p.dataValues.quantidade)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relatório de vendas
router.get('/vendas', auth, adminOnly, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    const where = {
      status: {
        [Op.notIn]: ['cancelado']
      }
    };

    if (data_inicio && data_fim) {
      where.createdAt = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    // Faturamento por dia
    const vendasPorDia = await Pedido.findAll({
      attributes: [
        [Pedido.sequelize.fn('DATE', Pedido.sequelize.col('createdAt')), 'data'],
        [Pedido.sequelize.fn('SUM', Pedido.sequelize.col('total')), 'faturamento'],
        [Pedido.sequelize.fn('COUNT', Pedido.sequelize.col('id')), 'pedidos']
      ],
      where,
      group: [Pedido.sequelize.fn('DATE', Pedido.sequelize.col('createdAt'))],
      order: [[Pedido.sequelize.fn('DATE', Pedido.sequelize.col('createdAt')), 'DESC']]
    });

    // Produtos mais vendidos
    const produtosMaisVendidos = await ItemPedido.findAll({
      attributes: [
        'cardapio_id',
        [ItemPedido.sequelize.fn('SUM', ItemPedido.sequelize.col('quantidade')), 'total_vendido'],
        [ItemPedido.sequelize.fn('SUM', 
          ItemPedido.sequelize.literal('quantidade * preco_unitario')
        ), 'faturamento']
      ],
      include: [{
        model: Cardapio,
        as: 'produto',
        attributes: ['nome', 'preco']
      }, {
        model: Pedido,
        as: 'pedido',
        where: {
          status: { [Op.notIn]: ['cancelado'] },
          ...(data_inicio && data_fim ? {
            createdAt: { [Op.between]: [new Date(data_inicio), new Date(data_fim)] }
          } : {})
        },
        attributes: []
      }],
      group: ['cardapio_id'],
      order: [[ItemPedido.sequelize.fn('SUM', ItemPedido.sequelize.col('quantidade')), 'DESC']],
      limit: 10
    });

    res.json({
      vendas_por_dia: vendasPorDia.map(v => ({
        data: v.dataValues.data,
        faturamento: parseFloat(v.dataValues.faturamento).toFixed(2),
        pedidos: parseInt(v.dataValues.pedidos)
      })),
      produtos_mais_vendidos: produtosMaisVendidos.map(p => ({
        produto: p.produto.nome,
        total_vendido: parseInt(p.dataValues.total_vendido),
        faturamento: parseFloat(p.dataValues.faturamento).toFixed(2)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
