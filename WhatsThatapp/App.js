import React, { Component } from 'react';

// Stack navigation for App

// Importing navigation components from the libraries
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importing the three screens needed for the navigation
import LoginScreen from './components/Login';
import SignupScreen from './components/Signup';
import TabNavScreen from './components/TabNav';

const Stack = createNativeStackNavigator();

// eslint-disable-next-line react/prefer-stateless-function
export default class App extends Component {
  render() {
    return (
      // Stack navigation inside Navigator Container
      // First navigator in the navigation hierarchy
      <NavigationContainer>
        {/* Hide navigation headers on the app */}
        {/* Making the login page the default initial page shown */}
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          {/* The screens in the stack navigation */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="TabNav" component={TabNavScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
