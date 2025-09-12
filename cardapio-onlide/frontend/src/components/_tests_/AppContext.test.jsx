import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from '../../tests/test-utils';
import ProductGrid from '../ProductGrid';
import userEvent from '@testing-library/user-event';

describe('ProductGrid Component', () => {
  const mockOnAddToCart = vi.fn();
  
  const mockProdutos = [
    {
      id: 1,
      nome: 'X-Burger Clássico',
      descricao: 'Hambúrguer com carne, queijo, alface e tomate',
      preco: 18.90,
      categoria_id: 1,
      disponivel: true,
      tempo_preparo: 15,
      categoria: { id: 1, nome: 'Lanches' }
    },
    {
      id: 2,
      nome: 'Pizza Margherita',
      descricao: 'Pizza com molho, mussarela e manjericão',
      preco: 35.00,
      categoria_id: 2,
      disponivel: false,
      tempo_preparo: 25,
      categoria: { id: 2, nome: 'Pizzas' }
    }
  ];

  const mockSelectedCategory = { id: 'all', nome: 'Todos' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar lista de produtos', () => {
    render(
      <ProductGrid 
        produtos={mockProdutos}
        selectedCategory={mockSelectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={false}
      />
    );

    expect(screen.getByText('X-Burger Clássico')).toBeInTheDocument();
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText(/R\$ 18,90/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 35,00/)).toBeInTheDocument();
  });

  it('deve mostrar estado de loading', () => {
    render(
      <ProductGrid 
        produtos={[]}
        selectedCategory={mockSelectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={true}
      />
    );

    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há produtos', () => {
    render(
      <ProductGrid 
        produtos={[]}
        selectedCategory={mockSelectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={false}
      />
    );

    expect(screen.getByText(/nenhum produto disponível/i)).toBeInTheDocument();
  });

  it('deve filtrar produtos por categoria', () => {
    const selectedCategory = { id: 1, nome: 'Lanches' };
    
    render(
      <ProductGrid 
        produtos={mockProdutos}
        selectedCategory={selectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={false}
      />
    );

    expect(screen.getByText('X-Burger Clássico')).toBeInTheDocument();
    expect(screen.queryByText('Pizza Margherita')).not.toBeInTheDocument();
  });

  it('deve filtrar produtos por busca', () => {
    render(
      <ProductGrid 
        produtos={mockProdutos}
        selectedCategory={mockSelectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={false}
        searchTerm="pizza"
      />
    );

    expect(screen.queryByText('X-Burger Clássico')).not.toBeInTheDocument();
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
  });

  it('deve mostrar produto indisponível', () => {
    render(
      <ProductGrid 
        produtos={mockProdutos}
        selectedCategory={mockSelectedCategory}
        onAddToCart={mockOnAddToCart}
        loading={false}
      />
    );

    const pizzaCard = screen.getByText('Pizza Margherita').closest('.product-card');
    expect(pizzaCard).toHaveClass('unavailable');
    
    const indisponivelButton = screen.getByRole('button', { name: 'Indisponível' });
    expect(indisponivelButton).toBeDisabled();
  });

  it('deve chamar onAddToCart ao clicar em adicionar', async () => {
  render(
    <ProductGrid 
      produtos={mockProdutos}
      selectedCategory={mockSelectedCategory}
      onAddToCart={mockOnAddToCart}
      loading={false}
    />
  );

  // Seleciona o botão "Adicionar"
  const addButton = screen.getByRole('button', { name: 'Adicionar' });
  expect(addButton).not.toBeDisabled();

  // Descobre qual produto ele representa
  const productCard = addButton.closest('.product-card');
  const productName = within(productCard).getByRole('heading').textContent;
  const clickedProduct = mockProdutos.find(p => p.nome === productName);

  await userEvent.click(addButton);

  expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
  expect(mockOnAddToCart).toHaveBeenCalledWith(clickedProduct);
});
});