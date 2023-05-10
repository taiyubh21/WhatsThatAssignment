import React, { Component } from 'react';
import {
  Text, TextInput, View, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';

// Import to handle email validation
import * as EmailValidator from 'email-validator';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      error: '',
      submitted: false,
      errorTimer: null,
      firstnameError: '',
      lastnameError: '',
      emailError: '',
      passwordError: '',
      firstnameTimer: null,
      lastnameTimer: null,
      emailTimer: null,
      passwordTimer: null,
      modalVisible: false,
      loginTimer: null,
    };
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    // Cleaning up all the timers
    if (this.state.errorTimer) {
      clearTimeout(this.state.errorTimer);
    }
    if (this.state.firstnameTimer) {
      clearTimeout(this.state.firstnameTimer);
    }
    if (this.state.lastnameTimer) {
      clearTimeout(this.state.lastnameTimer);
    }
    if (this.state.passwordTimer) {
      clearTimeout(this.state.passwordTimer);
    }
    if (this.state.emailTimer) {
      clearTimeout(this.state.emailTimer);
    }
    if (this.state.loginTimer) {
      clearTimeout(this.state.loginTimer);
    }
  }

  // For input validation
  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: '' });

    // Checks if all the input fields are filled in
    // eslint-disable-next-line max-len
    if (!this.state.firstname && !this.state.lastname && !this.state.email && !this.state.password) {
      this.setState({ error: 'Must enter first name, last name, email and password' });
      this.setState({
        errorTimer: setTimeout(() => {
          this.setState({ error: null, errorTimer: null });
        }, 3000),
      });
      return;
    }

    if (!this.state.firstname) {
      this.setState({ firstnameError: '*A first name is required' });
      this.setState({
        firstnameTimer: setTimeout(() => {
          this.setState({ firstnameError: null, firstnameTimer: null });
        }, 3000),
      });
      return;
    }

    if (!this.state.lastname) {
      this.setState({ lastnameError: '*A last name is required' });
      this.setState({
        lastnameTimer: setTimeout(() => {
          this.setState({ lastnameError: null, lastnameTimer: null });
        }, 3000),
      });
      return;
    }

    if (!this.state.email) {
      this.setState({ emailError: '*Email is required' });
      this.setState({
        emailTimer: setTimeout(() => {
          this.setState({ emailError: null, emailTimer: null });
        }, 3000),
      });
      return;
    }

    if (!this.state.password) {
      this.setState({ passwordError: '*Password is required' });
      this.setState({
        passwordTimer: setTimeout(() => {
          this.setState({ passwordError: null, passwordTimer: null });
        }, 3000),
      });
      return;
    }
    // If inputs aren't valid according to the validation error message will return

    // Checks with the email validator if the email is valid
    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: 'Must enter valid email' });
      this.setState({
        errorTimer: setTimeout(() => {
          this.setState({ error: null, errorTimer: null });
        }, 3000),
      });
      return;
    }

    // Reg Ex to validate first and last name
    const NAME_REGEX = /^[A-Z][A-Za-z]+$/;

    // Check if first name is valid
    if (!NAME_REGEX.test(this.state.firstname)) {
      this.setState({ error: 'First name must start with capital letter and have no spaces, numbers or symbols' });
      this.setState({
        errorTimer: setTimeout(() => {
          this.setState({ error: null, errorTimer: null });
        }, 3000),
      });
      return;
    }

    // Check if last name is valid
    if (!NAME_REGEX.test(this.state.lastname)) {
      this.setState({ error: 'Last name must start with capital letter and have no spaces, numbers or symbols' });
      this.setState({
        errorTimer: setTimeout(() => {
          this.setState({ error: null, errorTimer: null });
        }, 3000),
      });
      return;
    }

    // Reg Ex to validate password
    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    // Check if password is valid
    if (!PASSWORD_REGEX.test(this.state.password)) {
      this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" });
      return;
    }

    // If all validation is successful all the addUser to make a POST request to the server
    this.addUser();
  }

  // Adding user - interacting with the API
  addUser() {
    return fetch(
      'http://localhost:3333/api/1.0.0/user',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Creating JSON with the user data
        body: JSON.stringify({
          first_name: this.state.firstname,
          last_name: this.state.lastname,
          email: this.state.email,
          password: this.state.password,
        }),
      },
    )
    // Handles API response
    // Checks if it is a success and user was created or if there is an error
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } if (response.status === 400) {
          throw new Error('Email already exists. Please try again');
        } else if (response.status === 500) {
          throw new Error('Something went wrong');
        }
        return null;
      })
      .then((rjson) => {
        console.log(rjson);
        this.setState({ submitted: false });
        console.log('Successful login');
        // Display the success modal for a few seconds
        this.setState({ modalVisible: true });
        // Close modal and navigate to login screen after 4 seconds
        this.setState({
          loginTimer: setTimeout(() => {
            this.setState({ loginTimer: null, modalVisible: false });
            this.props.navigation.navigate('Login');
          }, 4000),
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error });
        this.setState({ submitted: false });
        // Error message will disappear after 3 seconds
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 3000),
        });
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>Whats</Text>
          <Text style={styles.logoText}>That?</Text>
        </View>
        <View style={styles.form}>
          {/* Update firstname state with value from input */}
          {/* Set default value to the current firstname state */}
          <TextInput style={styles.textInput} placeholder="First name..." onChangeText={(firstname) => this.setState({ firstname })} value={this.state.firstname} />
          {/* If submitted and first name input is empty then display error message */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {/* eslint-disable-next-line max-len */}
            {this.state.firstnameError && <Text style={styles.errorMessage}>{this.state.firstnameError}</Text>}
          </>
          {/* Update lastname state with value from input */}
          {/* Set default value to the current lastname state */}
          <TextInput style={styles.textInput} placeholder="Last name..." onChangeText={(lastname) => this.setState({ lastname })} value={this.state.lastname} />
          {/* If submitted and last name input is empty then display error message */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {/* eslint-disable-next-line max-len */}
            {this.state.lastnameError && <Text style={styles.errorMessage}>{this.state.lastnameError}</Text>}
          </>
          {/* Update email state with value from input */}
          {/* Set default value to the current email state */}
          <TextInput style={styles.textInput} placeholder="Email..." onChangeText={(email) => this.setState({ email })} value={this.state.email} />
          {/* If submitted and email input is empty then display error message */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {/* eslint-disable-next-line max-len */}
            {this.state.emailError && <Text style={styles.errorMessage}>{this.state.emailError}</Text>}
          </>
          {/* Update password state with value from input */}
          {/* Set default value to the current password state */}
          {/* Secure text entry to hide password text */}
          <TextInput style={styles.textInput} placeholder="Password..." onChangeText={(password) => this.setState({ password })} value={this.state.password} secureTextEntry />
          {/* If submitted and password input is empty then display error message */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {/* eslint-disable-next-line max-len */}
            {this.state.passwordError && <Text style={styles.errorMessage}>{this.state.passwordError}</Text>}
          </>
          {/* Sign up button */}
          <TouchableOpacity style={styles.signupButton} onPress={this.onPressButton}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
          <Text>{' '}</Text>
          {/* Output error if there is an error */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {this.state.error && <Text style={styles.errorMessage}>{this.state.error}</Text>}
          </>
          <TouchableOpacity style={styles.loginNav} onPress={() => this.props.navigation.navigate('Login')}>
            <Text style={styles.loginNavText}>Click here to login</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalStyle}>
              <Text style={styles.modalText}>You have successfully made an account</Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    backgroundColor: '#E5E4E2',
  },
  logo:
  {
    width: '40%',
    marginTop: 150,
    marginBottom: 45,
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
    color: '#069139',
  },
  form:
  {
    alignItems: 'center',
  },
  textInput:
  {
    width: '45%',
    height: 40,
    padding: 10,
    borderBottomWidth: 1,
  },
  signupButton:
  {
    width: '40%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderWidth: 3,
    borderColor: '#069139',
    backgroundColor: '#069139',
  },
  signupText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  loginNav:
  {
    alignItems: 'center',
    position: 'absolute',
    top: 400,
    left: 0,
    right: 0,
  },
  loginNavText:
  {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
    textDecorationLine: 'underline',
  },
  errorMessage:
  {
    color: 'red',
    textAlign: 'center',
  },
  modalContainer:
  {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle:
  {
    backgroundColor: '#E5E4E2',
    borderRadius: 10,
    padding: 15,
    width: '80%',
    borderColor: '#069139',
    borderWidth: 3,
  },
  modalText:
  {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Signup;
