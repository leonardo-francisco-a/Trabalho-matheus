import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MenuCategories from './components/MenuCategories'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('All Menu')
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Spicy Vegetable Salad', price: 17.98, quantity: 4 },
    { id: 2, name: 'Spicy Vegetable Salad', price: 17.98, quantity: 4 },
    { id: 3, name: 'Spicy Vegetable Salad', price: 17.98, quantity: 4 },
    { id: 4, name: 'Spicy Vegetable Salad', price: 17.98, quantity: 4 },
  ])

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setCurrentView('app')
  }

  const handleRegister = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setCurrentView('app')
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView('login')
  }

  const switchToRegister = () => {
    setCurrentView('register')
  }

  const switchToLogin = () => {
    setCurrentView('login')
  }

  if (!isAuthenticated) {
    if (currentView === 'register') {
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
        />
      )
    }
    
    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={switchToRegister}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <MenuCategories 
          selectedCategory={selectedCategory} 
          onCategorySelect={setSelectedCategory} 
        />
        <ProductGrid 
          category={selectedCategory} 
          onAddToCart={addToCart} 
        />
      </div>
      <Cart items={cartItems} setItems={setCartItems} />
    </div>
  )
}

export default App
