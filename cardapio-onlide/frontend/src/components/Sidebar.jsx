import './Sidebar.css'

const Sidebar = () => {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: false },
    { icon: '🍽️', label: 'Food Order', active: true },
    { icon: '⚙️', label: 'Settings', active: false }
  ]

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>LOGO</h2>
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
        <div className="logout-btn">
          <span>🔓</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
