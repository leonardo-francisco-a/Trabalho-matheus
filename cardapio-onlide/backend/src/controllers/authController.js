const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se usuário existe
    const usuario = await Usuario.findOne({ where: { email, ativo: true } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = gerarToken(usuario.id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      telefone,
      tipo: 'admin' // Por padrão, registro cria admin
    });

    const token = gerarToken(usuario.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const me = async (req, res) => {
  res.json({
    usuario: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
      tipo: req.usuario.tipo,
      telefone: req.usuario.telefone
    }
  });
};

module.exports = { login, register, me };