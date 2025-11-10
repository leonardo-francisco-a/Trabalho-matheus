import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||
         (import.meta.env.MODE === 'production'
           ? 'https://cardapio-backend-prod-791776403069.us-central1.run.app/api'
           : 'http://localhost:3001/api'),
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
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
    console.error('Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      toast.error('Sessão expirada. Faça login novamente.');
    }
    
    // Se for erro de rede, mostrar mensagem mais amigável
    if (!error.response) {
      toast.error('Erro de conexão. Verifique se o backend está rodando.');
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
      console.log('📝 Tentando registrar:', { nome, email, telefone });
      
      const requestData = {
        nome,
        email, 
        senha
      };
      
      // Adicionar telefone apenas se fornecido
      if (telefone && telefone.trim()) {
        requestData.telefone = telefone;
      }
      
      console.log('📝 Dados enviados:', requestData);
      
      const response = await api.post('/auth/register', requestData);
      return response.data;
    } catch (error) {
      console.error('❌ Erro no registro:', error.response?.data);
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
      const params = categoria_id && categoria_id !== 'all' ? { categoria_id } : {};
      const response = await api.get('/cardapio', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
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
      console.error('Erro ao carregar categorias:', error);
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
      console.error('Erro ao criar pedido:', error);
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

// ==================== UTILS ====================
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('🟢 Backend conectado:', response.data);
    return true;
  } catch (error) {
    console.error('🔴 Backend não conectado:', error.message);
    return false;
  }
};

export default api;