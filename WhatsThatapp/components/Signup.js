import React, { Component } from 'react';
import { Text, TextInput, View,TouchableOpacity, Button, Alert } from 'react-native';

// Import to handle email validation
import * as EmailValidator from 'email-validator';

class Signup extends Component {
  constructor(props){
    super(props);

    // Initialising state variables
    this.state = {
      firstname: "",
      lastname: "",
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

  //Adding user - interacting with the API
  addUser(){
    return fetch("http://localhost:3333/api/1.0.0/user",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Creating JSON with the user data
      body: JSON.stringify({
        first_name: this.state.firstname,
        last_name: this.state.lastname,
        email: this.state.email,
        password: this.state.password
      })
    })
    // Handles API response
    // Checks if it is a success and user was created or if there is an error
    .then((response) => {
      if(response.status === 201){
        return response.json();
      }else if(response.status === 400){
        throw "Email already exists or password isn't strong enough"
      }else{
        throw "Something went wrong"
      }
    })
    .then((rjson) => {
      console.log(rjson)
      this.setState({error: "User added successfully"})
      this.setState({submitted: false})
      console.log(this.state.error)
      // Navigate to login screen if sign up was successful
      this.props.navigation.navigate('Login')
    })
    .catch((error) => {
      console.log(error)
      this.setState({"error": error})
      this.setState({"submitted": false})
    });
  }

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // Checks if all the input fields are filled in
    if(!(this.state.firstname && this.state.lastname && this.state.email && this.state.password)){
      this.setState({error: "Must enter first name, last name, email and password"})
      return;    
    }

    // If inputs aren't valid according to the validation error message will return

    // Checks with the email validator if the email is valid
    if(!EmailValidator.validate(this.state.email)){
      this.setState({error: "Must enter valid email"})
      return;
    }

    // Reg Ex to validate first and last name
    const NAME_REGEX = new RegExp("^[A-Z][A-Za-z]+$")

    // Check if first name is valid
    if(!NAME_REGEX.test(this.state.firstname)){
      this.setState({error: "First name must start with capital letter and have no spaces, numbers or symbols"})
      return;
    }

    // Check if last name is valid
    if(!NAME_REGEX.test(this.state.lastname)){
      this.setState({error: "Last name must start with capital letter and have no spaces, numbers or symbols"})
      return;
    }

    // Reg Ex to validate password
    const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    // Check if password is valid
    if(!PASSWORD_REGEX.test(this.state.password)){
            this.setState({error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)"})
            return;
          }   
    
    // If all validation is successful all the addUser to make a POST request to the server
    this.addUser()
  }



  render() {
    return (
      <View>
        {/* First name input text */}
        <Text>First name:</Text>
        {/* Update firstname state with value from input */}
        {/* Set default value to the current firstname state */}
        <TextInput placeholder = "first name..." onChangeText={firstname => this.setState({firstname})} defaultValue={this.state.firstname}></TextInput>
        {/* If submitted and first name input is empty then display error message */}
        <>
        {this.state.submitted && !this.state.firstname && <Text>*A first name is required</Text>}
        </>
        {/* Last name input text */}
        <Text>Last name:</Text>
        {/* Update lastname state with value from input */}
        {/* Set default value to the current lastname state */}
        <TextInput placeholder = "last name..." onChangeText={lastname => this.setState({lastname})} defaultValue={this.state.lastname}></TextInput>
        {/* If submitted and last name input is empty then display error message */}
        <>
        {this.state.submitted && !this.state.lastname && <Text>*A last name is required</Text>}
        </>
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
        {/* Sign up button */}
        <TouchableOpacity onPress={this.onPressButton}><Text>Sign up</Text></TouchableOpacity>
        {/* Output error if there is an error */}
        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
      </View>
    );
  }

}

export default Signup