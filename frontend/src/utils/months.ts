export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleString('ru-RU', { month: 'long' }),
}));

export const QUALIFICATION_OPTIONS = [
  'Педагог',
  'Педагог-мастер',
  'Педагог-исследователь',
  'Педагог-эксперт',
].map((value) => ({ value, label: value }));
