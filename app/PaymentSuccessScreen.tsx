import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Modal,
  Pressable,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Heart, Chrome as Home, Share2, Bookmark, Download, Instagram, MessageCircle, AtSign, Send } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';
import RNShare from 'react-native-share';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { treatId, treatName, price, animalType, paymentMethod } =
    useLocalSearchParams();

  // 動態選擇影片的邏輯
  const videoSources = {
    // 狗狗的零食影片
    d1: require('../assets/dog-treat-freeze-dried.mp4'),
    d2: require('../assets/dog-treat-dental-bone.mp4'),
    d3: require('../assets/dog-treat-chicken-jerky.mp4'),
    // 貓咪的零食影片
    c1: require('../assets/cat-treat-puree.mp4'),
    c2: require('../assets/cat-treat-freeze-dried.mp4'),
    c3: require('../assets/cat-treat-biscuits.mp4'),
  };

  const videoSource =
    videoSources[treatId as keyof typeof videoSources] ||
    require('../assets/logo.mp4'); // 如果找不到對應影片，就播放預設的 logo 影片

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 使用動態選擇的影片來源初始化播放器
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false; // 播放完才會觸發結束
    player.muted = true; // 網頁自動播放策略需要靜音
    player.play(); // 自動播放
  });
  // 聚焦播放、失焦暫停
  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => {
        player.pause();
      };
    }, [player])
  );

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
    setShareModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeShareModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShareModalVisible(false);
    });
  };

  const handleShareOption = async (platform: string) => {
    console.log(`分享到 ${platform}`);
    closeShareModal();
    
    // 動態生成分享文案
    const shareMessage = treatId && typeof treatId === 'string' && treatId.startsWith('d')
      ? '快來看看這隻可愛的狗狗！馬上加入 Pawcket，一起守護浪浪！'
      : '快來看看這隻可愛的貓咪！馬上加入 Pawcket，一起守護浪浪！';
    
    // 假設的影片網路連結
    const videoUrl = 'https://example.com/pawcket-video.mp4';
    
    try {
      switch (platform) {
        case 'Instagram Stories':
          await RNShare.shareSingle({
            social: RNShare.Social.INSTAGRAM_STORIES,
            url: videoUrl,
            message: shareMessage,
          });
          break;
          
        case 'Instagram Messages':
          await RNShare.shareSingle({
            social: RNShare.Social.INSTAGRAM,
            url: videoUrl,
            message: shareMessage,
          });
          break;
          
        case 'Threads':
          await RNShare.shareSingle({
            social: RNShare.Social.THREADS,
            url: videoUrl,
            message: shareMessage,
          });
          break;
          
        case 'Line':
          await RNShare.shareSingle({
            social: RNShare.Social.LINE,
            url: videoUrl,
            message: shareMessage,
          });
          break;
          
        case 'More':
          // 使用 React Native 內建的 Share API
          await Share.share({
            message: shareMessage,
            url: videoUrl,
            title: 'Pawcket - 守護浪浪',
          });
          break;
          
        default:
          console.log('未知的分享平台');
      }
    } catch (error) {
      console.error('分享失敗:', error);
      Alert.alert('分享失敗', '無法完成分享，請稍後再試。');
    }
  };

  const handleBookmark = () => {
    // 收藏功能
    console.log('收藏影片');
    router.navigate('favorites' as any);
  };

  const handleVideoShare = () => {
    // 分享影片功能
    console.log('分享影片');
  };

  const handleDownload = () => {
    // 下載功能
    console.log('下載影片');
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
            },
          ]}
        >
          <Heart size={30} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
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
        
        {/* 影片操作按鈕 */}
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.videoActionButton} onPress={handleBookmark}>
            <Bookmark size={18} color="#78716C" strokeWidth={2} />
            <Text style={styles.videoActionText}>收藏</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoActionButton} onPress={handleVideoShare}>
            <Share2 size={18} color="#78716C" strokeWidth={2} />
            <Text style={styles.videoActionText}>分享</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoActionButton} onPress={handleDownload}>
            <Download size={18} color="#78716C" strokeWidth={2} />
            <Text style={styles.videoActionText}>下載</Text>
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={20} color="#F97316" strokeWidth={2} />
          <Text style={styles.shareButtonText}>分享愛心</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Home size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.homeButtonText}>回到首頁</Text>
        </TouchableOpacity>
      </View>

      {/* 分享 Modal */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeShareModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeShareModal}>
          <Animated.View
            style={[
              styles.shareModal,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.shareModalTitle}>分享到</Text>
            
            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Instagram Stories')}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#E4405F' }]}>
                  <Instagram size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Instagram 限時動態</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Instagram Messages')}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#E4405F' }]}>
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Instagram 訊息</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Threads')}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#000000' }]}>
                  <AtSign size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Threads</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Line')}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#00B900' }]}>
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Line</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('More')}
              >
                <View style={[styles.shareIconContainer, { backgroundColor: '#78716C' }]}>
                  <Send size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>分享到</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  successHeader: {
    backgroundColor: '#F97316',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 12,
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
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 24,
  },
  videoActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F4',
    minWidth: 60,
  },
  videoActionText: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
    fontWeight: '500',
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
  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    minHeight: 280,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  shareOption: {
    alignItems: 'center',
    flex: 1,
  },
  shareIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#44403C',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});
