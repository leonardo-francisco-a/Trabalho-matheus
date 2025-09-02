import React, { useState, useMemo } from 'react';
import ProductModal from './ProductModal';
import './ProductGrid.css';

const ProductGrid = ({ 
  produtos = [], 
  selectedCategory, 
  onAddToCart, 
  loading,
  searchTerm = '',
  filters = {}
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const productIcons = {
    'Lanches': '🍔',
    'Pizzas': '🍕', 
    'Bebidas': '🥤',
    'Sobremesas': '🍰',
    'Pratos Principais': '🍽️'
  };

  // Função para filtrar e buscar produtos
  const filteredProducts = useMemo(() => {
    let filtered = produtos;

    // Filtrar por categoria
    if (selectedCategory?.id !== 'all' && selectedCategory?.nome !== 'Todos') {
      filtered = filtered.filter(produto => produto.categoria_id === selectedCategory?.id);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(produto => 
        produto.nome.toLowerCase().includes(term) ||
        produto.descricao?.toLowerCase().includes(term) ||
        produto.categoria?.nome.toLowerCase().includes(term)
      );
    }

    // Aplicar filtros avançados
    if (filters.disponivel && filters.disponivel !== 'all') {
      const isAvailable = filters.disponivel === 'true';
      filtered = filtered.filter(produto => produto.disponivel === isAvailable);
    }

    if (filters.categoria && filters.categoria !== 'all') {
      filtered = filtered.filter(produto => 
        produto.categoria?.nome === filters.categoria
      );
    }

    if (filters.precoMin && !isNaN(parseFloat(filters.precoMin))) {
      const minPrice = parseFloat(filters.precoMin);
      filtered = filtered.filter(produto => produto.preco >= minPrice);
    }

    if (filters.precoMax && !isNaN(parseFloat(filters.precoMax))) {
      const maxPrice = parseFloat(filters.precoMax);
      filtered = filtered.filter(produto => produto.preco <= maxPrice);
    }

    // Ordenar por nome
    return filtered.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos, selectedCategory, searchTerm, filters]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getProductIcon = (produto) => {
    const categoryName = produto.categoria?.nome || 'Lanches';
    return productIcons[categoryName] || '🍽️';
  };

  const handleProductClick = (produto) => {
    setSelectedProduct(produto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const getCategoryTitle = () => {
    if (searchTerm) {
      return `Resultados para "${searchTerm}" (${filteredProducts.length})`;
    }
    
    if (selectedCategory?.nome === 'Todos' || selectedCategory?.id === 'all') {
      return `Todos os Produtos (${filteredProducts.length})`;
    }
    
    return `${selectedCategory?.nome} (${filteredProducts.length})`;
  };

  if (loading) {
    return (
      <div className="loading-products">
        <div className="loading-spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">
          {searchTerm ? '🔍' : '🍽️'}
        </div>
        <h3>
          {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum produto disponível'}
        </h3>
        <p>
          {searchTerm 
            ? `Não encontramos produtos para "${searchTerm}". Tente outros termos.`
            : 'Não há produtos disponíveis nesta categoria.'
          }
        </p>
        {searchTerm && (
          <div className="search-suggestions">
            <p>Sugestões:</p>
            <ul>
              <li>Verifique a ortografia</li>
              <li>Tente palavras mais gerais</li>
              <li>Use termos diferentes</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="category-header">
        <h2>{getCategoryTitle()}</h2>
        {(searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '')) && (
          <div className="filter-indicators">
            {searchTerm && (
              <span className="filter-tag search-tag">
                🔍 "{searchTerm}"
              </span>
            )}
            {filters.disponivel && filters.disponivel !== 'all' && (
              <span className="filter-tag">
                {filters.disponivel === 'true' ? '✅ Disponível' : '❌ Indisponível'}
              </span>
            )}
            {filters.categoria && filters.categoria !== 'all' && (
              <span className="filter-tag">
                📂 {filters.categoria}
              </span>
            )}
            {(filters.precoMin || filters.precoMax) && (
              <span className="filter-tag">
                💰 {filters.precoMin ? `Min: ${formatPrice(filters.precoMin)}` : ''}
                {filters.precoMin && filters.precoMax ? ' - ' : ''}
                {filters.precoMax ? `Max: ${formatPrice(filters.precoMax)}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="product-grid">
        {filteredProducts.map((produto) => (
          <div 
            key={produto.id} 
            className={`product-card ${!produto.disponivel ? 'unavailable' : ''}`}
            onClick={() => handleProductClick(produto)}
          >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (produto.disponivel) {
                      onAddToCart(produto);
                    }
                  }}
                  disabled={!produto.disponivel}
                >
                  {produto.disponivel ? 'Adicionar' : 'Indisponível'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductModal 
        produto={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={onAddToCart}
      />
    </>
  );
};

export default ProductGrid;