import React, { Component } from 'react';
import { View } from 'react-native';

import SignupScreen from './components/Signup';

export default class App extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return (
        <SignupScreen />
    );
  }
}

