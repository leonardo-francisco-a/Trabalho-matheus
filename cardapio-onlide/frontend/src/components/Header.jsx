import './Header.css'

const Header = ({ user }) => {
  return (
    <div className="header">
      <div className="search-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar produtos no cardápio..." 
            className="search-input"
          />
          <button className="filter-btn">
            🔍 Filtros
          </button>
        </div>
      </div>
      
      <div className="user-section">
        <div className="notification-icon" title="Notificações">
          🔔
        </div>
        <div className="user-info">
          <span className="user-name">
            Olá, {user?.nome || 'Usuário'}!
          </span>
          <div className="user-avatar" title={user?.email}>
            {user?.nome?.charAt(0).toUpperCase() || '👤'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header