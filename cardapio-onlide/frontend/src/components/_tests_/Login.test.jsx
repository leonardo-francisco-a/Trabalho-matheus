import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../tests/test-utils';
import Login from '../Login';
import { act } from 'react';
import userEvent from '@testing-library/user-event';

describe('Login Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de login', () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar estado de loading', () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={true}
      />
    );

    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
  });

  it('deve validar campos obrigatórios', async () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

it('deve validar formato do email', async () => {
  render(
    <Login 
      onLogin={mockOnLogin}
      onSwitchToRegister={mockOnSwitchToRegister}
      loading={false}
    />
  );

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/senha/i);
  const form = screen.getByRole('button', { name: /entrar/i }).closest('form');

  // Preencha os campos
  fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
  fireEvent.change(passwordInput, { target: { value: '123456' } });
  
  // Submit o formulário
  fireEvent.submit(form);

  // Use uma busca mais flexível que funciona
  await waitFor(() => {
    const errorElements = screen.queryAllByText(/email.*inválido/i);
    expect(errorElements.length).toBeGreaterThan(0);
  }, { timeout: 5000 });

  expect(mockOnLogin).not.toHaveBeenCalled();
});

  it('deve validar tamanho mínimo da senha', async () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('deve chamar onLogin com dados válidos', async () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: 'test@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('test@teste.com', '123456');
    });
  });

  it('deve chamar onSwitchToRegister ao clicar no link', () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    const registerLink = screen.getByRole('button', { name: /cadastre-se/i });
    fireEvent.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('deve mostrar informações de demo', () => {
    render(
      <Login 
        onLogin={mockOnLogin}
        onSwitchToRegister={mockOnSwitchToRegister}
        loading={false}
      />
    );

    expect(screen.getByText(/admin@cardapio.com/)).toBeInTheDocument();
    expect(screen.getByText(/admin123/)).toBeInTheDocument();
  });
});