import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Heart, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';
import ANIMALS_DATA from './datas';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;

// Mock animal data
export default function ExploreScreen() {
  const router = useRouter();
  const { applications } = useAdoption();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 使用 useRef 來存儲當前索引的最新值，避免 closure 問題
  const currentIndexRef = useRef(0);
  
  // 過濾已完成領養的寵物，然後隨機排序
  const animals = React.useMemo(() => {
    // 取得已完成領養的寵物ID
    const completedAdoptionIds = applications
      .filter(app => app.status === ApplicationStatus.COMPLETED)
      .map(app => app.animalId);
    
    // 過濾出已完成領養的寵物
    const availableAnimals = ANIMALS_DATA.filter(animal => 
      !completedAdoptionIds.includes(animal.id)
    );
    
    // 隨機排序
    const copy = [...availableAnimals];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [applications]);
  
  // 同步更新索引的函數，確保 state 和 ref 保持一致
  const updateCurrentIndex = useCallback(() => {
    const nextIndex = (currentIndexRef.current + 1) % animals.length;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    console.log('索引更新：', currentIndexRef.current, '→ 下一張動物：', animals[nextIndex]?.name);
    return nextIndex;
  }, [animals.length]);
  
  // 獲取當前動物的函數，確保使用最新的索引
  const getCurrentAnimal = useCallback(() => {
    const currentAnimal = animals[currentIndexRef.current];
    console.log('取得當前動物：索引', currentIndexRef.current, '動物名稱', currentAnimal?.name);
    return currentAnimal;
  }, [animals]);
  
  // 確保 ref 與 state 保持同步
  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.8)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const resetPosition = () => {
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
  };

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;
    
    if (direction === 'right') {
      triggerHapticFeedback();
    }

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = useCallback((direction: 'right' | 'left') => {
    // 使用 getCurrentAnimal 確保獲取最新的動物資料，避免 closure 問題
    const currentAnimal = getCurrentAnimal();
    
    if (!currentAnimal) {
      console.error('無法取得當前動物資料，索引：', currentIndexRef.current);
      return;
    }

    console.log(`==== 滑動完成 ====`);
    console.log(`方向: ${direction}, 動物: ${currentAnimal.name}, ID: ${currentAnimal.id}`);
    console.log(`當前索引: ${currentIndexRef.current}, State索引: ${currentIndex}`);

    if (direction === 'right') {
      // 右滑：導航到動物個人頁面
      console.log('執行右滑邏輯：導航到動物頁面');
      
      // 在導航前先更新索引，確保用戶返回時看到正確的下一張卡牌
      updateCurrentIndex();
      
      // 導航到動物個人頁面 - 使用當前動物的ID，不是下一張卡牌的ID
      console.log('導航到動物頁面，ID：', currentAnimal.id);
      router.push(`/animal/${currentAnimal.id}` as any);
    } else {
      // 左滑：祝福，直接更新到下一張卡牌
      console.log('執行左滑邏輯：祝福並繼續');
      updateCurrentIndex();
    }

    resetPosition();

    // 將下一張卡片的預視值復原到預設
    Animated.parallel([
      Animated.timing(nextCardOpacity, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    console.log(`==== 滑動完成後 ====`);
    console.log(`新的索引: ${currentIndexRef.current}`);
  }, [getCurrentAnimal, updateCurrentIndex, currentIndex, router, nextCardOpacity, nextCardScale]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        rotate.setValue(gesture.dx / screenWidth);

        // Animate next card based on current card movement
        const progress = Math.abs(gesture.dx) / screenWidth;
        nextCardOpacity.setValue(0.8 + progress * 0.2);
        nextCardScale.setValue(0.9 + progress * 0.1);
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();

        const threshold = 120;
        if (gesture.dx > threshold) {
          forceSwipe('right');
        } else if (gesture.dx < -threshold) {
          forceSwipe('left');
        } else {
          resetPosition();
          Animated.parallel([
            Animated.timing(nextCardOpacity, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(nextCardScale, {
              toValue: 0.9,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const rotateAndTranslate = {
    transform: [
      {
        rotate: rotate.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-10deg', '0deg', '10deg'],
        }),
      },
      ...position.getTranslateTransform(),
    ],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [25, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const blessOpacity = position.x.interpolate({
    inputRange: [-150, -25],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderCard = (animal: any, index: number) => {
    // 最上層：目前卡片
    if (index < currentIndex) {
      return null;
    }
    console.log(index, currentIndex, animal);
    if (index === currentIndex) {
      return (
        <Animated.View
          key={animal.id}
          style={[styles.card, rotateAndTranslate]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => router.push(`/animal/${animal.id}` as any)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: animal.image }} style={styles.cardImage} />

            {/* Like Overlay */}
            <Animated.View
              style={[
                styles.choiceOverlay,
                styles.likeOverlay,
                { opacity: likeOpacity },
              ]}
            >
              <View style={styles.choiceContent}>
                <Heart size={40} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={[styles.choiceText, { color: '#FFFFFF' }]}>
                  喜歡
                </Text>
              </View>
            </Animated.View>

            {/* Bless Overlay */}
            <Animated.View
              style={[
                styles.choiceOverlay,
                styles.blessOverlay,
                { opacity: blessOpacity },
              ]}
            >
              <View style={styles.choiceContent}>
                <Text style={styles.prayEmoji}>🙏</Text>
                <Text style={[styles.choiceText, { color: '#FFFFFF' }]}>
                  祝福
                </Text>
              </View>
            </Animated.View>

            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.animalName}>{animal.name}</Text>
                <Text style={styles.animalAge}>{animal.age}</Text>
              </View>

              <Text style={styles.animalBreed}>{animal.breed}</Text>

              <View style={styles.locationRow}>
                <MapPin size={14} color="#78716C" />
                <Text style={styles.locationText}>{animal.location}</Text>
              </View>

              <View style={styles.personalityContainer}>
                {animal.personality.map((trait: string, idx: number) => (
                  <View key={idx} style={styles.personalityTag}>
                    <Text style={styles.personalityText}>{trait}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.storyText} numberOfLines={3}>
                {animal.story}
              </Text>

              <Text style={styles.shelterDays}>
                在收容所 {animal.shelterDays} 天
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    if (index === currentIndex + 1) {
      return (
        <Animated.View
          key={animal.id}
          style={[
            styles.card,
            styles.nextCard,
            {
              opacity: nextCardOpacity,
              transform: [{ scale: nextCardScale }],
            },
          ]}
        >
          <TouchableOpacity style={styles.cardContent} activeOpacity={1}>
            <Image source={{ uri: animal.image }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.animalName}>{animal.name}</Text>
                <Text style={styles.animalAge}>{animal.age}</Text>
              </View>
              <Text style={styles.animalBreed}>{animal.breed}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#78716C" />
                <Text style={styles.locationText}>{animal.location}</Text>
              </View>
              <View style={styles.personalityContainer}>
                {animal.personality.map((trait: string, idx: number) => (
                  <View key={idx} style={styles.personalityTag}>
                    <Text style={styles.personalityText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>發現新朋友</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.cardContainer}>
        {animals.map((animal, index) => renderCard(animal, index))}
      </View>

      {/* Action Buttons */}
      <Animated.View style={styles.actionButtons}>
        <Animated.View
          style={[
            styles.actionButtonContainer,
            {
              opacity: position.x.interpolate({
                inputRange: [-screenWidth * 0.3, -50, 0, 50, screenWidth * 0.3],
                outputRange: [1, 1, 1, 0.2, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  translateX: position.x.interpolate({
                    inputRange: [-screenWidth, 0, screenWidth],
                    outputRange: [-screenWidth * 0.3, 0, 0],
                    extrapolate: 'clamp',
                  })
                },
                {
                  scale: position.x.interpolate({
                    inputRange: [-screenWidth * 0.3, -50, 0, 50, screenWidth * 0.3],
                    outputRange: [1.2, 1, 1, 0.7, 0.3],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.blessButton]}
            onPress={() => forceSwipe('left')}
          >
            <Text style={styles.blessEmoji}>🙏</Text>
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>祝福</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButtonContainer,
            {
              opacity: position.x.interpolate({
                inputRange: [-screenWidth * 0.3, -50, 0, 50, screenWidth * 0.3],
                outputRange: [0, 0.2, 1, 1, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  translateX: position.x.interpolate({
                    inputRange: [-screenWidth, 0, screenWidth],
                    outputRange: [0, 0, screenWidth * 0.3],
                    extrapolate: 'clamp',
                  })
                },
                {
                  scale: position.x.interpolate({
                    inputRange: [-screenWidth * 0.3, -50, 0, 50, screenWidth * 0.3],
                    outputRange: [0.3, 0.7, 1, 1, 1.2],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => forceSwipe('right')}
          >
            <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>查看</Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom instruction */}
      <Text style={styles.instructionText}>
        左滑祝福 · 右滑喜歡 · 點擊查看詳情
      </Text>
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
    zIndex: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  nextCard: {
    zIndex: -1,
  },
  cardContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  choiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  likeOverlay: {
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
  },
  blessOverlay: {
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
  },
  choiceContent: {
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  prayEmoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  animalAge: {
    fontSize: 18,
    color: '#78716C',
  },
  animalBreed: {
    fontSize: 16,
    color: '#78716C',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#78716C',
    marginLeft: 4,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  personalityTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  personalityText: {
    fontSize: 12,
    color: '#44403C',
    fontWeight: '500',
  },
  storyText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
    marginBottom: 8,
  },
  shelterDays: {
    fontSize: 12,
    color: '#78716C',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
    paddingVertical: 20,
    position: 'relative',
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  blessButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  blessEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  likeButton: {
    backgroundColor: '#F97316',
  },
  buttonLabel: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 8,
    fontWeight: '500',
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#78716C',
    paddingBottom: 20,
  },
});
