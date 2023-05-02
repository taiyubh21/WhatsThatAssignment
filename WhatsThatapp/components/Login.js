import React, { Component } from 'react';
import { Text, TextInput, View,TouchableOpacity, Button, StyleSheet } from 'react-native';

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
      submitted: false,
      errorTimer: null,
      emailError: "",
      passwordError: "",
      emailTimer: null,
      passwordTimer: null
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
        throw "Retype password and/or email"
      }else if(response.status === 500){
        throw "Please try again"
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
    .catch((error) => {
      console.log(error)
      this.setState({"error": error})
      this.setState({"submitted": false})
      // Error message will disappear after 5 seconds
      this.setState({errorTimer: setTimeout(() => {
        this.setState({error: null, errorTimer: null})
      }, 5000)})
    });
  }

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // Checks if all the input fields are filled in
    if(!this.state.email && !this.state.password){
      this.setState({error: "Must enter email and password"})
      this.setState({errorTimer: setTimeout(() => {
        this.setState({error: null, errorTimer: null})
      }, 5000)})
      return;    
    }

    if (!this.state.email) {
      this.setState({emailError: "*Email is required"});
      this.setState({emailTimer: setTimeout(() => {
        this.setState({emailError: null, emailTimer: null})
      }, 5000)})
      return;
    }

    if (!this.state.password) {
      this.setState({passwordError: "*Password is required"});
      this.setState({passwordTimer: setTimeout(() => {
        this.setState({passwordError: null, passwordTimer: null})
      }, 5000)})
      return;
    }

    // If inputs aren't valid according to the validation error message will return

    // Checks with the email validator if the email is valid
    if(!EmailValidator.validate(this.state.email)){
      this.setState({error: "Must enter valid email"})
      this.setState({errorTimer: setTimeout(() => {
        this.setState({error: null, errorTimer: null})
      }, 5000)})
      return;
    }

    // Reg Ex to validate password
    const PASSWORD_REGEX = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    // Check if password is valid
    if(!PASSWORD_REGEX.test(this.state.password)){
            this.setState({error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)"})
            this.setState({errorTimer: setTimeout(() => {
              this.setState({error: null, errorTimer: null})
            }, 5000)})
            return;
          }

        // If all validation is successful all the userLogin to make a POST request to the server
        this.userLogin()
  }

  componentDidMount(){
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        email: "",
        password: ""
      })
    });
  }

  componentWillUnmount(){
    this.unsubscribe();
    if(this.state.errorTimer){
      clearTimeout(this.state.errorTimer) 
    }
    if(this.state.passwordTimer){
      clearTimeout(this.state.passwordTimer) 
    }
    if(this.state.emailTimer){
      clearTimeout(this.state.emailTimer) 
    }
  }

  render() {
    return (
      <View style = {styles.container}>
        <View style = {styles.logo}>
          <Text style = {styles.logoText} >Whats</Text>
          <Text style = {styles.logoText} >That?</Text>
        </View>
        <View style = {styles.form}>
          <Text>{' '}</Text>
          {/* Update email state with value from input */}
          {/* Set default value to the current email state */}
          <TextInput style = {styles.textInput} placeholder = "Email..." onChangeText={email => this.setState({email})} value={this.state.email}></TextInput>
          {/* If submitted and email input is empty then display error message */}
          <>
            {this.state.emailError && <Text style = {styles.errorMessage}>{this.state.emailError}</Text>}
          </>
          {/* Update password state with value from input */}
          {/* Set default value to the current password state */}
          {/* Secure text entry to hide password text */}
          <TextInput style = {styles.textInput} placeholder = "Password..." onChangeText={password => this.setState({password})} value={this.state.password} secureTextEntry={true}></TextInput>
          {/* If submitted and password input is empty then display error message */}
          <>
          {this.state.passwordError && <Text style = {styles.errorMessage}>{this.state.passwordError}</Text>}
          </>
          {/* Login button */}
          <TouchableOpacity style = {styles.loginButton} onPress={this.onPressButton}>
            <Text style={styles.loginText} >Login</Text>
          </TouchableOpacity>
          {/* Output error if there is an error */}
          <Text>{' '}</Text>
          <>
            {this.state.error && <Text style = {styles.errorMessage}>{this.state.error}</Text>}
          </>
          {/* If user doesn't have an account navigate to sign up page */}
          <TouchableOpacity style = {styles.signupNav} onPress={() => this.props.navigation.navigate('Signup')}>
            <Text style = {styles.signupNavText} >Click here to sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    backgroundColor: '#E5E4E2'    
  },
  logo: 
  {
    width: '40%',
    marginTop: 150,
    marginBottom: 35,
    padding: 15,
    borderWidth: 4,
    borderColor: '#069139',
    alignItems: 'center',
    borderRadius: 20,
    alignSelf: 'center',
  },
  logoText: 
  {
    fontSize: 26,
    lineHeight: 25,
    fontWeight: 'bold',
    color: '#069139'
  },
  form: 
  {
    alignItems: 'center'
  },
  textInput: 
  {
    width: '45%',
    height: 40,
    padding: 10,
    borderBottomWidth: 1,
  },
  loginButton:
  {
    width: '40%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139'
  },
  loginText:
  {
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 20
  },
  signupNav: 
  {
    alignItems: 'center',
    position: 'absolute',
    top: 400,
    left: 0,
    right: 0,
  },
  signupNavText: 
  {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
    textDecorationLine: 'underline'
  },
  errorMessage:
  {
    color: 'red',
    textAlign: 'center'
  }
})

export default Login