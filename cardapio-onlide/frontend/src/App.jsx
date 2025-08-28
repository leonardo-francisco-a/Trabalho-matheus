import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MenuCategories from './components/MenuCategories'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'

// Toast simples para evitar erros
const showToast = (message, type = 'info') => {
  console.log(`${type.toUpperCase()}: ${message}`)
  
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    background: ${type === 'error' ? '#ef4444' : '#10b981'}; 
    color: white; padding: 12px 16px; border-radius: 8px;
    font-size: 14px; font-weight: 500;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast)
    }
  }, 3000)
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Estados do cardápio
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', name: 'Todos' })
  const [cartItems, setCartItems] = useState([])

  console.log('🔄 App renderizando:', { 
    isAuthenticated, 
    currentView, 
    user: user?.nome,
    cartItems: cartItems.length 
  })

  const handleLogin = async (email, password) => {
    console.log('🔐 Tentativa de login:', { email, password })
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === 'admin@cardapio.com' && password === 'admin123') {
        const userData = {
          email,
          nome: 'Administrador',
          tipo: 'admin'
        }
        
        setUser(userData)
        setIsAuthenticated(true)
        showToast('Login realizado com sucesso!', 'success')
        
        return userData
      } else {
        showToast('Email ou senha incorretos. Use: admin@cardapio.com / admin123', 'error')
        throw new Error('Credenciais inválidas')
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    console.log('📝 Tentativa de registro:', userData)
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser = {
        email: userData.email,
        nome: userData.name,
        tipo: 'admin'
      }
      
      setUser(newUser)
      setIsAuthenticated(true)
      showToast('Conta criada com sucesso!', 'success')
      
      return newUser
    } catch (error) {
      console.error('Erro no registro:', error)
      showToast('Erro ao criar conta', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const switchToRegister = () => setCurrentView('register')
  const switchToLogin = () => setCurrentView('login')

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView('login')
    setCartItems([])
    showToast('Logout realizado!', 'success')
  }

  // Funções do carrinho
  const addToCart = (produto) => {
    console.log('🛒 Adicionando ao carrinho:', produto)
    
    const existingItem = cartItems.find(item => item.id === produto.id)
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === produto.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { 
        ...produto, 
        quantity: 1,
        price: produto.price || 10.00 // fallback price
      }])
    }
    showToast(`${produto.name} adicionado ao carrinho!`, 'success')
  }

  const updateCartItem = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id))
      showToast('Item removido do carrinho', 'success')
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
    showToast('Item removido do carrinho', 'success')
  }

  const clearCart = () => {
    setCartItems([])
    showToast('Carrinho limpo', 'success')
  }

  // Se não autenticado, mostrar login/register
  if (!isAuthenticated) {
    if (currentView === 'register') {
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={switchToLogin}
          loading={loading}
        />
      )
    }

    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={switchToRegister}
        loading={loading}
      />
    )
  }

  // App principal após login
  return (
    <div className="app">
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <Header user={user} />
        <MenuCategories 
          selectedCategory={selectedCategory} 
          onCategorySelect={setSelectedCategory} 
        />
        <ProductGrid 
          category={selectedCategory?.name || 'All Menu'}
          onAddToCart={addToCart}
        />
      </div>
      <Cart 
        items={cartItems}
        setItems={setCartItems}
        onUpdateQuantity={updateCartItem}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  )
}

export default App