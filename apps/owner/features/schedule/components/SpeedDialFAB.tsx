import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Plus, X, CalendarPlus, Ban, Trophy, GraduationCap } from 'lucide-react-native';

interface SpeedDialFABProps {
  onPressItem?: (action: string) => void;
}

export function SpeedDialFAB({ onPressItem }: SpeedDialFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'booking', icon: CalendarPlus, label: 'New Booking', color: '#2563EB' },
    { id: 'block', icon: Ban, label: 'Block Slot', color: '#DC2626' },
    { id: 'tournament', icon: Trophy, label: 'Tournament', color: '#7C3AED' },
    { id: 'coaching', icon: GraduationCap, label: 'Coaching', color: '#D97706' },
    { id: 'membership', icon: CalendarPlus, label: 'Membership', color: '#16A34A' },
  ];

  const handlePress = (id: string) => {
    setIsOpen(false);
    onPressItem?.(id);
  };

  return (
    <View style={styles.container}>
      {isOpen && (
        <View style={styles.overlay}>
          <View style={styles.actionsList}>
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <View key={action.id} style={styles.actionRow}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>{action.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: action.color }]}
                    onPress={() => handlePress(action.id)}
                  >
                    <Icon size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, isOpen && styles.fabOpen]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        {isOpen ? (
          <X size={24} color="#fff" />
        ) : (
          <Plus size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
    alignItems: 'flex-end',
  },
  overlay: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  actionsList: {
    gap: 16,
    alignItems: 'flex-end',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabOpen: {
    backgroundColor: '#3B82F6',
  },
});
