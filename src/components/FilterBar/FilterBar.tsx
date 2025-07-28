export default function FilterBar({ start, end }: { start: string, end: string }) {
  return (
    <section className="flex flex-wrap items-center gap-4 px-6 py-4 mb-6 bg-blue-100 dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 shadow-md">
      <label className="flex items-center gap-2">
        <span className="font-medium">Language:</span>
      </label>
      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {start} to {end}
      </span>
    </section>
  );
}
