import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

function PeekLogo() {
  return (
    <View style={styles.logoRow}>
      {/* Eye / lens icon */}
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

          {/* Faux menu inside viewfinder */}
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
            onPress={() => navigation.navigate('Camera')}
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
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  helpText: { fontSize: 16, color: INK },

  greeting: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '800', color: INK, lineHeight: 36, marginBottom: 6 },
  subtitle: { fontSize: 14, color: MUTED },

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
    position: 'absolute',
    top: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  guideText: { color: '#fff', fontSize: 11, fontFamily: 'Courier' },

  fauxMenu: {
    backgroundColor: '#f4ede0',
    padding: 16,
    borderRadius: 4,
    width: '65%',
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
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
    borderWidth: 2.5, borderColor: INK,
    padding: 4,
    backgroundColor: '#fff',
    shadowColor: INK,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  shutterFill: { flex: 1, borderRadius: 40, backgroundColor: ACCENT },
});
