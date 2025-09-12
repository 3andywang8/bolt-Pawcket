import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Filter } from 'lucide-react-native';
// Dynamic import on native only to avoid web bundling issues
// import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';

import ALL_ANIMALS from './datas';
import {
  processShelterLocations,
  ShelterLocation,
} from '../../utils/geocoding';
import { ShelterMarker } from '../../components/ShelterMarker';
import { ShelterBottomSheet } from '../../components/ShelterBottomSheet';
import { MapFilterPanel, FilterOptions } from '../../components/MapFilterPanel';

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function AdoptScreen() {
  const [mapComponents, setMapComponents] = useState<null | {
    MapView: any;
    Marker: any;
  }>(null);

  const { applications } = useAdoption();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [shelterLocations, setShelterLocations] = useState<ShelterLocation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedShelter, setSelectedShelter] =
    useState<ShelterLocation | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    animalType: 'all',
    ageGroup: 'all',
    size: 'all',
    urgent: false,
  });
  const [allShelterLocations, setAllShelterLocations] = useState<
    ShelterLocation[]
  >([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 25.033, // 台灣台北預設座標
    longitude: 121.5654,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const initializeMap = useCallback(async () => {
    setLoading(true);

    try {
      if (Platform.OS !== 'web') {
        // 請求定位權限
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('定位權限', '需要定位權限來顯示附近的收容所');
        } else {
          // 取得使用者位置
          const location = await Location.getCurrentPositionAsync({});
          const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(userCoords);
          setMapRegion({
            ...userCoords,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      }

      // 過濾已完成領養的寵物
      const completedAdoptionIds = applications
        .filter((app) => app.status === ApplicationStatus.COMPLETED)
        .map((app) => app.animalId);

      const availableAnimals = ALL_ANIMALS.filter(
        (animal) => !completedAdoptionIds.includes(animal.id)
      );

      // 處理收容所位置
      const shelters = await processShelterLocations(availableAnimals);
      setAllShelterLocations(shelters);
      setShelterLocations(shelters);
    } catch (error) {
      console.error('初始化地圖失敗:', error);
      Alert.alert('錯誤', '初始化地圖失敗，請重試');
    } finally {
      setLoading(false);
    }
  }, [applications]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Dynamically load native MapView/Marker on iOS/Android only
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let mounted = true;
    (async () => {
      try {
        const MapModule: any = await import('react-native-maps');
        if (!mounted) return;
        setMapComponents({
          MapView: MapModule.default,
          Marker: MapModule.Marker,
        });
      } catch (e) {
        console.warn('Failed to load react-native-maps. Falling back.', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkerPress = (shelter: ShelterLocation) => {
    setSelectedShelter(shelter);
    setBottomSheetVisible(true);
  };

  const handleBottomSheetClose = () => {
    setBottomSheetVisible(false);
    setSelectedShelter(null);
  };

  // 篩選動物邏輯
  const filterAnimals = useCallback(
    (animals: any[]) => {
      return animals.filter((animal) => {
        // 動物類型篩選
        if (filters.animalType !== 'all') {
          if (filters.animalType === 'cat' && animal.type !== 'cat')
            return false;
          if (filters.animalType === 'dog' && animal.type !== 'dog')
            return false;
        }

        // 年齡篩選
        if (filters.ageGroup !== 'all') {
          if (filters.ageGroup === 'young' && !animal.age?.includes('幼'))
            return false;
          if (filters.ageGroup === 'adult' && !animal.age?.includes('成'))
            return false;
          if (filters.ageGroup === 'senior' && !animal.age?.includes('老'))
            return false;
        }

        // 體型篩選 (根據重量判斷)
        if (filters.size !== 'all') {
          const weight = parseFloat(animal.weight?.replace('kg', '') || '0');
          if (filters.size === 'small' && weight > 10) return false;
          if (filters.size === 'medium' && (weight <= 10 || weight > 25))
            return false;
          if (filters.size === 'large' && weight <= 25) return false;
        }

        // 緊急狀態篩選
        if (filters.urgent && !animal.isUrgent) return false;

        return true;
      });
    },
    [filters]
  );

  // 當篩選條件改變時更新顯示的收容所
  useEffect(() => {
    const filteredShelters = allShelterLocations
      .map((shelter) => ({
        ...shelter,
        animals: filterAnimals(shelter.animals),
      }))
      .filter((shelter) => shelter.animals.length > 0);

    setShelterLocations(filteredShelters);
  }, [allShelterLocations, filterAnimals]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const mapBuilder = () => {
    if (Platform.OS === 'web') {
      const WebMapView = require('../../components/WebMapView').default;
      return (
        <WebMapView
          center={{
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
          }}
          shelters={shelterLocations}
          onMarkerClick={handleMarkerPress}
        />
      );
    }

    if (!mapComponents) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>地圖元件載入中...</Text>
        </View>
      );
    }

    const MapViewComp = mapComponents.MapView;
    const MarkerComp = mapComponents.Marker;

    return (
      <MapViewComp
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={setMapRegion}
      >
        {/* 收容所標記 */}
        {shelterLocations.map((shelter, index) => (
          <MarkerComp
            key={index}
            coordinate={shelter.coordinate}
            title={shelter.name}
            description={`${shelter.animals.length} 隻動物等待領養`}
            onPress={() => handleMarkerPress(shelter)}
          >
            <ShelterMarker shelter={shelter} />
          </MarkerComp>
        ))}
      </MapViewComp>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>載入地圖中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>收容所地圖</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFilterPanelVisible(true)}
          >
            <Filter size={20} color="#F97316" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              setMapRegion({
                ...mapRegion,
                ...(userLocation || { latitude: 25.033, longitude: 121.5654 }),
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              })
            }
          >
            <MapPin size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      </View>

      {mapBuilder()}

      {/* 底部資訊卡 */}
      <ShelterBottomSheet
        shelter={selectedShelter}
        visible={bottomSheetVisible}
        onClose={handleBottomSheetClose}
      />

      {/* 篩選面板 */}
      <MapFilterPanel
        visible={filterPanelVisible}
        onClose={() => setFilterPanelVisible(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#78716C',
  },
  map: {
    flex: 1,
  },
});
