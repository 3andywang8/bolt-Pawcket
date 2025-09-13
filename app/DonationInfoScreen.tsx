import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Mail, Phone, MapPin, Receipt, ChevronDown, Calendar, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function DonationInfoScreen() {
  const router = useRouter();
  
  // 表單狀態
  const [formData, setFormData] = useState({
    // 捐款人基本資料
    name: '',
    email: '',
    phone: '',
    address: '',
    // 收據資訊
    receiptType: 'personal', // 'personal' 或 'company'
    taxId: '', // 統一編號（公司用）
    companyName: '', // 公司名稱
    receiptAddress: '', // 收據地址
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '請輸入姓名';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = '請輸入電話號碼';
    } else if (!/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = '請輸入有效的電話號碼';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = '請輸入地址';
    }
    
    if (!formData.receiptAddress.trim()) {
      newErrors.receiptAddress = '請輸入收據寄送地址';
    }
    
    if (formData.receiptType === 'company') {
      if (!formData.taxId.trim()) {
        newErrors.taxId = '請輸入統一編號';
      } else if (!/^\d{8}$/.test(formData.taxId)) {
        newErrors.taxId = '統一編號需為8位數字';
      }
      
      if (!formData.companyName.trim()) {
        newErrors.companyName = '請輸入公司名稱';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除該欄位的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    triggerHapticFeedback();
    
    if (!validateForm()) {
      Alert.alert('填寫不完整', '請檢查並填寫所有必填欄位');
      return;
    }
    
    // 這裡可以加入實際的提交邏輯
    Alert.alert(
      '資料提交成功',
      '您的捐款資訊已成功提交，我們會盡快處理。',
      [
        {
          text: '確定',
          onPress: () => {
            // 導回投餵成功頁面
            router.back();
          }
        }
      ]
    );
  };

  const handleBack = () => {
    triggerHapticFeedback();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* 標題列 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>填寫捐款資訊</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 捐款人基本資料 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#F97316" strokeWidth={2} />
            <Text style={styles.sectionTitle}>捐款人基本資料</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>姓名 *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="請輸入您的姓名"
              placeholderTextColor="#A3A3A3"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>電子郵件 *</Text>
            <TextInput
              style={[styles.textInput, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="example@email.com"
              placeholderTextColor="#A3A3A3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>電話號碼 *</Text>
            <TextInput
              style={[styles.textInput, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="09xx-xxx-xxx"
              placeholderTextColor="#A3A3A3"
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>地址 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="請輸入詳細地址"
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={3}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </View>

        {/* 收據資訊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Receipt size={20} color="#F97316" strokeWidth={2} />
            <Text style={styles.sectionTitle}>收據資訊</Text>
          </View>

          {/* 收據類型選擇 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>收據類型 *</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleInputChange('receiptType', 'personal')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.receiptType === 'personal' && styles.radioSelected
                ]} />
                <Text style={styles.radioLabel}>個人收據</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleInputChange('receiptType', 'company')}
              >
                <View style={[
                  styles.radioCircle,
                  formData.receiptType === 'company' && styles.radioSelected
                ]} />
                <Text style={styles.radioLabel}>公司收據</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 公司收據額外欄位 */}
          {formData.receiptType === 'company' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>統一編號 *</Text>
                <TextInput
                  style={[styles.textInput, errors.taxId && styles.inputError]}
                  value={formData.taxId}
                  onChangeText={(value) => handleInputChange('taxId', value)}
                  placeholder="12345678"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="numeric"
                  maxLength={8}
                />
                {errors.taxId && <Text style={styles.errorText}>{errors.taxId}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>公司名稱 *</Text>
                <TextInput
                  style={[styles.textInput, errors.companyName && styles.inputError]}
                  value={formData.companyName}
                  onChangeText={(value) => handleInputChange('companyName', value)}
                  placeholder="請輸入公司名稱"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>收據寄送地址 *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, errors.receiptAddress && styles.inputError]}
              value={formData.receiptAddress}
              onChangeText={(value) => handleInputChange('receiptAddress', value)}
              placeholder="請輸入收據寄送地址"
              placeholderTextColor="#A3A3A3"
              multiline
              numberOfLines={3}
            />
            {errors.receiptAddress && <Text style={styles.errorText}>{errors.receiptAddress}</Text>}
          </View>
        </View>

        {/* 注意事項 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>注意事項</Text>
          <Text style={styles.noticeText}>
            • 收據將在捐款確認後的7個工作天內寄出{'\n'}
            • 請確保您提供的地址正確，以免影響收據寄送{'\n'}
            • 如有任何問題，請聯繫客服：service@pawcket.com
          </Text>
        </View>

        {/* 提交按鈕 */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>提交資料</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FEFDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1917',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403C',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1917',
    backgroundColor: '#FEFDFB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D6D3D1',
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  radioLabel: {
    fontSize: 14,
    color: '#44403C',
  },
  noticeSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  submitButton: {
    margin: 20,
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});