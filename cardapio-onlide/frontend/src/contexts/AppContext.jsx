import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';
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
  selectedCategory: null,
  
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
      return {
        ...state,
        authLoading: action.payload
      };
      
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
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        cartItems: [],
        currentView: 'login'
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_PRODUTOS:
      return {
        ...state,
        produtos: action.payload
      };
      
    case ActionTypes.SET_CATEGORIAS:
      return {
        ...state,
        categorias: action.payload
      };
      
    case ActionTypes.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload
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
      return {
        ...state,
        cartItems: []
      };
      
    case ActionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload
      };
      
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
          // Validar token com backend
          const response = await authService.me();
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: {
              token,
              user: response.usuario
            }
          });
        } catch (error) {
          // Token inválido, limpar dados
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
    login: async (email, password) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await authService.login(email, password);
        
        // Salvar no localStorage
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
        toast.error(error.error || 'Erro ao fazer login');
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
    
    register: async (userData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await authService.register(
          userData.name,
          userData.email, 
          userData.password,
          userData.telefone
        );
        
        // Salvar no localStorage
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
    
    // UI actions
    setCurrentView: (view) => {
      dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view });
    },
    
    // Produtos actions
    setProdutos: (produtos) => {
      dispatch({ type: ActionTypes.SET_PRODUTOS, payload: produtos });
    },
    
    setCategorias: (categorias) => {
      dispatch({ type: ActionTypes.SET_CATEGORIAS, payload: categorias });
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
      if (quantity <= 0) {
        dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: id });
      } else {
        dispatch({ 
          type: ActionTypes.UPDATE_CART_ITEM, 
          payload: { id, quantity } 
        });
      }
    },
    
    removeFromCart: (id) => {
      dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: id });
      toast.success('Item removido do carrinho');
    },
    
    clearCart: () => {
      dispatch({ type: ActionTypes.CLEAR_CART });
    },
    
    // Utility
    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
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