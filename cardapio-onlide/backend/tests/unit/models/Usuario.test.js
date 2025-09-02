const { Usuario } = require('../../../src/models');

describe('Usuario Model', () => {
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