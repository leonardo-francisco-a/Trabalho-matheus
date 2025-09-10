import React, { useState } from 'react';
import './AddProductModal.css';

const AddProductModal = ({ isOpen, onClose, onAddProduct, categorias = [] }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    tempo_preparo: '',
    disponivel: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form quando modal fecha/abre
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        categoria_id: '',
        tempo_preparo: '',
        disponivel: true
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }
    
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Categoria é obrigatória';
    }
    
    if (!formData.tempo_preparo || parseInt(formData.tempo_preparo) <= 0) {
      newErrors.tempo_preparo = 'Tempo de preparo deve ser maior que zero';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const productData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        preco: parseFloat(formData.preco),
        categoria_id: parseInt(formData.categoria_id),
        tempo_preparo: parseInt(formData.tempo_preparo),
        disponivel: formData.disponivel
      };
      
      await onAddProduct(productData);
      onClose();
      
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setErrors({ submit: 'Erro ao adicionar produto. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) => {
    // Remove tudo que não é número ou ponto
    const numericValue = value.replace(/[^\d.]/g, '');
    // Permite apenas um ponto decimal
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  const handlePriceChange = (e) => {
    const formatted = formatPrice(e.target.value);
    setFormData(prev => ({ ...prev, preco: formatted }));
  };

  // Filtrar categorias válidas (excluir "Todos")
  const validCategorias = categorias.filter(cat => cat.id !== 'all' && cat.nome !== 'Todos');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Adicionar Novo Produto</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && (
            <div className="error-alert">
              {errors.submit}
            </div>
          )}
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nome">Nome do Produto *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={errors.nome ? 'error' : ''}
                placeholder="Ex: X-Burger Clássico"
                disabled={loading}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoria_id">Categoria *</label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className={errors.categoria_id ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Selecione uma categoria</option>
                {validCategorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.categoria_id && <span className="error-message">{errors.categoria_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="preco">Preço (R$) *</label>
              <input
                type="text"
                id="preco"
                name="preco"
                value={formData.preco}
                onChange={handlePriceChange}
                className={errors.preco ? 'error' : ''}
                placeholder="19.90"
                disabled={loading}
              />
              {errors.preco && <span className="error-message">{errors.preco}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tempo_preparo">Tempo de Preparo (min) *</label>
              <input
                type="number"
                id="tempo_preparo"
                name="tempo_preparo"
                value={formData.tempo_preparo}
                onChange={handleChange}
                className={errors.tempo_preparo ? 'error' : ''}
                placeholder="15"
                min="1"
                max="120"
                disabled={loading}
              />
              {errors.tempo_preparo && <span className="error-message">{errors.tempo_preparo}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição *</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className={errors.descricao ? 'error' : ''}
              placeholder="Descreva os ingredientes e características do produto..."
              rows="3"
              disabled={loading}
            />
            {errors.descricao && <span className="error-message">{errors.descricao}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="disponivel"
                checked={formData.disponivel}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-text">Produto disponível para venda</span>
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;