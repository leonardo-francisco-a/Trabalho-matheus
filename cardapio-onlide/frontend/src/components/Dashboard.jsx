import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    pedidos_hoje: 0,
    faturamento_hoje: '0.00',
    pedidos_pendentes: 0,
    total_itens_cardapio: 0,
    pedidos_por_status: []
  });
  
  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      numero_pedido: 'PED123456',
      cliente_nome: 'João Silva',
      total: 45.90,
      status: 'preparando',
      createdAt: new Date().toISOString(),
      itens: [
        { nome: 'X-Burger Clássico', quantidade: 2 },
        { nome: 'Coca-Cola 350ml', quantidade: 1 }
      ]
    },
    {
      id: 2,
      numero_pedido: 'PED123457',
      cliente_nome: 'Maria Santos',
      total: 28.50,
      status: 'pronto',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      itens: [
        { nome: 'Pizza Margherita', quantidade: 1 }
      ]
    },
    {
      id: 3,
      numero_pedido: 'PED123458',
      cliente_nome: 'Carlos Lima',
      total: 52.00,
      status: 'recebido',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      itens: [
        { nome: 'Lasanha Bolonhesa', quantidade: 1 },
        { nome: 'Suco de Laranja', quantidade: 2 }
      ]
    }
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tentar carregar dados reais da API
      try {
        const statsData = await dashboardService.obterEstatisticas();
        setStats(statsData);
      } catch (error) {
        console.warn('API indisponível, usando dados mockados');
        // Usar dados mockados se API falhar
        setStats({
          pedidos_hoje: 15,
          faturamento_hoje: '287.50',
          pedidos_pendentes: 5,
          total_itens_cardapio: 10,
          pedidos_por_status: [
            { status: 'recebido', quantidade: 3 },
            { status: 'preparando', quantidade: 2 },
            { status: 'pronto', quantidade: 1 },
            { status: 'entregue', quantidade: 8 },
            { status: 'cancelado', quantidade: 1 }
          ]
        });
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

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
            <span className="stat-trend positive">+12% vs ontem</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pedidos Hoje</h3>
            <p className="stat-value">{stats.pedidos_hoje}</p>
            <span className="stat-trend positive">+5 novos</span>
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
            {stats.pedidos_por_status.map((item) => (
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
            ))}
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
            {recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <div className="order-id">#{order.numero_pedido}</div>
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
                    {order.itens.map((item, index) => (
                      <span key={index}>
                        {item.quantidade}x {item.nome}
                        {index < order.itens.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="order-footer">
                  <div className="order-total">{formatPrice(order.total)}</div>
                  <div className="order-time">{formatDate(order.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="orders-footer">
            <button className="view-all-btn">
              Ver Todos os Pedidos →
            </button>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <h3>Ações Rápidas</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>Adicionar Produto</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>Relatórios</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span>Configurações</span>
          </button>
          
          <button className="action-btn">
            <span className="action-icon">💳</span>
            <span>Financeiro</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;