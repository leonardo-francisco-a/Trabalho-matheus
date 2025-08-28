import './Cart.css'

const Cart = ({ items = [], setItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const updateQuantity = (id, newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, newQuantity)
    } else if (setItems) {
      // Fallback para compatibilidade
      if (newQuantity === 0) {
        setItems(items.filter(item => item.id !== id))
      } else {
        setItems(items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        ))
      }
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.price || item.preco || 0
    return sum + (price * item.quantity)
  }, 0)
  
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>Pedido</h3>
        <div className="order-type">
          <button className="order-btn active">Delivery</button>
          <button className="order-btn">Retirar</button>
          <button className="order-btn">Local</button>
        </div>
      </div>

      <div className="cart-items">
        {items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#666' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <p>Carrinho vazio</p>
            <small>Adicione produtos para continuar</small>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                {item.image || '🍽️'}
              </div>
              <div className="item-details">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-price">
                  {formatPrice(item.price || item.preco || 0)}
                </p>
              </div>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="cart-summary">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-line">
              <span>Taxa de serviço</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="payment-section">
            <div className="payment-method">
              <span className="payment-icon">💳</span>
              <span>Cartão de Crédito</span>
            </div>
            <button className="order-place-btn">
              Finalizar Pedido
            </button>
            {onClearCart && (
              <button 
                onClick={onClearCart}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Limpar Carrinho
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Cart