import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import './PedidosPage.css';

const PedidosPage = () => {
  const { state, actions } = useApp();
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [filters, setFilters] = useState({
    status: 'todos',
    periodo: 'hoje'
  });
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(false);

  // Atualizar lista filtrada quando pedidos ou filtros mudarem
  useEffect(() => {
    filterPedidos();
  }, [state.pedidos, filters]);

  const filterPedidos = () => {
    let pedidos = state.pedidos || [];
    
    // Filtrar por status
    if (filters.status !== 'todos') {
      pedidos = pedidos.filter(pedido => pedido.status === filters.status);
    }
    
    // Filtrar por período
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    switch (filters.periodo) {
      case 'hoje':
        pedidos = pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.createdAt);
          return dataPedido.toDateString() === hoje.toDateString();
        });
        break;
      case 'ontem':
        pedidos = pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.createdAt);
          return dataPedido.toDateString() === ontem.toDateString();
        });
        break;
      case 'semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - 7);
        pedidos = pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.createdAt);
          return dataPedido >= inicioSemana;
        });
        break;
      case 'mes':
        const inicioMes = new Date(hoje);
        inicioMes.setDate(1);
        pedidos = pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.createdAt);
          return dataPedido >= inicioMes;
        });
        break;
      default:
        break;
    }
    
    // Ordenar por data mais recente primeiro
    pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredPedidos(pedidos);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(price));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      recebido: { 
        color: '#3b82f6', 
        bg: '#dbeafe', 
        icon: '📋', 
        label: 'Recebido',
        description: 'Aguardando preparo'
      },
      preparando: { 
        color: '#f59e0b', 
        bg: '#fef3c7', 
        icon: '👨‍🍳', 
        label: 'Preparando',
        description: 'Em produção'
      },
      pronto: { 
        color: '#10b981', 
        bg: '#d1fae5', 
        icon: '✅', 
        label: 'Pronto',
        description: 'Aguardando retirada'
      },
      entregue: { 
        color: '#6b7280', 
        bg: '#f3f4f6', 
        icon: '📦', 
        label: 'Entregue',
        description: 'Finalizado'
      },
      cancelado: { 
        color: '#ef4444', 
        bg: '#fee2e2', 
        icon: '❌', 
        label: 'Cancelado',
        description: 'Cancelado'
      }
    };
    return statusConfig[status] || statusConfig.recebido;
  };

  const getTipoEntregaInfo = (tipo) => {
    const tiposConfig = {
      delivery: { icon: '🚗', label: 'Delivery', color: '#667eea' },
      retirada: { icon: '🏪', label: 'Retirada', color: '#10b981' },
      balcao: { icon: '🍽️', label: 'Balcão', color: '#f59e0b' }
    };
    return tiposConfig[tipo] || tiposConfig.balcao;
  };

  const handleStatusChange = async (pedidoId, novoStatus) => {
    setLoading(true);
    try {
      if (actions.updatePedidoStatus) {
        await actions.updatePedidoStatus(pedidoId, novoStatus);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      filterPedidos();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="pedidos-page">
      {/* Header da Página */}
      <div className="pedidos-header">
        <div className="header-content">
          <div className="header-info">
            <h1>
              <span className="header-icon">📋</span>
              Gerenciar Pedidos
            </h1>
            <p>Acompanhe e gerencie todos os pedidos em tempo real</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredPedidos.length}</span>
              <span className="stat-label">Encontrados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {filteredPedidos.filter(p => ['recebido', 'preparando'].includes(p.status)).length}
              </span>
              <span className="stat-label">Pendentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="pedidos-filters-compact">
        <div className="filters-row">
          <div className="filter-chips">
            <div className="filter-chip-group">
              <label className="filter-label">Status:</label>
              <div className="chip-options">
                {[
                  { value: 'todos', label: 'Todos', icon: '📋' },
                  { value: 'recebido', label: 'Recebido', icon: '🔵' },
                  { value: 'preparando', label: 'Preparando', icon: '🟡' },
                  { value: 'pronto', label: 'Pronto', icon: '🟢' },
                  { value: 'entregue', label: 'Entregue', icon: '⚫' },
                  { value: 'cancelado', label: 'Cancelado', icon: '🔴' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`chip ${filters.status === option.value ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, status: option.value})}
                  >
                    <span className="chip-icon">{option.icon}</span>
                    <span className="chip-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-chip-group">
              <label className="filter-label">Período:</label>
              <div className="chip-options">
                {[
                  { value: 'hoje', label: 'Hoje', icon: '📅' },
                  { value: 'ontem', label: 'Ontem', icon: '⏮️' },
                  { value: 'semana', label: 'Semana', icon: '📊' },
                  { value: 'mes', label: 'Mês', icon: '📈' },
                  { value: 'todos', label: 'Todos', icon: '🗂️' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`chip ${filters.periodo === option.value ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, periodo: option.value})}
                  >
                    <span className="chip-icon">{option.icon}</span>
                    <span className="chip-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            className={`refresh-button ${loading ? 'loading' : ''}`}
            onClick={refreshData}
            disabled={loading}
          >
            <span className="refresh-icon">🔄</span>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Lista de Pedidos Melhorada */}
      <div className="pedidos-content">
        {filteredPedidos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Nenhum pedido encontrado</h3>
            <p>
              {state.pedidos?.length === 0 
                ? 'Ainda não há pedidos. Os pedidos aparecerão aqui quando forem feitos.'
                : 'Nenhum pedido corresponde aos filtros selecionados.'
              }
            </p>
            {filters.status !== 'todos' || filters.periodo !== 'hoje' ? (
              <button 
                className="clear-filters-btn"
                onClick={() => setFilters({ status: 'todos', periodo: 'hoje' })}
              >
                <span>🗑️</span>
                Limpar Filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="pedidos-grid">
            {filteredPedidos.map((pedido) => {
              const statusInfo = getStatusInfo(pedido.status);
              const tipoInfo = getTipoEntregaInfo(pedido.tipo_entrega);
              
              return (
                <div key={pedido.id} className="pedido-card-modern">
                  {/* Header do Card */}
                  <div className="card-header">
                    <div className="pedido-id-section">
                      <span className="pedido-number">
                        #{pedido.numero_pedido || `PED${pedido.id}`}
                      </span>
                      <span className="pedido-time">{formatDate(pedido.createdAt)}</span>
                    </div>
                    
                    <div className="card-actions">
                      <div 
                        className="tipo-badge"
                        style={{ 
                          background: `${tipoInfo.color}15`,
                          color: tipoInfo.color,
                          border: `1px solid ${tipoInfo.color}30`
                        }}
                      >
                        <span>{tipoInfo.icon}</span>
                        <span>{tipoInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="status-section">
                    <div 
                      className="status-badge"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}30`
                      }}
                    >
                      <span className="status-icon">{statusInfo.icon}</span>
                      <div className="status-text">
                        <span className="status-label">{statusInfo.label}</span>
                        <span className="status-description">{statusInfo.description}</span>
                      </div>
                    </div>

                    <select
                      className="status-selector"
                      value={pedido.status}
                      onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                      disabled={loading}
                      style={{ borderColor: statusInfo.color }}
                    >
                      <option value="recebido">📋 Recebido</option>
                      <option value="preparando">👨‍🍳 Preparando</option>
                      <option value="pronto">✅ Pronto</option>
                      <option value="entregue">📦 Entregue</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>

                  {/* Cliente Info */}
                  <div className="cliente-section">
                    <div className="cliente-info">
                      <div className="cliente-avatar">
                        {pedido.cliente_nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="cliente-details">
                        <span className="cliente-nome">{pedido.cliente_nome}</span>
                        {pedido.cliente_telefone && (
                          <span className="cliente-telefone">📞 {pedido.cliente_telefone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Endereço (se delivery) */}
                  {pedido.endereco_entrega && (
                    <div className="endereco-section">
                      <span className="endereco-icon">📍</span>
                      <span className="endereco-text">{pedido.endereco_entrega}</span>
                    </div>
                  )}

                  {/* Itens do Pedido */}
                  <div className="itens-section">
                    <div className="itens-header">
                      <span className="itens-title">Itens do Pedido</span>
                      <span className="itens-count">
                        {pedido.itens?.length || 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="itens-list">
                      {pedido.itens && pedido.itens.length > 0 ? (
                        pedido.itens.slice(0, 3).map((item, index) => (
                          <div key={index} className="item-row">
                            <span className="item-qty">{item.quantidade}x</span>
                            <span className="item-name">{item.nome || item.produto?.nome}</span>
                            {item.preco_unitario && (
                              <span className="item-price">{formatPrice(item.preco_unitario)}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="item-row">
                          <span className="item-name">Detalhes não disponíveis</span>
                        </div>
                      )}
                      {pedido.itens && pedido.itens.length > 3 && (
                        <div className="itens-more">
                          +{pedido.itens.length - 3} itens adicionais
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observações */}
                  {pedido.observacoes && (
                    <div className="observacoes-section">
                      <span className="obs-icon">💬</span>
                      <span className="obs-text">{pedido.observacoes}</span>
                    </div>
                  )}

                  {/* Footer do Card */}
                  <div className="card-footer">
                    <div className="total-section">
                      <span className="total-label">Total</span>
                      <span className="total-value">{formatPrice(pedido.total)}</span>
                    </div>
                    
                    <button 
                      className="details-btn"
                      onClick={() => setSelectedPedido(pedido)}
                    >
                      <span>👁️</span>
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes Melhorado */}
      {selectedPedido && (
        <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
          <div className="modal-content pedido-modal-modern" onClick={e => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-title-section">
                <h3>
                  <span className="modal-icon">📋</span>
                  Pedido #{selectedPedido.numero_pedido || `PED${selectedPedido.id}`}
                </h3>
                <div className="modal-subtitle">
                  {formatDate(selectedPedido.createdAt)} • {getTipoEntregaInfo(selectedPedido.tipo_entrega).label}
                </div>
              </div>
              <button className="modal-close-modern" onClick={() => setSelectedPedido(null)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body-modern">
              <div className="details-grid">
                {/* Cliente */}
                <div className="detail-card">
                  <h4>👤 Informações do Cliente</h4>
                  <div className="detail-content">
                    <p><strong>Nome:</strong> {selectedPedido.cliente_nome}</p>
                    {selectedPedido.cliente_telefone && (
                      <p><strong>Telefone:</strong> {selectedPedido.cliente_telefone}</p>
                    )}
                    {selectedPedido.cliente_email && (
                      <p><strong>Email:</strong> {selectedPedido.cliente_email}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="detail-card">
                  <h4>📊 Status do Pedido</h4>
                  <div className="detail-content">
                    <div className="status-display">
                      <span 
                        className="status-badge-large"
                        style={{
                          backgroundColor: getStatusInfo(selectedPedido.status).bg,
                          color: getStatusInfo(selectedPedido.status).color
                        }}
                      >
                        {getStatusInfo(selectedPedido.status).icon} {getStatusInfo(selectedPedido.status).label}
                      </span>
                    </div>
                    <p><strong>Tipo:</strong> {getTipoEntregaInfo(selectedPedido.tipo_entrega).label}</p>
                    <p><strong>Total:</strong> {formatPrice(selectedPedido.total)}</p>
                  </div>
                </div>

                {/* Itens */}
                {selectedPedido.itens && selectedPedido.itens.length > 0 && (
                  <div className="detail-card full-width">
                    <h4>🛒 Itens do Pedido</h4>
                    <div className="detail-content">
                      <div className="itens-detailed">
                        {selectedPedido.itens.map((item, index) => (
                          <div key={index} className="item-detailed">
                            <div className="item-info">
                              <span className="item-qty-large">{item.quantidade}x</span>
                              <div className="item-details">
                                <span className="item-name-large">{item.nome || item.produto?.nome}</span>
                                {item.observacoes && (
                                  <span className="item-obs">💬 {item.observacoes}</span>
                                )}
                              </div>
                            </div>
                            {item.preco_unitario && (
                              <span className="item-price-large">{formatPrice(item.preco_unitario)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {selectedPedido.observacoes && (
                  <div className="detail-card full-width">
                    <h4>💬 Observações Gerais</h4>
                    <div className="detail-content">
                      <p className="observacoes-text">{selectedPedido.observacoes}</p>
                    </div>
                  </div>
                )}

                {/* Endereço */}
                {selectedPedido.endereco_entrega && (
                  <div className="detail-card full-width">
                    <h4>📍 Endereço de Entrega</h4>
                    <div className="detail-content">
                      <p className="endereco-text">{selectedPedido.endereco_entrega}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosPage;