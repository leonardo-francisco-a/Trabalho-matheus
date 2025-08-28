import './ProductGrid.css'

const ProductGrid = ({ category, onAddToCart }) => {
  const products = [
    {
      id: 1,
      name: 'X-Burger Clássico',
      price: 18.90,
      image: '🍔',
      category: 'Lanches'
    },
    {
      id: 2,
      name: 'Pizza Margherita',
      price: 35.00,
      image: '🍕',
      category: 'Pizzas'
    },
    {
      id: 3,
      name: 'Coca-Cola 350ml',
      price: 5.00,
      image: '🥤',
      category: 'Bebidas'
    },
    {
      id: 4,
      name: 'Pudim de Leite',
      price: 8.50,
      image: '🍰',
      category: 'Sobremesas'
    },
    {
      id: 5,
      name: 'Pizza Portuguesa',
      price: 42.00,
      image: '🍕',
      category: 'Pizzas'
    },
    {
      id: 6,
      name: 'Suco de Laranja',
      price: 8.50,
      image: '🧃',
      category: 'Bebidas'
    }
  ]

  // Filtrar produtos por categoria
  const filteredProducts = category === 'Todos' || category === 'All Menu'
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
              <span className="product-price">
                R$ {product.price.toFixed(2)}
              </span>
              <button 
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product)}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductGrid