import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Heart, Clock, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';
// 暂時禁用 Maps 功能
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import * as Location from 'expo-location';

import ALL_ANIMALS from './datas';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 收容所座標資料（模擬數據，實際應該從API獲取）
const SHELTER_LOCATIONS: { [key: string]: { latitude: number; longitude: number } } = {
  '新竹縣動物保護教育園區': { latitude: 24.8138, longitude: 120.9675 },
  '澎湖縣動物之家': { latitude: 23.5667, longitude: 119.5667 },
  '花蓮縣動物之家': { latitude: 23.9739, longitude: 121.6083 },
  '雲林縣動物之家': { latitude: 23.7081, longitude: 120.4315 },
  '宜蘭縣流浪動物中途之家': { latitude: 24.7021, longitude: 121.7378 },
  '新北市新店區公立動物之家': { latitude: 24.9675, longitude: 121.5414 },
  '臺東縣動物之家': { latitude: 22.7972, longitude: 121.1713 },
  '新北市八里區公立動物之家': { latitude: 25.1897, longitude: 121.4019 },
  '新北市五股區公立動物之家': { latitude: 25.0833, longitude: 121.4333 },
};

// 小寵物卡片組件
const AnimalCard = React.memo(function AnimalCard({ animal }: { animal: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.animalCard}
      onPress={() => router.push((`/animal/${animal.id}` as any))}>
      <Image source={{ uri: animal.image }} style={styles.animalImage} />
      
      {animal.isUrgent && (
        <View style={styles.urgentBadge}>
          <Clock size={12} color="#FFFFFF" />
          <Text style={styles.urgentText}>急需</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.favoriteButton}>
        <Heart size={18} color="#78716C" strokeWidth={2} />
      </TouchableOpacity>
      
      <View style={styles.animalInfo}>
        <View style={styles.animalHeader}>
          <Text style={styles.animalName} numberOfLines={1}>{animal.name}</Text>
          <Text style={styles.animalAge}>{animal.age}</Text>
        </View>
        
        <Text style={styles.animalBreed} numberOfLines={1}>{animal.breed}</Text>
        
        <View style={styles.locationRow}>
          <MapPin size={12} color="#78716C" />
          <Text style={styles.locationText} numberOfLines={1}>{animal.shelter}</Text>
        </View>
        
        <View style={styles.personalityContainer}>
          {animal.personality.slice(0, 2).map((trait: string, idx: number) => (
            <View key={idx} style={styles.personalityTag}>
              <Text style={styles.personalityText}>{trait}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.shelterDays}>收容所 {animal.shelterDays > 0 ? animal.shelterDays : '?'} 天</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function AdoptScreen() {
  const { applications } = useAdoption();
  const [selectedFilter, setSelectedFilter] = useState('all');
  // const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);
  const [shelterAnimals, setShelterAnimals] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [region, setRegion] = useState({
    latitude: 23.8,
    longitude: 121.0,
    latitudeDelta: 4,
    longitudeDelta: 4,
  });

  // 取得可領養的動物（過濾已完成領養的）
  const availableAnimals = useMemo(() => {
    const completedAdoptionIds = applications
      .filter(app => app.status === ApplicationStatus.COMPLETED)
      .map(app => app.animalId);
    
    return ALL_ANIMALS.filter(animal => 
      !completedAdoptionIds.includes(animal.id)
    );
  }, [applications]);

  // 統計每個收容所的動物數量
  const shelterStats = useMemo(() => {
    const stats: { [key: string]: { cats: number; dogs: number; total: number } } = {};
    
    availableAnimals.forEach(animal => {
      if (!stats[animal.shelter]) {
        stats[animal.shelter] = { cats: 0, dogs: 0, total: 0 };
      }
      
      if (animal.type === 'cat') {
        stats[animal.shelter].cats++;
      } else if (animal.type === 'dog') {
        stats[animal.shelter].dogs++;
      }
      stats[animal.shelter].total++;
    });
    
    return stats;
  }, [availableAnimals]);

  // 用戶位置功能暫時禁用
  // useEffect(() => {
  //   ...
  // }, []);

  // 篩選收容所動物
  const filteredShelterAnimals = useMemo(() => {
    if (!selectedShelter) return [];
    
    const animals = availableAnimals.filter(animal => animal.shelter === selectedShelter);
    
    switch (selectedFilter) {
      case 'cat':
        return animals.filter(animal => animal.type === 'cat');
      case 'dog':
        return animals.filter(animal => animal.type === 'dog');
      case 'urgent':
        return animals.filter(animal => animal.isUrgent);
      case 'young':
        return animals.filter(animal => animal.age?.includes('幼'));
      default:
        return animals;
    }
  }, [selectedShelter, selectedFilter, availableAnimals]);

  // 處理收容所點擊
  const handleShelterPress = (shelterName: string) => {
    setSelectedShelter(shelterName);
    setShelterAnimals(availableAnimals.filter(animal => animal.shelter === shelterName));
  };

  // 關閉收容所資訊卡
  const closeShelterInfo = () => {
    setSelectedShelter(null);
    setShelterAnimals([]);
  };

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'cat', label: '貓咪' },
    { key: 'dog', label: '狗狗' },
    { key: 'urgent', label: '急需' },
    { key: 'young', label: '幼年' },
  ];

  // 渲染收容所資訊卡
  const renderShelterInfoCard = () => {
    if (!selectedShelter || filteredShelterAnimals.length === 0) return null;
    
    return (
      <View style={styles.shelterInfoCard}>
        <View style={styles.shelterInfoHeader}>
          <View>
            <Text style={styles.shelterInfoTitle}>{selectedShelter}</Text>
            <Text style={styles.shelterInfoSubtitle}>
              共 {filteredShelterAnimals.length} 隻動物等待領養
            </Text>
          </View>
          <TouchableOpacity onPress={closeShelterInfo} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredShelterAnimals}
          renderItem={({ item }) => <AnimalCard animal={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          style={styles.shelterAnimalsList}
          contentContainerStyle={styles.shelterAnimalsContent}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>等家的朋友</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerButton, viewMode === 'map' && styles.activeViewButton]}
            onPress={() => setViewMode('map')}
          >
            <MapPin size={20} color={viewMode === 'map' ? '#FFFFFF' : '#F97316'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, viewMode === 'list' && styles.activeViewButton]}
            onPress={() => setViewMode('list')}
          >
            <Search size={20} color={viewMode === 'list' ? '#FFFFFF' : '#F97316'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('導航', '定位功能開發中')}
          >
            <Navigation size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 篩選器 - 只在選擇收容所時顯示 */}
      {selectedShelter && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                selectedFilter === option.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(option.key)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === option.key && styles.activeFilterText,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 收容所列表模式 */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>🏥 收容所列表</Text>
            <Text style={styles.mapPlaceholderSubtext}>點擊收容所查看動物名單</Text>
            
            {/* 收容所列表 */}
            <ScrollView style={styles.shelterListContainer}>
              {Object.entries(shelterStats).map(([shelterName, stats]) => (
                <TouchableOpacity
                  key={shelterName}
                  style={styles.shelterListItem}
                  onPress={() => handleShelterPress(shelterName)}
                >
                  <Text style={styles.shelterName}>{shelterName}</Text>
                  <Text style={styles.shelterStats}>🐱{stats.cats}隻 🐶{stats.dogs}隻</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* 收容所資訊卡片 */}
          {renderShelterInfoCard()}
        </View>
      )}
      
      {/* 列表模式 - 維持原有的列表功能 */}
      {viewMode === 'list' && (
        <ScrollView style={styles.content}>
          <Text style={styles.resultCount}>
            共 {availableAnimals.length} 隻動物等待領養
          </Text>
          <FlatList
            data={availableAnimals}
            renderItem={({ item }) => <AnimalCard animal={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            style={styles.animalsList}
            contentContainerStyle={styles.animalsContent}
            scrollEnabled={false}
          />
        </ScrollView>
      )}
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
  activeViewButton: {
    backgroundColor: '#F97316',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 24,
  },
  shelterListContainer: {
    width: '100%',
    maxHeight: 300,
  },
  shelterListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 12,
    textAlign: 'center',
  },
  shelterListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shelterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1917',
    flex: 1,
  },
  shelterStats: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '600',
  },
  customMarker: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  markerStats: {
    flexDirection: 'row',
    gap: 4,
  },
  markerStatsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  shelterInfoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: screenHeight * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  shelterInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  shelterInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  shelterInfoSubtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78716C',
  },
  shelterAnimalsList: {
    flex: 1,
  },
  shelterAnimalsContent: {
    padding: 20,
    paddingTop: 10,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#F97316',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#78716C',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  animalsList: {
    flex: 1,
    marginTop: 20,
  },
  animalsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  urgentText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalInfo: {
    padding: 12,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  animalAge: {
    fontSize: 12,
    color: '#78716C',
  },
  animalBreed: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#78716C',
    marginLeft: 2,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  personalityTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  personalityText: {
    fontSize: 10,
    color: '#44403C',
    fontWeight: '500',
  },
  shelterDays: {
    fontSize: 10,
    color: '#78716C',
  },
  resultCount: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
});