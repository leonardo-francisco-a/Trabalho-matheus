import React from 'react';
import { render } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';
import { RouterProvider } from '../contexts/RouterContext';

// Provider personalizado para testes
const AllTheProviders = ({ children }) => {
  return (
    <AppProvider>
      <RouterProvider>
        {children}
      </RouterProvider>
    </AppProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportar tudo
export * from '@testing-library/react';
export { customRender as render };