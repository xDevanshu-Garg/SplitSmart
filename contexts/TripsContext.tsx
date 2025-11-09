import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Trip, Expense, Balance, Settlement } from '@/types';

const STORAGE_KEY = '@splitsmart_trips';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const [TripsProvider, useTrips] = createContextHook(() => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTrips(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTrips = async (updatedTrips: Trip[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error saving trips:', error);
    }
  };

  const createTrip = useCallback((name: string, members: string[]) => {
    const newTrip: Trip = {
      id: generateId(),
      name,
      members,
      expenses: [],
      createdAt: Date.now(),
    };
    const updatedTrips = [...trips, newTrip];
    saveTrips(updatedTrips);
    return newTrip.id;
  }, [trips]);

  const getTrip = useCallback((tripId: string): Trip | undefined => {
    return trips.find(t => t.id === tripId);
  }, [trips]);

  const addExpense = useCallback((tripId: string, expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      timestamp: Date.now(),
    };

    const updatedTrips = trips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          expenses: [...trip.expenses, newExpense],
        };
      }
      return trip;
    });

    saveTrips(updatedTrips);
  }, [trips]);

  const deleteTrip = useCallback((tripId: string) => {
    const updatedTrips = trips.filter(t => t.id !== tripId);
    saveTrips(updatedTrips);
  }, [trips]);

  const updateTrip = useCallback((tripId: string, name: string, members: string[]) => {
    const updatedTrips = trips.map(trip => {
      if (trip.id === tripId) {
        const validExpenses = trip.expenses.filter(expense => 
          members.includes(expense.payer) && 
          expense.splitAmong.every(member => members.includes(member))
        );
        
        return {
          ...trip,
          name,
          members,
          expenses: validExpenses,
        };
      }
      return trip;
    });
    
    saveTrips(updatedTrips);
  }, [trips]);

  const calculateBalances = useCallback((tripId: string): Balance[] => {
    const trip = getTrip(tripId);
    if (!trip) return [];

    const balances: Record<string, Balance> = {};

    trip.members.forEach(member => {
      balances[member] = {
        member,
        paid: 0,
        share: 0,
        balance: 0,
      };
    });

    trip.expenses.forEach(expense => {
      if (balances[expense.payer]) {
        balances[expense.payer].paid += expense.amount;
      }

      const shareAmount = expense.amount / expense.splitAmong.length;
      expense.splitAmong.forEach(member => {
        if (balances[member]) {
          balances[member].share += shareAmount;
        }
      });
    });

    Object.values(balances).forEach(balance => {
      balance.balance = balance.paid - balance.share;
    });

    return Object.values(balances);
  }, [getTrip]);

  const calculateSettlements = useCallback((tripId: string): Settlement[] => {
    const balances = calculateBalances(tripId);
    const settlements: Settlement[] = [];

    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        settlements.push({
          from: debtor.member,
          to: creditor.member,
          amount: Math.round(amount * 100) / 100,
        });
      }

      creditor.balance -= amount;
      debtor.balance += amount;

      if (creditor.balance < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return settlements;
  }, [calculateBalances]);

  return useMemo(() => ({
    trips,
    isLoading,
    createTrip,
    getTrip,
    addExpense,
    deleteTrip,
    updateTrip,
    calculateBalances,
    calculateSettlements,
  }), [trips, isLoading, createTrip, getTrip, addExpense, deleteTrip, updateTrip, calculateBalances, calculateSettlements]);
});
