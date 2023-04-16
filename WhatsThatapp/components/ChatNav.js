import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatList from './ChatList';
import ConversationDisplay from './ConversationDisplay';
import ChatDetails from './ChatDetails';
import AddtoChat from './AddtoChat';

const Stack = createNativeStackNavigator();

export default class ChatNav extends Component {
  render(){
    return(
        <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='ChatList'>
          <Stack.Screen name = 'ChatList' component={ChatList} />
          <Stack.Screen name='ConversationDisplay' component={ConversationDisplay} />
          <Stack.Screen name='ChatDetails' component={ChatDetails} />
          <Stack.Screen name='AddtoChat' component={AddtoChat} />
        </Stack.Navigator>
    );

}
}