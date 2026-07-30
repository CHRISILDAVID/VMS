import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Phone, Mail, Globe, MessageCircleQuestion } from 'lucide-react-native';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView style={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Phone size={18} color="#2563EB" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Call Support</Text>
                <Text style={styles.rowSub}>+91 98765 43210</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Mail size={18} color="#16A34A" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Email Us</Text>
                <Text style={styles.rowSub}>support@badmintonapp.com</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                <MessageCircleQuestion size={18} color="#7C3AED" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>FAQ</Text>
                <Text style={styles.rowSub}>Frequently asked questions</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
                <Globe size={18} color="#D97706" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Website</Text>
                <Text style={styles.rowSub}>Visit our help center</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  rowSub: { fontSize: 13, color: '#64748B', marginTop: 2 }
});
