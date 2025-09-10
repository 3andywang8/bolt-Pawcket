// 零食數據定義
export interface TreatData {
  id: string;
  name: string;
  price: number;
  image: any; // require() 返回的圖片資源
  description: string;
  type: 'dog' | 'cat';
}

// 零食數據
export const TREATS_DATA: TreatData[] = [
  // 狗狗零食
  {
    id: 'd1',
    name: '凍乾雞肉',
    price: 50,
    image: require('../assets/dog-treat-freeze-dried.png'),
    description: '純天然凍乾雞肉，營養豐富',
    type: 'dog',
  },
  {
    id: 'd2',
    name: '潔牙骨',
    price: 30,
    image: require('../assets/dog-treat-dental-bone.png'),
    description: '幫助清潔牙齒，維護口腔健康',
    type: 'dog',
  },
  {
    id: 'd3',
    name: '雞肉條',
    price: 40,
    image: require('../assets/dog-treat-chicken-jerky.png'),
    description: '香嫩雞肉條，狗狗最愛',
    type: 'dog',
  },
  // 貓咪零食
  {
    id: 'c1',
    name: '肉泥',
    price: 35,
    image: require('../assets/cat-treat-puree.png'),
    description: '滑嫩肉泥，貓咪無法抗拒',
    type: 'cat',
  },
  {
    id: 'c2',
    name: '凍乾魚肉',
    price: 45,
    image: require('../assets/cat-treat-freeze-dried.png'),
    description: '新鮮魚肉凍乾，保留原味',
    type: 'cat',
  },
  {
    id: 'c3',
    name: '脆餅乾',
    price: 25,
    image: require('../assets/cat-treat-biscuits.png'),
    description: '酥脆可口，營養均衡',
    type: 'cat',
  },
];

// 根據 ID 獲取零食數據
export const getTreatById = (id: string): TreatData | undefined => {
  return TREATS_DATA.find(treat => treat.id === id);
};

// 根據類型獲取零食列表
export const getTreatsByType = (type: 'dog' | 'cat'): TreatData[] => {
  return TREATS_DATA.filter(treat => treat.type === type);
};