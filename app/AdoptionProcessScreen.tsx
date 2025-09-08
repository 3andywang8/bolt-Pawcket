import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, CheckCircle, Calendar, Phone, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// 領養流程的四個步驟
enum AdoptionStep {
  GUIDELINES = 'guidelines',
  FORM = 'form',
  SUBMITTED = 'submitted',
  SUCCESS = 'success',
}

export default function AdoptionProcessScreen() {
  const router = useRouter();
  const { animalId, animalName, animalType, animalShelter, animalShelterPhone } = useLocalSearchParams();
  
  const [currentStep, setCurrentStep] = useState<AdoptionStep>(AdoptionStep.GUIDELINES);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    isFirstTime: '',
    petCount: '',
    livingSpace: '',
    familyMembers: '',
    workSchedule: '',
    appointmentDate: '',
    appointmentTime: '',
    shelter: '',
  });

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBack = () => {
    if (currentStep === AdoptionStep.GUIDELINES) {
      router.back();
    } else if (currentStep === AdoptionStep.FORM) {
      setCurrentStep(AdoptionStep.GUIDELINES);
    } else if (currentStep === AdoptionStep.SUBMITTED) {
      router.push('/(tabs)');
    } else {
      router.push('/(tabs)');
    }
  };

  const handleNextStep = () => {
    triggerHapticFeedback();
    if (currentStep === AdoptionStep.GUIDELINES) {
      setCurrentStep(AdoptionStep.FORM);
    } else if (currentStep === AdoptionStep.FORM) {
      // 無條件提交申請，不進行表單驗證
      setCurrentStep(AdoptionStep.SUBMITTED);
    }
  };

  const validateForm = () => {
    const { name, phone, email, isFirstTime, appointmentDate, appointmentTime } = formData;
    
    if (!name.trim()) {
      Alert.alert('請填寫姓名');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('請填寫電話號碼');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('請填寫電子郵件');
      return false;
    }
    if (!isFirstTime) {
      Alert.alert('請選擇是否為第一次飼養');
      return false;
    }
    if (!appointmentDate) {
      Alert.alert('請選擇預約日期');
      return false;
    }
    if (!appointmentTime) {
      Alert.alert('請選擇預約時間');
      return false;
    }
    
    return true;
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === AdoptionStep.GUIDELINES && '領養須知'}
          {currentStep === AdoptionStep.FORM && '領養申請'}
          {currentStep === AdoptionStep.SUBMITTED && '申請已提交'}
          {currentStep === AdoptionStep.SUCCESS && '預約成功'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            {
              width: currentStep === AdoptionStep.GUIDELINES ? '33%' :
                     currentStep === AdoptionStep.FORM ? '66%' : '100%'
            }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep === AdoptionStep.GUIDELINES && '步驟 1/3'}
          {currentStep === AdoptionStep.FORM && '步驟 2/3'}
          {currentStep === AdoptionStep.SUBMITTED && '完成'}
          {currentStep === AdoptionStep.SUCCESS && '完成'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === AdoptionStep.GUIDELINES && (
          <GuidelinesStep animalName={animalName as string} animalType={animalType as string} />
        )}
        
        {currentStep === AdoptionStep.FORM && (
          <FormStep 
            formData={formData} 
            updateFormData={updateFormData}
            animalName={animalName as string}
            animalShelter={animalShelter as string}
            animalShelterPhone={animalShelterPhone as string}
          />
        )}
        
        {currentStep === AdoptionStep.SUBMITTED && (
          <SubmittedStep 
            animalName={animalName as string}
            animalType={animalType as string}
          />
        )}
        
        {currentStep === AdoptionStep.SUCCESS && (
          <SuccessStep 
            formData={formData}
            animalName={animalName as string}
            animalShelter={animalShelter as string}
            animalShelterPhone={animalShelterPhone as string}
          />
        )}
      </ScrollView>

      {/* Bottom Button */}
      {currentStep !== AdoptionStep.SUCCESS && currentStep !== AdoptionStep.SUBMITTED && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === AdoptionStep.GUIDELINES ? '我已詳讀並同意' : '提交申請'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// 領養須知步驟
const GuidelinesStep = ({ animalName, animalType }: { animalName: string; animalType: string }) => {
  const animalTypeText = animalType === 'cat' ? '貓咪' : '狗狗';
  
  return (
    <View style={styles.stepContainer}>
      <View style={styles.welcomeSection}>
        <Heart size={32} color="#F97316" fill="#F97316" />
        <Text style={styles.welcomeTitle}>感謝您考慮領養 {animalName}</Text>
        <Text style={styles.welcomeSubtitle}>
          領養是一生的承諾，讓我們一起為 {animalName} 創造幸福的未來
        </Text>
      </View>

      <View style={styles.guidelinesSection}>
        <Text style={styles.sectionTitle}>領養前須知</Text>
        
        <View style={styles.guidelineItem}>
          <CheckCircle size={20} color="#10B981" />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>終生承諾</Text>
            <Text style={styles.guidelineText}>
              {animalTypeText}的平均壽命為 12-18 年，請確保您有能力照顧牠一輩子
            </Text>
          </View>
        </View>

        <View style={styles.guidelineItem}>
          <CheckCircle size={20} color="#10B981" />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>經濟能力</Text>
            <Text style={styles.guidelineText}>
              每月基本開銷約 NT$2,000-5,000，包含飼料、醫療、用品等費用
            </Text>
          </View>
        </View>

        <View style={styles.guidelineItem}>
          <CheckCircle size={20} color="#10B981" />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>居住環境</Text>
            <Text style={styles.guidelineText}>
              需要安全、舒適的居住空間，並確保家人都同意養寵物
            </Text>
          </View>
        </View>

        <View style={styles.guidelineItem}>
          <CheckCircle size={20} color="#10B981" />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>時間陪伴</Text>
            <Text style={styles.guidelineText}>
              每天需要足夠時間陪伴、餵食、清潔，{animalTypeText}需要您的關愛
            </Text>
          </View>
        </View>

        <View style={styles.guidelineItem}>
          <CheckCircle size={20} color="#10B981" />
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>醫療照護</Text>
            <Text style={styles.guidelineText}>
              定期健康檢查、疫苗接種、結紮等醫療照護不可缺少
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.responsibilitySection}>
        <Text style={styles.responsibilityTitle}>領養責任聲明</Text>
        <Text style={styles.responsibilityText}>
          我承諾將以愛心、耐心照顧 {animalName}，提供適當的居住環境、營養飲食、醫療照護，
          並承諾不棄養、不轉讓，讓 {animalName} 在愛的環境中度過幸福的一生。
        </Text>
      </View>
    </View>
  );
};

