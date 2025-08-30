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
      return { ...state, selectedCategory: action.payload };
      
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
const AppContext = createContext();

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
        
        // Mock login para desenvolvimento
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
          
          toast.success('Login realizado com sucesso!');
          return mockResponse;
        } else {
          throw { error: 'Credenciais inválidas. Use: admin@cardapio.com / admin123' };
        }
      } catch (error) {
        toast.error(error.error || 'Erro ao fazer login');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    
    register: async (userData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        // Mock register para desenvolvimento
        const mockResponse = {
          token: 'mock-jwt-token-456',
          usuario: {
            id: 2,
            nome: userData.name,
            email: userData.email,
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
        
        toast.success('Conta criada com sucesso!');
        return mockResponse;
      } catch (error) {
        toast.error('Erro ao criar conta');
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
            { id: 4, nome: 'Sobremesas' }
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
              nome: 'Pizza Margherita',
              descricao: 'Molho de tomate, mussarela de búfala e manjericão fresco',
              preco: 35.00,
              categoria_id: 2,
              disponivel: true,
              tempo_preparo: 25,
              categoria: { id: 2, nome: 'Pizzas' }
            },
            {
              id: 3,
              nome: 'Coca-Cola 350ml',
              descricao: 'Refrigerante gelado',
              preco: 5.00,
              categoria_id: 3,
              disponivel: true,
              tempo_preparo: 2,
              categoria: { id: 3, nome: 'Bebidas' }
            },
            {
              id: 4,
              nome: 'Pudim de Leite',
              descricao: 'Pudim caseiro com calda de caramelo',
              preco: 8.50,
              categoria_id: 4,
              disponivel: true,
              tempo_preparo: 5,
              categoria: { id: 4, nome: 'Sobremesas' }
            },
            {
              id: 5,
              nome: 'Pizza Portuguesa',
              descricao: 'Presunto, ovos, cebola, azeitona e mussarela',
              preco: 42.00,
              categoria_id: 2,
              disponivel: true,
              tempo_preparo: 25,
              categoria: { id: 2, nome: 'Pizzas' }
            },
            {
              id: 6,
              nome: 'X-Bacon Especial',
              descricao: 'Hambúrguer com carne 180g, bacon crocante, queijo e salada',
              preco: 22.50,
              categoria_id: 1,
              disponivel: true,
              tempo_preparo: 18,
              categoria: { id: 1, nome: 'Lanches' }
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
          
          dispatch({ type: ActionTypes.CLEAR_CART });
          toast.success(`Pedido ${response.pedido.numero_pedido} criado com sucesso!`);
          
          return response.pedido;
          
        } catch (apiError) {
          console.warn('⚠️ API indisponível para criar pedido, simulando:', apiError.message);
          
          // Fallback para simulação
          const numeroPedido = `PED${Date.now().toString().slice(-6)}`;
          const total = state.cartItems.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
          
          console.log('🍽️ Pedido simulado criado:', {
            numero: numeroPedido,
            cliente: orderData.cliente_nome,
            itens: state.cartItems.length,
            total: total.toFixed(2),
            tipo: orderData.tipo_entrega
          });
          
          dispatch({ type: ActionTypes.CLEAR_CART });
          toast.success(`Pedido ${numeroPedido} criado com sucesso! (modo demo)`);
          
          return { numero_pedido: numeroPedido, total };
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

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro do AppProvider');
  }
  return context;
}

export default AppContext;