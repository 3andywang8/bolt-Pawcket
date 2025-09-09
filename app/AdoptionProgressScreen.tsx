import React, { useState, useMemo } from 'react';
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

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function AdoptionProgressScreen() {
  const router = useRouter();
  const { applications } = useAdoption();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const itemsPerPage = 5;

  // 根據篩選條件過濾申請記錄
  const filteredApplications = useMemo(() => {
    switch (selectedFilter) {
      case 'pending':
        return applications.filter(app => app.status === ApplicationStatus.PENDING);
      case 'confirmed':
        return applications.filter(app => app.status === ApplicationStatus.CONFIRMED);
      case 'completed':
        return applications.filter(app => app.status === ApplicationStatus.COMPLETED);
      case 'cancelled':
        return applications.filter(app => app.status === ApplicationStatus.CANCELLED);
      default:
        return applications;
    }
  }, [applications, selectedFilter]);

  // 計算分頁資料
  const { totalPages, paginatedApplications, startIndex, endIndex } = useMemo(() => {
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
    
    return { totalPages, paginatedApplications, startIndex, endIndex };
  }, [filteredApplications, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    setCurrentPage(1); // 切換篩選時重設到第一頁
  };

  // 計算各狀態的數量
  const statusCounts = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === ApplicationStatus.PENDING).length,
      confirmed: applications.filter(app => app.status === ApplicationStatus.CONFIRMED).length,
      completed: applications.filter(app => app.status === ApplicationStatus.COMPLETED).length,
      cancelled: applications.filter(app => app.status === ApplicationStatus.CANCELLED).length
    };
  }, [applications]);

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
      case ApplicationStatus.CANCELLED:
        return {
          text: '已取消',
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: <AlertCircle size={16} color="#6B7280" />
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

          {application.status !== ApplicationStatus.COMPLETED && (
            <TouchableOpacity 
              style={styles.appointmentButton}
              onPress={() => router.push(`/animal/${application.animalId}`)}
            >
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
        {/* 統計概覽 - 改為篩選按鈕 */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>申請概覽</Text>
          <View style={styles.summaryCards}>
            <TouchableOpacity
              style={[
                styles.summaryCard,
                selectedFilter === 'all' && styles.activeSummaryCard
              ]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[
                styles.summaryNumber,
                selectedFilter === 'all' && styles.activeSummaryNumber
              ]}>
                {statusCounts.total}
              </Text>
              <Text style={[
                styles.summaryLabel,
                selectedFilter === 'all' && styles.activeSummaryLabel
              ]}>總申請數</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.summaryCard,
                selectedFilter === 'pending' && styles.activeSummaryCard
              ]}
              onPress={() => handleFilterChange('pending')}
            >
              <Text style={[
                styles.summaryNumber,
                selectedFilter === 'pending' && styles.activeSummaryNumber
              ]}>
                {statusCounts.pending}
              </Text>
              <Text style={[
                styles.summaryLabel,
                selectedFilter === 'pending' && styles.activeSummaryLabel
              ]}>等待中</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.summaryCard,
                selectedFilter === 'confirmed' && styles.activeSummaryCard
              ]}
              onPress={() => handleFilterChange('confirmed')}
            >
              <Text style={[
                styles.summaryNumber,
                selectedFilter === 'confirmed' && styles.activeSummaryNumber
              ]}>
                {statusCounts.confirmed}
              </Text>
              <Text style={[
                styles.summaryLabel,
                selectedFilter === 'confirmed' && styles.activeSummaryLabel
              ]}>待前往</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.summaryCard,
                selectedFilter === 'completed' && styles.activeSummaryCard
              ]}
              onPress={() => handleFilterChange('completed')}
            >
              <Text style={[
                styles.summaryNumber,
                selectedFilter === 'completed' && styles.activeSummaryNumber
              ]}>
                {statusCounts.completed}
              </Text>
              <Text style={[
                styles.summaryLabel,
                selectedFilter === 'completed' && styles.activeSummaryLabel
              ]}>已完成</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.summaryCard,
                selectedFilter === 'cancelled' && styles.activeSummaryCard
              ]}
              onPress={() => handleFilterChange('cancelled')}
            >
              <Text style={[
                styles.summaryNumber,
                selectedFilter === 'cancelled' && styles.activeSummaryNumber
              ]}>
                {statusCounts.cancelled}
              </Text>
              <Text style={[
                styles.summaryLabel,
                selectedFilter === 'cancelled' && styles.activeSummaryLabel
              ]}>已取消</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 申請記錄列表 */}
        <View style={styles.applicationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>申請記錄</Text>
            {filteredApplications.length > 0 && (
              <Text style={styles.recordCount}>
                顯示第 {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} 筆，共 {filteredApplications.length} 筆
              </Text>
            )}
          </View>
          {filteredApplications.length > 0 ? (
            paginatedApplications.map((application) => (
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
          
          {/* 分頁導航 */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <TouchableOpacity
                    key={page}
                    style={[
                      styles.pageButton,
                      currentPage === page && styles.activePageButton
                    ]}
                    onPress={() => handlePageChange(page)}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        currentPage === page && styles.activePageButtonText
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  activeSummaryCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOpacity: 0.2,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 4,
  },
  activeSummaryNumber: {
    color: '#EA580C',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#78716C',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeSummaryLabel: {
    color: '#EA580C',
    fontWeight: '600',
  },
  applicationsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  recordCount: {
    fontSize: 12,
    color: '#78716C',
    fontWeight: '500',
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  pageButton: {
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activePageButton: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activePageButtonText: {
    color: '#FFFFFF',
  },
});