import React, { createContext, useContext, useState, ReactNode } from 'react';

// 申請狀態枚舉
export enum ApplicationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed', 
  REJECTED = 'rejected',
  COMPLETED = 'completed',
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

interface AdoptionContextType {
  applications: AdoptionApplication[];
  addApplication: (application: Omit<AdoptionApplication, 'id' | 'applicationDate' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => void;
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

  const value: AdoptionContextType = {
    applications,
    addApplication,
    updateApplicationStatus,
    getApplicationById,
    getApplicationsByStatus,
  };

  return (
    <AdoptionContext.Provider value={value}>
      {children}
    </AdoptionContext.Provider>
  );
};