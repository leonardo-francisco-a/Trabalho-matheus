import { useEffect } from 'react'
import './App.css'
import { useApp } from './contexts/AppContext'
import { RouterProvider, useRouter } from './contexts/RouterContext'
import Login from './components/Login'
import Register from './components/Register'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MenuCategories from './components/MenuCategories'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import Dashboard from './components/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'
import PedidosPage from './components/PedidosPage'

// Componente das configurações (mantido da versão anterior)
const ConfiguracoesPage = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Configurações</h1>
        <p>Configure seu restaurante e sistema</p>
      </div>
      
      <div className="config-grid">
        <div className="config-section">
          <h3>🏪 Informações do Restaurante</h3>
          <div className="form-group">
            <label>Nome do Restaurante</label>
            <input type="text" defaultValue="Meu Restaurante" />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input type="text" placeholder="Endereço completo" />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input type="tel" placeholder="(11) 99999-9999" />
          </div>
          <button className="save-btn">Salvar Alterações</button>
        </div>
        
        <div className="config-section">
          <h3>⏰ Horário de Funcionamento</h3>
          <div className="horario-grid">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(dia => (
              <div key={dia} className="horario-item">
                <div className="dia-semana">{dia}</div>
                <div className="horario-inputs">
                  <input type="time" defaultValue="08:00" />
                  <span>às</span>
                  <input type="time" defaultValue="22:00" />
                </div>
                <label className="checkbox-wrapper">
                  <input type="checkbox" defaultChecked />
                  <span>Aberto</span>
                </label>
              </div>
            ))}
          </div>
          <button className="save-btn">Salvar Horários</button>
        </div>
        
        <div className="config-section">
          <h3>🚚 Configurações de Entrega</h3>
          <div className="form-group">
            <label>Taxa de Entrega</label>
            <input type="number" step="0.50" defaultValue="5.00" />
          </div>
          <div className="form-group">
            <label>Tempo Médio de Entrega (minutos)</label>
            <input type="number" defaultValue="30" />
          </div>
          <div className="form-group">
            <label>Raio de Entrega (km)</label>
            <input type="number" step="0.5" defaultValue="5" />
          </div>
          <button className="save-btn">Salvar Configurações</button>
        </div>
        
        <div className="config-section">
          <h3>💳 Formas de Pagamento</h3>
          <div className="payment-options">
            {[
              { id: 'dinheiro', nome: 'Dinheiro' },
              { id: 'pix', nome: 'PIX' },
              { id: 'cartao', nome: 'Cartão (Débito/Crédito)' },
              { id: 'vale', nome: 'Vale Refeição' }
            ].map(payment => (
              <label key={payment.id} className="checkbox-wrapper">
                <input type="checkbox" defaultChecked />
                <span>{payment.nome}</span>
              </label>
            ))}
          </div>
          <button className="save-btn">Salvar Formas de Pagamento</button>
        </div>
      </div>
    </div>
  )
}

// Componente principal do conteúdo
function MainContent() {
  const { state, actions } = useApp()
  const { currentRoute, navigate } = useRouter()

  // Carregar dados iniciais quando autenticado
  useEffect(() => {
    if (state.isAuthenticated && state.categorias.length === 0) {
      actions.loadInitialData()
    }
  }, [state.isAuthenticated, state.categorias.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderPageContent = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard user={state.user} />
      
      case 'cardapio':
        return (
          <>
            <Header 
              user={state.user}
              produtos={state.produtos}
              onSearch={actions.setSearchTerm}
              onFilter={actions.setFilters}
            />
            
            <MenuCategories 
              categorias={state.categorias}
              selectedCategory={state.selectedCategory} 
              onCategorySelect={actions.setSelectedCategory} 
            />
            
            <ProductGrid 
              produtos={state.produtos}
              selectedCategory={state.selectedCategory}
              searchTerm={state.searchTerm}
              filters={state.filters}
              onAddToCart={actions.addToCart}
              loading={state.loading}
            />
          </>
        )
      
      case 'pedidos':
        return <PedidosPage />
      
      case 'configuracoes':
        return <ConfiguracoesPage />
      
      default:
        return <Dashboard user={state.user} />
    }
  }

  return (
    <div className="app">
      <Sidebar 
        user={state.user}
        onLogout={actions.logout} 
      />
      <div className="main-content">
        {renderPageContent()}
      </div>
      
      {/* Carrinho sempre visível na página do cardápio */}
      {currentRoute === 'cardapio' && (
        <Cart 
          items={state.cartItems}
          onUpdateQuantity={actions.updateCartItem}
          onRemoveItem={actions.removeFromCart}
          onClearCart={actions.clearCart}
          onPlaceOrder={actions.placeOrder}
          loading={state.loading}
        />
      )}
      
      {/* Carrinho flutuante para outras páginas quando há itens */}
      {currentRoute !== 'cardapio' && state.cartItems.length > 0 && (
        <div className="floating-cart-indicator">
          <button 
            className="cart-indicator-btn"
            onClick={() => navigate('cardapio')}
            title={`${state.cartItems.length} itens no carrinho`}
          >
            🛒 <span className="cart-count">{state.cartItems.length}</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Componente App principal
function App() {
  const { state, actions } = useApp()

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

  // App principal após login com router
  return (
    <RouterProvider>
      <MainContent />
    </RouterProvider>
  )
}

export default App