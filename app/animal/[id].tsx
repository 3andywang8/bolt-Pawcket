import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Share2, MapPin, Clock, Gift, Chrome as Home, Phone, MessageCircle, CheckCircle, AlertCircle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import ANIMALS_DATA from '../(tabs)/datas';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';

const { width: screenWidth } = Dimensions.get('window');

// Mock animal data (same as in explore screen)

export default function AnimalProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { applications, canCancelApplication, cancelApplication } = useAdoption();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex] = useState(0);

  // Find animal by ID
  const animal = ANIMALS_DATA.find((a) => a.id === id);
  
  // Check if this animal has an active application (not cancelled)
  const existingApplication = applications.find(app => 
    app.animalId === id && app.status !== ApplicationStatus.CANCELLED
  );

  if (!animal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Animal not found</Text>
      </SafeAreaView>
    );
  }

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleFavorite = () => {
    console.log('handleFavorite function called!');
    triggerHapticFeedback();
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    Alert.alert('分享', `分享 ${animal.name} 的資訊`);
  };

  const handleDonation = () => {
    console.log('[DEBUG] handleDonation function called.'); // 監控點 1：確認函式被呼叫
    triggerHapticFeedback();
    
    if (animal?.type) {
      const targetPath = '/TreatSelectionScreen' as any;
      const params = { animalType: animal.type };
      
      console.log(`[DEBUG] Attempting to navigate to: ${targetPath} with params:`, params); // 監控點 2：確認跳轉參數
      
      try {
        router.push({
          pathname: targetPath,
          params: params,
        });
        console.log('[DEBUG] router.push command executed without error.'); // 監控點 3：確認指令執行完畢
      } catch (error) {
        console.error('[DEBUG] An error occurred during router.push:', error); // 監控點 4：捕捉跳轉時的錯誤
      }
    } else {
      console.error('[DEBUG] Navigation failed: Animal type is missing.');
      Alert.alert('錯誤', '無法確定動物類型');
    }
  };

  // const processDonation = (amount: number) => {
  //   // Simulate donation success
  //   Alert.alert(
  //     '感謝你的愛心！',
  //     `${animal.name} 正在享用你的愛心！\n捐款金額: NT$${amount}`,
  //     [{ text: '太棒了！', onPress: triggerHapticFeedback }]
  //   );
  // };

  const handleAdoptionInquiry = () => {
    console.log('handleAdoptionInquiry function called!');
    triggerHapticFeedback();
    
    if (existingApplication) {
      // 如果已有有效申請，跳轉到領養進度頁面
      router.push('/AdoptionProgressScreen');
    } else {
      // 如果沒有有效申請（包括從未申請或已取消），跳轉到領養流程頁面
      router.push({
        pathname: '/AdoptionProcessScreen',
        params: {
          animalId: animal.id,
          animalName: animal.name,
          animalType: animal.type,
          animalShelter: animal.shelter,
          animalShelterPhone: animal.shelterPhone,
        },
      });
    }
  };

  const handleCall = () => {
    Alert.alert('聯繫收容所', `撥打 ${animal.shelterPhone}`);
  };

  // 取得申請狀態資訊
  const getApplicationStatusInfo = () => {
    if (!existingApplication) return null;
    
    switch (existingApplication.status) {
      case ApplicationStatus.PENDING:
        return {
          text: '等待確認信中',
          icon: <Clock size={16} color="#F59E0B" />,
          bgColor: '#FEF3C7',
          textColor: '#F59E0B'
        };
      case ApplicationStatus.CONFIRMED:
        return {
          text: '已收到確認信',
          subtitle: '等待前往互動',
          icon: <CheckCircle size={16} color="#10B981" />,
          bgColor: '#D1FAE5',
          textColor: '#10B981'
        };
      case ApplicationStatus.REJECTED:
        return {
          text: '申請未通過',
          icon: <AlertCircle size={16} color="#EF4444" />,
          bgColor: '#FEE2E2',
          textColor: '#EF4444'
        };
      case ApplicationStatus.COMPLETED:
        return {
          text: '領養完成',
          icon: <Heart size={16} color="#8B5CF6" fill="#8B5CF6" />,
          bgColor: '#EDE9FE',
          textColor: '#8B5CF6'
        };
      default:
        return null;
    }
  };
  
  const statusInfo = getApplicationStatusInfo();
  
  // 處理取消申請
  const handleCancelApplication = () => {
    console.log('[DEBUG] handleCancelApplication called');
    console.log('[DEBUG] existingApplication:', existingApplication);
    
    if (!existingApplication) {
      console.log('[DEBUG] No existing application found');
      return;
    }
    
    const cancelCheck = canCancelApplication(existingApplication.id);
    console.log('[DEBUG] cancelCheck result:', cancelCheck);
    
    if (!cancelCheck.canCancel) {
      console.log('[DEBUG] Cannot cancel application:', cancelCheck.reason);
      Alert.alert('無法取消', cancelCheck.reason || '無法取消此申請');
      return;
    }
    
    // 顯示聲明和確認
    Alert.alert(
      '取消申請聲明',
      '同個使用者帳號最多只能取消3次，超過3次即會被加入黑名單，終身無法再透過APP申請領養，只能線上投餵。\n\n當預約時間少於24小時時，就不可透過APP取消申請，必須親自打電話聯繫收容所取消，同時也會被記錄起來，打電話取消也算在3次的額度裡面。\n\n是否願意遵守上述規定並取消此申請？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確認取消', 
          style: 'destructive',
          onPress: async () => {
            console.log('[DEBUG] User confirmed cancellation');
            const result = await cancelApplication(existingApplication.id, 'user');
            console.log('[DEBUG] Cancellation result:', result);
            
            if (result.success) {
              Alert.alert(
                '取消成功',
                result.message,
                [{
                  text: '確認',
                  onPress: () => router.push('/AdoptionProgressScreen')
                }]
              );
            } else {
              Alert.alert('取消失敗', result.message);
            }
          }
        }
      ]
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: animal.images[currentImageIndex] }}
            style={styles.heroImage}
          />
          
          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => router.back()}>
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            
            <View style={styles.rightControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleShare}>
                <Share2 size={20} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  isFavorited && styles.favoriteActive,
                ]}
                onPress={handleFavorite}>
                <Heart
                  size={20}
                  color="#FFFFFF"
                  fill={isFavorited ? '#FFFFFF' : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Image Indicator */}
          {animal.images.length > 1 && (
            <View style={styles.imageIndicator}>
              {animal.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    index === currentImageIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Basic Info */}
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.animalName}>{animal.name}</Text>
              <View style={styles.genderBadge}>
                <Text style={styles.genderText}>{animal.gender}</Text>
              </View>
            </View>
            
            <Text style={styles.breedAge}>{animal.breed} · {animal.age}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={16} color="#78716C" />
              <Text style={styles.locationText}>{animal.location}</Text>
              <Clock size={16} color="#78716C" style={{ marginLeft: 12 }} />
              <Text style={styles.locationText}>收容 {animal.shelterDays} 天</Text>
            </View>
          </View>

          {/* Application Status or Action Buttons */}
          {existingApplication ? (
            <View style={styles.statusSection}>
              <View style={[styles.statusCard, { backgroundColor: statusInfo?.bgColor }]}>
                <View style={styles.statusHeader}>
                  {statusInfo?.icon}
                  <Text style={[styles.statusMainText, { color: statusInfo?.textColor }]}>
                    {statusInfo?.text}
                  </Text>
                </View>
                {statusInfo?.subtitle && (
                  <Text style={[styles.statusSubtext, { color: statusInfo?.textColor }]}>
                    {statusInfo.subtitle}
                  </Text>
                )}
                <View style={styles.statusActions}>
                  <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() => router.push('/AdoptionProgressScreen')}
                  >
                    <Text style={styles.statusButtonText}>查看詳細進度</Text>
                  </TouchableOpacity>
                  
                  {existingApplication.status !== ApplicationStatus.COMPLETED && existingApplication.status !== ApplicationStatus.CANCELLED && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelApplication}
                    >
                      <X size={16} color="#EF4444" />
                      <Text style={styles.cancelButtonText}>取消申請</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.donationButton}
                onPress={handleDonation}>
                <Gift size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.donationButtonText}>線上投餵</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.adoptButton}
                onPress={handleAdoptionInquiry}>
                <Home size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.adoptButtonText}>我想了解領養</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Personality Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>個性特質</Text>
            <View style={styles.tagsContainer}>
              {animal.personality.map((trait, index) => (
                <View key={index} style={styles.personalityTag}>
                  <Text style={styles.personalityText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Story */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>我的故事</Text>
            <Text style={styles.storyText}>{animal.story}</Text>
          </View>

          {/* Health Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>健康狀況</Text>
            <View style={styles.healthContainer}>
              {animal.health.map((status, index) => (
                <View key={index} style={styles.healthItem}>
                  <View style={styles.healthDot} />
                  <Text style={styles.healthText}>{status}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Basic Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本資料</Text>
            <View style={styles.infoContainer}>
              <InfoRow label="體重" value={animal.weight} />
              <InfoRow label="性別" value={animal.gender} />
              <InfoRow label="品種" value={animal.breed} />
              <InfoRow label="年齡" value={animal.age} />
            </View>
          </View>

          {/* Adoption Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>領養條件</Text>
            <View style={styles.requirementsContainer}>
              {animal.adoptionRequirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.requirementDot} />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Shelter Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>收容單位</Text>
            <View style={styles.shelterInfo}>
              <Text style={styles.shelterName}>{animal.shelter}</Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleCall}>
                <Phone size={16} color="#F97316" />
                <Text style={styles.contactText}>聯絡電話</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.bottomDonationButton}
          onPress={handleDonation}>
          <Gift size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.bottomButtonText}>投餵</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.bottomAdoptButton}
          onPress={handleAdoptionInquiry}>
          {existingApplication ? (
            <>
              {statusInfo?.icon && React.cloneElement(statusInfo.icon, { size: 20, color: '#FFFFFF' })}
              <Text style={styles.bottomButtonText}>{statusInfo?.text}</Text>
            </>
          ) : (
            <>
              <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.bottomButtonText}>諮詢領養</Text>
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: screenWidth * 0.8,
    resizeMode: 'cover',
  },
  headerControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  favoriteActive: {
    backgroundColor: '#F97316',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    backgroundColor: '#FEFDFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  headerInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1917',
    marginRight: 12,
  },
  genderBadge: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  breedAge: {
    fontSize: 16,
    color: '#78716C',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#78716C',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statusSection: {
    marginBottom: 32,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusMainText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  statusButton: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  donationButton: {
    flex: 1,
    backgroundColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  donationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adoptButton: {
    flex: 2,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  adoptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  personalityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F97316',
  },
  storyText: {
    fontSize: 16,
    color: '#44403C',
    lineHeight: 24,
  },
  healthContainer: {
    gap: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  healthText: {
    fontSize: 14,
    color: '#44403C',
  },
  infoContainer: {
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  infoLabel: {
    fontSize: 14,
    color: '#78716C',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  requirementsContainer: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
    marginRight: 8,
    marginTop: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#44403C',
    flex: 1,
  },
  shelterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    padding: 16,
    borderRadius: 12,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
    gap: 12,
  },
  bottomDonationButton: {
    flex: 1,
    backgroundColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  bottomAdoptButton: {
    flex: 2,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  bottomButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});