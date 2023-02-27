import React, { Component } from 'react';
import { Text, TextInput, View,TouchableOpacity, Button, Alert } from 'react-native';


import * as EmailValidator from 'email-validator';

class Signup extends Component {
  constructor(props){
    super(props);

    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      error: "",
      submitted: false
    }
    this.onPressButton = this.onPressButton.bind(this)
  }

  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    if(!(this.state.firstname && this.state.lastname &&this.state.email && this.state.password)){
      this.setState({error: "Must enter first name, last name, email and password"})
      return;    
    }

    if(!EmailValidator.validate(this.state.email)){
      this.setState({error: "Must enter valid email"})
      return;
  }

    const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    if(!PASSWORD_REGEX.test(this.state.password)){
            this.setState({error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)"})
            return;
        }   

    this.props.navigation.navigate('Login')
  }

  render() {
    return (
      <View>
        <Text>First name:</Text>
        <TextInput placeholder = "first name..." onChangeText={firstname => this.setState({firstname})} defaultValue={this.state.firstname}></TextInput>
        <>
        {this.state.submitted && !this.state.firstname && <Text>*A first name is required</Text>}
        </>
        <Text>Last name:</Text>
        <TextInput placeholder = "last name..." onChangeText={lastname => this.setState({lastname})} defaultValue={this.state.lastname}></TextInput>
        <>
        {this.state.submitted && !this.state.lastname && <Text>*A last name is required</Text>}
        </>
        <Text>Email:</Text>
        <TextInput placeholder = "email..." onChangeText={email => this.setState({email})} defaultValue={this.state.email}></TextInput>
        <>
        {this.state.submitted && !this.state.email && <Text>*Email is required</Text>}
        </>
        <Text>Password:</Text>
        <TextInput placeholder = "password..." onChangeText={password => this.setState({password})} defaultValue={this.state.password} secureTextEntry={true}></TextInput>
        <>
        {this.state.submitted && !this.state.password && <Text>*Password is required</Text>}
        </>
        <TouchableOpacity onPress={this.onPressButton}><Text>Sign up</Text></TouchableOpacity>

        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
      </View>
    );
  }

}

export default Signup