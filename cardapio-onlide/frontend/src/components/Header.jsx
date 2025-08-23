import './Header.css'

const Header = () => {
  return (
    <div className="header">
      <div className="search-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search Restaurant food..." 
            className="search-input"
          />
          <button className="filter-btn">Filter</button>
        </div>
      </div>
      
      <div className="user-section">
        <div className="notification-icon">
          🔔
        </div>
        <div className="user-info">
          <span className="user-name">Saidur</span>
          <div className="user-avatar">👤</div>
        </div>
      </div>
    </div>
  )
}

export default Header
