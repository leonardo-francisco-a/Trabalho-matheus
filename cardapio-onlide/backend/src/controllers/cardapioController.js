const { Cardapio, Categoria } = require('../models');

const listarItens = async (req, res) => {
  try {
    console.log('📋 Listando itens do cardápio...');
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

    console.log(`✅ ${itens.length} itens encontrados`);
    res.json({
      itens,
      total: itens.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar itens:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const obterItem = async (req, res) => {
  try {
    console.log(`📋 Buscando item ${req.params.id}...`);
    const { id } = req.params;
    
    const item = await Cardapio.findByPk(id, {
      include: [{
        model: Categoria,
        as: 'categoria'
      }]
    });

    if (!item) {
      console.log(`❌ Item ${id} não encontrado`);
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    console.log(`✅ Item encontrado: ${item.nome}`);
    res.json(item);
  } catch (error) {
    console.error('❌ Erro ao obter item:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

const criarItem = async (req, res) => {
  try {
    console.log('📋 Criando novo item...');
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

    console.log(`✅ Item criado: ${itemCompleto.nome}`);
    res.status(201).json({
      message: 'Item criado com sucesso',
      item: itemCompleto
    });
  } catch (error) {
    console.error('❌ Erro ao criar item:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

const atualizarItem = async (req, res) => {
  try {
    console.log(`📋 Atualizando item ${req.params.id}...`);
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

    console.log(`✅ Item atualizado: ${itemAtualizado.nome}`);
    res.json({
      message: 'Item atualizado com sucesso',
      item: itemAtualizado
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

const deletarItem = async (req, res) => {
  try {
    console.log(`📋 Deletando item ${req.params.id}...`);
    const { id } = req.params;

    const item = await Cardapio.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.destroy();
    console.log(`✅ Item deletado: ${item.nome}`);
    res.json({ message: 'Item deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar item:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
};

const listarCategorias = async (req, res) => {
  try {
    console.log('📂 Listando categorias...');
    
    const categorias = await Categoria.findAll({
      where: { ativo: true },
      order: [['nome', 'ASC']]
    });

    console.log(`✅ ${categorias.length} categorias encontradas:`, categorias.map(c => c.nome));
    res.json(categorias);
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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