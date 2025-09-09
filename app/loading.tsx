import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

export default function LoadingScreen() {
  const router = useRouter();
  const [showTransition, setShowTransition] = useState(false);
  
  // 計算腳印數量：螢幕高度除以腳印間距，再加一些額外的
  const pawStepHeight = 80; // 每個腳印之間的垂直距離
  const totalPaws = Math.floor(screenHeight / pawStepHeight) + 2; // 約8-10個腳印
  
  // 動態創建腳印動畫值
  const pawAnimations = useRef(
    Array.from({ length: totalPaws }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3),
    }))
  ).current;

  // 頁面過渡動畫值
  const slideUpAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  // 腳印圖片陣列
  const pawImages = [
    require('../assets/腳掌橘.png'),
    require('../assets/腳掌黃.png'),
    require('../assets/腳掌白.png'),
  ];

  useEffect(() => {
    // 創建所有腳印的動畫陣列 (加快腳印出現速度)
    const pawAnimationSequence = pawAnimations.map((pawAnim, index) => 
      Animated.parallel([
        Animated.timing(pawAnim.opacity, {
          toValue: 1,
          duration: 300, // 從400ms減少到300ms
          useNativeDriver: true,
        }),
        Animated.timing(pawAnim.scale, {
          toValue: 1,
          duration: 300, // 從400ms減少到300ms
          useNativeDriver: true,
        }),
      ])
    );

    // 腳印依序出現的動畫 (從下往上，間隔縮短到280ms)
    const walkingAnimation = Animated.stagger(280, pawAnimationSequence);

    // 啟動走路動畫
    walkingAnimation.start(() => {
      // 走路動畫完成後，立即開始頁面過渡 (移除setTimeout)
      setShowTransition(true);
      
      // 同時執行淡出和滑入動畫 (加快速度)
      Animated.parallel([
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 400, // 從600ms減少到400ms
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 500, // 從800ms減少到500ms
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 動畫完成後跳轉
        router.replace('/(tabs)');
      });
    });

    return () => {
      walkingAnimation.stop();
    };
  }, [router, pawAnimations, slideUpAnim, fadeOutAnim]);

  return (
    <View style={styles.container}>
      {/* Loading內容 */}
      <Animated.View style={[
        styles.loadingContent,
        { opacity: fadeOutAnim }
      ]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.pawPathContainer}>
              {/* 動態渲染所有腳印 */}
              {pawAnimations.map((pawAnim, index) => {
                // 計算每個腳印的位置
                const bottomPosition = 50 + (index * pawStepHeight);
                const isEven = index % 2 === 0;
                const leftPosition = isEven ? 60 : 120; // 交替左右位置
                const rotation = isEven ? `${10 + (index % 3) * 5}deg` : `${-8 - (index % 3) * 4}deg`;
                const pawImageIndex = index % 3; // 循環使用三種腳印圖片

                return (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.pawStep,
                      {
                        bottom: bottomPosition,
                        left: leftPosition,
                        opacity: pawAnim.opacity,
                        transform: [
                          { scale: pawAnim.scale }, 
                          { rotate: rotation }
                        ],
                      }
                    ]}
                  >
                    <Image 
                      source={pawImages[pawImageIndex]}
                      style={styles.pawImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* 過渡元素 - 模擬下一頁面從下方滑入 */}
      {showTransition && (
        <Animated.View style={[
          styles.transitionOverlay,
          {
            transform: [{ translateY: slideUpAnim }],
          }
        ]}>
          <View style={styles.transitionContent}>
            <View style={styles.previewContent}>
              {/* 模擬探索頁面的預覽 */}
              <View style={styles.mockHeader}>
                <View style={styles.mockTitle} />
              </View>
              <View style={styles.mockCard} />
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  loadingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawPathContainer: {
    position: 'relative',
    width: 200,
    height: screenHeight - 100, // 使用整個螢幕高度減去邊距
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawStep: {
    position: 'absolute',
  },
  pawImage: {
    width: 50,
    height: 50,
  },
  // 過渡動畫樣式
  transitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FEFDFB',
    zIndex: 2,
  },
  transitionContent: {
    flex: 1,
    paddingTop: 100,
  },
  previewContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 30,
  },
  mockTitle: {
    width: 150,
    height: 24,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
  },
  mockCard: {
    width: '100%',
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});