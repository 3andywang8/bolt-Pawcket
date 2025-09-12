import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Filter, X } from 'lucide-react-native';

export interface FilterOptions {
  animalType: 'all' | 'cat' | 'dog';
  ageGroup: 'all' | 'young' | 'adult' | 'senior';
  size: 'all' | 'small' | 'medium' | 'large';
  urgent: boolean;
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

  const clearAllFilters = () => {
    onFiltersChange({
      animalType: 'all',
      ageGroup: 'all',
      size: 'all',
      urgent: false,
    });
  };

  const hasActiveFilters =
    filters.animalType !== 'all' ||
    filters.ageGroup !== 'all' ||
    filters.size !== 'all' ||
    filters.urgent;

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F4',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgentButtonActive: {
    backgroundColor: '#FEF3F2',
    borderColor: '#EF4444',
  },
  urgentEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  urgentText: {
    fontSize: 14,
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
});
