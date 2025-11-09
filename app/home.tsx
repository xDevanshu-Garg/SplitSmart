import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Plane, Users, DollarSign, MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import { useTrips } from '@/contexts/TripsContext';
import { Trip } from '@/types';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { trips, isLoading, deleteTrip } = useTrips();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const getTotalExpense = (trip: Trip): number => {
    return trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const handleDeleteTrip = (tripId: string, tripName: string) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${tripName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTrip(tripId);
            setMenuVisible(null);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleEditTrip = (tripId: string) => {
    setMenuVisible(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/create-trip?edit=${tripId}` as any);
  };

  const renderTripCard = ({ item, index }: { item: Trip; index: number }) => {
    const totalExpense = getTotalExpense(item);

    const handlePress = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      router.push(`/trip/${item.id}` as any);
    };

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={handlePress}
        activeOpacity={0.9}
        testID={`trip-card-${item.id}`}
      >
        <LinearGradient
          colors={['#a8edea', '#fed6e3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Plane color="#667eea" size={24} strokeWidth={2.5} />
            </View>
            <Text style={styles.tripName} numberOfLines={1}>{item.name}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setMenuVisible(item.id);
              }}
              testID={`trip-menu-${item.id}`}
            >
              <MoreVertical color="#667eea" size={20} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {menuVisible === item.id && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleEditTrip(item.id)}
                testID={`edit-trip-${item.id}`}
              >
                <Pencil color="#667eea" size={18} strokeWidth={2} />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleDeleteTrip(item.id, item.name)}
                testID={`delete-trip-${item.id}`}
              >
                <Trash2 color="#ef4444" size={18} strokeWidth={2} />
                <Text style={[styles.menuText, styles.menuTextDanger]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.cardStats}>
            <View style={styles.stat}>
              <Users color="#666" size={18} />
              <Text style={styles.statText}>{item.members.length} members</Text>
            </View>
            <View style={styles.stat}>
              <DollarSign color="#666" size={18} />
              <Text style={styles.statText}>₹{totalExpense.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.expenseCount}>
            {item.expenses.length} expense{item.expenses.length !== 1 ? 's' : ''}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (menuVisible) {
            setMenuVisible(null);
          }
        }}
        disabled={!menuVisible}
      >
        <View style={styles.backdrop} />
      </TouchableOpacity>
      <LinearGradient
        colors={['#f7f8ff', '#ffffff']}
        style={styles.background}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.title}>Your Trips</Text>
          </View>
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Plane color="#667eea" size={64} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Create your first trip to start tracking shared expenses
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            renderItem={renderTripCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push('/create-trip' as any);
          }}
          testID="create-trip-button"
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.fabGradient}
          >
            <Plus color="#ffffff" size={28} strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1a1a1a',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tripCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tripName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    flex: 1,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600' as const,
  },
  expenseCount: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    zIndex: 1000,
    minWidth: 140,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  menuTextDanger: {
    color: '#ef4444',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
