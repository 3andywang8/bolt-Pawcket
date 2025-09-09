import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = (provider: 'line' | 'apple' | 'google') => {
    // 登入後跳轉到Loading頁面
    console.log(`登入: ${provider}`);
    router.replace('/loading');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 背景圖片 */}
      <Image 
        source={require('../assets/ai圖去背.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/橫圖Logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* 標題文字 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>建立帳號</Text>
          <Text style={styles.subtitle}>選擇你的登入方式</Text>
        </View>

        {/* 登入按鈕區域 */}
        <View style={styles.buttonSection}>
          {/* Line 登入按鈕 */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.lineButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => handleLogin('line')}
          >
            <Image 
              source={require('../assets/line.png')} 
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              使用 Line 帳號登入
            </Text>
          </Pressable>

          {/* Apple 登入按鈕 */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.appleButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => handleLogin('apple')}
          >
            <Image 
              source={require('../assets/apple.png')} 
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              使用 Apple 帳號登入
            </Text>
          </Pressable>

          {/* Google 登入按鈕 */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              styles.googleButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => handleLogin('google')}
          >
            <Image 
              source={require('../assets/Google.png')} 
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: '#1C1917' }]}>
              使用 Google 帳號登入
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  backgroundImage: {
    position: 'absolute',
    top: 19, // 下移0.5公分 (約19px)
    left: 0,
    right: 0,
    bottom: -19,
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    flex: 1,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#78716C',
    textAlign: 'center',
  },
  logoImage: {
    width: 161,
    height: 48,
  },
  buttonSection: {
    alignItems: 'center', // 水平居中對齊
    paddingHorizontal: 55,
    paddingTop: -188, // 再往上移動約1公分 (總共約5公分)
    gap: 18,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 252, // 6.3公分 = 252px (約40px/公分)
    height: 48, // 1.2公分 = 48px
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  lineButton: {
    backgroundColor: 'rgba(0, 185, 0, 0.9)',
  },
  appleButton: {
    backgroundColor: '#0000004D',
  },
  googleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.25,
  },
  buttonIcon: {
    width: 22, // 再次縮小圖示
    height: 22,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14, // 再次縮小字體
    fontWeight: '600',
    textAlign: 'center',
  },
});