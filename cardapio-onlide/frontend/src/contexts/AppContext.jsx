import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, cardapioService, pedidosService } from '../services/api';
import toast from 'react-hot-toast';

// Estados iniciais
const initialState = {
  // Auth
  isAuthenticated: false,
  user: null,
  token: null,
  
  // Loading states
  loading: false,
  authLoading: true,
  
  // Produtos e categorias
  produtos: [],
  categorias: [],
  selectedCategory: { id: 'all', nome: 'Todos' },
  
  // Pedidos
  pedidos: [],
  
  // Busca e filtros
  searchTerm: '',
  filters: {
    disponivel: 'all',
    precoMin: '',
    precoMax: '',
    categoria: 'all'
  },
  
  // Carrinho
  cartItems: [],
  
  // UI
  currentView: 'login',
};

// Actions
const ActionTypes = {
  // Auth
  SET_AUTH_LOADING: 'SET_AUTH_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  
  // Loading
  SET_LOADING: 'SET_LOADING',
  
  // Produtos
  SET_PRODUTOS: 'SET_PRODUTOS',
  SET_CATEGORIAS: 'SET_CATEGORIAS',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  
  // Pedidos
  SET_PEDIDOS: 'SET_PEDIDOS',
  ADD_PEDIDO: 'ADD_PEDIDO',
  UPDATE_PEDIDO_STATUS: 'UPDATE_PEDIDO_STATUS',
  
  // Busca e filtros
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_SEARCH_AND_FILTERS: 'CLEAR_SEARCH_AND_FILTERS',
  
  // Carrinho
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  
  // UI
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_AUTH_LOADING:
      return { ...state, authLoading: action.payload };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        currentView: 'app',
        authLoading: false
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        authLoading: false
      };
      
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
      
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_PRODUTOS:
      return { ...state, produtos: action.payload };
      
    case ActionTypes.SET_CATEGORIAS:
      return { ...state, categorias: action.payload };
      
    case ActionTypes.SET_SELECTED_CATEGORY:
      return { 
        ...state, 
        selectedCategory: action.payload,
        // Limpar busca quando trocar de categoria
        searchTerm: '',
        filters: {
          disponivel: 'all',
          precoMin: '',
          precoMax: '',
          categoria: 'all'
        }
      };

    case ActionTypes.SET_PEDIDOS:
      return { ...state, pedidos: action.payload };
      
    case ActionTypes.ADD_PEDIDO:
      return { 
        ...state, 
        pedidos: [action.payload, ...state.pedidos] 
      };
      
    case ActionTypes.UPDATE_PEDIDO_STATUS:
      return {
        ...state,
        pedidos: state.pedidos.map(pedido =>
          pedido.id === action.payload.id
            ? { ...pedido, status: action.payload.status }
            : pedido
        )
      };

    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };

    case ActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case ActionTypes.CLEAR_SEARCH_AND_FILTERS:
      return { 
        ...state, 
        searchTerm: '', 
        filters: {
          disponivel: 'all',
          precoMin: '',
          precoMax: '',
          categoria: 'all'
        }
      };
      
    case ActionTypes.ADD_TO_CART:
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }]
      };
      
    case ActionTypes.UPDATE_CART_ITEM:
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cartItems: state.cartItems.filter(item => item.id !== action.payload.id)
        };
      }
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      
    case ActionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload)
      };
      
    case ActionTypes.CLEAR_CART:
      return { ...state, cartItems: [] };
      
    case ActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Se temos dados salvos, usá-los imediatamente
          const user = JSON.parse(userData);
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: { token, user }
          });
        } catch (error) {
          console.error('Erro ao recuperar dados salvos:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: false });
        }
      } else {
        dispatch({ type: ActionTypes.SET_AUTH_LOADING, payload: false });
      }
    };
    
    checkAuth();
  }, []);
  
  // Actions
  const actions = {
    // Auth actions
    login: async (email, senha) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // USAR API REAL em vez de mock
        const response = await authService.login(email, senha);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.usuario));
        
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            token: response.token,
            user: response.usuario
          }
        });
        
        toast.success('Login realizado com sucesso!');
        return response;
        
      } catch (error) {
        // Fallback para mock apenas se API falhar
        console.warn('⚠️ API falhou, tentando mock:', error.message);
        
        if (email === 'admin@cardapio.com' && senha === 'admin123') {
          const mockResponse = {
            token: 'mock-jwt-token-123',
            usuario: {
              id: 1,
              nome: 'Administrador',
              email: 'admin@cardapio.com',
              tipo: 'admin'
            }
          };
          
          localStorage.setItem('token', mockResponse.token);
          localStorage.setItem('user', JSON.stringify(mockResponse.usuario));
          
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: {
              token: mockResponse.token,
              user: mockResponse.usuario
            }
          });
          
          toast.success('Login realizado com sucesso! (modo demo)');
          return mockResponse;
        } else {
          toast.error(error.error || 'Credenciais inválidas');
          throw error;
        }
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    
    register: async (userData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // USAR API REAL em vez de mock
        const response = await authService.register(
          userData.name, 
          userData.email, 
          userData.password, 
          userData.telefone
        );
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.usuario));
        
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            token: response.token,
            user: response.usuario
          }
        });
        
        toast.success('Conta criada com sucesso!');
        return response;
        
      } catch (error) {
        toast.error(error.error || 'Erro ao criar conta');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: ActionTypes.LOGOUT });
      toast.success('Logout realizado com sucesso!');
    },
    
    // Carregar dados iniciais
    loadInitialData: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // Tentar carregar dados reais da API
        try {
          // Carregar categorias da API
          const categoriasResponse = await cardapioService.listarCategorias();
          let categorias = categoriasResponse || [];
          
          // Adicionar categoria "Todos" se não existir
          if (!categorias.find(cat => cat.id === 'all')) {
            categorias = [{ id: 'all', nome: 'Todos' }, ...categorias];
          }
          
          // Carregar produtos da API
          const produtosResponse = await cardapioService.listarItens();
          const produtos = produtosResponse?.itens || [];
          
          dispatch({ type: ActionTypes.SET_CATEGORIAS, payload: categorias });
          dispatch({ type: ActionTypes.SET_PRODUTOS, payload: produtos });
          
          console.log('✅ Dados carregados da API:', { categorias: categorias.length, produtos: produtos.length });
          
        } catch (apiError) {
          console.warn('⚠️ API indisponível, usando dados mockados:', apiError.message);
          
          // Fallback para dados mockados
          const categorias = [
            { id: 'all', nome: 'Todos' },
            { id: 1, nome: 'Lanches' },
            { id: 2, nome: 'Pizzas' },
            { id: 3, nome: 'Bebidas' },
            { id: 4, nome: 'Sobremesas' },
            { id: 5, nome: 'Pratos Principais' }
          ];
          
          const produtos = [
            {
              id: 1,
              nome: 'X-Burger Clássico',
              descricao: 'Hambúrguer com carne 180g, queijo, alface, tomate e maionese',
              preco: 18.90,
              categoria_id: 1,
              disponivel: true,
              tempo_preparo: 15,
              categoria: { id: 1, nome: 'Lanches' }
            },
            {
              id: 2,
              nome: 'X-Bacon Especial',
              descricao: 'Hambúrguer com carne 180g, bacon crocante, queijo e salada',
              preco: 22.50,
              categoria_id: 1,
              disponivel: true,
              tempo_preparo: 18,
              categoria: { id: 1, nome: 'Lanches' }
            },
            {
              id: 3,
              nome: 'Pizza Margherita',
              descricao: 'Molho de tomate, mussarela de búfala e manjericão fresco',
              preco: 35.00,
              categoria_id: 2,
              disponivel: true,
              tempo_preparo: 25,
              categoria: { id: 2, nome: 'Pizzas' }
            },
            {
              id: 4,
              nome: 'Pizza Portuguesa',
              descricao: 'Presunto, ovos, cebola, azeitona e mussarela',
              preco: 42.00,
              categoria_id: 2,
              disponivel: true,
              tempo_preparo: 25,
              categoria: { id: 2, nome: 'Pizzas' }
            },
            {
              id: 5,
              nome: 'Coca-Cola 350ml',
              descricao: 'Refrigerante gelado',
              preco: 5.00,
              categoria_id: 3,
              disponivel: true,
              tempo_preparo: 2,
              categoria: { id: 3, nome: 'Bebidas' }
            },
            {
              id: 6,
              nome: 'Suco de Laranja 500ml',
              descricao: 'Suco natural da fruta',
              preco: 8.50,
              categoria_id: 3,
              disponivel: true,
              tempo_preparo: 5,
              categoria: { id: 3, nome: 'Bebidas' }
            },
            {
              id: 7,
              nome: 'Pudim de Leite',
              descricao: 'Pudim caseiro com calda de caramelo',
              preco: 8.50,
              categoria_id: 4,
              disponivel: true,
              tempo_preparo: 5,
              categoria: { id: 4, nome: 'Sobremesas' }
            },
            {
              id: 8,
              nome: 'Brownie com Sorvete',
              descricao: 'Brownie quente com bola de sorvete de baunilha',
              preco: 12.00,
              categoria_id: 4,
              disponivel: true,
              tempo_preparo: 8,
              categoria: { id: 4, nome: 'Sobremesas' }
            },
            {
              id: 9,
              nome: 'Lasanha Bolonhesa',
              descricao: 'Lasanha tradicional com molho bolonhesa e queijo',
              preco: 28.90,
              categoria_id: 5,
              disponivel: true,
              tempo_preparo: 30,
              categoria: { id: 5, nome: 'Pratos Principais' }
            },
            {
              id: 10,
              nome: 'Frango Grelhado',
              descricao: 'Filé de frango grelhado com arroz e salada',
              preco: 22.50,
              categoria_id: 5,
              disponivel: false,
              tempo_preparo: 25,
              categoria: { id: 5, nome: 'Pratos Principais' }
            }
          ];
          
          dispatch({ type: ActionTypes.SET_CATEGORIAS, payload: categorias });
          dispatch({ type: ActionTypes.SET_PRODUTOS, payload: produtos });
          
          toast.error('Usando dados de demonstração (backend offline)');
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    
    // UI actions
    setCurrentView: (view) => {
      dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view });
    },
    
    setSelectedCategory: (category) => {
      dispatch({ type: ActionTypes.SET_SELECTED_CATEGORY, payload: category });
    },

    // Search and filter actions
    setSearchTerm: (term) => {
      dispatch({ type: ActionTypes.SET_SEARCH_TERM, payload: term });
    },

    setFilters: (filters) => {
      dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    },

    clearSearchAndFilters: () => {
      dispatch({ type: ActionTypes.CLEAR_SEARCH_AND_FILTERS });
    },
    
    // Carrinho actions
    addToCart: (produto) => {
      dispatch({ type: ActionTypes.ADD_TO_CART, payload: produto });
      toast.success(`${produto.nome} adicionado ao carrinho!`);
    },
    
    updateCartItem: (id, quantity) => {
      dispatch({ 
        type: ActionTypes.UPDATE_CART_ITEM, 
        payload: { id, quantity } 
      });
    },
    
    removeFromCart: (id) => {
      dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: id });
      toast.success('Item removido do carrinho');
    },
    
    clearCart: () => {
      dispatch({ type: ActionTypes.CLEAR_CART });
      toast.success('Carrinho limpo');
    },
    
    // Pedidos actions
    loadPedidos: async () => {
      try {
        const response = await pedidosService.listarPedidos();
        dispatch({ type: ActionTypes.SET_PEDIDOS, payload: response.pedidos || [] });
      } catch (error) {
        console.warn('Erro ao carregar pedidos da API:', error);
        // Manter pedidos existentes no estado local
      }
    },
    
    updatePedidoStatus: async (pedidoId, novoStatus) => {
      try {
        await pedidosService.atualizarStatus(pedidoId, novoStatus);
        dispatch({ 
          type: ActionTypes.UPDATE_PEDIDO_STATUS, 
          payload: { id: pedidoId, status: novoStatus }
        });
        toast.success('Status do pedido atualizado');
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status do pedido');
      }
    },
    
    placeOrder: async (orderData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // Tentar criar pedido via API
        try {
          const response = await pedidosService.criarPedido({
            cliente_nome: orderData.cliente_nome,
            cliente_telefone: orderData.cliente_telefone,
            endereco_entrega: orderData.endereco_entrega,
            tipo_entrega: orderData.tipo_entrega,
            observacoes: orderData.observacoes || '',
            itens: orderData.itens
          });
          
          // Adicionar o pedido ao estado local
          dispatch({ type: ActionTypes.ADD_PEDIDO, payload: response.pedido });
          dispatch({ type: ActionTypes.CLEAR_CART });
          toast.success(`Pedido ${response.pedido.numero_pedido} criado com sucesso!`);
          
          return response.pedido;
          
        } catch (apiError) {
          console.warn('⚠️ API indisponível para criar pedido, simulando:', apiError.message);
          
          // Fallback para simulação
          const numeroPedido = `PED${Date.now().toString().slice(-6)}`;
          const total = state.cartItems.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
          
          // Criar pedido simulado
          const pedidoSimulado = {
            id: Date.now(),
            numero_pedido: numeroPedido,
            cliente_nome: orderData.cliente_nome,
            cliente_telefone: orderData.cliente_telefone,
            cliente_email: orderData.cliente_email,
            endereco_entrega: orderData.endereco_entrega,
            tipo_entrega: orderData.tipo_entrega,
            observacoes: orderData.observacoes || '',
            status: 'recebido',
            total: total.toFixed(2),
            createdAt: new Date().toISOString(),
            itens: state.cartItems.map(item => ({
              id: Date.now() + Math.random(),
              nome: item.nome,
              quantidade: item.quantity,
              preco_unitario: item.preco,
              observacoes: item.observacoes || ''
            }))
          };
          
          console.log('🍽️ Pedido simulado criado:', pedidoSimulado);
          
          // Adicionar ao estado local
          dispatch({ type: ActionTypes.ADD_PEDIDO, payload: pedidoSimulado });
          dispatch({ type: ActionTypes.CLEAR_CART });
          toast.success(`Pedido ${numeroPedido} criado com sucesso! (modo demo)`);
          
          return pedidoSimulado;
        }
        
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        toast.error('Erro ao criar pedido');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }
  };
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro do AppProvider');
  }
  return context;
}

// Exportação padrão
export default AppContext;