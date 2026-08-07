import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronRight, Building2, Zap, BarChart2, TrendingUp,
  CreditCard, HelpCircle, LogOut, Moon, Sun, Monitor
} from 'lucide-react-native';
import {  COLORS, formatCurrency , formatPhone } from '@vms/shared/utils';
import { createReportsService } from '@vms/shared/services';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';
import { useThemeStore } from '../../stores/themeStore';

const menuGroups = [
  {
    title: 'Court',
    items: [
      { id: 'court-info', icon: Building2, label: 'Court Information', color: '#2563EB', bg: 'bg-blue-50 dark:bg-blue-900/30', sub: 'Elite Arena Badminton' },
      { id: 'schedule-pricing', icon: Zap, label: 'Court Schedule & Pricing', color: '#D97706', bg: 'bg-amber-50 dark:bg-amber-900/30', sub: 'Operating hours & pricing blocks' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { id: 'reports', icon: BarChart2, label: 'Reports', color: '#7C3AED', bg: 'bg-violet-50 dark:bg-violet-900/30', sub: 'Revenue, utilization & bookings' },
    ],
  },
  {
    title: 'Business',
    items: [
      { id: 'grow', icon: TrendingUp, label: 'Grow Your Business', color: '#16A34A', bg: 'bg-green-50 dark:bg-green-900/30', sub: 'Tournaments, coaching, shop & events' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'subscription', icon: CreditCard, label: 'Subscription & Billing', color: '#2563EB', bg: 'bg-blue-50 dark:bg-blue-900/30', sub: 'Pro Plan · Renews Aug 2026' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help & Support', color: '#64748B', bg: 'bg-slate-50 dark:bg-slate-800', sub: 'FAQs, contact & legal' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { ownerProfile } = useAuthContext();
  const { data: venues } = useVenues();
  const { selectedVenueId } = useVenueStore();
  const { theme, setTheme } = useThemeStore();

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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header banner */}
      <View className="bg-primary px-5 pb-6 pt-3">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-extrabold text-primary-foreground">Profile</Text>
          <TouchableOpacity onPress={() => router.push('/profile/edit-profile')}>
            <Text className="text-primary-foreground/80 text-sm font-semibold">Edit</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white/10 dark:bg-black/20 rounded-2xl p-4">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border-2 border-white/30 mr-3.5">
              <Text className="text-2xl font-extrabold text-primary-foreground">
                {ownerProfile?.full_name ? ownerProfile.full_name.charAt(0).toUpperCase() : 'O'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-extrabold text-primary-foreground">{ownerProfile?.full_name || 'Owner Name'}</Text>
              <Text className="text-xs text-primary-foreground/70 mt-0.5">
                {ownerProfile?.phone 
                  ? formatPhone(ownerProfile.phone)
                  : 'Phone Number'}
              </Text>
              {ownerProfile?.email ? (
                <Text className="text-xs text-primary-foreground/70 mt-0.5">{ownerProfile.email}</Text>
              ) : null}
            </View>
            <View className="bg-white/20 rounded-full py-1 px-3">
              <Text className="text-[11px] text-primary-foreground font-bold">Owner</Text>
            </View>
          </View>
          
          <View className="flex-row border-t border-white/15 pt-3.5">
            <View className="flex-1 items-center border-r border-white/15">
              <Text className="text-lg font-extrabold text-primary-foreground">{kpiData ? formatCurrency(kpiData.total_revenue) : '-'}</Text>
              <Text className="text-[10px] text-primary-foreground/65 font-medium">Total Rev</Text>
            </View>
            <View className="flex-1 items-center border-r border-white/15">
              <Text className="text-lg font-extrabold text-primary-foreground">{kpiData?.active_members ?? '-'}</Text>
              <Text className="text-[10px] text-primary-foreground/65 font-medium">Members</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-lg font-extrabold text-primary-foreground">{kpiData?.total_bookings ?? '-'}</Text>
              <Text className="text-[10px] text-primary-foreground/65 font-medium">Bookings</Text>
            </View>
          </View>
          {kpiData && (kpiData.booking_revenue > 0 || kpiData.membership_revenue > 0) ? (
            <View className="mt-4 pt-4 border-t border-white/15 gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-primary-foreground/70 font-medium">Bookings</Text>
                <Text className="text-xs text-primary-foreground font-bold">{formatCurrency(kpiData.booking_revenue)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-primary-foreground/70 font-medium">Memberships</Text>
                <Text className="text-xs text-primary-foreground font-bold">{formatCurrency(kpiData.membership_revenue)}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* Menu */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {menuGroups.map(group => (
            <View key={group.title} className="mb-4">
              <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">{group.title}</Text>
              <View className="bg-card rounded-2xl overflow-hidden border border-border">
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      className={`flex-row items-center p-3.5 px-4 ${i < group.items.length - 1 ? 'border-b border-border' : ''}`}
                      onPress={() => navigateTo(item.id)}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${item.bg}`}>
                        <Icon size={17} color={item.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{item.label}</Text>
                        <Text className="text-[11px] text-muted-foreground mt-0.5">{item.id === 'court-info' && currentVenue ? currentVenue.name : item.sub}</Text>
                      </View>
                      <ChevronRight size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Theme Preferences */}
          <View className="mb-4">
            <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 pl-1">Preferences</Text>
            <View className="bg-card rounded-2xl overflow-hidden border border-border">
              <View className="flex-row items-center p-3.5 px-4 border-b border-border">
                <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-slate-50 dark:bg-slate-800">
                  {theme === 'light' ? (
                     <Sun size={17} color="#64748B" />
                  ) : theme === 'dark' ? (
                     <Moon size={17} color="#64748B" />
                  ) : (
                     <Monitor size={17} color="#64748B" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Theme</Text>
                  <Text className="text-[11px] text-muted-foreground mt-0.5">Select your app appearance</Text>
                </View>
              </View>
              <View className="flex-row justify-around p-3 bg-card">
                <TouchableOpacity 
                  className={`flex-row items-center px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-primary/10' : ''}`}
                  onPress={() => setTheme('light')}
                >
                  <Sun size={14} color={theme === 'light' ? '#3B82F6' : '#64748B'} className="mr-2" />
                  <Text className={`text-xs font-semibold ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-row items-center px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-primary/10' : ''}`}
                  onPress={() => setTheme('dark')}
                >
                  <Moon size={14} color={theme === 'dark' ? '#3B82F6' : '#64748B'} className="mr-2" />
                  <Text className={`text-xs font-semibold ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`}>Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-row items-center px-3 py-2 rounded-lg ${theme === 'system' ? 'bg-primary/10' : ''}`}
                  onPress={() => setTheme('system')}
                >
                  <Monitor size={14} color={theme === 'system' ? '#3B82F6' : '#64748B'} className="mr-2" />
                  <Text className={`text-xs font-semibold ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`}>System</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity 
            className="flex-row items-center justify-center p-4 bg-destructive/10 border border-destructive/30 rounded-2xl mb-10 gap-3" 
            onPress={handleSignOut}
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="text-sm font-bold text-destructive">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
