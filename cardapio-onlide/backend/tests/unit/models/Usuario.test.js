const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configurar banco em memória para testes
const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  logging: false
});

// Definir modelo Usuario para teste
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  tipo: {
    type: DataTypes.ENUM('cliente', 'admin'),
    allowNull: false,
    defaultValue: 'cliente'
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        usuario.senha = await bcrypt.hash(usuario.senha, 12);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        usuario.senha = await bcrypt.hash(usuario.senha, 12);
      }
    }
  }
});

Usuario.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

describe('Usuario Model', () => {
  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar tabela antes de cada teste
    await Usuario.destroy({ where: {} });
  });

  describe('Criação de usuário', () => {
    it('deve criar um usuário válido', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456',
        tipo: 'admin'
      };

      const usuario = await Usuario.create(userData);

      expect(usuario.nome).toBe(userData.nome);
      expect(usuario.email).toBe(userData.email);
      expect(usuario.tipo).toBe(userData.tipo);
      expect(usuario.senha).not.toBe(userData.senha); // Deve ser hash
      expect(usuario.ativo).toBe(true); // Default
    });

    it('deve validar email único', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        senha: '123456',
        tipo: 'admin'
      };

      await Usuario.create(userData);

      // Tentar criar outro com mesmo email
      await expect(Usuario.create({
        ...userData,
        nome: 'Maria Silva'
      })).rejects.toThrow();
    });

    it('deve validar campos obrigatórios', async () => {
      // Nome obrigatório
      await expect(Usuario.create({
        email: 'test@teste.com',
        senha: '123456'
      })).rejects.toThrow();

      // Email obrigatório
      await expect(Usuario.create({
        nome: 'Test User',
        senha: '123456'
      })).rejects.toThrow();

      // Senha obrigatória
      await expect(Usuario.create({
        nome: 'Test User',
        email: 'test@teste.com'
      })).rejects.toThrow();
    });
  });

  describe('Métodos do modelo', () => {
    let usuario;

    beforeEach(async () => {
      usuario = await Usuario.create({
        nome: 'Test User',
        email: 'test@teste.com',
        senha: '123456',
        tipo: 'admin'
      });
    });

    it('deve verificar senha correta', async () => {
      const isValid = await usuario.verificarSenha('123456');
      expect(isValid).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const isValid = await usuario.verificarSenha('senha-errada');
      expect(isValid).toBe(false);
    });

    it('deve fazer hash da senha ao atualizar', async () => {
      const senhaOriginal = usuario.senha;
      
      await usuario.update({ senha: 'nova-senha' });
      await usuario.reload();

      expect(usuario.senha).not.toBe('nova-senha');
      expect(usuario.senha).not.toBe(senhaOriginal);
      
      const isValid = await usuario.verificarSenha('nova-senha');
      expect(isValid).toBe(true);
    });
  });
});