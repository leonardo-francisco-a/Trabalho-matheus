import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import './Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const { currentRoute, navigate } = useRouter();
  
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '📊', 
      label: 'Dashboard',
      description: 'Visão geral do negócio'
    },
    { 
      id: 'cardapio', 
      icon: '🍽️', 
      label: 'Cardápio',
      description: 'Gerenciar produtos'
    },
    { 
      id: 'pedidos', 
      icon: '📋', 
      label: 'Pedidos',
      description: 'Acompanhar pedidos'
    },
    { 
      id: 'configuracoes', 
      icon: '⚙️', 
      label: 'Configurações',
      description: 'Configurar sistema'
    }
  ];

  const handleMenuClick = (itemId) => {
    navigate(itemId);
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">🍽️</div>
        <div className="logo-text">
          <h2>Cardápio</h2>
          <span>Sistema de Gestão</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Menu Principal</div>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`nav-item ${currentRoute === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info-card">
          <div className="user-avatar">
            {user?.nome?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.nome || 'Usuário'}</div>
            <div className="user-role">{user?.tipo || 'Admin'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="action-btn help-btn" title="Ajuda">
            <span>❓</span>
          </button>
          
          <button className="action-btn settings-btn" title="Configurações Rápidas">
            <span>⚙️</span>
          </button>
          
          <button className="action-btn logout-btn" onClick={onLogout} title="Sair">
            <span>🚪</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;