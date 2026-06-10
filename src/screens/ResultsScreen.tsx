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
const CARD_IMG_H = 160;

export default function ResultsScreen({ navigation, route }: Props) {
  const { dishes } = route.params;
  const [selected, setSelected] = useState<(typeof dishes)[0] | null>(null);

  const withPhotos = dishes.filter((d) => d.photo.source !== 'none');
  const withoutPhotos = dishes.filter((d) => d.photo.source === 'none');

  // Group by section
  const sections: Record<string, typeof dishes> = {};
  dishes.forEach((d) => {
    const key = d.section ?? 'Menu';
    if (!sections[key]) sections[key] = [];
    sections[key].push(d);
  });

  const sectionList = Object.entries(sections);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.backText}>← New Scan</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {withPhotos.length} / {dishes.length} dishes
        </Text>
      </View>

      <FlatList
        data={sectionList}
        keyExtractor={([section]) => section}
        contentContainerStyle={styles.list}
        renderItem={({ item: [section, items] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{section}</Text>
            {items.map((dish) => (
              <TouchableOpacity
                key={dish.originalName}
                style={styles.card}
                activeOpacity={dish.photo.source !== 'none' ? 0.8 : 1}
                onPress={() => dish.photo.source !== 'none' && setSelected(dish)}
              >
                {/* Photo area */}
                <View style={styles.imgBox}>
                  {dish.photo.source !== 'none' ? (
                    <Image
                      source={{ uri: dish.photo.uri }}
                      style={styles.img}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noPhoto}>
                      <Text style={styles.noPhotoText}>No photo yet</Text>
                    </View>
                  )}
                  {dish.photo.source === 'search' && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>web</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.dishName}>{dish.originalName}</Text>
                  {dish.englishName !== dish.originalName && (
                    <Text style={styles.englishName}>{dish.englishName}</Text>
                  )}
                  {dish.price && <Text style={styles.price}>{dish.price}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Full-screen lightbox */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity
          style={styles.lightbox}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          {selected && (
            <>
              <Image
                source={{ uri: selected.photo.uri }}
                style={styles.lightboxImg}
                resizeMode="contain"
              />
              <View style={styles.lightboxInfo}>
                <Text style={styles.lightboxName}>{selected.originalName}</Text>
                {selected.englishName !== selected.originalName && (
                  <Text style={styles.lightboxEn}>{selected.englishName}</Text>
                )}
                {selected.price && (
                  <Text style={styles.lightboxPrice}>{selected.price}</Text>
                )}
              </View>
              <Text style={styles.lightboxDismiss}>Tap anywhere to close</Text>
            </>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backText: { color: '#E85D2F', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 13, color: '#999', fontWeight: '500' },

  list: { padding: 16, gap: 24 },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#999',
    textTransform: 'uppercase',
    paddingLeft: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  imgBox: { height: CARD_IMG_H, position: 'relative' },
  img: { width: '100%', height: CARD_IMG_H },
  noPhoto: {
    flex: 1,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoText: { fontSize: 12, color: '#BBB' },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },

  info: { padding: 14, gap: 3 },
  dishName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  englishName: { fontSize: 13, color: '#888' },
  price: { fontSize: 14, fontWeight: '600', color: '#E85D2F', marginTop: 2 },

  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  lightboxImg: { width: width - 48, height: (width - 48) * 0.7, borderRadius: 14 },
  lightboxInfo: { alignItems: 'center', gap: 4 },
  lightboxName: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  lightboxEn: { color: '#aaa', fontSize: 15, textAlign: 'center' },
  lightboxPrice: { color: '#E85D2F', fontSize: 18, fontWeight: '700', marginTop: 4 },
  lightboxDismiss: { color: '#555', fontSize: 12, marginTop: 8 },
});
