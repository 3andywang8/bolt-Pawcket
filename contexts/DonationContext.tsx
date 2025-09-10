import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { getTreatById } from '@/data/treats';

// 捐款記錄介面
export interface DonationRecord {
  id: string;
  treatId: string;
  treatName: string;
  price: number;
  animalType: 'cat' | 'dog';
  paymentMethod: string;
  donationDate: string;
  status: 'completed' | 'pending' | 'failed';
  animalName?: string;
  shelterName?: string;
  transactionId?: string;
}

interface DonationContextType {
  donations: DonationRecord[];
  addDonation: (donation: Omit<DonationRecord, 'id' | 'donationDate' | 'status'>) => void;
  getTotalDonations: () => number;
  getTotalAmount: () => number;
  getDonationsByAnimalType: (type: 'cat' | 'dog') => DonationRecord[];
  getDonationById: (id: string) => DonationRecord | undefined;
  getTreatData: (treatId: string) => any;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export const useDonations = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonations must be used within a DonationProvider');
  }
  return context;
};

export const DonationProvider = ({ children }: { children: ReactNode }) => {
  // 初始化一些示例數據
  const [donations, setDonations] = useState<DonationRecord[]>([
    {
      id: '1',
      treatId: 'd1',
      treatName: '凍乾雞肉',
      price: 50,
      animalType: 'dog',
      paymentMethod: 'line-pay',
      donationDate: '2024/01/20',
      status: 'completed',
      animalName: '小黃',
      shelterName: '台北市動物之家',
      transactionId: 'TXN001',
    },
    {
      id: '2',
      treatId: 'c1',
      treatName: '肉泥',
      price: 35,
      animalType: 'cat',
      paymentMethod: 'credit-card',
      donationDate: '2024/01/18',
      status: 'completed',
      animalName: '小花',
      shelterName: '新北市動物救援中心',
      transactionId: 'TXN002',
    },
    {
      id: '3',
      treatId: 'd2',
      treatName: '潔牙骨',
      price: 30,
      animalType: 'dog',
      paymentMethod: 'apple-pay',
      donationDate: '2024/01/15',
      status: 'completed',
      animalName: '黑皮',
      shelterName: '桃園市動物保護教育園區',
      transactionId: 'TXN003',
    },
    {
      id: '4',
      treatId: 'c2',
      treatName: '凍乾魚肉',
      price: 45,
      animalType: 'cat',
      paymentMethod: 'line-pay',
      donationDate: '2024/01/12',
      status: 'completed',
      animalName: '橘貓咪',
      shelterName: '高雄市動物保護處',
      transactionId: 'TXN004',
    },
    {
      id: '5',
      treatId: 'd3',
      treatName: '雞肉條',
      price: 40,
      animalType: 'dog',
      paymentMethod: 'apple-pay',
      donationDate: '2024/01/10',
      status: 'completed',
      animalName: '小白',
      shelterName: '台中市動物之家',
      transactionId: 'TXN005',
    },
    {
      id: '6',
      treatId: 'c3',
      treatName: '脆餅乾',
      price: 25,
      animalType: 'cat',
      paymentMethod: 'credit-card',
      donationDate: '2024/01/08',
      status: 'completed',
      animalName: '小咪',
      shelterName: '台南市動物之家',
      transactionId: 'TXN006',
    },
  ]);

  const addDonation = useCallback((donationData: Omit<DonationRecord, 'id' | 'donationDate' | 'status'>) => {
    const newDonation: DonationRecord = {
      ...donationData,
      id: Date.now().toString(),
      donationDate: new Date().toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      status: 'completed',
      transactionId: `TXN${Date.now()}`,
    };

    setDonations(prev => [newDonation, ...prev]);
  }, []);

  const getTotalDonations = useCallback(() => {
    return donations.filter(d => d.status === 'completed').length;
  }, [donations]);

  const getTotalAmount = useCallback(() => {
    return donations
      .filter(d => d.status === 'completed')
      .reduce((total, donation) => total + donation.price, 0);
  }, [donations]);

  const getDonationsByAnimalType = useCallback((type: 'cat' | 'dog') => {
    return donations.filter(d => d.animalType === type && d.status === 'completed');
  }, [donations]);

  const getDonationById = useCallback((id: string) => {
    return donations.find(d => d.id === id);
  }, [donations]);

  const getTreatData = useCallback((treatId: string) => {
    return getTreatById(treatId);
  }, []);

  const value: DonationContextType = useMemo(() => ({
    donations,
    addDonation,
    getTotalDonations,
    getTotalAmount,
    getDonationsByAnimalType,
    getDonationById,
    getTreatData,
  }), [
    donations,
    addDonation,
    getTotalDonations,
    getTotalAmount,
    getDonationsByAnimalType,
    getDonationById,
    getTreatData,
  ]);

  return (
    <DonationContext.Provider value={value}>
      {children}
    </DonationContext.Provider>
  );
};