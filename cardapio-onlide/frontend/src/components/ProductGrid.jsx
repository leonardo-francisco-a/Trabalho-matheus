import './ProductGrid.css'

const ProductGrid = ({ produtos = [], selectedCategory, onAddToCart, loading }) => {
  const productIcons = {
    'Lanches': '🍔',
    'Pizzas': '🍕', 
    'Bebidas': '🥤',
    'Sobremesas': '🍰'
  }

  // Filtrar produtos por categoria
  const filteredProducts = selectedCategory?.id === 'all' || selectedCategory?.nome === 'Todos'
    ? produtos 
    : produtos.filter(produto => produto.categoria_id === selectedCategory?.id)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getProductIcon = (produto) => {
    const categoryName = produto.categoria?.nome || 'Lanches'
    return productIcons[categoryName] || '🍽️'
  }

  if (loading) {
    return (
      <div className="loading-products">
        <div className="loading-spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">🍽️</div>
        <h3>Nenhum produto encontrado</h3>
        <p>Não há produtos disponíveis nesta categoria.</p>
      </div>
    )
  }

  return (
    <>
      <div className="category-header">
        <h2>
          {selectedCategory?.nome === 'Todos' || selectedCategory?.id === 'all' 
            ? `Todos os Produtos (${filteredProducts.length})` 
            : `${selectedCategory?.nome} (${filteredProducts.length})`
          }
        </h2>
      </div>
      
      <div className="product-grid">
        {filteredProducts.map((produto) => (
          <div key={produto.id} className="product-card">
            <div className="product-image">
              <span className="product-emoji">{getProductIcon(produto)}</span>
              {!produto.disponivel && (
                <div className="unavailable-badge">Indisponível</div>
              )}
            </div>
            
            <div className="product-info">
              <h3 className="product-name" title={produto.nome}>
                {produto.nome}
              </h3>
              
              {produto.descricao && (
                <p className="product-description" title={produto.descricao}>
                  {produto.descricao}
                </p>
              )}
              
              <div className="product-footer">
                <div className="product-pricing">
                  <span className="product-price">
                    {formatPrice(produto.preco)}
                  </span>
                  {produto.tempo_preparo && (
                    <span className="prep-time">
                      ⏱️ {produto.tempo_preparo}min
                    </span>
                  )}
                </div>
                
                <button 
                  className={`add-to-cart-btn ${!produto.disponivel ? 'disabled' : ''}`}
                  onClick={() => produto.disponivel && onAddToCart(produto)}
                  disabled={!produto.disponivel}
                >
                  {produto.disponivel ? 'Adicionar' : 'Indisponível'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ProductGrid