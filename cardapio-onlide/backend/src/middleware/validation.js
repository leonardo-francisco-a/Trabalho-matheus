const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
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

const validatePedido = [
  body('cliente_nome').trim().isLength({ min: 2, max: 255 }).withMessage('Nome do cliente é obrigatório'),
  body('cliente_telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('cliente_email').optional().isEmail().withMessage('Email inválido'),
  body('itens').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos um item'),
  body('itens.*.cardapio_id').isInt().withMessage('ID do produto é obrigatório'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser pelo menos 1'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateCardapioItem,
  validatePedido
};