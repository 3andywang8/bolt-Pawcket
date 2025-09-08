import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Phone, 
  MapPin,
  AlertCircle,
  Heart
} from 'lucide-react-native';
import { useAdoption, ApplicationStatus } from '@/contexts/AdoptionContext';

// 使用從 context 導入的類型

export default function AdoptionProgressScreen() {
  const router = useRouter();
  const { applications } = useAdoption();

  const getStatusInfo = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return {
          text: '等待確認信',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          icon: <Clock size={16} color="#F59E0B" />
        };
      case ApplicationStatus.CONFIRMED:
        return {
          text: '已收到確認信',
          color: '#10B981',
          bgColor: '#D1FAE5',
          icon: <CheckCircle size={16} color="#10B981" />
        };
      case ApplicationStatus.REJECTED:
        return {
          text: '申請未通過',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          icon: <AlertCircle size={16} color="#EF4444" />
        };
      case ApplicationStatus.COMPLETED:
        return {
          text: '領養完成',
          color: '#8B5CF6',
          bgColor: '#EDE9FE',
          icon: <Heart size={16} color="#8B5CF6" fill="#8B5CF6" />
        };
      default:
        return {
          text: '未知狀態',
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: <AlertCircle size={16} color="#6B7280" />
        };
    }
  };

  const handleContactShelter = (phone: string, shelter: string) => {
    Alert.alert(
      '聯絡收容所',
      `即將撥打 ${shelter}\n電話：${phone}`,
      [
        { text: '取消', style: 'cancel' },
        { text: '撥打', onPress: () => console.log(`撥打 ${phone}`) }
      ]
    );
  };

  const ApplicationCard = ({ application }: { application: any }) => {
    const statusInfo = getStatusInfo(application.status);
    const animalTypeText = application.animalType === 'cat' ? '貓咪' : '狗狗';

    return (
      <View style={styles.applicationCard}>
        {/* 申請標題 */}
        <View style={styles.cardHeader}>
          <View style={styles.animalInfo}>
            <Text style={styles.animalName}>{application.animalName}</Text>
            <Text style={styles.animalType}>{animalTypeText}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* 申請詳情 */}
        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#78716C" />
            <Text style={styles.detailLabel}>申請日期</Text>
            <Text style={styles.detailValue}>{application.applicationDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color="#78716C" />
            <Text style={styles.detailLabel}>收容所</Text>
            <Text style={styles.detailValue}>{application.shelter}</Text>
          </View>

          {application.appointmentDate && (
            <View style={styles.detailRow}>
              <Clock size={16} color="#78716C" />
              <Text style={styles.detailLabel}>預約時間</Text>
              <Text style={styles.detailValue}>
                {application.appointmentDate} {application.appointmentTime}
              </Text>
            </View>
          )}

          {application.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>備註</Text>
              <Text style={styles.notesText}>{application.notes}</Text>
            </View>
          )}
        </View>

        {/* 操作按鈕 */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactShelter(application.shelterPhone, application.shelter)}
          >
            <Phone size={16} color="#F97316" />
            <Text style={styles.contactButtonText}>聯絡收容所</Text>
          </TouchableOpacity>

          {application.status === ApplicationStatus.CONFIRMED && (
            <TouchableOpacity style={styles.appointmentButton}>
              <Calendar size={16} color="#FFFFFF" />
              <Text style={styles.appointmentButtonText}>查看預約</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>領養進度</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 統計概覽 */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>申請概覽</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{applications.length}</Text>
              <Text style={styles.summaryLabel}>總申請數</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {applications.filter(app => app.status === ApplicationStatus.PENDING).length}
              </Text>
              <Text style={styles.summaryLabel}>等待中</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {applications.filter(app => app.status === ApplicationStatus.COMPLETED).length}
              </Text>
              <Text style={styles.summaryLabel}>已完成</Text>
            </View>
          </View>
        </View>

        {/* 申請記錄列表 */}
        <View style={styles.applicationsSection}>
          <Text style={styles.sectionTitle}>申請記錄</Text>
          {applications.length > 0 ? (
            applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Heart size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>尚無申請記錄</Text>
              <Text style={styles.emptyText}>
                當您提交領養申請後，相關進度將會顯示在這裡
              </Text>
            </View>
          )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1917',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summarySection: {
    marginTop: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#78716C',
    textAlign: 'center',
  },
  applicationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 2,
  },
  animalType: {
    fontSize: 14,
    color: '#78716C',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#78716C',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1917',
    flex: 2,
  },
  notesSection: {
    backgroundColor: '#F5F5F4',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#78716C',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F97316',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F97316',
  },
  appointmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F97316',
    gap: 6,
  },
  appointmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
});