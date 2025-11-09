import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Receipt, Users, BarChart3, DollarSign } from 'lucide-react-native';
import { useTrips } from '@/contexts/TripsContext';
import { Expense } from '@/types';

export default function TripDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getTrip } = useTrips();

  const trip = getTrip(id as string);

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalExpense = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const renderExpenseCard = ({ item }: { item: Expense }) => {
    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.receiptIcon}>
            <Receipt color="#667eea" size={20} />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>{item.title}</Text>
            <Text style={styles.expensePayer}>Paid by {item.payer}</Text>
          </View>
          <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.expenseSplit}>
          <Text style={styles.splitLabel}>Split among:</Text>
          <Text style={styles.splitMembers}>{item.splitAmong.join(', ')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#a8edea', '#fed6e3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tripHeader}
        >
          <Text style={styles.tripName}>{trip.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users color="#667eea" size={24} />
              <Text style={styles.statValue}>{trip.members.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            
            <View style={styles.statCard}>
              <Receipt color="#667eea" size={24} />
              <Text style={styles.statValue}>{trip.expenses.length}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            
            <View style={styles.statCard}>
              <DollarSign color="#667eea" size={24} />
              <Text style={styles.statValue}>₹{totalExpense.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Members</Text>
          <View style={styles.membersList}>
            {trip.members.map((member, index) => (
              <View key={index} style={styles.memberChip}>
                <Text style={styles.memberName}>{member}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses</Text>
            <TouchableOpacity
              style={styles.viewSummaryButton}
              onPress={() => router.push(`/trip/${id}/summary` as any)}
              testID="view-summary-button"
            >
              <BarChart3 color="#667eea" size={18} />
              <Text style={styles.viewSummaryText}>View Split</Text>
            </TouchableOpacity>
          </View>

          {trip.expenses.length === 0 ? (
            <View style={styles.emptyExpenses}>
              <Receipt color="#ccc" size={48} strokeWidth={1.5} />
              <Text style={styles.emptyExpensesText}>No expenses yet</Text>
              <Text style={styles.emptyExpensesSubtext}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            <FlatList
              data={trip.expenses}
              renderItem={renderExpenseCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/trip/${id}/add-expense` as any)}
        testID="add-expense-button"
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
        >
          <Plus color="#ffffff" size={28} strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  tripHeader: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  tripName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500' as const,
  },
  membersSection: {
    padding: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberChip: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  memberName: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600' as const,
  },
  viewSummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
  },
  viewSummaryText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600' as const,
  },
  expensesSection: {
    padding: 20,
  },
  expenseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  expensePayer: {
    fontSize: 13,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#667eea',
  },
  expenseSplit: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  splitLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  splitMembers: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  emptyExpenses: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyExpensesText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyExpensesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
