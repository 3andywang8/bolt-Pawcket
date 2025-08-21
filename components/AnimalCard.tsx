import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MapPin, Heart } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;

interface AnimalCardProps {
  animal: {
    id: string;
    name: string;
    age: string;
    breed: string;
    location: string;
    story: string;
    image: string;
    shelterDays: number;
    personality: string[];
  };
  onPress?: () => void;
  style?: any;
}

export default function AnimalCard({ animal, onPress, style }: AnimalCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}>
      <Image source={{ uri: animal.image }} style={styles.cardImage} />
      
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={styles.animalAge}>{animal.age}</Text>
        </View>
        
        <Text style={styles.animalBreed}>{animal.breed}</Text>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color="#78716C" />
          <Text style={styles.locationText}>{animal.location}</Text>
        </View>
        
        <View style={styles.personalityContainer}>
          {animal.personality.map((trait: string, idx: number) => (
            <View key={idx} style={styles.personalityTag}>
              <Text style={styles.personalityText}>{trait}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.storyText} numberOfLines={3}>
          {animal.story}
        </Text>
        
        <Text style={styles.shelterDays}>在收容所 {animal.shelterDays} 天</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  cardInfo: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  animalAge: {
    fontSize: 18,
    color: '#78716C',
  },
  animalBreed: {
    fontSize: 16,
    color: '#78716C',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#78716C',
    marginLeft: 4,
  },
  personalityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  personalityTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  personalityText: {
    fontSize: 12,
    color: '#44403C',
    fontWeight: '500',
  },
  storyText: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
    marginBottom: 8,
  },
  shelterDays: {
    fontSize: 12,
    color: '#78716C',
  },
});