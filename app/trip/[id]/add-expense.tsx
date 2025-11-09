import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { useTrips } from '@/contexts/TripsContext';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getTrip, addExpense } = useTrips();

  const trip = getTrip(id as string);

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleMember = (member: string) => {
    const updated = new Set(selectedMembers);
    if (updated.has(member)) {
      updated.delete(member);
    } else {
      updated.add(member);
    }
    setSelectedMembers(updated);
  };

  const handleSaveExpense = () => {
    const trimmedTitle = title.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedPayer) {
      Alert.alert('Error', 'Please select who paid');
      return;
    }

    if (selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select at least one member to split with');
      return;
    }

    try {
      addExpense(id as string, {
        title: trimmedTitle,
        amount: numAmount,
        payer: selectedPayer,
        splitAmong: Array.from(selectedMembers),
      });

      router.back();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Details</Text>
            
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lunch at Beach Shack"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              testID="expense-title-input"
            />

            <Text style={[styles.label, styles.labelSpacing]}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
              testID="expense-amount-input"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paid By</Text>
            <View style={styles.optionsGrid}>
              {trip.members.map((member) => (
                <TouchableOpacity
                  key={member}
                  style={[
                    styles.optionCard,
                    selectedPayer === member && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedPayer(member)}
                  testID={`payer-option-${member}`}
                >
                  {selectedPayer === member && (
                    <View style={styles.checkmark}>
                      <Check color="#ffffff" size={16} strokeWidth={3} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      selectedPayer === member && styles.optionTextSelected,
                    ]}
                  >
                    {member}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Split Among</Text>
            <Text style={styles.sectionSubtitle}>
              Select members who share this expense
            </Text>
            <View style={styles.optionsGrid}>
              {trip.members.map((member) => (
                <TouchableOpacity
                  key={member}
                  style={[
                    styles.optionCard,
                    selectedMembers.has(member) && styles.optionCardSelected,
                  ]}
                  onPress={() => toggleMember(member)}
                  testID={`split-option-${member}`}
                >
                  {selectedMembers.has(member) && (
                    <View style={styles.checkmark}>
                      <Check color="#ffffff" size={16} strokeWidth={3} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      selectedMembers.has(member) && styles.optionTextSelected,
                    ]}
                  >
                    {member}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveExpense}
            testID="save-expense-button"
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
  },
  labelSpacing: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  optionCardSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1a1a1a',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
