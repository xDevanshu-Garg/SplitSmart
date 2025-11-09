import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react-native';
import { useTrips } from '@/contexts/TripsContext';
import { Balance } from '@/types';

const CHART_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

export default function SummaryScreen() {
  const { id } = useLocalSearchParams();
  const { getTrip, calculateBalances, calculateSettlements } = useTrips();

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

  const balances = calculateBalances(id as string);
  const settlements = calculateSettlements(id as string);

  const totalExpense = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const pieData = balances
    .filter(b => b.paid > 0)
    .map((balance, index) => ({
      value: balance.paid,
      color: CHART_COLORS[index % CHART_COLORS.length],
      key: balance.member,
      amount: balance.paid,
    }));

  const renderBalanceCard = (balance: Balance, index: number) => {
    const isPositive = balance.balance >= 0;
    const isZero = Math.abs(balance.balance) < 0.01;

    return (
      <View key={balance.member} style={styles.balanceCard}>
        <View style={[styles.memberIndicator, { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }]} />
        <View style={styles.balanceInfo}>
          <Text style={styles.memberName}>{balance.member}</Text>
          <View style={styles.balanceDetails}>
            <Text style={styles.balanceLabel}>
              Paid: ₹{balance.paid.toFixed(2)} • Share: ₹{balance.share.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.balanceAmount}>
          {!isZero && (
            isPositive ? (
              <TrendingUp color="#10b981" size={20} strokeWidth={2.5} />
            ) : (
              <TrendingDown color="#ef4444" size={20} strokeWidth={2.5} />
            )
          )}
          <Text style={[
            styles.balanceValue,
            isPositive && !isZero && styles.balancePositive,
            !isPositive && !isZero && styles.balanceNegative,
          ]}>
            {isZero ? '₹0.00' : `₹${Math.abs(balance.balance).toFixed(2)}`}
          </Text>
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
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{trip.name}</Text>
          <Text style={styles.totalExpense}>Total: ₹{totalExpense.toFixed(2)}</Text>
        </LinearGradient>

        {pieData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Contribution Breakdown</Text>
            <View style={styles.chartContainer}>
              <View style={styles.simpleChart}>
                {pieData.map((item, index) => {
                  const total = pieData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <View key={item.key} style={styles.chartBarContainer}>
                      <View style={styles.chartBarInfo}>
                        <View style={styles.chartBarLabel}>
                          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                          <Text style={styles.chartBarName}>{item.key}</Text>
                        </View>
                        <Text style={styles.chartBarAmount}>₹{item.amount.toFixed(2)}</Text>
                      </View>
                      <View style={styles.chartBarBackground}>
                        <View 
                          style={[
                            styles.chartBarFill,
                           { 
                            width: `${percentage}%` as any,
                            backgroundColor: item.color,
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.chartBarPercentage}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartTotalCard}>
                <Text style={styles.chartTotalLabel}>Total Expense</Text>
                <Text style={styles.chartTotalValue}>₹{totalExpense.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Balances</Text>
          <View style={styles.balancesList}>
            {balances.map((balance, index) => renderBalanceCard(balance, index))}
          </View>
        </View>

        {settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Settlements</Text>
            <Text style={styles.sectionSubtitle}>
              Minimum transactions to settle all balances
            </Text>
            <View style={styles.settlementsList}>
              {settlements.map((settlement, index) => (
                <View key={index} style={styles.settlementCard}>
                  <View style={styles.settlementContent}>
                    <Text style={styles.settlementFrom}>{settlement.from}</Text>
                    <ArrowRight color="#667eea" size={20} strokeWidth={2.5} />
                    <Text style={styles.settlementTo}>{settlement.to}</Text>
                  </View>
                  <Text style={styles.settlementAmount}>₹{settlement.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {settlements.length === 0 && trip.expenses.length > 0 && (
          <View style={styles.settledCard}>
            <Text style={styles.settledEmoji}>🎉</Text>
            <Text style={styles.settledTitle}>All Settled!</Text>
            <Text style={styles.settledText}>Everyone has paid their fair share</Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 40,
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
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  totalExpense: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#666',
  },
  chartSection: {
    padding: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: -12,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  chart: {
    height: 220,
    width: 220,
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webChartFallback: {
    alignItems: 'center',
    marginBottom: 24,
  },
  webChartCenter: {
    backgroundColor: '#f0f0ff',
    borderRadius: 110,
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#667eea',
  },
  chartCenterLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  chartCenterValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1a1a1a',
  },
  legend: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500' as const,
  },
  legendAmount: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600' as const,
  },
  section: {
    padding: 20,
  },
  balancesList: {
    gap: 12,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  memberIndicator: {
    width: 6,
    height: 48,
    borderRadius: 3,
  },
  balanceInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  balanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#666',
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#666',
  },
  balancePositive: {
    color: '#10b981',
  },
  balanceNegative: {
    color: '#ef4444',
  },
  settlementsList: {
    gap: 12,
  },
  settlementCard: {
    backgroundColor: '#f0f0ff',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  settlementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  settlementFrom: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  settlementTo: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  settlementAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#667eea',
  },
  settledCard: {
    margin: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86efac',
  },
  settledEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  settledTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#15803d',
    marginBottom: 8,
  },
  settledText: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
  },
  simpleChart: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  chartBarContainer: {
    gap: 8,
  },
  chartBarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartBarName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  chartBarAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#666',
  },
  chartBarBackground: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  chartBarPercentage: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#999',
    textAlign: 'right',
  },
  chartTotalCard: {
    backgroundColor: '#f0f0ff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  chartTotalLabel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  chartTotalValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#667eea',
  },
});
