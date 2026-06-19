export const TRANSACTION_STATUS = {
  PENDING: 0,
  PAID: 1,
  ERROR: 2,
};

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const FINANCE_SECTIONS = {
  ANNUAL: 'annual',
  FIXED_INCOME: 'fixedIncome',
  MONTHLY_EXPENSES: 'monthlyExpenses',
  VARIABLE_EXPENSES: 'variableExpenses',
};

export const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export const MONTHS_LONG = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

export const THEME_COLORS = [
  { id: 'emerald', name: 'Emerald', value: '#10b981', label: 'Verde' },
  { id: 'blue',    name: 'Blue',    value: '#3b82f6', label: 'Azul' },
  { id: 'purple',  name: 'Purple',  value: '#8b5cf6', label: 'Morado' },
  { id: 'rose',    name: 'Rose',    value: '#f43f5e', label: 'Rosa' },
];
