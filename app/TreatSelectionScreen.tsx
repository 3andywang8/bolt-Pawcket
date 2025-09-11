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
import { ArrowLeft, ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getTreatsByType } from '@/data/treats';

export default function TreatSelectionScreen() {
  const router = useRouter();
  const { animalId, animalType, animalName } = useLocalSearchParams();
  const [selectedTreat, setSelectedTreat] = useState<string | null>(null);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 根據動物類型獲取零食列表
  const treats = getTreatsByType(animalType as 'cat' | 'dog');
  const displayName = animalName ? animalName as string : (animalType === 'cat' ? '貓咪' : '狗狗');

  const handleTreatSelect = (treatId: string) => {
    triggerHapticFeedback();
    setSelectedTreat(treatId);
  };

  const handleCheckout = () => {
    if (!selectedTreat) {
      Alert.alert('請選擇零食', '請先選擇要購買的零食');
      return;
    }

    const treat = treats.find(t => t.id === selectedTreat);
    if (!treat) return;

    triggerHapticFeedback();
    
    // 跳轉到支付頁面
    router.push({
      pathname: '/PaymentScreen',
      params: {
        treatId: selectedTreat,
        treatName: treat.name,
        price: treat.price.toString(),
        animalId: animalId as string,
        animalType: animalType as string,
        animalName: animalName as string,
      },
    });
  };

  const selectedTreatData = treats.find(t => t.id === selectedTreat);

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
        <Text style={styles.headerTitle}>選擇{displayName}零食</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 說明文字 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>為{displayName}選擇美味零食 🍖</Text>
          <Text style={styles.descriptionText}>
            你的愛心將直接轉化為{displayName}的美味零食，讓牠感受到溫暖與關愛
          </Text>
        </View>

        {/* 零食選擇 */}
        <View style={styles.treatsContainer}>
          {treats.map((treat) => (
            <TouchableOpacity
              key={treat.id}
              style={[
                styles.treatCard,
                selectedTreat === treat.id && styles.selectedTreatCard,
              ]}
              onPress={() => handleTreatSelect(treat.id)}>
              
              <View style={styles.treatImageContainer}>
                <Image source={treat.image} style={styles.treatImage} />
                {selectedTreat === treat.id && (
                  <View style={styles.selectedOverlay}>
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.treatInfo}>
                <Text style={styles.treatName}>{treat.name}</Text>
                <Text style={styles.treatDescription}>{treat.description}</Text>
                <Text style={styles.treatPrice}>NT$ {treat.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 選中的零食詳情 */}
        {selectedTreatData && (
          <View style={styles.selectedTreatInfo}>
            <Text style={styles.selectedTitle}>已選擇</Text>
            <View style={styles.selectedTreatRow}>
              <Image source={selectedTreatData.image} style={styles.selectedTreatImage} />
              <View style={styles.selectedTreatDetails}>
                <Text style={styles.selectedTreatName}>{selectedTreatData.name}</Text>
                <Text style={styles.selectedTreatPrice}>NT$ {selectedTreatData.price}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 結帳按鈕 */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            !selectedTreat && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={!selectedTreat}>
          <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.checkoutButtonText}>
            {selectedTreatData ? `結帳 NT$ ${selectedTreatData.price}` : '請選擇零食'}
          </Text>
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
  descriptionContainer: {
    padding: 20,
    backgroundColor: '#FFF7ED',
    margin: 20,
    borderRadius: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
    textAlign: 'center',
  },
  treatsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  treatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTreatCard: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  treatImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  treatImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  treatInfo: {
    flex: 1,
  },
  treatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 4,
  },
  treatDescription: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 8,
  },
  treatPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F97316',
  },
  selectedTreatInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  selectedTreatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTreatImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedTreatDetails: {
    flex: 1,
  },
  selectedTreatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  selectedTreatPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  checkoutContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
  },
  checkoutButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D6D3D1',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});