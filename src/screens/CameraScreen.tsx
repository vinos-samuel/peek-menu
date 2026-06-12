import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { extractDishesFromMenu } from '../services/gemini';
import { getDishPhotos } from '../services/photos';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

const extra = Constants.expoConfig?.extra ?? {};
console.log('DEBUG extra keys:', JSON.stringify({
  gemini: extra.GEMINI_API_KEY?.substring(0, 10),
  places: extra.PLACES_API_KEY?.substring(0, 10),
}));

const KEYS = {
  gemini: (extra.GEMINI_API_KEY ?? '') as string,
};

const STEPS = [
  'Reading menu…',
  'Identifying dishes…',
  'Finding photos…',
];

export default function CameraScreen({ navigation, route }: Props) {
  const restaurant = route.params?.restaurant;
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  async function handleCapture() {
    if (!cameraRef.current || processing) return;
    setProcessing(true);
    setStepIndex(0);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) throw new Error('No photo captured');

      setStepIndex(1);
      const dishes = await extractDishesFromMenu(photo.uri, KEYS.gemini);

      if (dishes.length === 0) {
        Alert.alert('No dishes found', 'Try again with better lighting or a clearer angle.');
        setProcessing(false);
        return;
      }

      setStepIndex(2);
      const capped = dishes.slice(0, 12);
      const photoMap = await getDishPhotos(capped.map((d) => d.englishName), restaurant?.name);
      const results = capped.map((d) => ({ ...d, photo: photoMap[d.englishName] }));
      navigation.replace('Results', { menuPhotoUri: photo.uri, dishes: results, restaurant });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Something went wrong', msg);
    } finally {
      setProcessing(false);
      setStepIndex(0);
    }
  }

  if (!permission) return <View style={styles.safe} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permContainer}>
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Text style={styles.permSub}>Peek needs your camera to read menus.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">

        {/* Corner guides */}
        {[
          { top: 60, left: 24 },
          { top: 60, right: 24, flipX: true },
          { bottom: 140, right: 24, flipX: true, flipY: true },
          { bottom: 140, left: 24, flipY: true },
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

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>×</Text>
        </TouchableOpacity>

      </CameraView>

      {/* Processing overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#E85D2F" />
          <Text style={styles.processingText}>{STEPS[stepIndex]}</Text>
          <View style={styles.stepDots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i <= stepIndex ? styles.dotActive : null]} />
            ))}
          </View>
        </View>
      )}

      {/* Shutter row */}
      {!processing && (
        <View style={styles.shutterRow}>
          <View style={styles.shutterSide} />
          <TouchableOpacity
            style={styles.shutter}
            activeOpacity={0.8}
            onPress={handleCapture}
          >
            <View style={styles.shutterFill} />
          </TouchableOpacity>
          <View style={styles.shutterSide} />
        </View>
      )}
    </View>
  );
}

const ACCENT = '#E85D2F';
const INK = '#1a1a1a';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDFBF6' },
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  permContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 12,
  },
  permTitle: { fontSize: 20, fontWeight: '800', color: INK },
  permSub: { fontSize: 14, color: '#8a8a8a', textAlign: 'center' },
  permBtn: {
    marginTop: 8, backgroundColor: ACCENT,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  corner: { position: 'absolute', width: 24, height: 24 },
  cornerH: { position: 'absolute', top: 0, left: 0, width: 24, height: 2.5, backgroundColor: ACCENT, borderRadius: 2 },
  cornerV: { position: 'absolute', top: 0, left: 0, width: 2.5, height: 24, backgroundColor: ACCENT, borderRadius: 2 },
  cornerFlipX: { transform: [{ scaleX: -1 }] },
  cornerFlipY: { transform: [{ scaleY: -1 }] },

  guidePill: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  guideText: { color: '#fff', fontSize: 12, fontFamily: 'Courier' },

  backBtn: {
    position: 'absolute',
    top: 60, left: 20,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1.5, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  backText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 24 },

  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  processingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: ACCENT },

  shutterRow: {
    position: 'absolute', bottom: 48,
    left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  shutterSide: { width: 48, height: 48 },
  shutter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2.5, borderColor: '#fff',
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterFill: { flex: 1, borderRadius: 40, backgroundColor: '#fff' },
});
