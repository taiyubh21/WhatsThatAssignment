import { View } from 'react-native';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './components/Login';
import SignupScreen from './components/Signup';

const Stack = createNativeStackNavigator();

export default function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='Login'>
        <Stack.Screen name = 'Login' component={LoginScreen} />
        <Stack.Screen name = 'Signup' component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

