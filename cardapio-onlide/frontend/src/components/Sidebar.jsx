import './Sidebar.css'

const Sidebar = ({ user, onLogout }) => {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: false },
    { icon: '🍽️', label: 'Food Order', active: true },
    { icon: '📋', label: 'Pedidos', active: false },
    { icon: '⚙️', label: 'Settings', active: false }
  ]

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>🍽️ Cardápio</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {user.nome?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="user-details">
              <span className="user-name">{user.nome}</span>
              <span className="user-type">{user.tipo}</span>
            </div>
          </div>
        )}
        
        <div className="logout-btn" onClick={onLogout}>
          <span>🔓</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar