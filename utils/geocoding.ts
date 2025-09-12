import Constants from 'expo-constants';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface ShelterLocation {
  name: string;
  address: string;
  coordinate: Coordinate;
  animals: any[];
}

// 預設收容所位置對照表 (暫時方案，避免 API 密鑰限制問題)
const SHELTER_COORDINATES: { [key: string]: Coordinate } = {
  // 新北市
  '新北市新店區安泰路235號': { latitude: 24.9477, longitude: 121.5425 },
  '新北市八里區長坑里6鄰長坑道路36號': { latitude: 25.1498, longitude: 121.3983 },
  '新北市五股區外寮路9-9號': { latitude: 25.0838, longitude: 121.4319 },
  // 新竹縣
  '新竹縣竹北市縣政五街192號': { latitude: 24.8138, longitude: 121.0186 },
  // 宜蘭縣
  '宜蘭縣五結鄉成興村利寶路60號': { latitude: 24.6892, longitude: 121.7641 },
  // 澎湖縣
  '澎湖縣馬公市烏崁里260、261號': { latitude: 23.5693, longitude: 119.5792 },
  // 花蓮縣
  '花蓮縣鳳林鎮林榮里永豐路255號': { latitude: 23.7519, longitude: 121.4541 },
  // 雲林縣
  '雲林縣斗六市雲林路二段517號': { latitude: 23.7118, longitude: 120.5473 },
  // 臺東縣
  '臺東縣臺東市中華路4段999巷600號': { latitude: 22.7972, longitude: 121.1444 },
};

// 地址轉座標 (使用預設座標對照表)
export const geocodeAddress = async (
  address: string
): Promise<Coordinate | null> => {
  try {
    // 先檢查預設座標對照表
    if (SHELTER_COORDINATES[address]) {
      console.log(`✅ 使用預設座標: ${address}`);
      return SHELTER_COORDINATES[address];
    }

    // 如果沒有預設座標，嘗試使用 Google API (在客戶端環境中)
    if (typeof window !== 'undefined') {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${(Constants.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log(`✅ API 取得座標: ${address} -> ${lat}, ${lng}`);
        return { latitude: lat, longitude: lng };
      }
    }

    // 如果都沒有，返回台北市中心作為預設值
    console.warn(`⚠️  使用預設台北座標: ${address}`);
    return { latitude: 25.033, longitude: 121.5654 };
  } catch (error) {
    console.error('Geocoding error:', error);
    // 返回台北市中心作為預設值
    return { latitude: 25.033, longitude: 121.5654 };
  }
};

// 群組收容所並取得座標
export const processShelterLocations = async (
  animals: any[]
): Promise<ShelterLocation[]> => {
  // 按收容所名稱分組
  const shelterGroups: { [key: string]: any[] } = {};

  animals.forEach((animal) => {
    const shelterName = animal.shelter || '未知收容所';
    if (!shelterGroups[shelterName]) {
      shelterGroups[shelterName] = [];
    }
    shelterGroups[shelterName].push(animal);
  });

  // 為每個收容所取得座標
  const shelterLocations: ShelterLocation[] = [];

  for (const [shelterName, shelterAnimals] of Object.entries(shelterGroups)) {
    // 使用第一個動物的地址作為收容所地址
    const address = shelterAnimals[0].location;
    const coordinate = await geocodeAddress(address);

    if (coordinate) {
      shelterLocations.push({
        name: shelterName,
        address,
        coordinate,
        animals: shelterAnimals,
      });
    }
  }

  return shelterLocations;
};
