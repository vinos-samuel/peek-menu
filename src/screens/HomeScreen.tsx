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

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>peek</Text>
          <Text style={styles.tagline}>See what you're ordering.</Text>
          <Text style={styles.sub}>
            Point your camera at any menu and instantly see photos of every dish.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.ctaText}>📷  Scan a Menu</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Works in any language, any restaurant</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF8' },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 48,
    paddingTop: 60,
  },
  hero: { gap: 12 },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    color: '#E85D2F',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 32,
  },
  sub: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginTop: 4,
  },
  cta: {
    backgroundColor: '#E85D2F',
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  },
});
