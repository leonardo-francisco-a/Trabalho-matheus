const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  // Erro de constraint único
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Dados já existem',
      field: err.errors[0]?.path
    });
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Erro interno do servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};

module.exports = errorHandler;