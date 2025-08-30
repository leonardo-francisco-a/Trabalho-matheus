import { useState } from 'react'
import './Cart.css'

const Cart = ({ 
  items = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onPlaceOrder,
  loading 
}) => {
  const [orderType, setOrderType] = useState('delivery')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [customerData, setCustomerData] = useState({
    nome: '',
    telefone: '',
    endereco: ''
  })

  const updateQuantity = (id, newQuantity) => {
    onUpdateQuantity(id, newQuantity)
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.preco || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
  
  const deliveryFee = orderType === 'delivery' ? 5.00 : 0
  const total = subtotal + deliveryFee

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handlePlaceOrder = async () => {
    if (orderType !== 'balcao' && (!customerData.nome || !customerData.telefone)) {
      alert('Preencha nome e telefone para continuar')
      return
    }

    if (orderType === 'delivery' && !customerData.endereco) {
      alert('Preencha o endereço para delivery')
      return
    }

    try {
      await onPlaceOrder({
        cliente_nome: customerData.nome || 'Cliente Balcão',
        cliente_telefone: customerData.telefone,
        endereco_entrega: orderType === 'delivery' ? customerData.endereco : null,
        tipo_entrega: orderType,
        itens: items.map(item => ({
          cardapio_id: item.id,
          quantidade: item.quantity,
          observacoes: ''
        }))
      })
      
      setShowOrderForm(false)
      setCustomerData({ nome: '', telefone: '', endereco: '' })
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
    }
  }

  if (showOrderForm) {
    return (
      <div className="cart">
        <div className="cart-header">
          <button 
            className="back-btn"
            onClick={() => setShowOrderForm(false)}
          >
            ← Voltar
          </button>
          <h3>Finalizar Pedido</h3>
        </div>

        <div className="order-form">
          <div className="form-group">
            <label>Tipo de Pedido</label>
            <div className="order-type">
              <button 
                className={`order-btn ${orderType === 'delivery' ? 'active' : ''}`}
                onClick={() => setOrderType('delivery')}
              >
                Delivery
              </button>
              <button 
                className={`order-btn ${orderType === 'retirada' ? 'active' : ''}`}
                onClick={() => setOrderType('retirada')}
              >
                Retirar
              </button>
              <button 
                className={`order-btn ${orderType === 'balcao' ? 'active' : ''}`}
                onClick={() => setOrderType('balcao')}
              >
                Local
              </button>
            </div>
          </div>

          {orderType !== 'balcao' && (
            <>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={customerData.nome}
                  onChange={(e) => setCustomerData({...customerData, nome: e.target.value})}
                  placeholder="Digite seu nome"
                />
              </div>

              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={customerData.telefone}
                  onChange={(e) => setCustomerData({...customerData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>

              {orderType === 'delivery' && (
                <div className="form-group">
                  <label>Endereço *</label>
                  <textarea
                    value={customerData.endereco}
                    onChange={(e) => setCustomerData({...customerData, endereco: e.target.value})}
                    placeholder="Rua, número, bairro"
                    rows="3"
                  />
                </div>
              )}
            </>
          )}

          <div className="order-summary">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="summary-line">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button 
            className="order-place-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Finalizando...' : `Confirmar Pedido - ${formatPrice(total)}`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>Pedido ({items.length})</h3>
        <div className="order-type">
          <button 
            className={`order-btn ${orderType === 'delivery' ? 'active' : ''}`}
            onClick={() => setOrderType('delivery')}
          >
            Delivery
          </button>
          <button 
            className={`order-btn ${orderType === 'retirada' ? 'active' : ''}`}
            onClick={() => setOrderType('retirada')}
          >
            Retirar
          </button>
          <button 
            className={`order-btn ${orderType === 'balcao' ? 'active' : ''}`}
            onClick={() => setOrderType('balcao')}
          >
            Local
          </button>
        </div>
      </div>

      <div className="cart-items">
        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h4>Carrinho vazio</h4>
            <p>Adicione produtos para continuar</p>
          </div>
        ) : (
          items.map((item) => {
            const price = item.preco || item.price || 0
            return (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image || '🍽️'}
                </div>
                <div className="item-details">
                  <h4 className="item-name" title={item.nome || item.name}>
                    {item.nome || item.name}
                  </h4>
                  <p className="item-price">
                    {formatPrice(price)}
                  </p>
                  <p className="item-total">
                    Total: {formatPrice(price * item.quantity)}
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
            )
          })
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="cart-summary">
            <div className="summary-line">
              <span>Subtotal ({items.length} itens)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="summary-line">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="payment-section">
            <div className="cart-actions">
              <button 
                className="order-place-btn"
                onClick={() => setShowOrderForm(true)}
                disabled={loading}
              >
                Finalizar Pedido
              </button>
              
              <button 
                className="clear-cart-btn"
                onClick={onClearCart}
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart