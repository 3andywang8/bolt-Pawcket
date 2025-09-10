import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  Heart,
  Share2,
  Bookmark,
  Download,
  Instagram,
  MessageCircle,
  AtSign,
  Send,
  History,
} from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { smartShare } from '../utils/share';
import { useDonations } from '@/contexts/DonationContext';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { addDonation } = useDonations();
  const { treatId, treatName, price, animalType, animalName, paymentMethod } =
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
  const lastOpenedRef = useRef(0);

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

  // 計算顯示用的動物名稱（使用 useMemo 避免重新計算）
  const displayAnimalName = useMemo(() => {
    return animalName ? animalName as string : (animalType === 'cat' ? '貓咪' : '狗狗');
  }, [animalName, animalType]);
  
  // 固定支付時間（在組件加載時就確定）
  const [paymentTime] = useState(() => new Date().toLocaleString('zh-TW'));

  // 動畫和震動反饋 - 只在組件載入時執行一次
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件載入時執行一次

  // 記錄捐款到歷史記錄 - 只在組件載入時執行一次
  useEffect(() => {
    if (treatId && treatName && price && animalType && paymentMethod) {
      addDonation({
        treatId: treatId as string,
        treatName: treatName as string,
        price: typeof price === 'string' ? parseInt(price) : parseInt(Array.isArray(price) ? price[0] : price),
        animalType: animalType as 'cat' | 'dog',
        paymentMethod: paymentMethod as string,
        animalName: displayAnimalName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件載入時執行一次

  const handleViewDonations = () => {
    router.push('/MyDonationsScreen');
  };

  const handleShare = () => {
    // Web 上使用 RN 內建 Share 或 smartShare 可能直接開新視窗而非彈窗
    // 我們保留自家 UI 彈窗，讓使用者選擇平台
    const now = Date.now();
    // 防抖：避免重複點擊
    if (now - lastOpenedRef.current < 350) return;
    lastOpenedRef.current = now;
    console.log('分享愛心投餵');
    setShareModalVisible(true);
    const startAnim = () => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    };
    if (Platform.OS === 'web' && typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(startAnim);
    } else {
      startAnim();
    }
  };

  const closeShareModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setShareModalVisible(false);
    });
  };

  const handleOverlayPress = () => {
    // 避免點擊按鈕後，第一個 click 冒泡到遮罩導致立刻關閉（特別是 Web）
    if (Date.now() - lastOpenedRef.current < 250) return;
    closeShareModal();
  };

  const handleShareOption = async (platform: string) => {
    console.log(`分享到 ${platform}`);
    closeShareModal();

    // 動態生成分享文案
    const shareMessage =
      treatId && typeof treatId === 'string' && treatId.startsWith('d')
        ? '快來看看這隻可愛的狗狗！馬上加入 Pawcket，一起守護浪浪！'
        : '快來看看這隻可愛的貓咪！馬上加入 Pawcket，一起守護浪浪！';

    // 假設的影片網路連結
    const videoUrl = 'https://example.com/pawcket-video.mp4';

    try {
      switch (platform) {
        case 'Instagram Stories':
          await smartShare({
            social: 'instagram',
            variant: 'stories',
            url: videoUrl,
            message: shareMessage,
            subject: 'Pawcket - 守護浪浪',
          });
          break;

        case 'Instagram Messages':
          await smartShare({
            social: 'instagram',
            url: videoUrl,
            message: shareMessage,
            subject: 'Pawcket - 守護浪浪',
          });
          break;

        case 'Threads':
          await smartShare({
            social: 'threads',
            url: videoUrl,
            message: shareMessage,
            subject: 'Pawcket - 守護浪浪',
          });
          break;

        case 'Line':
          await smartShare({
            social: 'line',
            url: videoUrl,
            message: shareMessage,
            subject: 'Pawcket - 守護浪浪',
          });
          break;

        case 'More':
          await smartShare({
            message: shareMessage,
            url: videoUrl,
            subject: 'Pawcket - 守護浪浪',
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
    router.push('/FavoritesScreen');
  };

  const handleVideoShare = () => {
    // 分享影片功能
    const now = Date.now();
    // 防抖：避免重複點擊
    if (now - lastOpenedRef.current < 350) return;
    lastOpenedRef.current = now;
    console.log('分享影片');
    setShareModalVisible(true);
    const startAnim = () => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    };
    if (Platform.OS === 'web' && typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(startAnim);
    } else {
      startAnim();
    }
  };

  const handleDownload = async () => {
    // 檢查是否為 Web 環境
    if (Platform.OS === 'web') {
      Alert.alert('下載功能', '此功能僅在手機 App 上提供');
      return;
    }

    try {
      // 請求媒體庫權限
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('權限不足', '需要相簿存取權限才能下載影片');
        return;
      }

      // 顯示下載開始提示
      Alert.alert('開始下載', '影片正在下載中，請稍候...');

      // 獲取當前影片的本地路徑
      const videoUri = videoSource;
      
      // 生成檔案名稱
      const animalType = treatId && typeof treatId === 'string' && treatId.startsWith('d') ? 'dog' : 'cat';
      const fileName = `pawcket_${animalType}_${treatId}_${Date.now()}.mp4`;
      
      // 創建下載目錄
      const downloadDir = `${FileSystem.documentDirectory}downloads/`;
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      
      // 目標檔案路徑
      const targetPath = `${downloadDir}${fileName}`;

      // 複製影片檔案到下載目錄
      await FileSystem.copyAsync({
        from: videoUri,
        to: targetPath,
      });

      // 將檔案保存到相簿
      const asset = await MediaLibrary.createAssetAsync(targetPath);
      
      // 創建或獲取 Pawcket 相簿
      let album = await MediaLibrary.getAlbumAsync('Pawcket');
      if (album == null) {
        album = await MediaLibrary.createAlbumAsync('Pawcket', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // 清理臨時檔案
      await FileSystem.deleteAsync(targetPath, { idempotent: true });

      // 顯示成功提示
      Alert.alert(
        '下載成功！', 
        '影片已保存到相簿的 Pawcket 資料夾中',
        [{ text: '確定', style: 'default' }]
      );

      // 觸發成功震動回饋
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

    } catch (error) {
      console.error('下載失敗:', error);
      Alert.alert(
        '下載失敗', 
        '無法下載影片，請檢查儲存空間或稍後再試',
        [{ text: '確定', style: 'default' }]
      );
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F97316" />

      {/* 成功標題區域 - 固定在頂部 */}
      <View style={styles.successHeader}>
        <Animated.View
          onStartShouldSetResponder={() => true}
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
            感謝你的愛心，{displayAnimalName}正在享用美味的{treatName}
          </Text>
        </Animated.View>
      </View>

      {/* 可滾動內容區域 */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
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
            {displayAnimalName}正在開心地享用你贈送的{treatName}！
          </Text>

          {/* 影片操作按鈕 */}
          <View style={styles.videoActions}>
            <TouchableOpacity
              style={styles.videoActionButton}
              onPress={handleBookmark}
            >
              <Bookmark size={18} color="#78716C" strokeWidth={2} />
              <Text style={styles.videoActionText}>收藏</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.videoActionButton}
              onPress={handleVideoShare}
            >
              <Share2 size={18} color="#78716C" strokeWidth={2} />
              <Text style={styles.videoActionText}>分享</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.videoActionButton}
              onPress={handleDownload}
            >
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
              {paymentMethod === 'line-pay' && 'LINE Pay'}
              {paymentMethod === 'credit-card' && '信用卡'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>時間</Text>
            <Text style={styles.detailValue}>
              {paymentTime}
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

          <TouchableOpacity style={styles.donationButton} onPress={handleViewDonations}>
            <History size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.donationButtonText}>查看捐款紀錄</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 分享 Modal */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeShareModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleOverlayPress}>
          <Animated.View
            onStartShouldSetResponder={() => true}
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
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#E4405F' },
                  ]}
                >
                  <Instagram size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Instagram 限時動態</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Instagram Messages')}
              >
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#E4405F' },
                  ]}
                >
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Instagram 訊息</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Threads')}
              >
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#000000' },
                  ]}
                >
                  <AtSign size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Threads</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('Line')}
              >
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#00B900' },
                  ]}
                >
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.shareOptionText}>Line</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleShareOption('More')}
              >
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#78716C' },
                  ]}
                >
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  donationButton: {
    flex: 2,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  donationButtonText: {
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
