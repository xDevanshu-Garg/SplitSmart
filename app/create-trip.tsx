import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
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
import { Plus, X, Users } from 'lucide-react-native';
import { useTrips } from '@/contexts/TripsContext';

export default function CreateTripScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams();
  const { createTrip, updateTrip, getTrip } = useTrips();
  const [tripName, setTripName] = useState<string>('');
  const [members, setMembers] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  const editMode = typeof edit === 'string';
  const tripToEdit = editMode ? getTrip(edit as string) : undefined;

  useEffect(() => {
    if (tripToEdit) {
      setTripName(tripToEdit.name);
      setMembers(tripToEdit.members.length > 0 ? tripToEdit.members : ['']);
    }
  }, [tripToEdit]);

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index: number) => {
    if (members.length > 1) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleCreateTrip = () => {
    const trimmedName = tripName.trim();
    const validMembers = members
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    if (validMembers.length < 2) {
      Alert.alert('Error', 'Please add at least 2 members');
      return;
    }

    const uniqueMembers = Array.from(new Set(validMembers));
    if (uniqueMembers.length !== validMembers.length) {
      Alert.alert('Error', 'Member names must be unique');
      return;
    }

    setIsCreating(true);
    try {
      if (editMode && edit) {
        updateTrip(edit as string, trimmedName, uniqueMembers);
        Alert.alert('Success', 'Trip updated successfully');
        router.back();
      } else {
        const tripId = createTrip(trimmedName, uniqueMembers);
        router.replace(`/trip/${tripId}` as any);
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', `Failed to ${editMode ? 'update' : 'create'} trip`);
      setIsCreating(false);
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
            <Text style={styles.sectionTitle}>Trip Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Goa Beach Trip"
              value={tripName}
              onChangeText={setTripName}
              placeholderTextColor="#999"
              testID="trip-name-input"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Members</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addMemberField}
                testID="add-member-button"
              >
                <Plus color="#667eea" size={20} strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {members.map((member, index) => (
              <View key={index} style={styles.memberInputContainer}>
                <View style={styles.memberIconWrapper}>
                  <Users color="#667eea" size={20} />
                </View>
                <TextInput
                  style={styles.memberInput}
                  placeholder={`Member ${index + 1} name`}
                  value={member}
                  onChangeText={(text) => updateMember(index, text)}
                  placeholderTextColor="#999"
                  testID={`member-input-${index}`}
                />
                {members.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMemberField(index)}
                    testID={`remove-member-${index}`}
                  >
                    <X color="#ff6b6b" size={20} strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateTrip}
            disabled={isCreating}
            testID="create-trip-submit"
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Trip' : 'Start Trip')}
              </Text>
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
  section: {
    marginBottom: 32,
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
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
  },
  addButtonText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  memberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  memberIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  createButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
