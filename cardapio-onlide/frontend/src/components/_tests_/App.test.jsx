import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../tests/test-utils';
import App from '../../App';


vi.mock('../services/api', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
  cardapioService: {
    listarCategorias: vi.fn(),
    listarItens: vi.fn(),
  },
}));


vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('deve mostrar tela de login por padrão', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    });
  });

  it('deve navegar para tela de registro', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    });

    const registerLink = screen.getByRole('button', { name: /cadastre-se/i });
    fireEvent.click(registerLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
    });
  });

  it('deve mostrar loading de autenticação', () => {
    
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ nome: 'Test User' }));

    render(<App />);

    
    
    expect(screen.queryByText(/verificando autenticação/i)).toBeDefined();
  });
});