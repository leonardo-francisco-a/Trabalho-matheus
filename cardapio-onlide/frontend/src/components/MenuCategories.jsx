import './MenuCategories.css'

const MenuCategories = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    { name: 'All Menu', icon: '🍽️' },
    { name: 'Burger', icon: '🍔' }
  ]

  return (
    <div className="menu-categories">
      {categories.map((category) => (
        <div
          key={category.name}
          className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
          onClick={() => onCategorySelect(category.name)}
        >
          <div className="category-icon">{category.icon}</div>
          <span className="category-name">{category.name}</span>
        </div>
      ))}
    </div>
  )
}

export default MenuCategories
