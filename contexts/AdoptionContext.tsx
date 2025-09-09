import React, { createContext, useContext, useState, ReactNode } from 'react';

// 申請狀態枚舉
export enum ApplicationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// 申請記錄介面
export interface AdoptionApplication {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'cat' | 'dog';
  animalImage: string;
  applicationDate: string;
  status: ApplicationStatus;
  shelter: string;
  shelterPhone: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  applicantInfo: {
    name: string;
    phone: string;
    email: string;
    isFirstTime: string;
    petCount?: string;
    livingSpace?: string;
    familyMembers?: string;
    workSchedule?: string;
  };
}

// 用戶資料介面
export interface UserProfile {
  id: string;
  cancellationCount: number;
  isBlacklisted: boolean;
  lastCancellationDate?: string;
}

interface AdoptionContextType {
  applications: AdoptionApplication[];
  userProfile: UserProfile;
  addApplication: (application: Omit<AdoptionApplication, 'id' | 'applicationDate' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
  cancelApplication: (id: string, reason: 'user' | 'phone') => Promise<{ success: boolean; message: string }>;
  canCancelApplication: (applicationId: string) => { canCancel: boolean; reason?: string };
  getApplicationById: (id: string) => AdoptionApplication | undefined;
  getApplicationsByStatus: (status: ApplicationStatus) => AdoptionApplication[];
}

const AdoptionContext = createContext<AdoptionContextType | undefined>(undefined);

export const useAdoption = () => {
  const context = useContext(AdoptionContext);
  if (!context) {
    throw new Error('useAdoption must be used within an AdoptionProvider');
  }
  return context;
};

export const AdoptionProvider = ({ children }: { children: ReactNode }) => {
  // 用戶資料（之後可以從 AsyncStorage 或其他持久化存儲中讀取）
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user123',
    cancellationCount: 0,
    isBlacklisted: false,
  });

  // 初始化一些示例數據（之後可以從 AsyncStorage 或其他持久化存儲中讀取）
  const [applications, setApplications] = useState<AdoptionApplication[]>([
    {
      id: '1',
      animalId: '417389',
      animalName: '混種貓 6001',
      animalType: 'cat',
      animalImage: 'https://www.pet.gov.tw/upload/pic/1754552120967.png',
      applicationDate: '2024/01/15',
      status: ApplicationStatus.CONFIRMED,
      shelter: '新竹縣動物保護教育園區',
      shelterPhone: '03-5519548',
      appointmentDate: '2024/01/22',
      appointmentTime: '上午 9:00-12:00',
      notes: '請攜帶身分證件及相關文件',
      applicantInfo: {
        name: '愛心使用者',
        phone: '0912345678',
        email: 'user@example.com',
        isFirstTime: 'no',
        petCount: '1隻貓',
        livingSpace: '公寓',
        familyMembers: '夫妻二人',
        workSchedule: '朝九晚五'
      }
    },
    {
      id: '2',
      animalId: '417451',
      animalName: '狗狗 6004',
      animalType: 'dog',
      animalImage: 'https://www.pet.gov.tw/upload/pic/1754555310183.png',
      applicationDate: '2024/01/18',
      status: ApplicationStatus.PENDING,
      shelter: '澎湖縣動物之家',
      shelterPhone: '02-4092-2957',
      appointmentDate: '2024/01/25',
      appointmentTime: '下午 14:00-17:00',
      applicantInfo: {
        name: '愛心使用者',
        phone: '0912345678',
        email: 'user@example.com',
        isFirstTime: 'yes'
      }
    },
    {
      id: '3',
      animalId: '417455',
      animalName: '橘貓小花',
      animalType: 'cat',
      animalImage: 'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg',
      applicationDate: '2024/01/10',
      status: ApplicationStatus.COMPLETED,
      shelter: '桃園市動物保護教育園區',
      shelterPhone: '03-4861760',
      appointmentDate: '2024/01/17',
      appointmentTime: '假日 10:00-16:00',
      notes: '領養成功！小花已經回到溫暖的家',
      applicantInfo: {
        name: '愛心使用者',
        phone: '0912345678',
        email: 'user@example.com',
        isFirstTime: 'no',
        petCount: '2隻貓',
        livingSpace: '透天厝',
        familyMembers: '有小孩',
        workSchedule: '在家工作'
      }
    }
  ]);

  const addApplication = (applicationData: Omit<AdoptionApplication, 'id' | 'applicationDate' | 'status'>) => {
    const newApplication: AdoptionApplication = {
      ...applicationData,
      id: Date.now().toString(), // 簡單的 ID 生成策略
      applicationDate: new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      status: ApplicationStatus.PENDING, // 新申請預設為等待狀態
    };

    setApplications(prev => [newApplication, ...prev]);
    return newApplication.id;
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus, notes?: string) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { ...app, status, notes: notes || app.notes }
          : app
      )
    );
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  // 檢查是否可以取消申請
  const canCancelApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return { canCancel: false, reason: '找不到申請記錄' };
    }

    if (userProfile.isBlacklisted) {
      return { canCancel: false, reason: '您已被列入黑名單，無法取消申請' };
    }

    if (application.status === ApplicationStatus.COMPLETED || application.status === ApplicationStatus.CANCELLED) {
      return { canCancel: false, reason: '此申請已無法取消' };
    }

    // 檢查預約時間是否在24小時內
    if (application.appointmentDate && application.appointmentTime) {
      const appointmentDateTime = parseAppointmentDateTime(application.appointmentDate, application.appointmentTime);
      const now = new Date();
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < 24 && hoursUntilAppointment > 0) {
        return { canCancel: false, reason: '預約時間少於24小時，請直接致電收容所取消' };
      }
    }

    return { canCancel: true };
  };

  // 取消申請
  const cancelApplication = async (id: string, reason: 'user' | 'phone'): Promise<{ success: boolean; message: string }> => {
    const canCancel = canCancelApplication(id);
    
    if (!canCancel.canCancel) {
      return { success: false, message: canCancel.reason || '無法取消申請' };
    }

    // 更新取消次數
    const newCancellationCount = userProfile.cancellationCount + 1;
    const newIsBlacklisted = newCancellationCount >= 3;

    setUserProfile(prev => ({
      ...prev,
      cancellationCount: newCancellationCount,
      isBlacklisted: newIsBlacklisted,
      lastCancellationDate: new Date().toLocaleDateString('zh-TW')
    }));

    // 更新申請狀態
    setApplications(prev => 
      prev.map(app => 
        app.id === id 
          ? { 
              ...app, 
              status: ApplicationStatus.CANCELLED,
              notes: `取消原因：${reason === 'user' ? 'APP取消' : '電話取消'}` 
            }
          : app
      )
    );

    const message = newIsBlacklisted 
      ? '申請已取消。您已達到取消上限（3次），已被加入黑名單，今後只能進行線上投餵。'
      : `申請已取消。您還可以取消 ${3 - newCancellationCount} 次。`;

    return { success: true, message };
  };

  // 解析預約日期時間
  const parseAppointmentDateTime = (date: string, time: string): Date => {
    // 解析日期 (格式: 2024/01/22)
    const [year, month, day] = date.split('/').map(Number);
    
    // 解析時間 (格式: 上午 9:00-12:00 或 下午 14:00-17:00)
    let hour = 9; // 預設值
    
    const timeMatch = time.match(/(\d+):(\d+)/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      
      if (time.includes('下午') && hour < 12) {
        hour += 12;
      }
    }
    
    return new Date(year, month - 1, day, hour, 0, 0);
  };

  const value: AdoptionContextType = {
    applications,
    userProfile,
    addApplication,
    updateApplicationStatus,
    cancelApplication,
    canCancelApplication,
    getApplicationById,
    getApplicationsByStatus,
  };

  return (
    <AdoptionContext.Provider value={value}>
      {children}
    </AdoptionContext.Provider>
  );
};