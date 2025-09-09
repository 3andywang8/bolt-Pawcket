import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function LoadingScreen() {
  const router = useRouter();
  
  // 動畫值
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(1)).current;
  const scaleAnim2 = useRef(new Animated.Value(1)).current;
  const scaleAnim3 = useRef(new Animated.Value(1)).current;
  const opacityAnim1 = useRef(new Animated.Value(1)).current;
  const opacityAnim2 = useRef(new Animated.Value(0.7)).current;
  const opacityAnim3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 旋轉動畫
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // 脈衝動畫 - 腳掌1
    const pulseAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim1, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ])
    );

    // 脈衝動畫 - 腳掌2 (延遲)
    const pulseAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(scaleAnim2, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    );

    // 脈衝動畫 - 腳掌3 (延遲更多)
    const pulseAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(scaleAnim3, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    // 透明度動畫
    const opacityAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim1, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(opacityAnim2, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim2, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacityAnim3, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim3, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // 啟動所有動畫
    rotateAnimation.start();
    pulseAnimation1.start();
    pulseAnimation2.start();
    pulseAnimation3.start();
    opacityAnimation1.start();
    opacityAnimation2.start();
    opacityAnimation3.start();

    // 1秒後跳轉到探索頁面
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);

    return () => {
      rotateAnimation.stop();
      pulseAnimation1.stop();
      pulseAnimation2.stop();
      pulseAnimation3.stop();
      opacityAnimation1.stop();
      opacityAnimation2.stop();
      opacityAnimation3.stop();
      clearTimeout(timer);
    };
  }, [router, rotateAnim, scaleAnim1, scaleAnim2, scaleAnim3, opacityAnim1, opacityAnim2, opacityAnim3]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.pawContainer, { transform: [{ rotate: spin }] }]}>
          {/* 腳掌橘 - 中心 */}
          <Animated.View style={[
            styles.pawWrapper,
            styles.centerPaw,
            {
              transform: [{ scale: scaleAnim1 }],
              opacity: opacityAnim1,
            }
          ]}>
            <Image 
              source={require('../assets/腳掌橘.png')} 
              style={styles.pawImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 腳掌黃 - 左上 */}
          <Animated.View style={[
            styles.pawWrapper,
            styles.leftPaw,
            {
              transform: [{ scale: scaleAnim2 }],
              opacity: opacityAnim2,
            }
          ]}>
            <Image 
              source={require('../assets/腳掌黃.png')} 
              style={styles.pawImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 腳掌白 - 右下 */}
          <Animated.View style={[
            styles.pawWrapper,
            styles.rightPaw,
            {
              transform: [{ scale: scaleAnim3 }],
              opacity: opacityAnim3,
            }
          ]}>
            <Image 
              source={require('../assets/腳掌白.png')} 
              style={styles.pawImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPaw: {
    top: 35,
    left: 35,
  },
  leftPaw: {
    top: 10,
    left: 10,
  },
  rightPaw: {
    top: 60,
    left: 60,
  },
  pawImage: {
    width: 50,
    height: 50,
  },
});