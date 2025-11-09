export interface Expense {
  id: string;
  title: string;
  payer: string;
  amount: number;
  splitAmong: string[];
  timestamp: number;
}

export interface Trip {
  id: string;
  name: string;
  members: string[];
  expenses: Expense[];
  createdAt: number;
}

export interface Balance {
  member: string;
  paid: number;
  share: number;
  balance: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
