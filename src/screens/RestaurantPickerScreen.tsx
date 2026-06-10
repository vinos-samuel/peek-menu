import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { searchRestaurants, Restaurant } from '../services/places';
import Constants from 'expo-constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RestaurantPicker'>;
  route: RouteProp<RootStackParamList, 'RestaurantPicker'>;
};

const PLACES_KEY = (Constants.expoConfig?.extra?.PLACES_API_KEY ?? '') as string;

export default function RestaurantPickerScreen({ navigation, route }: Props) {
  const { onSelect } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await searchRestaurants(query, PLACES_KEY);
      setResults(r);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  function handleSelect(r: Restaurant) {
    onSelect(r);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Where are you?</Text>
        </View>

        {/* Search input */}
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search restaurant name…"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color="#E85D2F" style={{ marginRight: 12 }} />}
        </View>

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.length > 1 && !loading ? (
              <Text style={styles.empty}>No restaurants found</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <View style={styles.rowIcon}>
                <Text style={styles.rowIconText}>📍</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowAddress} numberOfLines={1}>{item.address}</Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      </KeyboardAvoidingView>
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1.5, borderBottomColor: FAINT,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  backText: { fontSize: 16, fontWeight: '700', color: INK },
  headerTitle: { fontSize: 20, fontWeight: '800', color: INK },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16,
    borderWidth: 1.5, borderColor: INK, borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: INK, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  inputIcon: { fontSize: 16, paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: INK },

  list: { paddingHorizontal: 16, gap: 8 },
  empty: { textAlign: 'center', color: MUTED, fontSize: 14, marginTop: 40, fontFamily: 'Courier' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderWidth: 1.5, borderColor: FAINT,
    borderRadius: 14, backgroundColor: '#fff',
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
  },
  rowIconText: { fontSize: 16 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: INK },
  rowAddress: { fontSize: 11, color: MUTED, fontFamily: 'Courier', marginTop: 2 },
  rowChevron: { fontSize: 18, color: MUTED },
});
