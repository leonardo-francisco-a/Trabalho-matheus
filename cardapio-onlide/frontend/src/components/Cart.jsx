import './Cart.css'

const Cart = ({ items, setItems }) => {
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      setItems(items.filter(item => item.id !== id))
    } else {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="cart">
      <div className="cart-header">
        <div className="order-type">
          <button className="order-btn active">Delivery</button>
          <button className="order-btn">Take away</button>
          <button className="order-btn">Dine</button>
        </div>
      </div>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-image">🥗</div>
            <div className="item-details">
              <h4 className="item-name">{item.name}</h4>
              <p className="item-price">${item.price}</p>
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
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-line">
          <span>Sub Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-line">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="summary-line total">
          <span>Total Amount</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-section">
        <div className="payment-method">
          <span className="payment-icon">💳</span>
          <span>Credit/Debit Card</span>
        </div>
        <button className="order-place-btn">Order Place</button>
      </div>
    </div>
  )
}

export default Cart
