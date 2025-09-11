import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  // 基本資料 - 必填
  nickname: string;
  gender: string;
  city: string;
  
  // 基本資料 - 選填
  avatar: string | number | null;
  ageRange: string;
  occupation: string;
  phone: string;
  email: string;
  interests: string[];
  
  // 寵物相關
  petExperience: string;
  petTypes: string[];
  petSizePreference: string[];
  petAgePreference: string[];
  petPersonalityPreference: string[];
  myPets: { name: string; photo: string; description: string }[];
  
  // 社群交流
  bio: string;
  instagram: string;
  facebook: string;
  lineId: string;
  
  // 愛心活動
  volunteerExperience: boolean;
  volunteerTypes: string[];
  donationPreference: string[];
  monthlyDonationReminder: boolean;
  
  // 隱私設定
  profileVisibility: string;
  allowMessages: boolean;
  shareActivity: boolean;
  petRecommendations: boolean;
  
  // 系統資料
  joinDate: string;
}

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetProfile: () => Promise<void>;
  isProfileComplete: () => boolean;
  getCompletionPercentage: () => number;
}

const defaultProfile: UserProfile = {
  // 基本資料 - 必填
  nickname: 'S',
  gender: '女性',
  city: '台中市',
  
  // 基本資料 - 選填
  avatar: 'lezu.png',
  ageRange: '',
  occupation: '',
  phone: '',
  email: '',
  interests: [],
  
  // 寵物相關
  petExperience: '有經驗',
  petTypes: ['貓'],
  petSizePreference: [],
  petAgePreference: [],
  petPersonalityPreference: [],
  myPets: [],
  
  // 社群交流
  bio: '',
  instagram: '',
  facebook: '',
  lineId: '',
  
  // 愛心活動
  volunteerExperience: false,
  volunteerTypes: [],
  donationPreference: [],
  monthlyDonationReminder: false,
  
  // 隱私設定
  profileVisibility: 'public',
  allowMessages: true,
  shareActivity: true,
  petRecommendations: true,
  
  // 系統資料
  joinDate: new Date().toISOString(),
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = '@pawcket_user_profile';

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  // 加載保存的用戶資料
  const loadProfile = useCallback(async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // 合併預設值和保存的資料，確保新增欄位有預設值
        setProfile({ ...defaultProfile, ...parsedProfile });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  // 保存用戶資料
  const saveProfile = useCallback(async (profileData: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }, []);

  // 更新用戶資料
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    await saveProfile(newProfile);
  }, [profile, saveProfile]);

  // 重置用戶資料
  const resetProfile = useCallback(async () => {
    const newProfile = { ...defaultProfile, joinDate: profile.joinDate };
    setProfile(newProfile);
    await saveProfile(newProfile);
  }, [profile.joinDate, saveProfile]);

  // 檢查資料是否完整（必填項目）
  const isProfileComplete = useCallback(() => {
    return !!(profile.nickname && profile.gender && profile.city);
  }, [profile.nickname, profile.gender, profile.city]);

  // 計算資料完整度百分比
  const getCompletionPercentage = useCallback(() => {
    const totalFields = Object.keys(profile).length;
    const filledFields = Object.values(profile).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return true;
      return value !== '' && value !== null;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  }, [profile]);

  // 初始化時加載資料
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const value: UserProfileContextType = useMemo(() => ({
    profile,
    updateProfile,
    resetProfile,
    isProfileComplete,
    getCompletionPercentage,
  }), [
    profile,
    updateProfile,
    resetProfile,
    isProfileComplete,
    getCompletionPercentage,
  ]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};