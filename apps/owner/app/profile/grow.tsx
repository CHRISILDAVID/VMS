import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingUp, Users, ShoppingBag, Trophy } from 'lucide-react-native';

const features = [
  { icon: Trophy, title: 'Tournaments', desc: 'Host and manage local badminton tournaments.', comingSoon: true },
  { icon: Users, title: 'Coaching', desc: 'Offer coaching sessions and track progress.', comingSoon: true },
  { icon: ShoppingBag, title: 'Pro Shop', desc: 'Sell gear and equipment at your venue.', comingSoon: true },
];

export default function GrowBusinessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grow Your Business</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIconBox}>
            <TrendingUp size={32} color="#16A34A" />
          </View>
          <Text style={styles.heroTitle}>Unlock New Revenue</Text>
          <Text style={styles.heroDesc}>Expand your offerings beyond just court bookings. More features coming soon!</Text>
        </View>
        
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <View key={i} style={styles.card}>
              <View style={styles.cardIconBox}>
                <Icon size={20} color="#16A34A" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.desc}</Text>
              </View>
              {f.comingSoon && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Soon</Text>
                </View>
              )}
            </View>
          );
        })}
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
  hero: { alignItems: 'center', padding: 24, marginBottom: 20 },
  heroIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  heroDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#64748B' }
});
