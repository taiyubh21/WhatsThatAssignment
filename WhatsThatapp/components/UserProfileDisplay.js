import React, { Component } from 'react';
import { Text, TextInput, View, TouchableOpacity, Image} from 'react-native';

// Import to handle email validation
import * as EmailValidator from 'email-validator';

import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileUpdate extends Component {
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
      submitted: false,
      // For holding the ID of current user
      currentUserId: null,
      photo: null
    }
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this)
    this.setCurrentUserId();
  }

  // Getting the current ID from async storage
  // Setting it to the new state
  // Making sure its an integer
    async setCurrentUserId() {
      const userId = await AsyncStorage.getItem("whatsthat_user_id");
      this.setState({ currentUserId: parseInt(userId) });
      console.log("Current user ID:" + this.state.currentUserId);
    }

    async getImage() {
      fetch("http://localhost:3333/api/1.0.0/user/"+ this.state.currentUserId + "/photo", {
          method: "GET",
          headers: {
              'Content-Type': 'media/png',
              "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          }
      })
      .then((response) => {
          if(response.status === 200){
            return response.blob()
          }else{
            throw "Error"
          }
      })
      .then((resBlob) => {
          let data = URL.createObjectURL(resBlob);

          this.setState({
              photo: data,
              isLoading: false
          })
      })
      .catch((err) => {
          console.log(err)
      })
  }

    async getData(){
      return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.currentUserId, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          }
        })    
        .then((response) => {
          if(response.status === 200){
              return response.json()
          }else{
              throw "Error";
          }
      })
      .then((responseJson) => {
          // Updating each state with their data
          this.setState({
              isLoading: false,
              firstname: responseJson.first_name,
              lastname: responseJson.last_name,
              email: responseJson.email
          })
      })
      .catch((error)=> {
          console.log(error);
      });
  }

  //Updating user - interacting with the API
  async updateUser(){

    let to_send = {};

    if(this.state.firstname != ""){
        to_send['first_name'] = this.state.firstname
    }

    if(this.state.lastname != ""){
        to_send['last_name'] = this.state.lastname
    }

    if(this.state.email != ""){
        to_send['email'] = this.state.email
    }

    if(this.state.password != ""){
        to_send['password'] = this.state.password
    }
    
    console.log(JSON.stringify(to_send));
    return fetch("http://localhost:3333/api/1.0.0/user/" + this.state.currentUserId,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
      "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token") 
    },
      // Creating JSON with the user data
      body: JSON.stringify(to_send)
    })
    // Handles API response
    // Checks if it is a success or if there is an error
    .then((response) => {
      console.log(response); // log the entire response object
      if(response.status === 200){
        console.log("User has been updated");
      }else if(response.status === 400){
        throw "Please try again"
      }
    })
    .catch((error) => {
      console.log(error)
      this.setState({error: "error"})
      this.setState({submitted: false})
    });
  }

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // If inputs aren't valid according to the validation error message will return
    // If inputs are null no need for validation
    // Checks with the email validator if the email is valid
    if(this.state.email != ""){
      if(!EmailValidator.validate(this.state.email)){
        this.setState({error: "Must enter valid email"})
        return;
      }
    }

    // Reg Ex to validate first and last name
    const NAME_REGEX = new RegExp("^[A-Z][A-Za-z]+$")

    // Check if first name is valid
    if(this.state.firstname != ""){
      if(!NAME_REGEX.test(this.state.firstname)){
        this.setState({error: "First name must start with capital letter and have no spaces, numbers or symbols"})
        return;
      }
  }

    // Check if last name is valid
    if(this.state.lastname != ""){
      if(!NAME_REGEX.test(this.state.lastname)){
        this.setState({error: "Last name must start with capital letter and have no spaces, numbers or symbols"})
        return;
      }
    }

    // Reg Ex to validate password
    const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    
    // Check if password is valid
    if(this.state.password != ""){
      if(!PASSWORD_REGEX.test(this.state.password)){
        this.setState({error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)"})
        return;
      }   
    }
    
    // If all validation is successful all the updateUser to make a PATCH request to the server
    this.updateUser()
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setCurrentUserId()
      .then(() => this.getImage())
      .then(() => this.getData())
      .then(() => this.setState({password: ""}))
      .catch((error) => console.log(error));
    })
  }

  componentWillUnmount(){
    this.unsubscribe();
  }

  render() {
        // If data is still being fetched return a loading spinner
        if(this.state.isLoading){
          return(
              <View>
                  <ActivityIndicator/>
              </View>
          );
        }else{
    return (
      <View>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Camera')}>
          <Image
            source={{
              uri: this.state.photo
            }}
            style={{
              width: 120,
              height: 120
            }}
          />
        </TouchableOpacity>
        <Text style={{position: 'absolute', bottom: 165, right: 140, textAlign: 'center', width: '100%', color: 'white'}}>Click to edit</Text>
        {/* First name input text */}
        <Text>First name:</Text>
        {/* Update firstname state with value from input */}
        {/* Set default value to the current firstname state */}
        <TextInput placeholder = "first name..." onChangeText={firstname => this.setState({firstname})} defaultValue={this.state.firstname}></TextInput>
        {/* Last name input text */}
        <Text>Last name:</Text>
        {/* Update lastname state with value from input */}
        {/* Set default value to the current lastname state */}
        <TextInput placeholder = "last name..." onChangeText={lastname => this.setState({lastname})} defaultValue={this.state.lastname}></TextInput>
        {/* Email input text */}
        <Text>Email:</Text>
        {/* Update email state with value from input */}
        {/* Set default value to the current email state */}
        <TextInput placeholder = "email..." onChangeText={email => this.setState({email})} defaultValue={this.state.email}></TextInput>
        {/* Password input text */}
        <Text>Password:</Text>
        {/* Update password state with value from input */}
        {/* Set default value to the current password state */}
        {/* Secure text entry to hide password text */}
        <TextInput placeholder = "password..." onChangeText={password => this.setState({password})} value={this.state.password} secureTextEntry={true}></TextInput>
        {/* Sign up button */}
        <TouchableOpacity onPress={this.onPressButton}><Text>Update profile</Text></TouchableOpacity>
        {/* Output error if there is an error */}
        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
      </View>
    );
  }
}

}

export default ProfileUpdate