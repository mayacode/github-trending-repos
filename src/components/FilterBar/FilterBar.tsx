import type { UseTrendingReposReturn } from "../../types";

export type FilterBarProps = Pick<UseTrendingReposReturn, 'changePerPage' | 'changeSearch' | 'end' | 'perPage' | 'search' | 'start'>;

export default function FilterBar({ changePerPage, changeSearch, end, perPage, search, start }: FilterBarProps) {
  return (
    <section className="flex flex-wrap items-center gap-4 px-6 py-4 mb-6 bg-blue-100 dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 shadow-md">
      {/* <label className="flex items-center gap-2">
        <span className="font-medium">Language:</span>
      </label> */}
      <label className="flex items-center gap-2">
        <span className="font-medium">Show:</span>
        <select
          value={perPage}
          onChange={changePerPage}
          className="rounded border border-blue-200 dark:border-green-700 px-2 py-1 bg-blue-50 dark:bg-green-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-green-400"
        >
          <option value={10}>10 repos</option>
          <option value={20}>20 repos</option>
          <option value={30}>30 repos</option>
          <option value={50}>50 repos</option>
          <option value={100}>100 repos</option>
        </select>
      </label>
      <input
        type="text"
        placeholder="Search keywords..."
        value={search}
        onChange={changeSearch}
        className="rounded border border-blue-200 dark:border-green-700 px-2 py-1 bg-blue-50 dark:bg-green-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-green-400 placeholder-gray-600 dark:placeholder-gray-300"
      />
      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {start} to {end}
      </span>
    </section>
  );
}
