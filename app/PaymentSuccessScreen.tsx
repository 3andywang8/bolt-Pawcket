import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Heart, Chrome as Home, Share2 } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { treatId, treatName, price, animalType, paymentMethod } = useLocalSearchParams();
  
  // 動態選擇影片的邏輯
  const videoSources = {
    // 狗狗的零食影片
    'd1': require('../assets/dog-treat-freeze-dried.mp4'),
    'd2': require('../assets/dog-treat-dental-bone.mp4'),
    'd3': require('../assets/dog-treat-chicken-jerky.mp4'),
    // 貓咪的零食影片
    'c1': require('../assets/cat-treat-puree.mp4'),
    'c2': require('../assets/cat-treat-freeze-dried.mp4'),
    'c3': require('../assets/cat-treat-biscuits.mp4'),
  };

  const videoSource = videoSources[treatId as keyof typeof videoSources] || require('../assets/logo.mp4'); // 如果找不到對應影片，就播放預設的 logo 影片
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 使用動態選擇的影片來源初始化播放器
  const player = useVideoPlayer(videoSource, player => {
    player.shouldPlay = true; // 自動播放
    player.isLooping = false; // 不重複
    player.isMuted = true;    // 預設靜音
  });

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  useEffect(() => {
    triggerHapticFeedback();
    
    // 成功動畫
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBackToHome = () => {
    router.push('/(tabs)');
  };

  const handleShare = () => {
    // 分享功能
    console.log('分享愛心投餵');
  };

  const animalName = animalType === 'cat' ? '貓咪' : '狗狗';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F97316" />
      
      {/* 成功標題區域 */}
      <View style={styles.successHeader}>
        <Animated.View 
          style={[
            styles.successIconContainer,
            { 
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}>
          <Heart size={60} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
        </Animated.View>
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.successTitle}>投餵成功！</Text>
          <Text style={styles.successSubtitle}>
            感謝你的愛心，{animalName}正在享用美味的{treatName}
          </Text>
        </Animated.View>
      </View>

      {/* 即時影像區域 */}
      <View style={styles.videoContainer}>
        <Text style={styles.videoTitle}>即時影像</Text>
        <View style={styles.videoWrapper}>
          <VideoView
            style={styles.video}
            player={player}
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="cover"
          />
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.videoDescription}>
          {animalName}正在開心地享用你贈送的{treatName}！
        </Text>
      </View>

      {/* 支付詳情 */}
      <View style={styles.paymentDetails}>
        <Text style={styles.detailsTitle}>支付詳情</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>零食</Text>
          <Text style={styles.detailValue}>{treatName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>金額</Text>
          <Text style={styles.detailValue}>NT$ {price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>支付方式</Text>
          <Text style={styles.detailValue}>
            {paymentMethod === 'apple-pay' && 'Apple Pay'}
            {paymentMethod === 'google-pay' && 'Google Pay'}
            {paymentMethod === 'line-pay' && 'LINE Pay'}
            {paymentMethod === 'credit-card' && '信用卡'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>時間</Text>
          <Text style={styles.detailValue}>
            {new Date().toLocaleString('zh-TW')}
          </Text>
        </View>
      </View>

      {/* 感謝訊息 */}
      <View style={styles.thankYouMessage}>
        <Text style={styles.thankYouTitle}>你的愛心讓世界更美好 💝</Text>
        <Text style={styles.thankYouText}>
          每一次的投餵都是對流浪動物最溫暖的關懷，謝謝你成為牠們生命中的天使。
        </Text>
      </View>

      {/* 底部按鈕 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}>
          <Share2 size={20} color="#F97316" strokeWidth={2} />
          <Text style={styles.shareButtonText}>分享愛心</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}>
          <Home size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.homeButtonText}>回到首頁</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  successHeader: {
    backgroundColor: '#F97316',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  videoContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 12,
    textAlign: 'center',
  },
  videoWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  video: {
    width: '100%',
    aspectRatio: 1,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  videoDescription: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentDetails: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#78716C',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  thankYouMessage: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  thankYouTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 14,
    color: '#44403C',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97316',
  },
  homeButton: {
    flex: 2,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});