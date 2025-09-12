// Native placeholder to avoid importing web-only libs on iOS/Android
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WebMapView() {
  return (
    <View style={styles.container}>
      <Text>WebMapView is not used on native platforms.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
