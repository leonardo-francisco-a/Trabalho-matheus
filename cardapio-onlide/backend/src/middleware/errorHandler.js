const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Dados já existem',
      field: err.errors[0]?.path
    });
  }

  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
};

module.exports = errorHandler;