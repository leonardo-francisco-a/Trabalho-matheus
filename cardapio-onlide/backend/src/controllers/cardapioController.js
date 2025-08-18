const { Cardapio, Categoria } = require('../models');

const listarItens = async (req, res) => {
  try {
    const { categoria_id, disponivel } = req.query;
    
    const where = {};
    if (categoria_id) where.categoria_id = categoria_id;
    if (disponivel !== undefined) where.disponivel = disponivel === 'true';

    const itens = await Cardapio.findAll({
      where,
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['id', 'nome']
      }],
      order: [['nome', 'ASC']]
    });

    res.json({
      itens,
      total: itens.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obterItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Cardapio.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria'
      }]
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const criarItem = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria_id, imagem_url, tempo_preparo } = req.body;

    const item = await Cardapio.create({
      nome,
      descricao,
      preco,
      categoria_id,
      imagem_url,
      tempo_preparo
    });

    const itemCompleto = await Cardapio.findByPk(item.id, {
      include: [{
        model: Categoria,
        as: 'categoria'
      }]
    });

    res.status(201).json({
      message: 'Item criado com sucesso',
      item: itemCompleto
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const atualizarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, categoria_id, imagem_url, disponivel, tempo_preparo } = req.body;

    const item = await Cardapio.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.update({
      nome,
      descricao,
      preco,
      categoria_id,
      imagem_url,
      disponivel,
      tempo_preparo
    });

    const itemAtualizado = await Cardapio.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria'
      }]
    });

    res.json({
      message: 'Item atualizado com sucesso',
      item: itemAtualizado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletarItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Cardapio.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.destroy();

    res.json({ message: 'Item deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listarItens,
  obterItem,
  criarItem,
  atualizarItem,
  deletarItem,
  listarCategorias
};