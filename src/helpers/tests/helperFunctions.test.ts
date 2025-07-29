import { getLastWeekRange } from "../helperFunctions";

describe('helperFunctions', () => {
  it('should return the correct data', () => {
    vi.useFakeTimers();
    const date = new Date(2025, 1, 1, 13);
    vi.setSystemTime(date);

    const { start, end } = getLastWeekRange();
    expect(start).toBe('2025-01-25');
    expect(end).toBe('2025-02-01');

    vi.useRealTimers();
  });
});
