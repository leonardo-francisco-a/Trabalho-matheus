import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sessão expirada. Faça login novamente.');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================
export const authService = {
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao fazer login' };
    }
  },

  register: async (nome, email, senha, telefone) => {
    try {
      const response = await api.post('/auth/register', {
        nome,
        email, 
        senha,
        telefone
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar conta' };
    }
  },

  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao obter dados do usuário' };
    }
  }
};

// ==================== CARDAPIO SERVICES ====================
export const cardapioService = {
  listarItens: async (categoria_id = null) => {
    try {
      const params = categoria_id ? { categoria_id } : {};
      const response = await api.get('/cardapio', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao carregar cardápio' };
    }
  },

  obterItem: async (id) => {
    try {
      const response = await api.get(`/cardapio/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao carregar item' };
    }
  },

  listarCategorias: async () => {
    try {
      const response = await api.get('/cardapio/categorias');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao carregar categorias' };
    }
  }
};

// ==================== PEDIDOS SERVICES ====================
export const pedidosService = {
  criarPedido: async (pedidoData) => {
    try {
      const response = await api.post('/pedidos', pedidoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao criar pedido' };
    }
  },

  obterPedido: async (id) => {
    try {
      const response = await api.get(`/pedidos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao obter pedido' };
    }
  },

  listarPedidos: async (params = {}) => {
    try {
      const response = await api.get('/pedidos', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao listar pedidos' };
    }
  },

  atualizarStatus: async (id, status) => {
    try {
      const response = await api.put(`/pedidos/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao atualizar status' };
    }
  }
};

// ==================== DASHBOARD SERVICES ====================
export const dashboardService = {
  obterEstatisticas: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao carregar estatísticas' };
    }
  },

  obterRelatorioVendas: async (dataInicio, dataFim) => {
    try {
      const params = {};
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;
      
      const response = await api.get('/dashboard/vendas', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erro ao carregar relatório' };
    }
  }
};

export default api;