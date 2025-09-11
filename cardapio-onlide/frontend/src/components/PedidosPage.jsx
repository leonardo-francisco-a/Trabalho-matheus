import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const PedidosPage = () => {
  const { state, actions } = useApp();
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [filters, setFilters] = useState({
    status: 'todos',
    periodo: 'hoje'
  });
  const [selectedPedido, setSelectedPedido] = useState(null);

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
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      recebido: '#3b82f6',
      preparando: '#f59e0b',
      pronto: '#10b981',
      entregue: '#6b7280',
      cancelado: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      recebido: 'Recebido',
      preparando: 'Preparando',
      pronto: 'Pronto',
      entregue: 'Entregue',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  };

  const handleStatusChange = (pedidoId, novoStatus) => {
    if (actions.updatePedidoStatus) {
      actions.updatePedidoStatus(pedidoId, novoStatus);
    } else {
      console.log(`Atualizando pedido ${pedidoId} para ${novoStatus}`);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gerenciar Pedidos</h1>
        <p>Visualize e gerencie todos os pedidos do restaurante ({filteredPedidos.length} encontrados)</p>
      </div>
      
      <div className="pedidos-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="todos">Todos</option>
            <option value="recebido">Recebido</option>
            <option value="preparando">Preparando</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Período:</label>
          <select 
            value={filters.periodo}
            onChange={(e) => setFilters({...filters, periodo: e.target.value})}
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        
        <button className="refresh-btn" onClick={filterPedidos}>
          🔄 Atualizar
        </button>
      </div>
      
      <div className="pedidos-grid">
        {filteredPedidos.length === 0 ? (
          <div className="no-pedidos">
            <div className="no-pedidos-icon">📋</div>
            <h3>Nenhum pedido encontrado</h3>
            <p>
              {state.pedidos?.length === 0 
                ? 'Ainda não há pedidos. Os pedidos aparecerão aqui quando forem feitos.'
                : 'Nenhum pedido corresponde aos filtros selecionados.'
              }
            </p>
          </div>
        ) : (
          <div className="pedidos-list">
            {filteredPedidos.map((pedido) => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3>#{pedido.numero_pedido || `PED${pedido.id}`}</h3>
                    <span className="pedido-date">{formatDate(pedido.createdAt)}</span>
                  </div>
                  <div className="pedido-status-wrapper">
                    <select
                      value={pedido.status}
                      onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                      style={{ 
                        color: getStatusColor(pedido.status),
                        border: `1px solid ${getStatusColor(pedido.status)}`,
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <option value="recebido">Recebido</option>
                      <option value="preparando">Preparando</option>
                      <option value="pronto">Pronto</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="pedido-details">
                  <div className="cliente-info">
                    <strong>Cliente:</strong> {pedido.cliente_nome}
                    {pedido.cliente_telefone && (
                      <span> - {pedido.cliente_telefone}</span>
                    )}
                  </div>
                  
                  <div className="pedido-tipo">
                    <strong>Tipo:</strong> {pedido.tipo_entrega === 'delivery' ? 'Delivery' : 
                                           pedido.tipo_entrega === 'retirada' ? 'Retirada' : 'Balcão'}
                  </div>

                  {pedido.endereco_entrega && (
                    <div className="endereco-entrega">
                      <strong>Endereço:</strong> {pedido.endereco_entrega}
                    </div>
                  )}

                  <div className="pedido-itens">
                    <strong>Itens:</strong>
                    {pedido.itens && pedido.itens.length > 0 ? (
                      <ul>
                        {pedido.itens.map((item, index) => (
                          <li key={index}>
                            {item.quantidade}x {item.nome || item.produto?.nome}
                            {item.observacoes && <span> - {item.observacoes}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span> Detalhes não disponíveis</span>
                    )}
                  </div>

                  {pedido.observacoes && (
                    <div className="pedido-observacoes">
                      <strong>Observações:</strong> {pedido.observacoes}
                    </div>
                  )}
                </div>

                <div className="pedido-footer">
                  <div className="pedido-total">
                    <strong>Total: {formatPrice(pedido.total)}</strong>
                  </div>
                  
                  <div className="pedido-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedPedido(pedido)}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes do pedido */}
      {selectedPedido && (
        <div className="modal-overlay" onClick={() => setSelectedPedido(null)}>
          <div className="modal-content pedido-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pedido #{selectedPedido.numero_pedido || `PED${selectedPedido.id}`}</h3>
              <button onClick={() => setSelectedPedido(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="pedido-details-full">
                <div className="detail-section">
                  <h4>Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedPedido.cliente_nome}</p>
                  {selectedPedido.cliente_telefone && (
                    <p><strong>Telefone:</strong> {selectedPedido.cliente_telefone}</p>
                  )}
                  {selectedPedido.cliente_email && (
                    <p><strong>Email:</strong> {selectedPedido.cliente_email}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Detalhes do Pedido</h4>
                  <p><strong>Status:</strong> 
                    <span style={{ color: getStatusColor(selectedPedido.status), marginLeft: '8px' }}>
                      {getStatusLabel(selectedPedido.status)}
                    </span>
                  </p>
                  <p><strong>Tipo:</strong> {selectedPedido.tipo_entrega}</p>
                  <p><strong>Data:</strong> {formatDate(selectedPedido.createdAt)}</p>
                  <p><strong>Total:</strong> {formatPrice(selectedPedido.total)}</p>
                </div>

                {selectedPedido.itens && selectedPedido.itens.length > 0 && (
                  <div className="detail-section">
                    <h4>Itens do Pedido</h4>
                    <ul className="itens-detalhados">
                      {selectedPedido.itens.map((item, index) => (
                        <li key={index} className="item-detalhado">
                          <div>
                            <strong>{item.quantidade}x {item.nome || item.produto?.nome}</strong>
                            {item.preco_unitario && (
                              <span> - {formatPrice(item.preco_unitario)} cada</span>
                            )}
                          </div>
                          {item.observacoes && (
                            <div className="item-observacoes">Obs: {item.observacoes}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPedido.observacoes && (
                  <div className="detail-section">
                    <h4>Observações Gerais</h4>
                    <p>{selectedPedido.observacoes}</p>
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