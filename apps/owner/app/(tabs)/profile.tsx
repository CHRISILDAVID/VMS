import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronRight, Building2, Zap, BarChart2, TrendingUp,
  CreditCard, HelpCircle, LogOut 
} from 'lucide-react-native';
import {  COLORS, formatCurrency , formatPhone } from '@vms/shared/utils';
import { createReportsService } from '@vms/shared/services';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';

const menuGroups = [
  {
    title: 'Court',
    items: [
      { id: 'court-info', icon: Building2, label: 'Court Information', color: '#2563EB', bg: '#EFF6FF', sub: 'Elite Arena Badminton' },
      { id: 'schedule-pricing', icon: Zap, label: 'Court Schedule & Pricing', color: '#D97706', bg: '#FFFBEB', sub: 'Operating hours & pricing blocks' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'reports', icon: BarChart2, label: 'Reports', color: '#7C3AED', bg: '#F5F3FF', sub: 'Revenue, utilization & bookings' },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'grow', icon: TrendingUp, label: 'Grow Your Business', color: '#16A34A', bg: '#F0FDF4', sub: 'Tournaments, coaching, shop & events' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'subscription', icon: CreditCard, label: 'Subscription & Billing', color: '#2563EB', bg: '#EFF6FF', sub: 'Pro Plan · Renews Aug 2026' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help & Support', color: '#64748B', bg: '#F8FAFC', sub: 'FAQs, contact & legal' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { ownerProfile } = useAuthContext();
  const { data: venues } = useVenues();
  const { selectedVenueId } = useVenueStore();

  const currentVenue = venues?.find((v: any) => v.id === selectedVenueId);

  const { data: kpiData } = useQuery({
    queryKey: ['venueKPIs', selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId || selectedVenueId === 'all') return null;
      return createReportsService(supabase).getVenueKPIs(selectedVenueId);
    },
    enabled: !!selectedVenueId && selectedVenueId !== 'all'
  });

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  const navigateTo = (route: string) => {
    router.push(`/profile/${route}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/profile/edit-profile')}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {ownerProfile?.full_name ? ownerProfile.full_name.charAt(0).toUpperCase() : 'O'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{ownerProfile?.full_name || 'Owner Name'}</Text>
              <Text style={styles.profileSubtext}>
                {ownerProfile?.phone 
                  ? formatPhone(ownerProfile.phone)
                  : 'Phone Number'}
              </Text>
              {ownerProfile?.email ? (
                <Text style={styles.profileSubtext}>{ownerProfile.email}</Text>
              ) : null}
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Owner</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statBlock, styles.statBorder]}>
              <Text style={styles.statValue}>{kpiData ? formatCurrency(kpiData.total_revenue) : '-'}</Text>
              <Text style={styles.statLabel}>Total Rev</Text>
            </View>
            <View style={[styles.statBlock, styles.statBorder]}>
              <Text style={styles.statValue}>{kpiData?.active_members ?? '-'}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{kpiData?.total_bookings ?? '-'}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
          </View>
          {kpiData && (kpiData.booking_revenue > 0 || kpiData.membership_revenue > 0) ? (
            <View style={styles.revenueBreakdown}>
              <View style={styles.revRow}>
                <Text style={styles.revLabel}>Bookings</Text>
                <Text style={styles.revValue}>{formatCurrency(kpiData.booking_revenue)}</Text>
              </View>
              <View style={styles.revRow}>
                <Text style={styles.revLabel}>Memberships</Text>
                <Text style={styles.revValue}>{formatCurrency(kpiData.membership_revenue)}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* Menu */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuGroups.map(group => (
            <View key={group.title} style={styles.menuGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, i < group.items.length - 1 && styles.menuItemBorder]}
                      onPress={() => navigateTo(item.id)}
                    >
                      <View style={[styles.menuIconContainer, { backgroundColor: item.bg }]}>
                        <Icon size={17} color={item.color} />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuSubtext}>{item.id === 'court-info' && currentVenue ? currentVenue.name : item.sub}</Text>
                      </View>
                      <ChevronRight size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBanner: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  editButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  profileSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  roleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  revenueBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: 8,
  },
  revRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  revValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  scrollContainer: { flex: 1 },
  menuContainer: { padding: 16 },
  menuGroup: { marginBottom: 16 },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: { flex: 1 },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 18,
    marginBottom: 40,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  }
});
