import React, { Component } from 'react';
import { View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './components/Login';
import SignupScreen from './components/Signup';
import ContactsScreen from './components/contacts';

const Stack = createNativeStackNavigator();

export default class App extends Component {
  render(){
    return(
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='Login'>
          <Stack.Screen name = 'Login' component={LoginScreen} />
          <Stack.Screen name = 'Signup' component={SignupScreen} />
          <Stack.Screen name = 'Contacts' component={ContactsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

}
}
