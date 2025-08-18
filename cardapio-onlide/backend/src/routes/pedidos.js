const express = require('express');
const {
  criarPedido,
  listarPedidos,
  obterPedido,
  atualizarStatusPedido
} = require('../controllers/pedidosController');
const { auth, adminOnly } = require('../middleware/auth');
const { validatePedido } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas (para clientes)
router.post('/', validatePedido, criarPedido);
router.get('/:id', obterPedido);

// Rotas administrativas
router.get('/', auth, adminOnly, listarPedidos);
router.put('/:id/status', auth, adminOnly, atualizarStatusPedido);

module.exports = router;
