import { useEffect } from 'react'
import './App.css'
import { useApp } from './contexts/AppContext'
import Login from './components/Login'
import Register from './components/Register'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MenuCategories from './components/MenuCategories'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { state, actions } = useApp()

  // Carregar dados iniciais quando autenticado
  useEffect(() => {
    if (state.isAuthenticated && state.categorias.length === 0) {
      actions.loadInitialData()
    }
  }, [state.isAuthenticated])

  // Loading inicial de autenticação
  if (state.authLoading) {
    return <LoadingSpinner message="Verificando autenticação..." />
  }

  // Telas de autenticação
  if (!state.isAuthenticated) {
    if (state.currentView === 'register') {
      return (
        <Register 
          onRegister={actions.register}
          onSwitchToLogin={() => actions.setCurrentView('login')}
          loading={state.loading}
        />
      )
    }

    return (
      <Login 
        onLogin={actions.login}
        onSwitchToRegister={() => actions.setCurrentView('register')}
        loading={state.loading}
      />
    )
  }

  // App principal após login
  return (
    <div className="app">
      <Sidebar 
        user={state.user}
        onLogout={actions.logout} 
      />
      <div className="main-content">
        <Header user={state.user} />
        
        <MenuCategories 
          categorias={state.categorias}
          selectedCategory={state.selectedCategory} 
          onCategorySelect={actions.setSelectedCategory} 
        />
        
        <ProductGrid 
          produtos={state.produtos}
          selectedCategory={state.selectedCategory}
          onAddToCart={actions.addToCart}
          loading={state.loading}
        />
      </div>
      
      <Cart 
        items={state.cartItems}
        onUpdateQuantity={actions.updateCartItem}
        onRemoveItem={actions.removeFromCart}
        onClearCart={actions.clearCart}
        onPlaceOrder={actions.placeOrder}
        loading={state.loading}
      />
    </div>
  )
}

export default App