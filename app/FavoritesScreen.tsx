import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Gift } from 'lucide-react-native';
import { useFavorites, FavoriteItem } from '@/contexts/FavoritesContext';
import { useDonations } from '@/contexts/DonationContext';
import animalsData from '@/app/(tabs)/datas';

type FilterType = 'liked' | 'fed';

const AnimalCard = ({ 
  animal, 
  onPress, 
  showFedBadge = false 
}: { 
  animal: FavoriteItem | any; 
  onPress: () => void;
  showFedBadge?: boolean;
}) => (
  <TouchableOpacity style={styles.animalCard} onPress={onPress}>
    <View style={styles.cardImageContainer}>
      <Image 
        source={{ uri: animal.animalImage || animal.image || animal.images?.[0] }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      {showFedBadge && (
        <View style={styles.fedBadge}>
          <Gift size={12} color="#FFFFFF" />
          <Text style={styles.fedBadgeText}>已投餵</Text>
        </View>
      )}
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.animalName}>{animal.animalName || animal.name}</Text>
      <View style={styles.animalDetails}>
        <Text style={styles.animalType}>
          {animal.animalType === 'cat' ? '🐱 貓咪' : '🐕 狗狗'}
        </Text>
        <Text style={styles.animalBreed}>
          {animal.animalBreed || animal.breed} · {animal.animalAge || animal.age}
        </Text>
      </View>
      <Text style={styles.animalLocation} numberOfLines={2}>
        📍 {animal.shelter || animal.location}
      </Text>
      {animal.personality && (
        <View style={styles.personalityContainer}>
          {animal.personality.slice(0, 2).map((trait: string, index: number) => (
            <View key={`${animal.animalId || animal.id}-${trait}-${index}`} style={styles.personalityTag}>
              <Text style={styles.personalityText}>{trait}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const { donations } = useDonations();
  const [filter, setFilter] = useState<FilterType>('liked');

  // 獲取已投餵的動物ID列表
  const getFedAnimalIds = () => {
    const fedAnimalIds = new Set<string>();
    donations.forEach(donation => {
      if (donation.animalName && donation.animalName !== '愛心動物') {
        // 嘗試從動物數據中找到匹配的動物
        const matchingAnimal = animalsData.find(animal => 
          animal.name === donation.animalName || 
          animal.name.includes(donation.animalName) ||
          donation.animalName.includes(animal.name)
        );
        if (matchingAnimal) {
          fedAnimalIds.add(matchingAnimal.id);
        }
      }
    });
    return fedAnimalIds;
  };

  const fedAnimalIds = getFedAnimalIds();
  const fedAnimals = animalsData.filter(animal => fedAnimalIds.has(animal.id));

  const handleAnimalPress = (animalId: string) => {
    router.push(`/animal/${animalId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderAnimalCard = ({ item }: { item: any }) => (
    <AnimalCard
      animal={item}
      onPress={() => handleAnimalPress(item.animalId || item.id)}
      showFedBadge={filter === 'fed'}
    />
  );

  const currentData = filter === 'liked' ? favorites : fedAnimals;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}>
          <ArrowLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'liked' && styles.activeFilterTab]}
          onPress={() => setFilter('liked')}>
          <Heart 
            size={18} 
            color={filter === 'liked' ? '#F97316' : '#78716C'} 
            fill={filter === 'liked' ? '#F97316' : 'none'}
            strokeWidth={2}
          />
          <Text style={[styles.filterTabText, filter === 'liked' && styles.activeFilterTabText]}>
            喜歡的動物
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'fed' && styles.activeFilterTab]}
          onPress={() => setFilter('fed')}>
          <Gift 
            size={18} 
            color={filter === 'fed' ? '#F97316' : '#78716C'} 
            strokeWidth={2}
          />
          <Text style={[styles.filterTabText, filter === 'fed' && styles.activeFilterTabText]}>
            投餵過的動物
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {currentData.length > 0 ? (
          <FlatList
            data={currentData}
            renderItem={renderAnimalCard}
            keyExtractor={(item) => `${filter}-${item.animalId || item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            {filter === 'liked' ? (
              <>
                <Heart size={64} color="#E5E5E5" strokeWidth={1} />
                <Text style={styles.emptyTitle}>還沒有喜歡的動物</Text>
                <Text style={styles.emptyText}>
                  在首頁向右滑動卡片，將可愛的毛孩加入收藏吧！
                </Text>
              </>
            ) : (
              <>
                <Gift size={64} color="#E5E5E5" strokeWidth={1} />
                <Text style={styles.emptyTitle}>還沒有投餵過的動物</Text>
                <Text style={styles.emptyText}>
                  開始你的第一次愛心投餵，為毛孩們送上美味零食吧！
                </Text>
              </>
            )}
          </View>
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    marginHorizontal: 4,
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#78716C',
  },
  activeFilterTabText: {
    color: '#F97316',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  cardImageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  fedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  fedBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 12,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 6,
  },
  animalDetails: {
    marginBottom: 6,
  },
  animalType: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '500',
    marginBottom: 2,
  },
  animalBreed: {
    fontSize: 12,
    color: '#78716C',
  },
  animalLocation: {
    fontSize: 11,
    color: '#A8A29E',
    marginBottom: 8,
    lineHeight: 14,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  personalityTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  personalityText: {
    fontSize: 10,
    color: '#78716C',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
});