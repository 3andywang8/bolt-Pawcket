import React, { useMemo, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import Constants from 'expo-constants';
import type { ShelterLocation } from '@/utils/geocoding';

type Props = {
  center: { latitude: number; longitude: number };
  shelters: ShelterLocation[];
  onMarkerClick?: (shelter: ShelterLocation) => void;
  height?: number | string;
};

export default function WebMapView({ center, shelters, onMarkerClick, height = '100%' }: Props) {
  const apiKey = (Constants.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey as string,
  });

  const mapCenter = useMemo(
    () => ({ lat: center.latitude, lng: center.longitude }),
    [center.latitude, center.longitude]
  );

  const handleClick = useCallback(
    (shelter: ShelterLocation) => () => onMarkerClick?.(shelter),
    [onMarkerClick]
  );

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Text>地圖載入失敗，請稍後再試。</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 8, color: '#78716C' }}>地圖元件載入中...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={11}
        options={{ disableDefaultUI: false }}
      >
        {shelters.map((s, i) => (
          <Marker
            key={i}
            position={{ lat: s.coordinate.latitude, lng: s.coordinate.longitude }}
            label={s.name}
            onClick={handleClick(s)}
          />
        ))}
      </GoogleMap>
    </View>
  );
}
