const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Erros de validação:', errors.array());
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

const validateCardapioItem = [
  body('nome').trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('preco').isDecimal({ decimal_digits: '0,2' }).withMessage('Preço deve ser um valor decimal válido'),
  body('categoria_id').optional().isInt().withMessage('ID da categoria deve ser um número inteiro'),
  handleValidationErrors
];

// ✅ VALIDAÇÃO CORRIGIDA PARA PEDIDOS
const validatePedido = [
  // Nome do cliente é obrigatório
  body('cliente_nome')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome do cliente deve ter entre 2 e 255 caracteres'),
  
  // Telefone é opcional, mas se fornecido deve ter formato válido
  body('cliente_telefone')
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 20 })
    .withMessage('Telefone deve ter entre 8 e 20 caracteres'),
  
  // Email é opcional, mas se fornecido deve ser válido
  body('cliente_email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email deve ter formato válido'),
  
  // Tipo de entrega deve ser válido
  body('tipo_entrega')
    .isIn(['delivery', 'retirada', 'balcao'])
    .withMessage('Tipo de entrega deve ser: delivery, retirada ou balcao'),
  
  // Endereço é obrigatório apenas para delivery
  body('endereco_entrega')
    .if(body('tipo_entrega').equals('delivery'))
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Endereço é obrigatório para delivery e deve ter entre 5 e 500 caracteres'),
  
  // Observações são opcionais
  body('observacoes')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres'),
  
  // Itens devem ser um array não vazio
  body('itens')
    .isArray({ min: 1 })
    .withMessage('Pedido deve ter pelo menos um item'),
  
  // Cada item deve ter cardapio_id válido
  body('itens.*.cardapio_id')
    .isInt({ min: 1 })
    .withMessage('ID do produto deve ser um número inteiro válido'),
  
  // Cada item deve ter quantidade válida
  body('itens.*.quantidade')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantidade deve ser um número entre 1 e 99'),
  
  // Observações do item são opcionais
  body('itens.*.observacoes')
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Observações do item devem ter no máximo 200 caracteres'),
  
  handleValidationErrors
];

// ✅ VALIDAÇÃO MAIS FLEXÍVEL PARA PEDIDOS (fallback)
const validatePedidoFlexible = (req, res, next) => {
  console.log('🔍 Validando pedido (modo flexível):', req.body);
  
  const { cliente_nome, tipo_entrega, itens } = req.body;
  const errors = [];

  // Validar nome do cliente
  if (!cliente_nome || typeof cliente_nome !== 'string' || cliente_nome.trim().length < 2) {
    errors.push({ msg: 'Nome do cliente é obrigatório e deve ter pelo menos 2 caracteres' });
  }

  // Validar tipo de entrega
  const tiposValidos = ['delivery', 'retirada', 'balcao'];
  if (!tipo_entrega || !tiposValidos.includes(tipo_entrega)) {
    errors.push({ msg: 'Tipo de entrega deve ser: delivery, retirada ou balcao' });
  }

  // Validar itens
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    errors.push({ msg: 'Pedido deve ter pelo menos um item' });
  } else {
    itens.forEach((item, index) => {
      if (!item.cardapio_id || isNaN(parseInt(item.cardapio_id))) {
        errors.push({ msg: `Item ${index + 1}: ID do produto inválido` });
      }
      if (!item.quantidade || isNaN(parseInt(item.quantidade)) || parseInt(item.quantidade) < 1) {
        errors.push({ msg: `Item ${index + 1}: Quantidade deve ser pelo menos 1` });
      }
    });
  }

  // Validar endereço para delivery
  if (tipo_entrega === 'delivery') {
    const { endereco_entrega } = req.body;
    if (!endereco_entrega || typeof endereco_entrega !== 'string' || endereco_entrega.trim().length < 5) {
      errors.push({ msg: 'Endereço é obrigatório para delivery' });
    }
  }

  if (errors.length > 0) {
    console.log('❌ Erros de validação flexível:', errors);
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors
    });
  }

  console.log('✅ Validação flexível passou');
  next();
};

module.exports = {
  handleValidationErrors,
  validateCardapioItem,
  validatePedido,
  validatePedidoFlexible
};