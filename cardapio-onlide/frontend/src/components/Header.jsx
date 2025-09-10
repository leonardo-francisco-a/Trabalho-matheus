import React, { useState } from 'react';
import SearchBar from './SearchBar';
import AddProductModal from './AddProductModal';
import { useRouter } from '../contexts/RouterContext';
import './Header.css';

const Header = ({ produtos, onSearch, onFilter, onAddProduct, categorias }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const { currentRoute } = useRouter();

  const notifications = [
    { id: 1, message: 'Novo pedido #1234 recebido', time: '2 min', unread: true },
    { id: 2, message: 'Produto em estoque baixo', time: '15 min', unread: true },
    { id: 3, message: 'Pedido #1230 concluído', time: '1h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleAddProduct = async (productData) => {
    if (onAddProduct) {
      await onAddProduct(productData);
    }
  };

  return (
    <div className="header">
      <SearchBar 
        onSearch={onSearch}
        onFilter={onFilter}
        produtos={produtos}
      />
      
      <div className="header-actions">
        {/* Botão Adicionar Produto - só aparece na página do cardápio */}
        {currentRoute === 'cardapio' && onAddProduct && (
          <button 
            className="add-product-btn"
            onClick={() => setShowAddProductModal(true)}
            title="Adicionar novo produto"
          >
            <span className="add-icon">➕</span>
            <span className="add-text">Novo Produto</span>
          </button>
        )}
        
        <div className="notification-wrapper">
          <div 
            className="notification-icon" 
            title="Notificações"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notificações</h4>
                <button 
                  className="close-notifications"
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {notification.unread && (
                        <div className="notification-dot"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="notifications-footer">
                <button className="mark-all-read">
                  Marcar todas como lidas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Produto */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProduct={handleAddProduct}
        categorias={categorias}
      />
    </div>
  );
};

export default Header;