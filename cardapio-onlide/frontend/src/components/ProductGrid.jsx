import './ProductGrid.css'

const ProductGrid = ({ category, onAddToCart }) => {
  const products = [
    {
      id: 1,
      name: 'Spicy Seasoned Seafood Noodles',
      price: 2.29,
      image: '🍜',
      category: 'All Menu'
    },
    {
      id: 2,
      name: 'Salted Pasta with mushroom sauce',
      price: 2.69,
      image: '🍝',
      category: 'All Menu'
    },
    {
      id: 3,
      name: 'Beef dumpling in hot and sour soup',
      price: 2.99,
      image: '🥟',
      category: 'All Menu'
    },
    {
      id: 4,
      name: 'Healthy noodle with spinach leaf',
      price: 3.29,
      image: '🍲',
      category: 'All Menu'
    },
    {
      id: 5,
      name: 'Hot spicy fried rice with omelet',
      price: 3.49,
      image: '🍳',
      category: 'All Menu'
    },
    {
      id: 6,
      name: 'Spicy instant noodle with special omelette',
      price: 3.59,
      image: '🍜',
      category: 'All Menu'
    }
  ]

  const filteredProducts = category === 'All Menu' 
    ? products 
    : products.filter(product => product.category === category)

  return (
    <div className="product-grid">
      {filteredProducts.map((product) => (
        <div key={product.id} className="product-card">
          <div className="product-image">
            <span className="product-emoji">{product.image}</span>
          </div>
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <div className="product-footer">
              <span className="product-price">${product.price}</span>
              <button 
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductGrid
