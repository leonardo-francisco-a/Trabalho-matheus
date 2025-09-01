-- backend/database/init.sql
-- Script simplificado de inicialização

USE cardapio_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
    telefone VARCHAR(20) NULL,
    ativo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela do Cardápio
CREATE TABLE IF NOT EXISTS cardapio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    imagem_url VARCHAR(500) NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    tempo_preparo INT DEFAULT 30,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NULL,
    cliente_email VARCHAR(255) NULL,
    status ENUM('recebido', 'preparando', 'pronto', 'entregue', 'cancelado') DEFAULT 'recebido',
    total DECIMAL(10,2) NOT NULL,
    observacoes TEXT NULL,
    tipo_entrega ENUM('balcao', 'delivery') DEFAULT 'balcao',
    endereco_entrega TEXT NULL,
    numero_pedido VARCHAR(20) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    cardapio_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    observacoes TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (cardapio_id) REFERENCES cardapio(id)
);

-- Dados iniciais - Usuário admin
INSERT IGNORE INTO usuarios (nome, email, senha, tipo, ativo) VALUES 
('Administrador', 'admin@cardapio.com', 'admin123', 'admin', TRUE);

-- Dados iniciais - Categorias
INSERT IGNORE INTO categorias (nome, descricao, ativo) VALUES
('Lanches', 'Hambúrguers e sanduíches', TRUE),
('Pizzas', 'Pizzas tradicionais', TRUE),
('Bebidas', 'Refrigerantes e sucos', TRUE),
('Sobremesas', 'Doces e sobremesas', TRUE);

-- Dados iniciais - Cardápio
INSERT IGNORE INTO cardapio (nome, descricao, preco, categoria_id, disponivel, tempo_preparo) VALUES
('X-Burger Clássico', 'Hambúrguer com carne, queijo, alface e tomate', 18.90, 1, TRUE, 15),
('Pizza Margherita', 'Pizza com molho, mussarela e manjericão', 35.00, 2, TRUE, 25),
('Coca-Cola 350ml', 'Refrigerante gelado', 5.00, 3, TRUE, 2),
('Pudim de Leite', 'Pudim caseiro com calda de caramelo', 8.50, 4, TRUE, 5);

SELECT 'Banco inicializado com sucesso!' as status;