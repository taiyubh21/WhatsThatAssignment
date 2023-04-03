import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserProfileDisplay from './UserProfileDisplay';
import CameraSendToServer from './Camera';

const Stack = createNativeStackNavigator();

export default class CamNav extends Component {
  render(){
    return(
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='UserProfileDisplay'>
          <Stack.Screen name = 'UserProfileDisplay' component={UserProfileDisplay} />
          <Stack.Screen name="Camera" component={CameraSendToServer} />
        </Stack.Navigator>
    );

}
}