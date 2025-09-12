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

// 地址轉座標
export const geocodeAddress = async (
  address: string
): Promise<Coordinate | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${(Constants.expoConfig?.extra as any)?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
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
