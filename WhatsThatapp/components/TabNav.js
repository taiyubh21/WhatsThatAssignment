import React, { Component } from 'react';
import { View } from 'react-native';

// Tab navigation for App inside stack navigation

// Importing navigation components from the libraries
// Navigation container not in use since its second navigator in the hierarchy 
import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importing the two screens needed for the navigation
import ContactsScreen from './Contacts';
import ChatListScreen from './ChatList';
import UserListScreen from './UserListDisplay';
import UserProfile from './UserProfileDisplay';

const Tab = createBottomTabNavigator();

export default class TabNav extends Component {
  render(){
    return(
        // Hide navigation headers on the app
        // Making the contacts page the default initial page shown*
        <Tab.Navigator screenOptions={{headerShown: false}} initialRouteName='Contacts'>
          {/* The screens in the tab navigation*/}
          <Tab.Screen name = 'Contacts' component={ContactsScreen} />
          <Tab.Screen name = 'ChatList' component={ChatListScreen} />
          <Tab.Screen name = 'UserList' component={UserListScreen} />
          <Tab.Screen name = 'UserProfile' component={UserProfile} />
        </Tab.Navigator>
    );

}
}