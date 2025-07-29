import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale in tests to ensure refetching
    },
  },
});

// @ts-expect-error TS7031: Binding element 'children' implicitly has an 'any' type.
const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const customRender = (ui: React.ReactElement, options: RenderOptions = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: Wrapper,
    ...options,
  });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
// eslint-disable-next-line react-refresh/only-export-components
export { default as userEvent } from '@testing-library/user-event';
// override render export
// eslint-disable-next-line react-refresh/only-export-components
export { customRender as render, Wrapper };
