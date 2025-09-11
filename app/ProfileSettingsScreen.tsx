import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  User,
  Heart,
  Settings,
  Save,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile, UserProfile } from '@/contexts/UserProfileContext';

// 預設頭像選項 - 使用 emoji 作為預設頭像
const DEFAULT_AVATARS = [
  '😊', '😎', '🥰', '😇', '🤗', '😋', '🤔', '😴'
];

// 興趣標籤選項
const INTEREST_TAGS = [
  '戶外活動', '攝影', '烘焙', '運動', '音樂', '閱讀', '電影', '旅行',
  '手作', '園藝', '瑜珈', '登山', '料理', '繪畫', '舞蹈', '寫作'
];

// 職業選項
const OCCUPATIONS = [
  '學生', '上班族', '自由業', '教師', '醫護人員', '工程師',
  '設計師', '創業家', '退休', '家管', '其他'
];

// 縣市選項
const CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '新竹縣', '新竹市', '苗栗縣', '彰化縣', '南投縣', '雲林縣',
  '嘉義縣', '嘉義市', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣',
  '澎湖縣', '金門縣', '連江縣'
];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, updateProfile: updateUserProfile, getCompletionPercentage } = useUserProfile();
  
  // 本地編輯狀態
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // 初始化本地狀態
  useEffect(() => {
    setLocalProfile(profile);
    setCompletionPercentage(getCompletionPercentage());
  }, [profile, getCompletionPercentage]);

  // 更新本地資料的函數
  const updateLocalProfile = (field: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = localProfile.interests;
    if (currentInterests.includes(interest)) {
      updateLocalProfile('interests', currentInterests.filter(i => i !== interest));
    } else if (currentInterests.length < 5) {
      updateLocalProfile('interests', [...currentInterests, interest]);
    } else {
      Alert.alert('提示', '最多只能選擇5個興趣標籤');
    }
  };

  const toggleArrayValue = (field: keyof UserProfile, value: string) => {
    const currentArray = localProfile[field] as string[];
    if (currentArray.includes(value)) {
      updateLocalProfile(field, currentArray.filter(item => item !== value));
    } else {
      updateLocalProfile(field, [...currentArray, value]);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert(
      '選擇頭像',
      '請選擇頭像來源',
      [
        { text: '預設頭像', onPress: showDefaultAvatars },
        { text: '相機膠卷', onPress: pickImage },
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const showDefaultAvatars = () => {
    Alert.alert(
      '選擇預設頭像',
      '請選擇一個預設頭像',
      [
        ...DEFAULT_AVATARS.map(emoji => ({
          text: emoji,
          onPress: () => updateLocalProfile('avatar', emoji)
        })),
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('權限需求', '需要相機權限才能選擇照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateLocalProfile('avatar', result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    // 檢查必填項目
    if (!localProfile.nickname || !localProfile.gender || !localProfile.city) {
      Alert.alert('提示', '請填寫所有必填項目（暱稱、性別、所在地區）');
      return;
    }

    try {
      // 保存到全局狀態
      await updateUserProfile(localProfile);
      
      Alert.alert('保存成功', '個人資料已更新', [
        { text: '確定', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('保存失敗', '無法保存個人資料，請稍後再試');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>資料完整度</Text>
        <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
      </View>
    </View>
  );

  const renderSection = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    required: boolean = false,
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A8A29E"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const renderPickerField = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void,
    required: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              value === option && styles.selectedOption
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              value === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTagSelector = (
    label: string,
    selectedTags: string[],
    options: string[],
    onToggle: (tag: string) => void,
    maxSelection: number = 999
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {selectedTags.length > 0 && <Text style={styles.tagCount}>({selectedTags.length}/{maxSelection})</Text>}
      </Text>
      <View style={styles.tagsContainer}>
        {options.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              selectedTags.includes(tag) && styles.selectedTag
            ]}
            onPress={() => onToggle(tag)}
          >
            <Text style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.selectedTagText
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSwitchField = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && <Text style={styles.switchDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E7E5E4', true: '#FED7AA' }}
        thumbColor={value ? '#F97316' : '#A8A29E'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人資料設定</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
        >
          <Save size={20} color="#F97316" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 進度條 */}
        {renderProgressBar()}

        {/* 基本資料區塊 */}
        {renderSection(
          '基本資料',
          <User size={20} color="#F97316" strokeWidth={2} />,
          <>
            {/* 頭像 */}
            <View style={styles.avatarSection}>
              <Text style={styles.inputLabel}>頭像</Text>
              <TouchableOpacity style={styles.avatarContainer} onPress={showAvatarOptions}>
                {localProfile.avatar ? (
                  typeof localProfile.avatar === 'string' && DEFAULT_AVATARS.includes(localProfile.avatar) ? (
                    <View style={[styles.avatar, styles.emojiAvatar]}>
                      <Text style={styles.emojiText}>{localProfile.avatar}</Text>
                    </View>
                  ) : typeof localProfile.avatar === 'string' && localProfile.avatar.endsWith('.png') ? (
                    <Image source={require('../assets/lezu.png')} style={styles.avatar} />
                  ) : typeof localProfile.avatar === 'string' ? (
                    <Image source={{ uri: localProfile.avatar }} style={styles.avatar} />
                  ) : (
                    <Image source={localProfile.avatar} style={styles.avatar} />
                  )
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Camera size={24} color="#78716C" strokeWidth={2} />
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <Camera size={16} color="#FFFFFF" strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>

            {/* 暱稱 */}
            {renderInputField(
              '暱稱',
              localProfile.nickname,
              (text) => updateLocalProfile('nickname', text),
              '請輸入您的暱稱',
              true
            )}

            {/* 性別 */}
            {renderPickerField(
              '性別',
              localProfile.gender,
              ['男性', '女性', '不願透露'],
              (value) => updateLocalProfile('gender', value),
              true
            )}

            {/* 所在地區 */}
            {renderPickerField(
              '所在地區',
              localProfile.city,
              CITIES,
              (value) => updateLocalProfile('city', value),
              true
            )}

            {/* 年齡區間 */}
            {renderPickerField(
              '年齡區間',
              localProfile.ageRange,
              ['18-25歲', '26-35歲', '36-45歲', '46-60歲', '60歲以上'],
              (value) => updateLocalProfile('ageRange', value)
            )}

            {/* 職業 */}
            {renderPickerField(
              '職業',
              localProfile.occupation,
              OCCUPATIONS,
              (value) => updateLocalProfile('occupation', value)
            )}

            {/* 聯絡方式 */}
            {renderInputField(
              '手機號碼',
              localProfile.phone,
              (text) => updateLocalProfile('phone', text),
              '09xxxxxxxx'
            )}

            {renderInputField(
              'Email',
              localProfile.email,
              (text) => updateLocalProfile('email', text),
              'example@email.com'
            )}

            {/* 興趣標籤 */}
            {renderTagSelector(
              '興趣標籤',
              localProfile.interests,
              INTEREST_TAGS,
              toggleInterest,
              5
            )}
          </>
        )}

        {/* 寵物相關區塊 */}
        {renderSection(
          '寵物相關',
          <Heart size={20} color="#F97316" strokeWidth={2} />,
          <>
            {/* 寵物經驗 */}
            {renderPickerField(
              '寵物經驗',
              localProfile.petExperience,
              ['新手', '有經驗', '專業級'],
              (value) => updateLocalProfile('petExperience', value)
            )}

            {/* 曾養寵物類型 */}
            {renderTagSelector(
              '曾經養過的寵物',
              localProfile.petTypes,
              ['狗', '貓', '鳥類', '魚類', '兔子', '倉鼠', '其他'],
              (tag) => toggleArrayValue('petTypes', tag)
            )}

            {/* 寵物偏好 */}
            {renderTagSelector(
              '偏好寵物大小',
              localProfile.petSizePreference,
              ['小型', '中型', '大型'],
              (tag) => toggleArrayValue('petSizePreference', tag)
            )}

            {renderTagSelector(
              '偏好寵物年齡',
              localProfile.petAgePreference,
              ['幼年', '成年', '老年'],
              (tag) => toggleArrayValue('petAgePreference', tag)
            )}

            {renderTagSelector(
              '偏好寵物個性',
              localProfile.petPersonalityPreference,
              ['活潑', '溫和', '安靜', '獨立', '黏人', '聰明'],
              (tag) => toggleArrayValue('petPersonalityPreference', tag)
            )}
          </>
        )}

        {/* 社群交流區塊 */}
        {renderSection(
          '社群交流',
          <Award size={20} color="#F97316" strokeWidth={2} />,
          <>
            {/* 自我介紹 */}
            {renderInputField(
              '自我介紹',
              localProfile.bio,
              (text) => updateLocalProfile('bio', text),
              '分享你的寵物故事或愛心理念...',
              false,
              true
            )}

            {/* 社群連結 */}
            {renderInputField(
              'Instagram',
              localProfile.instagram,
              (text) => updateLocalProfile('instagram', text),
              '@your_instagram'
            )}

            {renderInputField(
              'Facebook',
              localProfile.facebook,
              (text) => updateLocalProfile('facebook', text),
              'Facebook 個人檔案連結'
            )}

            {renderInputField(
              'LINE ID',
              localProfile.lineId,
              (text) => updateLocalProfile('lineId', text),
              'your_line_id'
            )}
          </>
        )}

        {/* 愛心活動區塊 */}
        {renderSection(
          '愛心活動',
          <Heart size={20} color="#F97316" strokeWidth={2} />,
          <>
            {/* 志工經驗 */}
            {renderSwitchField(
              '曾參與動物志工活動',
              localProfile.volunteerExperience,
              (value) => updateLocalProfile('volunteerExperience', value)
            )}

            {localProfile.volunteerExperience && (
              renderTagSelector(
                '志工類型',
                localProfile.volunteerTypes,
                ['收容所', '動物醫院', '街貓TNR', '動物救援', '教育宣導'],
                (tag) => toggleArrayValue('volunteerTypes', tag)
              )
            )}

            {/* 捐款偏好 */}
            {renderTagSelector(
              '偏好捐款動物類型',
              localProfile.donationPreference,
              ['狗', '貓', '特殊需求動物', '所有動物'],
              (tag) => toggleArrayValue('donationPreference', tag)
            )}

            {renderSwitchField(
              '每月捐款提醒',
              localProfile.monthlyDonationReminder,
              (value) => updateLocalProfile('monthlyDonationReminder', value),
              '提醒您定期進行愛心捐款'
            )}
          </>
        )}

        {/* 隱私設定區塊 */}
        {renderSection(
          '隱私設定',
          <Settings size={20} color="#F97316" strokeWidth={2} />,
          <>
            {/* 個人資料可見度 */}
            {renderPickerField(
              '個人資料可見度',
              localProfile.profileVisibility,
              ['公開', '僅好友可見', '私人'],
              (value) => updateLocalProfile('profileVisibility', value)
            )}

            {/* 互動偏好 */}
            {renderSwitchField(
              '允許其他用戶私訊',
              localProfile.allowMessages,
              (value) => updateLocalProfile('allowMessages', value)
            )}

            {renderSwitchField(
              '分享我的愛心動態',
              localProfile.shareActivity,
              (value) => updateLocalProfile('shareActivity', value)
            )}

            {renderSwitchField(
              '接收寵物推薦通知',
              localProfile.petRecommendations,
              (value) => updateLocalProfile('petRecommendations', value)
            )}
          </>
        )}

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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  progressContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F5F5F4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 3,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1917',
    marginLeft: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  emojiAvatar: {
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  tagCount: {
    color: '#78716C',
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginTop: 4,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  selectedOption: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  optionText: {
    fontSize: 12,
    color: '#44403C',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 2,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  selectedTag: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  tagText: {
    fontSize: 12,
    color: '#44403C',
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1917',
  },
  switchDescription: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 32,
  },
});