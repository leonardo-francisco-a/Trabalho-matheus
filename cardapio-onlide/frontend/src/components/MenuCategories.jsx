import './MenuCategories.css'

const MenuCategories = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    { id: 'all', name: 'Todos', icon: '🍽️' },
    { id: 1, name: 'Lanches', icon: '🍔' },
    { id: 2, name: 'Pizzas', icon: '🍕' },
    { id: 3, name: 'Bebidas', icon: '🥤' },
    { id: 4, name: 'Sobremesas', icon: '🍰' }
  ]

  return (
    <div className="menu-categories">
      {categories.map((category) => (
        <div
          key={category.id}
          className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
          onClick={() => onCategorySelect(category)}
        >
          <div className="category-icon">{category.icon}</div>
          <span className="category-name">{category.name}</span>
        </div>
      ))}
    </div>
  )
}

export default MenuCategories