// 表單填寫步驟
const FormStep = ({ 
  formData, 
  updateFormData, 
  animalName,
  animalShelter,
  animalShelterPhone
}: { 
  formData: any; 
  updateFormData: (field: string, value: string) => void;
  animalName: string;
  animalShelter: string;
  animalShelterPhone: string;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const shelters = [
    { name: '台北市動物之家', phone: '02-8791-3254' },
    { name: '新北市板橋動物之家', phone: '02-2959-6353' },
    { name: '桃園市動物保護教育園區', phone: '03-4861760' },
    { name: '台中市動物之家南屯園區', phone: '04-23850949' },
  ];

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      updateFormData('appointmentDate', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getMaximumDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 最多可預約30天後
    return maxDate;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.formTitle}>領養申請表單</Text>
      <Text style={styles.formSubtitle}>請填寫以下資訊，我們將為您安排與 {animalName} 的見面</Text>

      {/* 基本資料 */}
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>基本資料</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>姓名 *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="請輸入您的姓名"
            placeholderTextColor="#A8A29E"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>電話號碼 *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="請輸入聯絡電話"
            placeholderTextColor="#A8A29E"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>電子郵件 *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="請輸入電子郵件"
            placeholderTextColor="#A8A29E"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* 飼養經驗 */}
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>飼養經驗</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>是否為第一次飼養寵物？ *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioOption, formData.isFirstTime === 'yes' && styles.radioSelected]}
              onPress={() => updateFormData('isFirstTime', 'yes')}
            >
              <Text style={[styles.radioText, formData.isFirstTime === 'yes' && styles.radioTextSelected]}>
                是，第一次飼養
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioOption, formData.isFirstTime === 'no' && styles.radioSelected]}
              onPress={() => updateFormData('isFirstTime', 'no')}
            >
              <Text style={[styles.radioText, formData.isFirstTime === 'no' && styles.radioTextSelected]}>
                不是，有飼養經驗
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>目前飼養寵物數量</Text>
          <TextInput
            style={styles.textInput}
            value={formData.petCount}
            onChangeText={(value) => updateFormData('petCount', value)}
            placeholder="例如：2隻貓、1隻狗"
            placeholderTextColor="#A8A29E"
          />
        </View>
      </View>

      {/* 居住環境 */}
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>居住環境</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>居住空間類型</Text>
          <TextInput
            style={styles.textInput}
            value={formData.livingSpace}
            onChangeText={(value) => updateFormData('livingSpace', value)}
            placeholder="例如：公寓、透天厝、有院子"
            placeholderTextColor="#A8A29E"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>家庭成員狀況</Text>
          <TextInput
            style={styles.textInput}
            value={formData.familyMembers}
            onChangeText={(value) => updateFormData('familyMembers', value)}
            placeholder="例如：夫妻二人、有小孩、與父母同住"
            placeholderTextColor="#A8A29E"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>工作時間安排</Text>
          <TextInput
            style={styles.textInput}
            value={formData.workSchedule}
            onChangeText={(value) => updateFormData('workSchedule', value)}
            placeholder="例如：朝九晚五、在家工作、輪班"
            placeholderTextColor="#A8A29E"
          />
        </View>
      </View>

      {/* 預約時間 */}
      <View style={styles.formSection}>
        <Text style={styles.formSectionTitle}>預約參訪時間</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>希望參訪日期 *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={showDatePickerModal}
          >
            <Calendar size={20} color="#78716C" />
            <Text style={[styles.dateText, !formData.appointmentDate && styles.placeholderText]}>
              {formData.appointmentDate || '請選擇日期'}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={getMinimumDate()}
              maximumDate={getMaximumDate()}
              locale="zh-TW"
            />
          )}
          
          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                onPress={() => {
                  setShowDatePicker(false);
                  const formattedDate = selectedDate.toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  });
                  updateFormData('appointmentDate', formattedDate);
                }}
              >
                <Text style={[styles.datePickerButtonText, styles.datePickerConfirmButtonText]}>確認</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>希望參訪時間 *</Text>
          <View style={styles.timeSlots}>
            {['上午 9:00-12:00', '下午 14:00-17:00', '假日 10:00-16:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeSlot, formData.appointmentTime === time && styles.timeSlotSelected]}
                onPress={() => updateFormData('appointmentTime', time)}
              >
                <Text style={[styles.timeText, formData.appointmentTime === time && styles.timeTextSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>參訪收容所</Text>
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>{animalShelter || '收容所資訊'}</Text>
            <Text style={styles.shelterPhone}>{animalShelterPhone || '聯絡電話'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 申請已提交步驟
const SubmittedStep = ({ 
  animalName, 
  animalType 
}: { 
  animalName: string; 
  animalType: string;
}) => {
  const router = useRouter();
  const animalTypeText = animalType === 'cat' ? '貓咪' : '狗狗';

  return (
    <View style={styles.stepContainer}>
      <View style={styles.successHeader}>
        <CheckCircle size={64} color="#10B981" />
        <Text style={styles.successTitle}>申請已提交！</Text>
        <Text style={styles.successSubtitle}>
          感謝您的申請，我們已收到您對 {animalName} 的領養申請
        </Text>
      </View>

      <View style={styles.submittedCard}>
        <Text style={styles.submittedTitle}>後續流程說明</Text>
        
        <View style={styles.submittedContent}>
          <Text style={styles.submittedText}>
            收容所已收到申請，請靜候 Email 通知，收到確認信後，即表示申請成功，即可於申請日期前往探望{animalTypeText}，並完成領養作業。
          </Text>
          
          <View style={styles.submittedSteps}>
            <View style={styles.submittedStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>等待收容所審核申請資料</Text>
            </View>
            
            <View style={styles.submittedStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>收到 Email 確認信通知</Text>
            </View>
            
            <View style={styles.submittedStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>按預約時間前往收容所</Text>
            </View>
            
            <View style={styles.submittedStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>與 {animalName} 見面並完成領養</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.reminderSection}>
        <Text style={styles.reminderTitle}>溫馨提醒</Text>
        <View style={styles.reminderList}>
          <Text style={styles.reminderItem}>• 請留意您的電子郵件，確認信將在 1-3 個工作天內寄出</Text>
          <Text style={styles.reminderItem}>• 如超過一週未收到回覆，請主動聯絡收容所</Text>
          <Text style={styles.reminderItem}>• 領養是一生的承諾，請再次確認您的決定</Text>
          <Text style={styles.reminderItem}>• 感謝您給 {animalName} 一個溫暖的家</Text>
        </View>
      </View>

      <View style={styles.submittedActions}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>回到首頁</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 預約成功步驟
const SuccessStep = ({ 
  formData, 
  animalName,
  animalShelter,
  animalShelterPhone
}: { 
  formData: any; 
  animalName: string;
  animalShelter: string;
  animalShelterPhone: string;
}) => {
  const router = useRouter();

  return (
    <View style={styles.stepContainer}>
      <View style={styles.successHeader}>
        <CheckCircle size={64} color="#10B981" />
        <Text style={styles.successTitle}>預約成功！</Text>
        <Text style={styles.successSubtitle}>
          感謝您的申請，我們已為您安排與 {animalName} 的見面時間
        </Text>
      </View>

      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentTitle}>預約資訊</Text>
        
        <View style={styles.appointmentDetail}>
          <Calendar size={20} color="#F97316" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>參訪日期</Text>
            <Text style={styles.appointmentValue}>{formData.appointmentDate}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetail}>
          <Calendar size={20} color="#F97316" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>參訪時間</Text>
            <Text style={styles.appointmentValue}>{formData.appointmentTime}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetail}>
          <MapPin size={20} color="#F97316" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>收容所</Text>
            <Text style={styles.appointmentValue}>{animalShelter}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetail}>
          <Phone size={20} color="#F97316" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>聯絡電話</Text>
            <Text style={styles.appointmentValue}>{animalShelterPhone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.reminderSection}>
        <Text style={styles.reminderTitle}>溫馨提醒</Text>
        <View style={styles.reminderList}>
          <Text style={styles.reminderItem}>• 請準時到達收容所，並攜帶身分證件</Text>
          <Text style={styles.reminderItem}>• 建議穿著輕便服裝，方便與動物互動</Text>
          <Text style={styles.reminderItem}>• 如需改期，請提前致電收容所</Text>
          <Text style={styles.reminderItem}>• 領養前請再次確認您的決定</Text>
        </View>
      </View>

      <View style={styles.successActions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            Alert.alert('撥打電話', `即將撥打 ${animalShelterPhone}`);
          }}
        >
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.callButtonText}>聯絡收容所</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>回到首頁</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEFDFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F4' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1917' },
  placeholder: { width: 40 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  progressBar: { height: 4, backgroundColor: '#F5F5F4', borderRadius: 2, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#F97316', borderRadius: 2 },
  progressText: { fontSize: 14, color: '#78716C', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  stepContainer: { paddingBottom: 20 },
  welcomeSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#1C1917', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: '#78716C', textAlign: 'center', lineHeight: 24 },
  guidelinesSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1917', marginBottom: 16 },
  guidelineItem: { flexDirection: 'row', marginBottom: 16, paddingRight: 16 },
  guidelineContent: { flex: 1, marginLeft: 12 },
  guidelineTitle: { fontSize: 16, fontWeight: '600', color: '#1C1917', marginBottom: 4 },
  guidelineText: { fontSize: 14, color: '#44403C', lineHeight: 20 },
  responsibilitySection: { backgroundColor: '#FFF7ED', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#F97316' },
  responsibilityTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1917', marginBottom: 12 },
  responsibilityText: { fontSize: 14, color: '#44403C', lineHeight: 22 },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#1C1917', marginBottom: 8 },
  formSubtitle: { fontSize: 16, color: '#78716C', marginBottom: 24, lineHeight: 24 },
  formSection: { marginBottom: 24 },
  formSectionTitle: { fontSize: 18, fontWeight: '600', color: '#1C1917', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#1C1917', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1C1917', backgroundColor: '#FFFFFF' },
  radioGroup: { gap: 8 },
  radioOption: { borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  radioSelected: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  radioText: { fontSize: 16, color: '#44403C' },
  radioTextSelected: { color: '#F97316', fontWeight: '500' },
  dateInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', gap: 8 },
  dateText: { fontSize: 16, color: '#1C1917' },
  placeholderText: { color: '#A8A29E' },
  timeSlots: { gap: 8 },
  timeSlot: { borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  timeSlotSelected: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  timeText: { fontSize: 16, color: '#44403C', textAlign: 'center' },
  timeTextSelected: { color: '#F97316', fontWeight: '500' },
  shelterList: { gap: 8 },
  shelterOption: { borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, padding: 16, backgroundColor: '#FFFFFF' },
  shelterSelected: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  shelterName: { fontSize: 16, fontWeight: '500', color: '#1C1917', marginBottom: 4 },
  shelterNameSelected: { color: '#F97316' },
  shelterPhone: { fontSize: 14, color: '#78716C' },
  shelterInfo: { backgroundColor: '#F5F5F4', borderRadius: 8, padding: 16 },
  successHeader: { alignItems: 'center', paddingVertical: 32, marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: '#1C1917', marginTop: 16, marginBottom: 8 },
  successSubtitle: { fontSize: 16, color: '#78716C', textAlign: 'center', lineHeight: 24 },
  appointmentCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  appointmentTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1917', marginBottom: 16 },
  appointmentDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  appointmentInfo: { marginLeft: 12, flex: 1 },
  appointmentLabel: { fontSize: 14, color: '#78716C', marginBottom: 2 },
  appointmentValue: { fontSize: 16, fontWeight: '500', color: '#1C1917' },
  reminderSection: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 20, marginBottom: 24 },
  reminderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1917', marginBottom: 12 },
  reminderList: { gap: 8 },
  reminderItem: { fontSize: 14, color: '#44403C', lineHeight: 20 },
  successActions: { gap: 12 },
  callButton: { backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8 },
  callButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  homeButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F97316', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  homeButtonText: { fontSize: 16, fontWeight: '600', color: '#F97316' },
  bottomContainer: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F5F5F4' },
  nextButton: { backgroundColor: '#F97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  datePickerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 16 },
  datePickerButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E7E5E4' },
  datePickerConfirmButton: { backgroundColor: '#F97316', borderColor: '#F97316' },
  datePickerButtonText: { fontSize: 16, color: '#44403C', textAlign: 'center' },
  datePickerConfirmButtonText: { color: '#FFFFFF' },
  submittedCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  submittedTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1917', marginBottom: 16 },
  submittedContent: { gap: 16 },
  submittedText: { fontSize: 16, color: '#44403C', lineHeight: 24, marginBottom: 8 },
  submittedSteps: { gap: 12 },
  submittedStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  stepText: { fontSize: 14, color: '#44403C', flex: 1 },
  submittedActions: { gap: 12 },
});