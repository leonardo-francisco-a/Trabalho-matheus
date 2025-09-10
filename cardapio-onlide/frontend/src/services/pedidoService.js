// src/services/pedidosService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const pedidosService = {
  // Criar novo pedido
  criarPedido: async (dadosPedido) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPedido),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },

  // Buscar todos os pedidos
  buscarPedidos: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  // Buscar pedido por ID
  buscarPedidoPorId: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      throw error;
    }
  },

  // Atualizar status do pedido
  atualizarStatusPedido: async (id, novoStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  },

  // Cancelar pedido
  cancelarPedido: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      throw error;
    }
  }
};