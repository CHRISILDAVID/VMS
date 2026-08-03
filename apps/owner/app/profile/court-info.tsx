import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Phone, Mail, Wifi, ParkingSquare, ShowerHead, Coffee, Camera, Check } from 'lucide-react-native';
import { useVenues } from '../../hooks/useVenues';
import { useVenueStore } from '../../stores/venueStore';
import {  COLORS , formatPhone } from '@vms/shared/utils';

const amenityIcons: Record<string, React.ComponentType<any>> = {
  'Free Wi-Fi': Wifi,
  'Parking': ParkingSquare,
  'Changing Room': ShowerHead,
  'Cafeteria': Coffee,
};

const InfoRow = ({ label, value, Icon }: { label: string; value: string | undefined; Icon?: React.ComponentType<any> }) => (
  <View style={styles.infoRow}>
    {Icon && (
      <View style={styles.iconBox}>
        <Icon size={15} color="#2563EB" />
      </View>
    )}
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
    </View>
  </View>
);

export default function CourtInformationScreen() {
  const router = useRouter();
  const { data: venues } = useVenues();
  const { selectedVenueId } = useVenueStore();
  const venue = venues?.find(v => v.id === selectedVenueId);

  const handleOpenMaps = () => {
    if (!venue?.latitude || !venue?.longitude) return;
    
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${venue.latitude},${venue.longitude}`;
    const label = venue.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
  };

  if (!venue) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading venue...</Text>
      </SafeAreaView>
    );
  }

  const fullAddress = [venue.address, venue.city, venue.state, venue.pincode].filter(Boolean).join(', ');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Court Information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photos (Read Only) */}
        <View style={styles.card}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
            {venue.photos && venue.photos.length > 0 ? (
              venue.photos.map((url, i) => (
                <View key={i} style={styles.photoWrapper}>
                  <Image source={{ uri: url }} style={styles.photo} />
                </View>
              ))
            ) : (
              <View style={[styles.photoWrapper, styles.emptyPhoto]}>
                <Camera size={24} color="#94A3B8" />
                <Text style={styles.emptyPhotoText}>No photos</Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.photoFooter}>
            <Camera size={13} color="#94A3B8" />
            <Text style={styles.photoFooterText}>
              {venue.photos?.length || 0} photos · Swipe to view
            </Text>
          </View>
        </View>

        {/* Basic Info (Read Only) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>BASIC DETAILS</Text>
          <InfoRow label="Court Name" value={venue.name} />
          <InfoRow label="Address" value={fullAddress} Icon={MapPin} />
          <InfoRow label="Phone" value={venue.contact_phone ? formatPhone(venue.contact_phone) : undefined} Icon={Phone} />
          <InfoRow label="Email" value={venue.contact_email || undefined} Icon={Mail} />
          <InfoRow label="Court Type" value={venue.court_type ? venue.court_type.charAt(0).toUpperCase() + venue.court_type.slice(1) : undefined} />
        </View>

        {/* Location / Google Maps */}
        <View style={[styles.card, { padding: 0 }]}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>Location</Text>
          </View>
          <View style={styles.mapPlaceholder}>
            {/* Simple stylised representation of a map */}
            <View style={styles.pinIcon}>
              <Text style={styles.pinText}>{venue.name}</Text>
            </View>
          </View>
          <View style={styles.locationFooter}>
            <TouchableOpacity 
              style={[styles.mapBtn, (!venue.latitude || !venue.longitude) && styles.mapBtnDisabled]} 
              onPress={handleOpenMaps}
              disabled={!venue.latitude || !venue.longitude}
            >
              <MapPin size={13} color={(!venue.latitude || !venue.longitude) ? "#94A3B8" : "#2563EB"} />
              <Text style={[styles.mapBtnText, (!venue.latitude || !venue.longitude) && styles.mapBtnTextDisabled]}>
                Open in Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amenities (Read Only) */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <Text style={styles.cardSectionTitle}>AMENITIES</Text>
          <View style={styles.amenitiesGrid}>
            {venue.amenities && venue.amenities.length > 0 ? (
              venue.amenities.map(a => {
                const Icon = amenityIcons[a] || Check;
                return (
                  <View key={a} style={styles.amenityBadge}>
                    <Icon size={16} color="#2563EB" />
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No amenities listed</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  photosScroll: { flexDirection: 'row' },
  photoWrapper: {
    width: 200,
    height: 130,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  emptyPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotoText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  photoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  photoFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  locationHeader: {
    padding: 14,
    paddingBottom: 10,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationFooter: {
    padding: 14,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
  },
  mapBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  mapBtnTextDisabled: {
    color: '#94A3B8',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  }
});
