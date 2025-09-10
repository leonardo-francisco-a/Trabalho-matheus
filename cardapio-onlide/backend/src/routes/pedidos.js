const express = require('express');
const {
  criarPedido,
  listarPedidos,
  obterPedido,
  atualizarStatusPedido
} = require('../controllers/pedidosController');
const { auth, adminOnly } = require('../middleware/auth');
const { validatePedidoFlexible } = require('../middleware/validation');

const router = express.Router();

// ✅ ROTA PÚBLICA PARA CRIAR PEDIDOS (sem autenticação)
// Usar validação flexível para evitar erros desnecessários
router.post('/', validatePedidoFlexible, criarPedido);

// ✅ ROTA PÚBLICA PARA VER PEDIDO ESPECÍFICO (para o cliente)
router.get('/:id', obterPedido);

// ✅ ROTAS ADMINISTRATIVAS (requer autenticação)
router.get('/', auth, adminOnly, listarPedidos);
router.put('/:id/status', auth, adminOnly, atualizarStatusPedido);

module.exports = router;