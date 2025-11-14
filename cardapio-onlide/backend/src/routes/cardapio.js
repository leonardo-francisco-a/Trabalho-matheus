const express = require('express');
const {
  listarItens,
  obterItem,
  criarItem,
  atualizarItem,
  deletarItem,
  listarCategorias
} = require('../controllers/cardapioController');
const { auth, adminOnly } = require('../middleware/auth');
const { validateCardapioItem } = require('../middleware/validation');

const router = express.Router();


router.get('/', listarItens);
router.get('/categorias', listarCategorias);
router.get('/:id', obterItem);


router.post('/', auth, adminOnly, validateCardapioItem, criarItem);
router.put('/:id', auth, adminOnly, validateCardapioItem, atualizarItem);
router.delete('/:id', auth, adminOnly, deletarItem);

module.exports = router;