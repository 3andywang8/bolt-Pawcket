import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Heart, Gift, Chrome as Home, Award, Settings, ChevronRight, Bell, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDonations } from '@/contexts/DonationContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

const ProfileItem = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}) => (
  <TouchableOpacity style={styles.profileItem} onPress={onPress}>
    <View style={styles.profileItemLeft}>
      <View style={styles.iconContainer}>
        <Icon size={20} color="#F97316" strokeWidth={2} />
      </View>
      <View style={styles.profileItemText}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.profileItemRight}>
      {value && <Text style={styles.profileItemValue}>{value}</Text>}
      {showChevron && <ChevronRight size={16} color="#78716C" />}
    </View>
  </TouchableOpacity>
);

const StatsCard = ({
  number,
  label,
  color = '#F97316',
}: {
  number: string;
  label: string;
  color?: string;
}) => (
  <View style={styles.statsCard}>
    <Text style={[styles.statsNumber, { color }]}>{number}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { applications } = useAdoption();
  const { favorites } = useFavorites();
  const { getTotalDonations, getTotalAmount } = useDonations();
  const { profile } = useUserProfile();

  // 計算統計數據
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    app.status === ApplicationStatus.PENDING || 
    app.status === ApplicationStatus.CONFIRMED
  ).length;
  const favoritesCount = favorites.length;
  const totalDonations = getTotalDonations();
  const totalDonationAmount = getTotalAmount();

  const handleItemPress = (item: string) => {
    console.log(`Pressed: ${item}`);
    switch (item) {
      case 'adoptions':
        router.push('/AdoptionProgressScreen');
        break;
      case 'donations':
        router.push('/MyDonationsScreen');
        break;
      case 'favorites':
        router.push('/FavoritesScreen');
        break;
      case 'profile-settings':
        router.push('/ProfileSettingsScreen');
        break;
      default:
        console.log(`Navigation for ${item} not implemented yet`);
        break;
    }
  };

  const handleEditProfile = () => {
    router.push('/ProfileSettingsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => handleItemPress('settings')}>
          <Settings size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              typeof profile.avatar === 'string' && profile.avatar.startsWith('http') ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : typeof profile.avatar === 'string' && profile.avatar.endsWith('.png') ? (
                <Image 
                  source={require('../../assets/lezu.png')} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : typeof profile.avatar === 'number' ? (
                <Image 
                  source={profile.avatar} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
              )
            ) : (
              <User size={32} color="#F97316" strokeWidth={2} />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.nickname || '愛心使用者'}</Text>
            <Text style={styles.userSubtitle}>
              已加入 Pawcket {Math.ceil((new Date().getTime() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24))} 天
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>編輯</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatsCard number={favoritesCount.toString()} label="已收藏" color="#F97316" />
          <StatsCard number={totalDonations.toString()} label="已捐款" color="#FBBF24" />
          <StatsCard number={pendingApplications.toString()} label="諮詢中" color="#10B981" />
        </View>

        {/* My Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>我的活動</Text>
          
          <ProfileItem
            icon={Heart}
            title="我的收藏"
            subtitle="查看收藏的毛孩"
            value={favoritesCount.toString()}
            onPress={() => handleItemPress('favorites')}
          />
          
          <ProfileItem
            icon={Gift}
            title="我的捐款"
            subtitle="捐款紀錄與證明"
            value={`NT$${totalDonationAmount}`}
            onPress={() => handleItemPress('donations')}
          />
          
          <ProfileItem
            icon={Home}
            title="領養進度"
            subtitle="追蹤領養狀況"
            value={`${totalApplications}個`}
            onPress={() => handleItemPress('adoptions')}
          />
          
          <ProfileItem
            icon={Award}
            title="成就牆"
            subtitle="我的愛心徽章"
            onPress={() => handleItemPress('achievements')}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>設定與偏好</Text>
          
          <ProfileItem
            icon={Bell}
            title="通知設定"
            subtitle="管理推播通知"
            onPress={() => handleItemPress('notifications')}
          />
          
          <ProfileItem
            icon={HelpCircle}
            title="幫助與支援"
            subtitle="常見問題與客服"
            onPress={() => handleItemPress('help')}
          />
        </View>

        {/* Love Message */}
        <View style={styles.loveMessage}>
          <Text style={styles.loveTitle}>感謝你的愛心 💝</Text>
          <Text style={styles.loveText}>
            每一次滑動、每一筆捐款，都是給毛孩們最溫暖的擁抱。
            因為有你，讓更多生命找到了家的方向。
          </Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#78716C',
  },
  editButton: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  profileItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 2,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemValue: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
    marginRight: 8,
  },
  loveMessage: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  loveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  loveText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
    textAlign: 'center',
  },
});