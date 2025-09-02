import React, { createContext, useContext, useState } from 'react';

<<<<<<< HEAD
// Context de roteamento
const RouterContext = createContext();

// Provider do router
export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState('dashboard'); // Iniciar no dashboard
=======
const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
>>>>>>> a53a98747da3678869bf508f43ad6aa971f847e1
  
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

<<<<<<< HEAD
// Hook para usar o router
=======
>>>>>>> a53a98747da3678869bf508f43ad6aa971f847e1
export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter deve ser usado dentro do RouterProvider');
  }
  return context;
}

export default RouterContext;