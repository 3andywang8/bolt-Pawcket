import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, MapPin, Heart, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import ALL_ANIMALS from './datas';

const ITEMS_PER_PAGE = 2;

const AnimalCard = React.memo(({ animal }: { animal: any }) => {
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
          <Text style={styles.locationText} numberOfLines={1}>{animal.location}</Text>
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
});

export default function AdoptScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [displayedAnimals, setDisplayedAnimals] = useState<any[]>([]);

  const filteredAnimals = useMemo(() => {
    return ALL_ANIMALS.filter(animal => {
      if (!animal) return false;
      switch (selectedFilter) {
        case 'urgent':
          return animal.isUrgent;
        case 'cat':
          return animal.breed?.includes('貓');
        case 'dog':
          return animal.breed?.includes('犬') || animal.breed?.includes('狗');
        case 'young':
          return animal.age?.includes('幼');
        default:
          return true;
      }
    });
  }, [selectedFilter]);

  useEffect(() => {
    setPage(1);
    setDisplayedAnimals(filteredAnimals.slice(0, ITEMS_PER_PAGE));
  }, [filteredAnimals]);

  const loadMoreItems = () => {
    const nextPage = page + 1;
    const nextItems = filteredAnimals.slice(0, nextPage * ITEMS_PER_PAGE);
    if (nextItems.length > displayedAnimals.length) {
      setPage(nextPage);
      setDisplayedAnimals(nextItems);
    }
  };

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'urgent', label: '急需' },
    { key: 'cat', label: '貓咪' },
    { key: 'dog', label: '狗狗' },
    { key: 'young', label: '幼年' },
  ];

  const renderFooter = () => {
    if (displayedAnimals.length < filteredAnimals.length) {
      return <ActivityIndicator size="large" color="#F97316" style={{ marginVertical: 20 }} />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
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

      <FlatList
        data={displayedAnimals}
        renderItem={({ item }) => <AnimalCard animal={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        style={styles.animalsList}
        contentContainerStyle={styles.animalsContent}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={() => (
          <Text style={styles.resultCount}>
            共 {filteredAnimals.length} 隻動物等待領養
          </Text>
        )}
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