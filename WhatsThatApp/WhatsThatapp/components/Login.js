import React, { Component } from 'react';
import { Text, TextInput, View,TouchableOpacity, Button, Alert } from 'react-native';


import * as EmailValidator from 'email-validator';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Login extends Component {
  constructor(props){
    super(props);

    this.state = {
      email: "",
      password: "",
      error: "",
      submitted: false
    }
    this.onPressButton = this.onPressButton.bind(this)
  }

  userLogin(){
    return fetch("http://localhost:3333/api/1.0.0/login",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
    .then((response) => {
      if(response.status === 200){
        return response.json();
      }else if(response.status === 400){
        throw "error"
      }
    })
    .then(async (rJson) => {
      console.log(rJson)
      try{
        await AsyncStorage.setItem("whatsthat_user_id",rJson.id)
        await AsyncStorage.setItem("whatsthat_session_token",rJson.token)
        
        this.setState({"submitted": false})

        this.props.navigation.navigate("TabNav")
      }catch{
        throw "Something went wrong"
      }
  })
  }

  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    if(!(this.state.email && this.state.password)){
      this.setState({error: "Must enter email and password"})
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

        this.userLogin()
  }

  render() {
    return (
      <View>
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
        <TouchableOpacity onPress={this.onPressButton}><Text>Login</Text></TouchableOpacity>

        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
        <Button
        title="Don't have an account? Click here to sign up"
        onPress={() => this.props.navigation.navigate('Signup')}
        />
      </View>
    );
  }

}

export default Login