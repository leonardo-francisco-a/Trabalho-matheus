import React, { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onFilter, produtos = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    disponivel: 'all',
    precoMin: '',
    precoMax: '',
    categoria: 'all'
  });

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, onSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      disponivel: 'all',
      precoMin: '',
      precoMax: '',
      categoria: 'all'
    };
    setFilters(clearedFilters);
    if (onFilter) {
      onFilter(clearedFilters);
    }
  };

  const getUniqueCategories = () => {
    const categories = produtos
      .map(produto => produto.categoria?.nome)
      .filter((nome, index, self) => nome && self.indexOf(nome) === index);
    return categories;
  };

  return (
    <div className="search-section">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Buscar produtos no cardápio..." 
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="search-icon">🔍</div>
        </div>
        
        <button 
          className={`filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          🔧 Filtros
          {Object.values(filters).some(v => v !== 'all' && v !== '') && (
            <span className="filter-badge">•</span>
          )}
        </button>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Disponibilidade</label>
              <select 
                value={filters.disponivel} 
                onChange={(e) => handleFilterChange('disponivel', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="true">Disponível</option>
                <option value="false">Indisponível</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Categoria</label>
              <select 
                value={filters.categoria} 
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
              >
                <option value="all">Todas</option>
                {getUniqueCategories().map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Preço Min.</label>
              <input 
                type="number" 
                placeholder="0.00"
                min="0"
                step="0.50"
                value={filters.precoMin}
                onChange={(e) => handleFilterChange('precoMin', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Preço Max.</label>
              <input 
                type="number" 
                placeholder="100.00"
                min="0"
                step="0.50"
                value={filters.precoMax}
                onChange={(e) => handleFilterChange('precoMax', e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Limpar Filtros
            </button>
            <button className="close-filters-btn" onClick={() => setShowFilters(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;