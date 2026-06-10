import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { extractDishesFromMenu } from '../services/gemini';
import { getDishPhoto } from '../services/photos';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
};

const KEYS = {
  gemini: (Constants.expoConfig?.extra?.GEMINI_API_KEY ?? '') as string,
  places: (Constants.expoConfig?.extra?.PLACES_API_KEY ?? '') as string,
  searchKey: (Constants.expoConfig?.extra?.SEARCH_API_KEY ?? '') as string,
  searchCx: (Constants.expoConfig?.extra?.SEARCH_CX ?? '') as string,
};

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  async function handleCapture() {
    if (!cameraRef.current || processing) return;
    setProcessing(true);

    try {
      // 1. Take photo
      setStatusText('Reading menu…');
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) throw new Error('No photo captured');

      // 2. Get location (best-effort)
      let lat: number | null = null;
      let lng: number | null = null;
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.granted) {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      // 3. Extract dishes via Gemini
      setStatusText('Identifying dishes…');
      const dishes = await extractDishesFromMenu(photo.uri, KEYS.gemini);

      if (dishes.length === 0) {
        Alert.alert('No dishes found', 'Try again with better lighting or a clearer angle.');
        setProcessing(false);
        return;
      }

      // 4. Fetch photos concurrently (cap at 12 dishes to limit API calls)
      setStatusText(`Finding photos for ${dishes.length} dishes…`);
      const capped = dishes.slice(0, 12);
      const photos = await Promise.all(
        capped.map((d) =>
          getDishPhoto(d.englishName, lat, lng, {
            placesKey: KEYS.places,
            searchKey: KEYS.searchKey,
            searchCx: KEYS.searchCx,
          }),
        ),
      );

      const results = capped.map((d, i) => ({ ...d, photo: photos[i] }));

      navigation.replace('Results', { menuPhotoUri: photo.uri, dishes: results });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Something went wrong', msg);
    } finally {
      setProcessing(false);
      setStatusText('');
    }
  }

  if (!permission) return <View style={styles.center} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access needed</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Viewfinder guide */}
        <View style={styles.overlay}>
          <View style={styles.guide}>
            <Text style={styles.guideText}>Frame the menu</Text>
          </View>
        </View>
      </CameraView>

      {/* Processing overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#E85D2F" />
          <Text style={styles.processingText}>{statusText}</Text>
        </View>
      )}

      {/* Shutter */}
      {!processing && (
        <View style={styles.shutterRow}>
          <TouchableOpacity style={styles.shutter} onPress={handleCapture} activeOpacity={0.8}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF8' },
  permText: { fontSize: 16, color: '#333', marginBottom: 16 },
  permBtn: { backgroundColor: '#E85D2F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: '700' },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 120,
    alignItems: 'center',
  },
  guide: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  guideText: { color: '#fff', fontSize: 13, opacity: 0.9 },

  shutterRow: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  processingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
