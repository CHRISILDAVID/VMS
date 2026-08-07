import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useVenueStore } from '../../stores/venueStore';
import { useMembershipSlots } from '../../features/members/hooks/useMemberships';
import { useVenuePaymentSummary } from '../../features/payments/hooks/usePayments';
import { VenueSelector } from '../../components/domain/VenueSelector';
import { PaymentsDashboard } from '../../features/payments/components/PaymentsDashboard';
import { SlotPaymentCard } from '../../features/payments/components/SlotPaymentCard';
import { DefaultersList } from '../../features/payments/components/DefaultersList';

export default function PaymentsScreen() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'defaulters'>('dashboard');
  const { selectedVenueId } = useVenueStore();
  const { data: slots, isLoading } = useMembershipSlots();
  const { data: summary } = useVenuePaymentSummary(selectedVenueId || undefined);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="bg-card px-4 pt-3 pb-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-extrabold text-foreground">Payments</Text>
          <VenueSelector />
        </View>
        <Text className="text-sm text-muted-foreground mt-1">Monthly membership payments</Text>
      </View>

      <View className="flex-row px-4 py-2 gap-3 bg-card border-b border-border">
        <TouchableOpacity 
          className={`py-1.5 px-4 rounded-full ${activeTab === 'dashboard' ? 'bg-primary/10' : 'bg-muted'}`} 
          onPress={() => setActiveTab('dashboard')}
        >
          <Text className={`text-sm font-semibold ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`py-1.5 px-4 rounded-full ${activeTab === 'defaulters' ? 'bg-primary/10' : 'bg-muted'}`} 
          onPress={() => setActiveTab('defaulters')}
        >
          <Text className={`text-sm font-semibold ${activeTab === 'defaulters' ? 'text-primary' : 'text-muted-foreground'}`}>Defaulters</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'dashboard' ? (
        <FlatList
          ListHeaderComponent={() => (
            <View>
              <PaymentsDashboard venueId={selectedVenueId || undefined} />
              <Text className="text-base font-extrabold text-foreground px-4 mt-2 mb-2">Membership Slots</Text>
            </View>
          )}
          data={slots}
          keyExtractor={item => item.id}
          contentContainerClassName="py-4"
          renderItem={({ item }) => (
            <SlotPaymentCard 
              slot={item} 
              stats={summary?.slotAggregates?.[item.id]}
              onPress={() => router.push(`/payments/slot-payments?slotId=${item.id}`)} 
            />
          )}
          ListEmptyComponent={() => (
            <View className="p-8 items-center">
              <Text className="text-sm text-muted-foreground">No membership slots found.</Text>
            </View>
          )}
        />
      ) : (
        <DefaultersList venueId={selectedVenueId || undefined} />
      )}
    </SafeAreaView>
  );
}
