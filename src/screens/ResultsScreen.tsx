import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Image,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const { width } = Dimensions.get('window');

const FLAG_MAP: Record<string, { icon: string; label: string }> = {
  v: { icon: '🌱', label: 'veg' },
  g: { icon: '🌾', label: 'gluten' },
  e: { icon: '🥚', label: 'egg' },
  d: { icon: '🥛', label: 'dairy' },
  f: { icon: '🐟', label: 'fish' },
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { dishes, restaurant } = route.params;
  const [selected, setSelected] = useState<(typeof dishes)[0] | null>(null);
  const withPhotos = dishes.filter((d) => d.photo.source !== 'none').length;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Sticky header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{restaurant?.name ?? 'Menu'}</Text>
          <Text style={styles.headerSub}>{dishes.length} dishes · tap any to peek</Text>
        </View>
        <View style={styles.langPill}>
          <Text style={styles.langText}>→ EN</Text>
        </View>
      </View>

      {/* Dish list */}
      <FlatList
        data={dishes}
        keyExtractor={(d) => d.originalName}
        contentContainerStyle={styles.list}
        renderItem={({ item: dish }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => setSelected(dish)}
          >
            {/* Thumbnail */}
            <View style={styles.thumb}>
              {dish.photo.source !== 'none' ? (
                <Image source={{ uri: dish.photo.uri }} style={styles.thumbImg} resizeMode="cover" />
              ) : (
                <View style={styles.thumbEmpty}>
                  <Text style={styles.thumbEmptyIcon}>✨</Text>
                  <Text style={styles.thumbEmptyText}>no{'\n'}photo</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.dishName} numberOfLines={1}>{dish.originalName}</Text>
              {dish.englishName !== dish.originalName && (
                <Text style={styles.dishEn}>↳ {dish.englishName}</Text>
              )}
              {dish.photo.source === 'search' && (
                <Text style={styles.webBadge}>WEB</Text>
              )}
            </View>

            {/* Price */}
            {dish.price && <Text style={styles.price}>{dish.price}</Text>}
          </TouchableOpacity>
        )}
      />

      {/* Floating scan-again pill */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.fabText}>📷  Scan again</Text>
        </TouchableOpacity>
      </View>

      {/* Dish modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        {selected && (
          <View style={styles.modal}>
            {/* Hero photo */}
            <View style={styles.modalHero}>
              {selected.photo.source !== 'none' ? (
                <Image
                  source={{ uri: selected.photo.uri }}
                  style={styles.modalImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalNoPhoto}>
                  <Text style={styles.modalNoPhotoText}>No photo found</Text>
                </View>
              )}

              {/* Close */}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
                <Text style={styles.closeBtnText}>×</Text>
              </TouchableOpacity>

              {/* Source badge */}
              {selected.photo.source === 'search' && (
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeText}>web search</Text>
                </View>
              )}
              {selected.photo.source === 'places' && (
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeText}>📷 from diners · Google</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={styles.modalNameRow}>
                <Text style={styles.modalName}>{selected.originalName}</Text>
                {selected.price && <Text style={styles.modalPrice}>{selected.price}</Text>}
              </View>

              {selected.englishName !== selected.originalName && (
                <View style={styles.translationPill}>
                  <Text style={styles.translationText}>↳ {selected.englishName}</Text>
                </View>
              )}

              <View style={styles.divider} />
              <Text style={styles.sourceNote}>
                {selected.photo.source === 'none'
                  ? 'No diner photos found for this dish.'
                  : selected.photo.source === 'places'
                  ? 'Photo from Google restaurant reviews.'
                  : 'Photo from web image search.'}
              </Text>
            </ScrollView>
          </View>
        )}
      </Modal>

    </SafeAreaView>
  );
}

const ACCENT = '#E85D2F';
const INK = '#1a1a1a';
const PAPER = '#fdfbf6';
const FAINT = '#dcdad3';
const MUTED = '#8a8a8a';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: FAINT,
    gap: 12,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backText: { fontSize: 16, color: INK, fontWeight: '700' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: INK },
  headerSub: { fontSize: 11, color: MUTED, fontFamily: 'Courier' },
  langPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 100, borderWidth: 1.5, borderColor: INK,
    backgroundColor: '#fff',
  },
  langText: { fontSize: 10, fontWeight: '700', fontFamily: 'Courier' },

  list: { padding: 16, paddingBottom: 100, gap: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: FAINT,
    borderRadius: 14,
    backgroundColor: '#fff',
  },

  thumb: {
    width: 56, height: 56, borderRadius: 10,
    overflow: 'hidden', flexShrink: 0,
    borderWidth: 1.5, borderColor: INK,
  },
  thumbImg: { width: 56, height: 56 },
  thumbEmpty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PAPER, gap: 2,
    borderWidth: 1.5, borderColor: ACCENT, borderStyle: 'dashed',
    borderRadius: 10,
  },
  thumbEmptyIcon: { fontSize: 16 },
  thumbEmptyText: { fontSize: 7, color: ACCENT, fontWeight: '700', textAlign: 'center', fontFamily: 'Courier' },

  cardInfo: { flex: 1, minWidth: 0, gap: 3 },
  dishName: { fontSize: 14, fontWeight: '700', color: INK },
  dishEn: { fontSize: 11, color: MUTED, fontFamily: 'Courier' },
  webBadge: { fontSize: 8, color: ACCENT, fontWeight: '700', fontFamily: 'Courier' },

  price: { fontSize: 14, fontWeight: '700', color: INK, flexShrink: 0 },

  fab: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center' },
  fabBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1.5, borderColor: INK,
    backgroundColor: INK,
    shadowColor: ACCENT,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Modal
  modal: { flex: 1, backgroundColor: PAPER },

  modalHero: { height: 300, position: 'relative' },
  modalImg: { width: '100%', height: 300 },
  modalNoPhoto: {
    height: 300, backgroundColor: '#f0ede8',
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1.5, borderBottomColor: INK,
  },
  modalNoPhotoText: { color: MUTED, fontSize: 14 },

  closeBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  closeBtnText: { fontSize: 18, fontWeight: '700', color: INK },

  sourceBadge: {
    position: 'absolute', bottom: 10, left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
  },
  sourceBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Courier' },

  modalContent: { flex: 1, padding: 22 },
  modalNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  modalName: { flex: 1, fontSize: 26, fontWeight: '800', color: INK },
  modalPrice: { fontSize: 22, fontWeight: '800', color: INK },

  translationPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 100, borderWidth: 1, borderColor: MUTED,
    borderStyle: 'dashed', marginBottom: 16,
  },
  translationText: { fontSize: 11, color: MUTED, fontFamily: 'Courier' },

  divider: { height: 1, borderTopWidth: 1, borderTopColor: FAINT, borderStyle: 'dashed', marginBottom: 12 },
  sourceNote: { fontSize: 11, color: MUTED, fontFamily: 'Courier' },
});
