import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster as Sonner } from '@/components/ui/sonner';

const defaultQueryClient = new QueryClient();

export function render(ui: React.ReactElement, options?: unknown) {
  const Wrapper = ({ children }: unknown) =>
  <QueryClientProvider client={defaultQueryClient}>
      {children}
      <Sonner />
    </QueryClientProvider>;

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';