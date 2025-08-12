import React, { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Conectando...');

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL || 'http://localhost:3001')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Erro na conexão'));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🍽️ Sistema de Cardápio Online</h1>
      <p><strong>Status Backend:</strong> {backendStatus}</p>
      <p><strong>Ambiente:</strong> Desenvolvimento</p>
      <p><strong>Infraestrutura:</strong> Docker + WSL2</p>
    </div>
  );
}

export default App;
