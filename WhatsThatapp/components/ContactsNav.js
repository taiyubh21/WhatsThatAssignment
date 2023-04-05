import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Contacts from './contacts';
import UserListDisplay from './UserListDisplay';
import BlockedUsers from './BlockedUsers';

const Stack = createNativeStackNavigator();

export default class CamNav extends Component {
  render(){
    return(
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='ContactsScreen'>
          <Stack.Screen name = 'ContactsScreen' component={Contacts} />
          <Stack.Screen name="UserListDisplay" component={UserListDisplay} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
        </Stack.Navigator>
    );

}
}