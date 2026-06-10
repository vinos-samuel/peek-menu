import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { detectNearbyRestaurant, Restaurant } from '../services/places';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const PLACES_KEY = (Constants.expoConfig?.extra?.PLACES_API_KEY ?? '') as string;

function PeekLogo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoIcon}>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner} />
        </View>
      </View>
      <Text style={styles.logoText}>peek</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    detectRestaurant();
  }, []);

  async function detectRestaurant() {
    setDetecting(true);
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) { setDetecting(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const r = await detectNearbyRestaurant(loc.coords.latitude, loc.coords.longitude, PLACES_KEY);
      setRestaurant(r);
    } catch {
      // silent — user can pick manually
    } finally {
      setDetecting(false);
    }
  }

  function openPicker() {
    navigation.navigate('RestaurantPicker', {
      onSelect: (r: Restaurant) => setRestaurant(r),
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <PeekLogo />
          <TouchableOpacity style={styles.helpBtn}>
            <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.title}>Ready when{'\n'}you are.</Text>
          <Text style={styles.subtitle}>Point at the menu and tap the shutter.</Text>
        </View>

        {/* Restaurant card */}
        <TouchableOpacity style={styles.restaurantCard} onPress={openPicker} activeOpacity={0.8}>
          <View style={styles.restaurantIcon}>
            <Text style={styles.restaurantIconText}>📍</Text>
          </View>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantLabel}>YOU'RE AT</Text>
            {detecting ? (
              <ActivityIndicator size="small" color="#E85D2F" style={{ marginTop: 4 }} />
            ) : restaurant ? (
              <>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantAddress} numberOfLines={1}>{restaurant.address}</Text>
              </>
            ) : (
              <Text style={styles.restaurantName}>Tap to select restaurant</Text>
            )}
          </View>
          <Text style={styles.changeText}>change ›</Text>
        </TouchableOpacity>

        {/* Viewfinder preview */}
        <View style={styles.viewfinder}>
          {/* Corner guides */}
          {[
            { top: 12, left: 12 },
            { top: 12, right: 12, flipX: true },
            { bottom: 12, right: 12, flipX: true, flipY: true },
            { bottom: 12, left: 12, flipY: true },
          ].map((c, i) => (
            <View key={i} style={[
              styles.corner,
              c.top !== undefined ? { top: c.top } : { bottom: c.bottom },
              c.left !== undefined ? { left: c.left } : { right: c.right },
              c.flipX ? styles.cornerFlipX : null,
              c.flipY ? styles.cornerFlipY : null,
            ]}>
              <View style={styles.cornerH} />
              <View style={styles.cornerV} />
            </View>
          ))}

          {/* Guide pill */}
          <View style={styles.guidePill}>
            <Text style={styles.guideText}>fit menu in frame</Text>
          </View>

          {/* Faux menu */}
          <View style={styles.fauxMenu}>
            <Text style={styles.fauxMenuTitle}>~ MENU ~</Text>
            {['Bruschetta', 'Carbonara', 'Tiramisù'].map((d, i) => (
              <View key={i} style={styles.fauxMenuRow}>
                <Text style={styles.fauxMenuDish}>{d}</Text>
                <View style={styles.fauxMenuDots} />
                <Text style={styles.fauxMenuPrice}>€{[6, 14, 7][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shutter row */}
        <View style={styles.shutterRow}>
          <View style={styles.shutterSide} />
          <TouchableOpacity
            style={styles.shutter}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Camera', { restaurant: restaurant ?? undefined })}
          >
            <View style={styles.shutterFill} />
          </TouchableOpacity>
          <View style={styles.shutterSide} />
        </View>

      </View>
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
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  logoOuter: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  logoInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  logoText: { fontSize: 22, fontWeight: '800', color: INK, letterSpacing: 0.5 },
  helpBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  helpText: { fontSize: 16, color: INK },

  greeting: { marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', color: INK, lineHeight: 36, marginBottom: 6 },
  subtitle: { fontSize: 14, color: MUTED },

  restaurantCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, marginBottom: 16,
    borderWidth: 1.5, borderColor: INK, borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  restaurantIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  restaurantIconText: { fontSize: 16 },
  restaurantInfo: { flex: 1 },
  restaurantLabel: { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 1, fontFamily: 'Courier' },
  restaurantName: { fontSize: 17, fontWeight: '700', color: INK, marginTop: 1 },
  restaurantAddress: { fontSize: 11, color: MUTED, marginTop: 1 },
  changeText: { fontSize: 13, fontWeight: '700', color: ACCENT, flexShrink: 0 },

  viewfinder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: INK,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: { position: 'absolute', width: 20, height: 20 },
  cornerH: { position: 'absolute', top: 0, left: 0, width: 20, height: 2.5, backgroundColor: ACCENT, borderRadius: 2 },
  cornerV: { position: 'absolute', top: 0, left: 0, width: 2.5, height: 20, backgroundColor: ACCENT, borderRadius: 2 },
  cornerFlipX: { transform: [{ scaleX: -1 }] },
  cornerFlipY: { transform: [{ scaleY: -1 }] },

  guidePill: {
    position: 'absolute', top: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100,
  },
  guideText: { color: '#fff', fontSize: 11, fontFamily: 'Courier' },

  fauxMenu: {
    backgroundColor: '#f4ede0', padding: 16, borderRadius: 4, width: '65%',
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20,
    elevation: 10,
  },
  fauxMenuTitle: { fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 2, color: INK, marginBottom: 10 },
  fauxMenuRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 },
  fauxMenuDish: { fontSize: 9, fontWeight: '700', color: INK },
  fauxMenuDots: { flex: 1, borderBottomWidth: 1, borderBottomColor: INK, borderStyle: 'dotted', marginHorizontal: 4, marginBottom: 2 },
  fauxMenuPrice: { fontSize: 9, color: INK },

  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shutterSide: { width: 48, height: 48 },
  shutter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2.5, borderColor: INK, padding: 4, backgroundColor: '#fff',
    shadowColor: INK, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  shutterFill: { flex: 1, borderRadius: 40, backgroundColor: ACCENT },
});
