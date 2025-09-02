import React, { useState } from 'react';
import SearchBar from './SearchBar';
import './Header.css';

const Header = ({ user, produtos, onSearch, onFilter }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: 'Novo pedido #1234 recebido', time: '2 min', unread: true },
    { id: 2, message: 'Produto em estoque baixo', time: '15 min', unread: true },
    { id: 3, message: 'Pedido #1230 concluído', time: '1h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="header">
      <SearchBar 
        onSearch={onSearch}
        onFilter={onFilter}
        produtos={produtos}
      />
      
      <div className="user-section">
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
        
        <div className="user-info">
          <div className="user-details">
            <span className="user-greeting">Olá, {user?.nome || 'Usuário'}!</span>
            <span className="user-role">{user?.tipo || 'Admin'}</span>
          </div>
          <div className="user-avatar" title={user?.email}>
            {user?.nome?.charAt(0).toUpperCase() || '👤'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;