import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';
import { ChevronDown, MapPin, Check } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS } from '@vms/shared/utils';
import { useState } from 'react';

export function VenueSelector() {
  const { data: venues, isLoading } = useVenues();
  const { selectedVenueId, setSelectedVenueId } = useVenueStore();
  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} size="small" />
      </View>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noVenues}>No venues found</Text>
      </View>
    );
  }

  const selectedVenue = venues.find(v => v.id === selectedVenueId) || venues[0];

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => setModalVisible(true)}
      >
        <MapPin size={14} color="#2563EB" />
        <Text style={styles.venueName} numberOfLines={1}>
          {selectedVenue.name}
        </Text>
        <ChevronDown size={14} color="#2563EB" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Venue</Text>
            </View>
            <FlatList
              data={venues}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.venueItem}
                  onPress={() => {
                    setSelectedVenueId(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.venueItemInfo}>
                    <Text style={[
                      styles.venueItemName, 
                      selectedVenueId === item.id && styles.venueItemSelectedText
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.venueItemCity}>{item.city}, {item.state}</Text>
                  </View>
                  {selectedVenueId === item.id && (
                    <Check size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF', // Light blue background
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Light blue border
    gap: 6,
    maxWidth: '60%', // Prevent taking up the whole header
  },
  venueName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    flexShrink: 1, // Shrink text with ellipsis if too long
  },
  noVenues: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '80%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  venueItemInfo: {
    flex: 1,
  },
  venueItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  venueItemSelectedText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  venueItemCity: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg,
  },
});
