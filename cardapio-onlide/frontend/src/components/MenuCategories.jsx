import './MenuCategories.css'

const MenuCategories = ({ categorias = [], selectedCategory, onCategorySelect }) => {
  const categoryIcons = {
    'all': '🍽️',
    'Todos': '🍽️',
    'Lanches': '🍔',
    'Pizzas': '🍕',
    'Bebidas': '🥤',
    'Sobremesas': '🍰',
    1: '🍔',
    2: '🍕',
    3: '🥤',
    4: '🍰'
  }

  const getIcon = (category) => {
    return categoryIcons[category.id] || categoryIcons[category.nome] || '🍽️'
  }

  return (
    <div className="menu-categories">
      {categorias.map((category) => (
        <div
          key={category.id}
          className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
          onClick={() => onCategorySelect(category)}
        >
          <div className="category-icon">{getIcon(category)}</div>
          <span className="category-name">{category.nome}</span>
        </div>
      ))}
    </div>
  )
}

export default MenuCategories