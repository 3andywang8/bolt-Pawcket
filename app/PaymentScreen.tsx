import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const PAYMENT_METHODS = [
  {
    id: 'credit-card',
    name: '信用卡',
    icon: '💳',
    description: 'Visa / MasterCard',
    available: true,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: require('../assets/applepay.png'),
    description: '快速安全支付',
    available: true,
    isImage: true,
  },
  {
    id: 'line-pay',
    name: 'LINE Pay',
    icon: require('../assets/linepay.png'),
    description: 'LINE 快速支付',
    available: true,
    isImage: true,
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { treatId, treatName, price, animalId, animalType, animalName } = useLocalSearchParams();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    triggerHapticFeedback();
    setSelectedPayment(paymentId);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      Alert.alert('請選擇支付方式', '請先選擇一種支付方式');
      return;
    }

    setIsProcessing(true);
    triggerHapticFeedback();

    // 模擬支付處理
    setTimeout(() => {
      setIsProcessing(false);
      
      // 跳轉到支付成功頁面
      router.push({
        pathname: '/PaymentSuccessScreen',
        params: {
          treatId: treatId as string,
          treatName: treatName as string,
          price: price as string,
          animalId: animalId as string,
          animalType: animalType as string,
          animalName: animalName as string,
          paymentMethod: selectedPayment,
        },
      });
    }, 2000);
  };

  const availablePayments = PAYMENT_METHODS.filter(method => method.available);

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
        <Text style={styles.headerTitle}>選擇支付方式</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 訂單摘要 */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>訂單摘要</Text>
          <View style={styles.orderItem}>
            <Text style={styles.itemName}>{treatName}</Text>
            <Text style={styles.itemPrice}>NT$ {price}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>總計</Text>
            <Text style={styles.totalPrice}>NT$ {price}</Text>
          </View>
        </View>

        {/* 支付方式 */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>選擇支付方式</Text>
          
          {availablePayments.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPayment === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => handlePaymentSelect(method.id)}>
              
              <View style={styles.paymentLeft}>
                {method.isImage ? (
                  <Image source={method.icon} style={styles.paymentIconImage} />
                ) : (
                  <Text style={styles.paymentIcon}>{method.icon}</Text>
                )}
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
              </View>
              
              <View style={[
                styles.radioButton,
                selectedPayment === method.id && styles.radioButtonSelected,
              ]}>
                {selectedPayment === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 安全提示 */}
        <View style={styles.securityInfo}>
          <Shield size={20} color="#10B981" strokeWidth={2} />
          <Text style={styles.securityText}>
            您的支付資訊受到 SSL 加密保護，交易安全可靠
          </Text>
        </View>
      </ScrollView>

      {/* 支付按鈕 */}
      <View style={styles.paymentContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!selectedPayment || isProcessing) && styles.paymentButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedPayment || isProcessing}>
          
          {isProcessing ? (
            <Text style={styles.paymentButtonText}>處理中...</Text>
          ) : (
            <>
              <CreditCard size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.paymentButtonText}>
                確認支付 NT$ {price}
              </Text>
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
  orderSummary: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#44403C',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F4',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F97316',
  },
  paymentSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 16,
  },
  paymentMethod: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#F5F5F4',
  },
  selectedPaymentMethod: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentIconImage: {
    width: 32,
    height: 32,
    marginRight: 12,
    resizeMode: 'contain',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#78716C',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D6D3D1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#F97316',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F97316',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#059669',
    flex: 1,
  },
  paymentContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  paymentButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  paymentButtonDisabled: {
    backgroundColor: '#D6D3D1',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});