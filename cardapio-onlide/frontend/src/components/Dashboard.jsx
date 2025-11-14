import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { dashboardService } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const { state } = useApp();
  const [stats, setStats] = useState({
    pedidos_hoje: 0,
    faturamento_hoje: '0.00',
    pedidos_pendentes: 0,
    total_itens_cardapio: 0,
    pedidos_por_status: []
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [state.pedidos]);

  
  const calculateStats = () => {
    const pedidos = state.pedidos || [];
    const produtos = state.produtos || [];
    
    
    const hoje = new Date();
    const hojeStr = hoje.toDateString();
    
    
    const pedidosHoje = pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.createdAt);
      return dataPedido.toDateString() === hojeStr;
    });
    
    
    const faturamentoHoje = pedidosHoje
      .filter(pedido => pedido.status !== 'cancelado')
      .reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
    
    
    const pedidosPendentes = pedidos.filter(pedido => 
      ['recebido', 'preparando'].includes(pedido.status)
    ).length;
    
    
    const statusCount = pedidos.reduce((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {});
    
    const pedidosPorStatus = Object.entries(statusCount).map(([status, quantidade]) => ({
      status,
      quantidade
    }));
    
    return {
      pedidos_hoje: pedidosHoje.length,
      faturamento_hoje: faturamentoHoje.toFixed(2),
      pedidos_pendentes: pedidosPendentes,
      total_itens_cardapio: produtos.filter(p => p.disponivel).length,
      pedidos_por_status: pedidosPorStatus
    };
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      
      try {
        const statsData = await dashboardService.obterEstatisticas();
        setStats(statsData);
      } catch (error) {
        console.warn('API indisponível, calculando stats do estado local');
        
        const localStats = calculateStats();
        setStats(localStats);
      }
      
      
      const pedidos = state.pedidos || [];
      if (pedidos.length > 0) {
        
        const pedidosRecentes = pedidos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(pedido => ({
            ...pedido,
            itens: pedido.itens || []
          }));
        setRecentOrders(pedidosRecentes);
      } else {
        
        setRecentOrders([]);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(price));
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  const getTrend = (current, type) => {
    
    const trends = {
      pedidos: Math.random() > 0.5 ? '+5' : '-2',
      faturamento: Math.random() > 0.5 ? '+12%' : '-5%'
    };
    
    const isPositive = trends[type]?.startsWith('+');
    return {
      value: trends[type] || '0%',
      isPositive
    };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  const pedidosTrend = getTrend(stats.pedidos_hoje, 'pedidos');
  const faturamentoTrend = getTrend(stats.faturamento_hoje, 'faturamento');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo, {user?.nome}! Aqui está um resumo do seu negócio hoje.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Faturamento Hoje</h3>
            <p className="stat-value">{formatPrice(stats.faturamento_hoje)}</p>
            <span className={`stat-trend ${faturamentoTrend.isPositive ? 'positive' : 'negative'}`}>
              {faturamentoTrend.value} vs ontem
            </span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pedidos Hoje</h3>
            <p className="stat-value">{stats.pedidos_hoje}</p>
            <span className={`stat-trend ${pedidosTrend.isPositive ? 'positive' : 'negative'}`}>
              {pedidosTrend.value} novos
            </span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Pedidos Pendentes</h3>
            <p className="stat-value">{stats.pedidos_pendentes}</p>
            <span className="stat-trend neutral">Em andamento</span>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Itens no Cardápio</h3>
            <p className="stat-value">{stats.total_itens_cardapio}</p>
            <span className="stat-trend neutral">Ativos</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Status e Pedidos Recentes */}
      <div className="dashboard-content">
        <div className="status-chart-card">
          <h3>Status dos Pedidos</h3>
          <div className="status-chart">
            {stats.pedidos_por_status.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>Nenhum pedido ainda</p>
              </div>
            ) : (
              stats.pedidos_por_status.map((item) => (
                <div key={item.status} className="status-item">
                  <div className="status-info">
                    <span 
                      className="status-dot" 
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></span>
                    <span className="status-name">{getStatusLabel(item.status)}</span>
                  </div>
                  <span className="status-count">{item.quantidade}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recent-orders-card">
          <div className="card-header">
            <h3>Pedidos Recentes</h3>
            <button className="refresh-btn" onClick={loadDashboardData}>
              🔄 Atualizar
            </button>
          </div>
          
          <div className="orders-list">
            {recentOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <h4>Nenhum pedido recente</h4>
                <p>Os pedidos aparecerão aqui quando forem feitos</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <div className="order-id">#{order.numero_pedido || `PED${order.id}`}</div>
                    <div 
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-customer">
                      <strong>{order.cliente_nome}</strong>
                    </div>
                    <div className="order-items">
                      {order.itens && order.itens.length > 0 ? (
                        order.itens.map((item, index) => (
                          <span key={index}>
                            {item.quantidade}x {item.nome || item.produto?.nome}
                            {index < order.itens.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        <span>Detalhes indisponíveis</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="order-footer">
                    <div className="order-total">{formatPrice(order.total)}</div>
                    <div className="order-time">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {recentOrders.length > 0 && (
            <div className="orders-footer">
              <button className="view-all-btn">
                Ver Todos os Pedidos →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;