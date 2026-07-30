import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Check } from 'lucide-react-native';

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>Pro Plan</Text>
              <Text style={styles.planPrice}>₹999<Text style={styles.planPriceSub}> / month</Text></Text>
            </View>
            <View style={styles.iconBox}>
              <CreditCard size={20} color="#2563EB" />
            </View>
          </View>
          <Text style={styles.renewsText}>Next billing date: 15 Aug 2026</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.featuresTitle}>Included Features</Text>
          {['Unlimited courts & bookings', 'Membership management', 'Analytics & reporting', 'Priority support'].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Check size={16} color="#2563EB" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.manageBtn}>
          <Text style={styles.manageBtnText}>Manage Billing Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { flex: 1, padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 14, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  planPrice: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  planPriceSub: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  renewsText: { fontSize: 13, color: '#64748B', marginTop: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  featuresTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureText: { fontSize: 14, color: '#475569', marginLeft: 10 },
  manageBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  manageBtnText: { fontSize: 14, fontWeight: '600', color: '#0F172A' }
});
