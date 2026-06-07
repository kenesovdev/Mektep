const currentYear = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from({ length: currentYear - 2000 + 1 }, (_, index) => {
  const year = currentYear - index;
  return { value: year, label: String(year) };
});
