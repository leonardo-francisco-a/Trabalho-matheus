USE cardapio_db;

CREATE TABLE IF NOT EXISTS categorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS cardapio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

INSERT IGNORE INTO categorias VALUES
(1, "Lanches", "Hambúrguers e sanduíches"),
(2, "Pizzas", "Pizzas tradicionais"),
(3, "Bebidas", "Refrigerantes e sucos"),
(4, "Sobremesas", "Doces");

INSERT IGNORE INTO cardapio VALUES
(1, "X-Burger", "Hambúrguer simples", 18.90, 1),
(2, "Pizza Margherita", "Pizza tradicional", 35.00, 2),
(3, "Coca-Cola", "Refrigerante", 5.00, 3),
(4, "Pudim", "Sobremesa", 8.50, 4);
