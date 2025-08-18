const express = require('express');
const { body } = require('express-validator');
const { login, register, me } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validações
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors
];

const registerValidation = [
  body('nome').trim().isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('telefone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  handleValidationErrors
];

// Rotas
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/me', auth, me);

module.exports = router;