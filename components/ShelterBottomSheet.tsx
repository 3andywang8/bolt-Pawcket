import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { X, Phone, MapPin, Clock, Heart } from 'lucide-react-native';
import { ShelterLocation } from '../utils/geocoding';
import { useRouter } from 'expo-router';

interface ShelterBottomSheetProps {
  shelter: ShelterLocation | null;
  visible: boolean;
  onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const ShelterBottomSheet: React.FC<ShelterBottomSheetProps> = ({
  shelter,
  visible,
  onClose,
}) => {
  const router = useRouter();

  if (!visible || !shelter) return null;

  const catCount = shelter.animals.filter(animal => animal.type === 'cat').length;
  const dogCount = shelter.animals.filter(animal => animal.type === 'dog').length;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.bottomSheet} onPress={() => {}}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.handleBar} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.shelterName}>{shelter.name}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>🐱 {catCount} 隻</Text>
                <Text style={styles.statsText}>🐶 {dogCount} 隻</Text>
                <Text style={styles.totalText}>共 {shelter.animals.length} 隻</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#78716C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactRow}>
            <MapPin size={16} color="#78716C" />
            <Text style={styles.contactText} numberOfLines={2}>
              {shelter.address}
            </Text>
          </View>
          {shelter.animals[0]?.shelterPhone && (
            <View style={styles.contactRow}>
              <Phone size={16} color="#78716C" />
              <Text style={styles.contactText}>{shelter.animals[0].shelterPhone}</Text>
            </View>
          )}
        </View>

        {/* Animals Grid */}
        <ScrollView style={styles.animalsSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>等待領養的朋友們</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.animalsGrid}>
            {shelter.animals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={styles.animalCard}
                onPress={() => {
                  onClose();
                  router.push(`/animal/${animal.id}` as any);
                }}>
                <Image source={{ uri: animal.image }} style={styles.animalImage} />
                
                {animal.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Clock size={10} color="#FFFFFF" />
                    <Text style={styles.urgentText}>急需</Text>
                  </View>
                )}
                
                <TouchableOpacity style={styles.favoriteButton}>
                  <Heart size={14} color="#78716C" strokeWidth={2} />
                </TouchableOpacity>
                
                <View style={styles.animalInfo}>
                  <Text style={styles.animalName} numberOfLines={1}>
                    {animal.name}
                  </Text>
                  <Text style={styles.animalDetails} numberOfLines={1}>
                    {animal.breed} • {animal.age}
                  </Text>
                  <View style={styles.personalityTags}>
                    {animal.personality.slice(0, 2).map((trait: string, idx: number) => (
                      <View key={idx} style={styles.personalityTag}>
                        <Text style={styles.personalityText}>{trait}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
    minHeight: screenHeight * 0.4,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shelterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#78716C',
  },
  totalText: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#78716C',
    marginLeft: 8,
    flex: 1,
  },
  animalsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginVertical: 16,
  },
  animalsGrid: {
    paddingRight: 20,
    paddingBottom: 20,
  },
  animalCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  urgentBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  urgentText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalInfo: {
    padding: 8,
  },
  animalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 2,
  },
  animalDetails: {
    fontSize: 11,
    color: '#78716C',
    marginBottom: 4,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  personalityTag: {
    backgroundColor: '#F5F5F4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    marginRight: 3,
    marginBottom: 2,
  },
  personalityText: {
    fontSize: 9,
    color: '#44403C',
    fontWeight: '500',
  },
});