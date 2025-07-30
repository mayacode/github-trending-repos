# GitHub Trending Repositories

A React app that shows trending GitHub repositories from the last week. Users can star/unstar repositories and filter by language.

## How to Run

### Development

1. Install dependencies:

   ```bash
   yarn install --frozen-lockfile
   ```

2. Start the development server:

   ```bash
   yarn dev:full
   ```

3. Open your browser and go to `http://localhost:5173`


## Available Scripts

- `yarn dev` - Start development server
- `yarn dev:server` - Start backend server only
- `yarn dev:full` - Start both frontend and backend servers
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn coverage` - Run tests with coverage report
- `yarn lint` - Check code for errors
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check if code is formatted correctly

## Key Decisions Made

### Testing Strategy

- Used **Vitest** for fast testing
- **React Testing Library** for component testing
- **Jest Axe** for accessibility testing
- Created helper functions in `test-utils.tsx` to reduce code duplication
- Used `withConsoleErrorSpy` helper for error testing
- Used `getMockedServices` helper for service mocking

### State Management

- **React Query** for server state (trending repos, starred repos)
- **React hooks** for local state (filters, UI state)
- **Optimistic updates** for star/unstar actions

### UI/UX

- **Tailwind CSS** for styling
- **Dark mode** support
- **Responsive design** for mobile and desktop
- **Loading states** and error handling
- **Accessibility** features (ARIA labels, keyboard navigation)

### Code Organization

- **Component-based architecture** with clear separation of responsibilities
- **Custom hooks** for reusable logic
- **TypeScript** for type safety
- **Path aliases** for clean imports
- **ESLint + Prettier** for code quality

### GitHub Integration

- **OAuth flow** for authentication
- **Octokit** for GitHub API calls
- **Session storage** for auth state
- **Error handling** for API failures

### Performance

- **Debounced search** to reduce API calls
- **React Query caching** for data
- **Code splitting** with Vite
- **Optimistic updates** for better UX
- vitest for fast tests

### Vercel deployment URL

- TBD
