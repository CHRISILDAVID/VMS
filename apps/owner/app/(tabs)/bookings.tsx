import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@vms/shared/utils';

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Manage court bookings</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>📋</Text>
        <Text style={styles.placeholderText}>Bookings will appear here</Text>
        <Text style={styles.milestone}>Coming in Milestone 2</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  placeholder: { fontSize: 64, marginBottom: 16 },
  placeholderText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' },
  milestone: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
});
