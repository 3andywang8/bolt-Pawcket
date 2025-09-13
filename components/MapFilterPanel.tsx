import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Filter, X, Check } from 'lucide-react-native';

export interface FilterOptions {
  animalType: 'all' | 'cat' | 'dog';
  ageGroup: 'all' | 'young' | 'adult' | 'senior';
  size: 'all' | 'small' | 'medium' | 'large';
  urgent: boolean;
  personality: string[];
  gender: string[];
  health: string[];
}

interface MapFilterPanelProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const MapFilterPanel: React.FC<MapFilterPanelProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  if (!visible) return null;

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: 'personality' | 'gender' | 'health',
    value: string
  ) => {
    const currentValues = filters[key];
    const isSelected = currentValues.includes(value);
    
    const newValues = isSelected
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    onFiltersChange({ ...filters, [key]: newValues });
  };

  // 篩選選項常數
  const filterOptions = {
    personality: ['親人', '活潑', '溫和', '獨立', '愛玩', '安靜', '黏人', '膽小', '好奇', '聰明'],
    gender: ['男生', '女生'],
    health: ['健康良好', '已絕育', '未絕育', '已施打疫苗', '需要特殊照顧', '有慢性病']
  };

  const clearAllFilters = () => {
    onFiltersChange({
      animalType: 'all',
      ageGroup: 'all',
      size: 'all',
      urgent: false,
      personality: [],
      gender: [],
      health: [],
    });
  };

  const hasActiveFilters =
    filters.animalType !== 'all' ||
    filters.ageGroup !== 'all' ||
    filters.size !== 'all' ||
    filters.urgent ||
    filters.personality.length > 0 ||
    filters.gender.length > 0 ||
    filters.health.length > 0;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Filter size={20} color="#F97316" />
            <Text style={styles.headerTitle}>篩選條件</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#78716C" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 動物類型 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>動物類型</Text>
            <View style={styles.optionRow}>
              {[
                { key: 'all', label: '全部', emoji: '🐾' },
                { key: 'cat', label: '貓咪', emoji: '🐱' },
                { key: 'dog', label: '狗狗', emoji: '🐶' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    filters.animalType === option.key &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => updateFilter('animalType', option.key as any)}
                >
                  <Text style={styles.emoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      filters.animalType === option.key &&
                        styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 年齡分組 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>年齡</Text>
            <View style={styles.optionRow}>
              {[
                { key: 'all', label: '全部' },
                { key: 'young', label: '幼年' },
                { key: 'adult', label: '成年' },
                { key: 'senior', label: '老年' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    filters.ageGroup === option.key &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => updateFilter('ageGroup', option.key as any)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.ageGroup === option.key &&
                        styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 體型大小 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>體型</Text>
            <View style={styles.optionRow}>
              {[
                { key: 'all', label: '全部' },
                { key: 'small', label: '小型' },
                { key: 'medium', label: '中型' },
                { key: 'large', label: '大型' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.optionButton,
                    filters.size === option.key && styles.optionButtonActive,
                  ]}
                  onPress={() => updateFilter('size', option.key as any)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      filters.size === option.key && styles.optionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 緊急狀態 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>特殊狀態</Text>
            <TouchableOpacity
              style={[
                styles.urgentButton,
                filters.urgent && styles.urgentButtonActive,
              ]}
              onPress={() => updateFilter('urgent', !filters.urgent)}
            >
              <Text style={styles.urgentEmoji}>🚨</Text>
              <Text
                style={[
                  styles.urgentText,
                  filters.urgent && styles.urgentTextActive,
                ]}
              >
                只看急需領養
              </Text>
            </TouchableOpacity>
          </View>

          {/* 性格特質 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>性格特質</Text>
            <View style={styles.tagContainer}>
              {filterOptions.personality.map((trait) => (
                <TouchableOpacity
                  key={trait}
                  style={[
                    styles.tagButton,
                    filters.personality.includes(trait) && styles.tagButtonSelected
                  ]}
                  onPress={() => toggleArrayFilter('personality', trait)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.personality.includes(trait) && styles.tagTextSelected
                  ]}>
                    {trait}
                  </Text>
                  {filters.personality.includes(trait) && (
                    <Check size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 性別 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>性別</Text>
            <View style={styles.tagContainer}>
              {filterOptions.gender.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.tagButton,
                    filters.gender.includes(gender) && styles.tagButtonSelected
                  ]}
                  onPress={() => toggleArrayFilter('gender', gender)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.gender.includes(gender) && styles.tagTextSelected
                  ]}>
                    {gender}
                  </Text>
                  {filters.gender.includes(gender) && (
                    <Check size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 健康狀態 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>健康狀態</Text>
            <View style={styles.tagContainer}>
              {filterOptions.health.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.tagButton,
                    filters.health.includes(condition) && styles.tagButtonSelected
                  ]}
                  onPress={() => toggleArrayFilter('health', condition)}
                >
                  <Text style={[
                    styles.tagText,
                    filters.health.includes(condition) && styles.tagTextSelected
                  ]}>
                    {condition}
                  </Text>
                  {filters.health.includes(condition) && (
                    <Check size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>清除篩選</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>套用篩選</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginLeft: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#F97316',
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#78716C',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  urgentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F4',
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  urgentButtonActive: {
    backgroundColor: '#FEF3F2',
    borderColor: '#EF4444',
  },
  urgentEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  urgentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#78716C',
  },
  urgentTextActive: {
    color: '#EF4444',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F4',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // New tag styles for personality, gender, health filters
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  tagButtonSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  tagText: {
    fontSize: 14,
    color: '#78716C',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
});
