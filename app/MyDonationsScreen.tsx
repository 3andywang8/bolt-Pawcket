import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, DollarSign, Home } from 'lucide-react-native';
import { useDonations, DonationRecord } from '@/contexts/DonationContext';

// 支付方式圖標映射
const PAYMENT_ICONS: Record<string, any> = {
  'apple-pay': require('../assets/applepay.png'),
  'line-pay': require('../assets/linepay.png'),
  'credit-card': '💳',
};

// 支付方式名稱映射
const PAYMENT_NAMES: Record<string, string> = {
  'apple-pay': 'Apple Pay',
  'line-pay': 'LINE Pay',
  'credit-card': '信用卡',
};

// 移除舊的表情符號映射，改用真實圖片

type FilterType = 'all' | 'dog' | 'cat';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle,
  color = '#F97316' 
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const DonationCard = ({ donation, getTreatData }: { donation: DonationRecord; getTreatData: (treatId: string) => any }) => {
  const treatData = getTreatData(donation.treatId);
  
  return (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <View style={styles.donationLeft}>
          <View style={styles.treatImageContainer}>
            {treatData?.image ? (
              <Image source={treatData.image} style={styles.treatImage} />
            ) : (
              <View style={styles.treatPlaceholder}>
                <Text style={styles.treatPlaceholderText}>🎁</Text>
              </View>
            )}
          </View>
          <View style={styles.donationInfo}>
            <Text style={styles.treatName}>{donation.treatName}</Text>
            <Text style={styles.animalInfo}>
              {donation.animalType === 'dog' ? '🐕' : '🐱'} {donation.animalName || '愛心動物'}
            </Text>
            {donation.shelterName && (
              <Text style={styles.shelterName}>{donation.shelterName}</Text>
            )}
          </View>
        </View>
        <View style={styles.donationRight}>
          <Text style={styles.donationAmount}>NT$ {donation.price}</Text>
          <Text style={styles.donationDate}>{donation.donationDate}</Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentIconContainer}>
              {typeof PAYMENT_ICONS[donation.paymentMethod] === 'string' ? (
                <Text style={styles.paymentIcon}>
                  {PAYMENT_ICONS[donation.paymentMethod] || '💳'}
                </Text>
              ) : (
                <Image 
                  source={PAYMENT_ICONS[donation.paymentMethod]} 
                  style={styles.paymentIconImage}
                  resizeMode="contain"
                />
              )}
            </View>
            <Text style={styles.paymentMethod}>
              {PAYMENT_NAMES[donation.paymentMethod] || donation.paymentMethod}
            </Text>
          </View>
        </View>
      </View>
    
    <View style={styles.donationFooter}>
      <View style={[styles.statusBadge, styles.completedBadge]}>
        <Text style={styles.statusText}>已完成</Text>
      </View>
      {donation.transactionId && (
        <Text style={styles.transactionId}>交易編號：{donation.transactionId}</Text>
      )}
    </View>
  </View>
  );
};

export default function MyDonationsScreen() {
  const router = useRouter();
  const { donations, getTotalDonations, getTotalAmount, getDonationsByAnimalType, getTreatData } = useDonations();
  const [filter, setFilter] = useState<FilterType>('all');

  const handleBackToHome = () => {
    router.push('/(tabs)');
  };

  // 根據過濾器獲取捐款記錄
  const getFilteredDonations = () => {
    switch (filter) {
      case 'dog':
        return getDonationsByAnimalType('dog');
      case 'cat':
        return getDonationsByAnimalType('cat');
      default:
        return donations.filter(d => d.status === 'completed');
    }
  };

  const filteredDonations = getFilteredDonations();
  const totalDonations = getTotalDonations();
  const totalAmount = getTotalAmount();
  const dogDonations = getDonationsByAnimalType('dog').length;
  const catDonations = getDonationsByAnimalType('cat').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的捐款</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 感謝訊息 */}
        <View style={styles.gratitudeCard}>
          <Text style={styles.gratitudeTitle}>謝謝你的愛心 💝</Text>
          <Text style={styles.gratitudeText}>
            每一份零食都承載著你對毛孩的關愛，讓收容所的動物們感受到溫暖與希望。
          </Text>
        </View>

        {/* 統計卡片 */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Trophy size={24} color="#F97316" />}
            title="總捐款次數"
            value={totalDonations.toString()}
            subtitle="次投餵"
            color="#F97316"
          />
          <StatCard
            icon={<DollarSign size={24} color="#10B981" />}
            title="總捐款金額"
            value={`NT$ ${totalAmount}`}
            color="#10B981"
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon={<Text style={{fontSize: 20}}>🐕</Text>}
            title="狗狗零食"
            value={dogDonations.toString()}
            subtitle="次投餵"
            color="#F59E0B"
          />
          <StatCard
            icon={<Text style={{fontSize: 20}}>🐱</Text>}
            title="貓咪零食"
            value={catDonations.toString()}
            subtitle="次投餵"
            color="#8B5CF6"
          />
        </View>

        {/* 過濾器 */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>捐款記錄</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
              onPress={() => setFilter('all')}>
              <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
                全部
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'dog' && styles.activeFilterButton]}
              onPress={() => setFilter('dog')}>
              <Text style={[styles.filterButtonText, filter === 'dog' && styles.activeFilterButtonText]}>
                🐕 狗狗
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'cat' && styles.activeFilterButton]}
              onPress={() => setFilter('cat')}>
              <Text style={[styles.filterButtonText, filter === 'cat' && styles.activeFilterButtonText]}>
                🐱 貓咪
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 捐款記錄列表 */}
        <View style={styles.donationsContainer}>
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} getTreatData={getTreatData} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyTitle}>還沒有捐款記錄</Text>
              <Text style={styles.emptyText}>
                開始你的第一次愛心投餵，為毛孩們帶來美味零食吧！
              </Text>
            </View>
          )}
        </View>

        {/* 返回首頁按鈕 */}
        <View style={styles.homeButtonContainer}>
          <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
            <Home size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.homeButtonText}>返回首頁</Text>
          </TouchableOpacity>
        </View>

        {/* 底部間距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  gratitudeCard: {
    backgroundColor: '#FFF7ED',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  gratitudeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  gratitudeText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '500',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#A8A29E',
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  activeFilterButton: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#44403C',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  donationsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5F5F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  donationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  treatImageContainer: {
    width: 64,
    height: 64,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F4',
  },
  treatImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  treatPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  treatPlaceholderText: {
    fontSize: 24,
  },
  donationInfo: {
    flex: 1,
  },
  treatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 4,
  },
  animalInfo: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 12,
    color: '#A8A29E',
  },
  donationRight: {
    alignItems: 'flex-end',
  },
  donationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 4,
  },
  donationDate: {
    fontSize: 12,
    color: '#78716C',
  },
  donationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentIconContainer: {
    marginRight: 6,
  },
  paymentIcon: {
    fontSize: 16,
  },
  paymentIconImage: {
    width: 16,
    height: 16,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#44403C',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  transactionId: {
    fontSize: 11,
    color: '#A8A29E',
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  homeButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  homeButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});