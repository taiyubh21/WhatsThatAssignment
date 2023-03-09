import React, { Component } from 'react';
import { View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ContactsScreen from './Contacts';
import ChatListScreen from './ChatList';

const Tab = createBottomTabNavigator();

export default class TabNav extends Component {
  render(){
    return(
        <Tab.Navigator screenOptions={{headerShown: false}} initialRouteName='Login'>
          <Tab.Screen name = 'Contacts' component={ContactsScreen} />
          <Tab.Screen name = 'ChatList' component={ChatListScreen} />
        </Tab.Navigator>
    );

}
}