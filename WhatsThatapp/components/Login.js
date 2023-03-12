import React, { Component } from 'react';
import { Text, TextInput, View,TouchableOpacity, Button, Alert } from 'react-native';

// Import to handle email validation
import * as EmailValidator from 'email-validator';
// Import AsyncStorage for storing user ID and session token
import AsyncStorage from '@react-native-async-storage/async-storage';

class Login extends Component {
  constructor(props){
    super(props);

    // Initialising state variables
    this.state = {
      email: "",
      password: "",
      // Error message for failed validation
      error: "",
      // Checks if submission has happened or not
      submitted: false
    }
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this)
  }

  // Send POST request to login endpoint
  userLogin(){
    return fetch("http://localhost:3333/api/1.0.0/login",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Email and password in request body
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
    .then((response) => {
      // If the response is ok then return JSON response 
      if(response.status === 200){
        return response.json();
      // Else if its bad then throw an error
      }else if(response.status === 400){
        // Output error on screen if theres a 400 response
        this.setState({error: "Retype password and/or email"})
        throw "error"
      }
    })

    // If successful response then store user ID and session token in async storage
    .then(async (rJson) => {
      console.log(rJson)
      try{
        await AsyncStorage.setItem("whatsthat_user_id",rJson.id)
        await AsyncStorage.setItem("whatsthat_session_token",rJson.token)
        
        this.setState({"submitted": false})
        // navigate to the tab navigation screen
        this.props.navigation.navigate("TabNav")
      // Throw error if something is wrong
      }catch{
        throw "Something went wrong"
      }
  })
  }

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // Checks if all the input fields are filled in
    if(!(this.state.email && this.state.password)){
      this.setState({error: "Must enter email and password"})
      return;    
    }

    // If inputs aren't valid according to the validation error message will return

    // Checks with the email validator if the email is valid
    if(!EmailValidator.validate(this.state.email)){
      this.setState({error: "Must enter valid email"})
      return;
    }

    // Reg Ex to validate password
    const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    // Check if password is valid
    if(!PASSWORD_REGEX.test(this.state.password)){
            this.setState({error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)"})
            return;
          }

        // If all validation is successful all the userLogin to make a POST request to the server
        this.userLogin()
  }

  render() {
    return (
      <View>
        {/* Email input text */}
        <Text>Email:</Text>
        {/* Update email state with value from input */}
        {/* Set default value to the current email state */}
        <TextInput placeholder = "email..." onChangeText={email => this.setState({email})} defaultValue={this.state.email}></TextInput>
        {/* If submitted and email input is empty then display error message */}
        <>
        {this.state.submitted && !this.state.email && <Text>*Email is required</Text>}
        </>
        {/* Password input text */}
        <Text>Password:</Text>
        {/* Update password state with value from input */}
        {/* Set default value to the current password state */}
        {/* Secure text entry to hide password text */}
        <TextInput placeholder = "password..." onChangeText={password => this.setState({password})} defaultValue={this.state.password} secureTextEntry={true}></TextInput>
        {/* If submitted and password input is empty then display error message */}
        <>
        {this.state.submitted && !this.state.password && <Text>*Password is required</Text>}
        </>
        {/* Login button */}
        <TouchableOpacity onPress={this.onPressButton}><Text>Login</Text></TouchableOpacity>
        {/* Output error if there is an error */}
        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
        {/* If user doesn't have an account navigate to sign up page with button */}
        <Button
        title="Don't have an account? Click here to sign up"
        onPress={() => this.props.navigation.navigate('Signup')}
        />
      </View>
    );
  }

}

export default Login