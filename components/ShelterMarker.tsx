import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShelterLocation } from '../utils/geocoding';

interface ShelterMarkerProps {
  shelter: ShelterLocation;
}

export const ShelterMarker: React.FC<ShelterMarkerProps> = ({ shelter }) => {
  const catCount = shelter.animals.filter(
    (animal) => animal.type === 'cat'
  ).length;
  const dogCount = shelter.animals.filter(
    (animal) => animal.type === 'dog'
  ).length;

  return (
    <View style={styles.markerContainer}>
      <View style={styles.markerContent}>
        {catCount > 0 && (
          <View style={styles.countRow}>
            <Text style={styles.emoji}>🐱</Text>
            <Text style={styles.count}>{catCount}</Text>
          </View>
        )}
        {dogCount > 0 && (
          <View style={styles.countRow}>
            <Text style={styles.emoji}>🐶</Text>
            <Text style={styles.count}>{dogCount}</Text>
          </View>
        )}
      </View>
      {/* 指針 */}
      <View style={styles.pointer} />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1917',
    minWidth: 16,
    textAlign: 'center',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F97316',
    marginTop: -1,
  },
});
