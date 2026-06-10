import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const { width } = Dimensions.get('window');

const STEPS = [
  {
    title: 'See before\nyou order.',
    sub: 'Photos of every dish on any menu, anywhere.',
    illustration: 'menu',
  },
  {
    title: 'Snap the\nmenu.',
    sub: "Point your camera at any printed menu — that's it.",
    illustration: 'camera',
  },
  {
    title: 'Real photos\nfrom diners.',
    sub: 'We pull actual customer photos. No photo? Web search fills the gap.',
    illustration: 'gallery',
  },
];

function MenuIllustration() {
  return (
    <View style={il.menuWrap}>
      <View style={il.menuSheet}>
        {['Bruschetta', 'Carbonara', 'Tiramisù', 'Panna Cotta'].map((d, i) => (
          <View key={i} style={il.menuRow}>
            <Text style={il.menuDish}>{d}</Text>
            <View style={il.menuDots} />
            <Text style={il.menuPrice}>€{[6, 14, 7, 7][i]}</Text>
          </View>
        ))}
      </View>
      {/* Photo bubbles */}
      <View style={[il.bubble, { top: 20, right: -10, transform: [{ rotate: '6deg' }] }]}>
        <View style={il.bubbleInner} /><Text style={il.bubbleLabel}>dish</Text>
      </View>
      <View style={[il.bubble, { bottom: 20, left: -10, transform: [{ rotate: '-8deg' }] }]}>
        <View style={il.bubbleInner} /><Text style={il.bubbleLabel}>dish</Text>
      </View>
    </View>
  );
}

function CameraIllustration() {
  return (
    <View style={il.camWrap}>
      <View style={il.camBody}>
        <View style={il.camLens}>
          <View style={il.camLensInner} />
        </View>
        {/* corner guides */}
        {[
          { top: 8, left: 8 },
          { top: 8, right: 8, fx: true },
          { bottom: 8, left: 8, fy: true },
          { bottom: 8, right: 8, fx: true, fy: true },
        ].map((c, i) => (
          <View key={i} style={[
            il.camCorner,
            c.top !== undefined ? { top: c.top } : { bottom: c.bottom },
            c.left !== undefined ? { left: c.left } : { right: c.right },
            c.fx ? { transform: [{ scaleX: -1 }] } : null,
            c.fy ? { transform: [{ scaleY: -1 }] } : null,
          ]}>
            <View style={il.camCornerH} />
            <View style={il.camCornerV} />
          </View>
        ))}
      </View>
    </View>
  );
}

function GalleryIllustration() {
  return (
    <View style={il.galleryWrap}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={il.galleryCell}>
          <View style={il.galleryCellInner} />
          <Text style={il.galleryCellLabel}>{i === 2 ? 'web' : 'real'}</Text>
        </View>
      ))}
    </View>
  );
}

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem('onboarded', 'true');
      navigation.replace('Home');
    }
  }

  async function handleSkip() {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationBox}>
          {current.illustration === 'menu' && <MenuIllustration />}
          {current.illustration === 'camera' && <CameraIllustration />}
          {current.illustration === 'gallery' && <GalleryIllustration />}
        </View>
      </View>

      {/* Copy */}
      <View style={styles.copy}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.sub}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step ? styles.dotActive : null]} />
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.ctaText}>{step === STEPS.length - 1 ? "Let's eat →" : 'Next'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const ACCENT = '#E85D2F';
const INK = '#1a1a1a';
const PAPER = '#fdfbf6';
const FAINT = '#dcdad3';
const MUTED = '#8a8a8a';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER, paddingHorizontal: 28, paddingBottom: 32 },

  skipBtn: { alignSelf: 'flex-end', paddingVertical: 12 },
  skipText: { fontSize: 12, color: MUTED, fontFamily: 'Courier' },

  illustrationWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustrationBox: {
    width: 220, height: 240,
    borderWidth: 1.5, borderColor: INK,
    borderRadius: 16, padding: 14,
    backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: INK, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },

  copy: { marginBottom: 28, gap: 10 },
  title: { fontSize: 32, fontWeight: '800', color: INK, lineHeight: 38 },
  sub: { fontSize: 15, color: MUTED, lineHeight: 22 },

  dots: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: FAINT, borderWidth: 1, borderColor: INK },
  dotActive: { width: 22, backgroundColor: ACCENT },

  cta: {
    backgroundColor: ACCENT, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: INK,
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

// Illustration sub-styles
const il = StyleSheet.create({
  menuWrap: { width: '100%', height: '100%', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  menuSheet: {
    width: '80%', backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
    padding: 14, gap: 10,
  },
  menuRow: { flexDirection: 'row', alignItems: 'flex-end' },
  menuDish: { fontSize: 10, fontWeight: '700', color: INK },
  menuDots: { flex: 1, borderBottomWidth: 1, borderBottomColor: INK, borderStyle: 'dotted', marginHorizontal: 4, marginBottom: 2 },
  menuPrice: { fontSize: 10, color: INK },
  bubble: {
    position: 'absolute', width: 62, height: 50,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8,
    backgroundColor: FAINT, alignItems: 'center', justifyContent: 'center',
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  bubbleInner: { width: 30, height: 24, backgroundColor: '#ddd', borderRadius: 4, marginBottom: 3 },
  bubbleLabel: { fontSize: 7, color: MUTED, fontFamily: 'Courier' },

  camWrap: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  camBody: {
    width: 160, height: 120,
    borderWidth: 2, borderColor: INK, borderRadius: 10,
    backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  camLens: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  camLensInner: { width: 32, height: 32, borderRadius: 16, backgroundColor: ACCENT },
  camCorner: { position: 'absolute', width: 14, height: 14 },
  camCornerH: { position: 'absolute', top: 0, left: 0, width: 14, height: 2, backgroundColor: ACCENT, borderRadius: 1 },
  camCornerV: { position: 'absolute', top: 0, left: 0, width: 2, height: 14, backgroundColor: ACCENT, borderRadius: 1 },

  galleryWrap: { width: '100%', height: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 4 },
  galleryCell: {
    width: '45%', flex: 1, minHeight: 80,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8,
    backgroundColor: FAINT, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  galleryCellInner: { width: 40, height: 32, backgroundColor: '#ccc', borderRadius: 4 },
  galleryCellLabel: { fontSize: 8, color: MUTED, fontFamily: 'Courier' },
});

const ACCENT_REF = '#E85D2F';
const FAINT_REF = '#dcdad3';
const MUTED_REF = '#8a8a8a';
