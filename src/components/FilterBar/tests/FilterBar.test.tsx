import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../FilterBar';

expect.extend(toHaveNoViolations);

const mockProps = {
  availableLanguages: ['JavaScript', 'TypeScript', 'Python'],
  changeLanguage: vi.fn(),
  changePerPage: vi.fn(),
  changeSearch: vi.fn(),
  end: '20',
  language: 'All',
  perPage: 10,
  search: '',
  start: '1',
};

describe('FilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter elements', () => {
    render(<FilterBar {...mockProps} />);

    expect(screen.getByLabelText('Language:')).toBeInTheDocument();
    expect(screen.getByLabelText('Show:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search keywords...')).toBeInTheDocument();
    expect(screen.getByText('1 to 20')).toBeInTheDocument();
  });

  it('should display language options and let change it', async () => {
    const { rerender } = render(<FilterBar {...mockProps} />);

    const languageSelect = screen.getByLabelText('Language:');

    expect(languageSelect).toHaveValue('All');
    expect(mockProps.changeLanguage).toHaveBeenCalledTimes(0);

    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'JavaScript' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Python' })).toBeInTheDocument();

    await userEvent.selectOptions(languageSelect, 'JavaScript');

    expect(mockProps.changeLanguage).toHaveBeenCalledTimes(1);

    rerender(<FilterBar {...mockProps} language="JavaScript" />);

    expect(languageSelect).toHaveValue('JavaScript');
  });

  it('should display per page options', async () => {
    const { rerender } = render(<FilterBar {...mockProps} />);

    const perPageSelect = screen.getByLabelText('Show:');
    expect(perPageSelect).toHaveValue('10');
    expect(mockProps.changePerPage).toHaveBeenCalledTimes(0);

    expect(screen.getByRole('option', { name: '10 repos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '20 repos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '30 repos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '50 repos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '100 repos' })).toBeInTheDocument();

    await userEvent.selectOptions(perPageSelect, '30');

    expect(mockProps.changePerPage).toHaveBeenCalledTimes(1);

    rerender(<FilterBar {...mockProps} perPage={30} />);

    expect(perPageSelect).toHaveValue('30');
  });

  it('should call changeSearch when search input is typed in', async () => {
    const { rerender } = render(<FilterBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search keywords...');
    await userEvent.type(searchInput, 'react');

    expect(mockProps.changeSearch).toHaveBeenCalledTimes(5);

    rerender(<FilterBar {...mockProps} search="react" />);

    expect(searchInput).toHaveValue('react');
  });

  it('should meet accessibility formal requirements', async () => {
    const { container } = render(<FilterBar {...mockProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper focus management', async () => {
    render(<FilterBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search keywords...');
    await userEvent.click(searchInput);

    expect(searchInput).toHaveFocus();
  });

  it('should handle empty available languages', () => {
    render(<FilterBar {...mockProps} availableLanguages={[]} />);

    const languageSelect = screen.getByLabelText('Language:');
    expect(languageSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
  });
});