import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@tests/test-utils';
import MainLayout from '../MainLayout';
import * as useTrendingReposHook from '@hooks/useTrendingRepos';
import type { UseTrendingRepoReturn } from '@types';

expect.extend(toHaveNoViolations);

const useTrendingReposHookSpy = vi.spyOn(useTrendingReposHook, 'useTrendingRepos');

describe('MainLayout', () => {
  beforeAll(() => {
    useTrendingReposHookSpy.mockReturnValue({
      availableLanguages: ['JavaScript', 'TypeScript', 'Python'],
      changeLanguage: vi.fn(),
      changePerPage: vi.fn(),
      changeSearch: vi.fn(),
      end: '20',
      error: '',
      language: 'All',
      pending: false,
      perPage: 10,
      repoList: [],
      search: '',
      start: '1',
    } as UseTrendingRepoReturn);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<MainLayout />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'GitHub Trending Repositories (Last Week)'
    );
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('1 to 20')).toBeInTheDocument();
  });

  it('should meet formal accessibility requirements', async () => {
    const { container } = render(<MainLayout />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
