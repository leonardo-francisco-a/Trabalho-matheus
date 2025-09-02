import React, { createContext, useContext, useState } from 'react';

const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  
  const navigate = (route) => {
    console.log(`🧭 Navegando para: ${route}`);
    setCurrentRoute(route);
  };
  
  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter deve ser usado dentro do RouterProvider');
  }
  return context;
}

export default RouterContext;