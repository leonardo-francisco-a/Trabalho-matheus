import React, { useState, useEffect } from 'react';
import './ProductModal.css';

const ProductModal = ({ produto, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setObservacoes('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !produto) return null;

  const productIcons = {
    'Lanches': '🍔',
    'Pizzas': '🍕', 
    'Bebidas': '🥤',
    'Sobremesas': '🍰',
    'Pratos Principais': '🍽️'
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getProductIcon = () => {
    const categoryName = produto.categoria?.nome || 'Lanches';
    return productIcons[categoryName] || '🍽️';
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    const productToAdd = {
      ...produto,
      quantity,
      observacoes
    };
    
    // Adicionar múltiplas vezes se quantidade > 1
    for (let i = 0; i < quantity; i++) {
      onAddToCart({ ...produto, observacoes });
    }
    
    onClose();
  };

  const totalPrice = produto.preco * quantity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-body">
          <div className="product-image-large">
            <span className="product-emoji-large">{getProductIcon()}</span>
            {!produto.disponivel && (
              <div className="unavailable-overlay">
                <span>Indisponível</span>
              </div>
            )}
          </div>
          
          <div className="product-details-full">
            <div className="product-header">
              <h2 className="product-title">{produto.nome}</h2>
              <div className="product-category">
                {produto.categoria?.nome || 'Categoria'}
              </div>
            </div>
            
            {produto.descricao && (
              <p className="product-description-full">
                {produto.descricao}
              </p>
            )}
            
            <div className="product-info-grid">
              <div className="info-item">
                <span className="info-label">Preço</span>
                <span className="info-value price">{formatPrice(produto.preco)}</span>
              </div>
              
              {produto.tempo_preparo && (
                <div className="info-item">
                  <span className="info-label">Tempo de Preparo</span>
                  <span className="info-value">⏱️ {produto.tempo_preparo} min</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`info-value status ${produto.disponivel ? 'available' : 'unavailable'}`}>
                  {produto.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                </span>
              </div>
            </div>
            
            {produto.disponivel && (
              <>
                <div className="quantity-section">
                  <label className="quantity-label">Quantidade</label>
                  <div className="quantity-controls-large">
                    <button 
                      className="qty-btn-large"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button 
                      className="qty-btn-large"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="observations-section">
                  <label htmlFor="observacoes" className="observations-label">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="observacoes"
                    className="observations-input"
                    placeholder="Ex: Sem cebola, ponto da carne bem passado..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <div className="char-count">
                    {observacoes.length}/200
                  </div>
                </div>
                
                <div className="modal-footer">
                  <div className="total-section">
                    <div className="total-breakdown">
                      <span>
                        {quantity}x {formatPrice(produto.preco)}
                      </span>
                      <span className="total-price">
                        Total: {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className="add-to-cart-large"
                    onClick={handleAddToCart}
                  >
                    Adicionar ao Carrinho - {formatPrice(totalPrice)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
    