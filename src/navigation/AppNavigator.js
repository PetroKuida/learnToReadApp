/**
 * AppNavigator — Stack navigator wiring all four screens.
 *
 * headerShown: false everywhere — each screen draws its own chrome (or none).
 * initialRouteName is Home so the app always starts at the home screen.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import LettersScreen from '../screens/LettersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home"     component={HomeScreen} />
      <Stack.Screen name="Letters"  component={LettersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About"    component={AboutScreen} />
    </Stack.Navigator>
  );
}
