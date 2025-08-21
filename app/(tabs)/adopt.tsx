import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Heart, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Extended mock data for adoption list
const ADOPTION_ANIMALS = [
  {
    id: '1',
    name: '阿橘',
    age: '2歲',
    breed: '橘貓',
    location: '台北市中山區',
    image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
    shelterDays: 45,
    personality: ['親人', '愛玩', '愛撒嬌'],
    adoptionStatus: 'available',
    isUrgent: false,
  },
  {
    id: '2',
    name: '小白',
    age: '1歲',
    breed: '混種犬',
    location: '台北市信義區',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
    shelterDays: 23,
    personality: ['溫和', '聰明', '友善'],
    adoptionStatus: 'available',
    isUrgent: false,
  },
  {
    id: '3',
    name: '花花',
    age: '3歲',
    breed: '三花貓',
    location: '新北市板橋區',
    image: 'https://images.pexels.com/photos/774731/pexels-photo-774731.jpeg',
    shelterDays: 67,
    personality: ['安靜', '依賴', '溫柔'],
    adoptionStatus: 'available',
    isUrgent: true,
  },
  {
    id: '4',
    name: '黑仔',
    age: '4歲',
    breed: '黑狗',
    location: '桃園市中壢區',
    image: 'https://images.pexels.com/photos/97082/weimaraner-puppy-dog-snout-97082.jpeg',
    shelterDays: 89,
    personality: ['忠心', '護主', '活潑'],
    adoptionStatus: 'available',
    isUrgent: true,
  },
  {
    id: '5',
    name: '小灰',
    age: '6個月',
    breed: '灰貓',
    location: '台中市西區',
    image: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg',
    shelterDays: 12,
    personality: ['幼稚', '好奇', '愛玩'],
    adoptionStatus: 'available',
    isUrgent: false,
  },
];

export default function AdoptScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'urgent', label: '急需' },
    { key: 'cat', label: '貓咪' },
    { key: 'dog', label: '狗狗' },
    { key: 'young', label: '幼年' },
  ];

  const filteredAnimals = ADOPTION_ANIMALS.filter(animal => {
    switch (selectedFilter) {
      case 'urgent':
        return animal.isUrgent;
      case 'cat':
        return animal.breed.includes('貓');
      case 'dog':
        return animal.breed.includes('犬') || animal.breed.includes('狗');
      case 'young':
        return animal.age.includes('個月') || parseInt(animal.age) <= 1;
      default:
        return true;
    }
  });

  const AnimalCard = ({ animal }: { animal: any }) => (
    <TouchableOpacity
      style={styles.animalCard}
      onPress={() => router.push(`/animal/${animal.id}` as any)}>
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
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={styles.animalAge}>{animal.age}</Text>
        </View>
        
        <Text style={styles.animalBreed}>{animal.breed}</Text>
        
        <View style={styles.locationRow}>
          <MapPin size={12} color="#78716C" />
          <Text style={styles.locationText}>{animal.location}</Text>
        </View>
        
        <View style={styles.personalityContainer}>
          {animal.personality.slice(0, 2).map((trait: string, idx: number) => (
            <View key={idx} style={styles.personalityTag}>
              <Text style={styles.personalityText}>{trait}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.shelterDays}>收容所 {animal.shelterDays} 天</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>等家的朋友</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Search size={20} color="#F97316" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
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

      {/* Animals List */}
      <ScrollView
        style={styles.animalsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.animalsContent}>
        <Text style={styles.resultCount}>
          共 {filteredAnimals.length} 隻動物等待領養
        </Text>
        
        <View style={styles.animalsGrid}>
          {filteredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </View>
      </ScrollView>
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
  resultCount: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 16,
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
});