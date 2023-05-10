import React, { Component } from 'react';

// Tab navigation for App inside stack navigation

// Importing navigation components from the libraries
// Navigation container not in use since its second navigator in the hierarchy

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Importing the two screens needed for the navigation
import ChatNav from './ChatNav';
import CamNav from './CamNav';
import ContactNav from './ContactsNav';
import Logout from './Logout';

const Tab = createBottomTabNavigator();

export default class TabNav extends Component {
  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.checkLoggedIn();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_session_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  render() {
    return (
    // Hide navigation headers on the app
    // Making the contacts page the default initial page shown*
      <Tab.Navigator
        initialRouteName="Contacts"
        screenOptions={({ route }) => ({
          headerShown: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Contacts') {
              iconName = 'people';
            } else if (route.name === 'Chats') {
              iconName = 'chatbubbles';
            } else if (route.name === 'User Profile') {
              iconName = 'person';
            } else if (route.name === 'Logout') {
              iconName = 'log-out';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#069139',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {/* The screens in the tab navigation */}
        <Tab.Screen name="Contacts" component={ContactNav} />
        <Tab.Screen name="Chats" component={ChatNav} />
        <Tab.Screen name="User Profile" component={CamNav} />
        <Tab.Screen name="Logout" component={Logout} />
      </Tab.Navigator>
    );
  }
}
