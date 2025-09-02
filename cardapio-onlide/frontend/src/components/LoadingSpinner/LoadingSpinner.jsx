import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Carregando...', 
  inline = false,
  color = 'primary' 
}) => {
  if (inline) {
    return (
      <div className="loading-inline">
        <div className={`loading-spinner ${size} ${color}`}></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size} ${color}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;