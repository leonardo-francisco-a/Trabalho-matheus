-- Atualizar arquivo init.sql com mais dados
USE cardapio_db;

-- Limpar dados existentes
DELETE FROM itens_pedido;
DELETE FROM pedidos;
DELETE FROM cardapio;
DELETE FROM categorias;
DELETE FROM usuarios;

-- Inserir categorias
INSERT INTO categorias (id, nome, descricao, ativo, createdAt, updatedAt) VALUES
(1, 'Lanches', 'Hambúrguers, sanduíches e petiscos', true, NOW(), NOW()),
(2, 'Pizzas', 'Pizzas tradicionais e especiais', true, NOW(), NOW()),
(3, 'Bebidas', 'Refrigerantes, sucos e águas', true, NOW(), NOW()),
(4, 'Sobremesas', 'Doces e sobremesas', true, NOW(), NOW()),
(5, 'Pratos Principais', 'Refeições completas', true, NOW(), NOW());

-- Inserir itens do cardápio
INSERT INTO cardapio (nome, descricao, preco, categoria_id, disponivel, tempo_preparo, createdAt, updatedAt) VALUES
-- Lanches
('X-Burger Clássico', 'Hambúrguer com carne 180g, queijo, alface, tomate e maionese', 18.90, 1, true, 15, NOW(), NOW()),
('X-Bacon Especial', 'Hambúrguer com carne 180g, bacon crocante, queijo e salada', 22.50, 1, true, 18, NOW(), NOW()),
('X-Egg Supreme', 'Hambúrguer com carne, ovo frito, queijo, bacon e molho especial', 24.90, 1, true, 20, NOW(), NOW()),
('Sanduíche Natural', 'Pão integral com peito de peru, queijo branco e salada', 12.50, 1, true, 10, NOW(), NOW()),

-- Pizzas
('Pizza Margherita', 'Molho de tomate, mussarela de búfala e manjericão fresco', 35.00, 2, true, 25, NOW(), NOW()),
('Pizza Portuguesa', 'Presunto, ovos, cebola, azeitona e mussarela', 42.00, 2, true, 25, NOW(), NOW()),
('Pizza Calabresa', 'Calabresa fatiada, cebola e mussarela', 38.00, 2, true, 25, NOW(), NOW()),
('Pizza Quatro Queijos', 'Mussarela, gorgonzola, parmesão e catupiry', 45.00, 2, true, 25, NOW(), NOW()),

-- Bebidas
('Coca-Cola 350ml', 'Refrigerante gelado', 5.00, 3, true, 2, NOW(), NOW()),
('Suco de Laranja 500ml', 'Suco natural da fruta', 8.50, 3, true, 5, NOW(), NOW()),
('Água Mineral 500ml', 'Água mineral natural', 3.50, 3, true, 1, NOW(), NOW()),
('Refrigerante Guaraná 350ml', 'Guaraná Antarctica gelado', 5.00, 3, true, 2, NOW(), NOW()),

-- Sobremesas
('Pudim de Leite', 'Pudim caseiro com calda de caramelo', 8.50, 4, true, 5, NOW(), NOW()),
('Brownie com Sorvete', 'Brownie quente com bola de sorvete de baunilha', 12.00, 4, true, 8, NOW(), NOW()),
('Açaí 300ml', 'Açaí batido com banana e granola', 10.50, 4, true, 5, NOW(), NOW()),

-- Pratos Principais
('Lasanha Bolonhesa', 'Lasanha tradicional com molho bolonhesa e queijo', 28.90, 5, true, 30, NOW(), NOW()),
('Frango Grelhado', 'Filé de frango grelhado com arroz e salada', 22.50, 5, true, 25, NOW(), NOW()),
('Peixe Assado', 'Filé de peixe assado com legumes e arroz', 26.90, 5, true, 28, NOW(), NOW());

-- Inserir usuário admin padrão
INSERT INTO usuarios (nome, email, senha, tipo, ativo, createdAt, updatedAt) VALUES
('Administrador', 'admin@cardapio.com', '$2a$12$rQW8kUCTGVQ8k.RMZZQr6eQELVx9uDCqCzHLBJfPJ5r3QJcHOQEQm', 'admin', true, NOW(), NOW());
-- Senha: admin123