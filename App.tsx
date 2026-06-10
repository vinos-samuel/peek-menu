import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DishResult } from './src/services/gemini';
import { DishPhoto } from './src/services/photos';
import { Restaurant } from './src/services/places';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import RestaurantPickerScreen from './src/screens/RestaurantPickerScreen';

export type DishWithPhoto = DishResult & { photo: DishPhoto };

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Camera: { restaurant?: Restaurant };
  Results: {
    menuPhotoUri: string;
    dishes: DishWithPhoto[];
    restaurant?: Restaurant;
  };
  RestaurantPicker: {
    onSelect: (r: Restaurant) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Home' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then((v) => {
      setInitialRoute(v === 'true' ? 'Home' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen
          name="RestaurantPicker"
          component={RestaurantPickerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
