import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ChevronDown, MapPin, Check } from 'lucide-react-native';
import { useState } from 'react';

export function VenueSelector() {
  const { data: venues, isLoading } = useVenues();
  const { selectedVenueId, setSelectedVenueId } = useVenueStore();
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-row items-center py-1.5 px-3 bg-primary/10 rounded-full border border-primary/20 gap-1.5 max-w-[65%]">
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <View className="flex-row items-center py-1.5 px-3 bg-primary/10 rounded-full border border-primary/20 gap-1.5 max-w-[65%]">
        <Text className="text-muted-foreground italic">No venues found</Text>
      </View>
    );
  }

  const selectedVenue = venues.find(v => v.id === selectedVenueId) || venues[0];

  return (
    <>
      <TouchableOpacity 
        className="flex-row items-center py-1.5 px-3 bg-primary/10 rounded-full border border-primary/20 gap-1.5 max-w-[65%]"
        onPress={() => setModalVisible(true)}
      >
        <MapPin size={14} color={colors.primary} />
        <Text className="text-[13px] font-semibold text-primary shrink" numberOfLines={1}>
          {selectedVenue.name}
        </Text>
        <ChevronDown size={14} color={colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-card rounded-t-2xl max-h-[80%] pb-8">
            <View className="p-6 border-b border-border">
              <Text className="text-xl font-bold text-foreground">Select Venue</Text>
            </View>
            <FlatList
              data={venues}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between p-6"
                  onPress={() => {
                    setSelectedVenueId(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View className="flex-1">
                    <Text className={`text-base font-semibold mb-1 ${selectedVenueId === item.id ? 'text-primary font-bold' : 'text-foreground'}`}>
                      {item.name}
                    </Text>
                    <Text className="text-sm text-muted-foreground">{item.city}, {item.state}</Text>
                  </View>
                  {selectedVenueId === item.id && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-border ml-6" />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
