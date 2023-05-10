import React, { Component } from 'react';
import {
  Text, TextInput, View, TouchableOpacity, Image, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';

// Import to handle email validation
import * as EmailValidator from 'email-validator';

import AsyncStorage from '@react-native-async-storage/async-storage';

class ProfileUpdate extends Component {
  constructor(props) {
    super(props);

    // Initialising state variables
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      // Error message for failed validation
      error: '',
      // Checks if submission has happened or not
      submitted: false,
      // For holding the ID of current user
      currentUserId: null,
      photo: null,
      errorTimer: null,
      modalVisible: false,
      modalTimer: null,
    };
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this);
    this.setCurrentUserId();
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setCurrentUserId()
        .then(() => this.getImage())
        .then(() => this.getData())
        .then(() => this.setState({ password: '' }))
        .catch((error) => console.log(error));
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (this.state.errorTimer) {
      clearTimeout(this.state.errorTimer);
    }
    if (this.state.modalTimer) {
      clearTimeout(this.state.modalTimer);
    }
  }

  // For input validation
  onPressButton() {
    this.setState({ submitted: true });
    this.setState({ error: '' });
    // If inputs aren't valid according to the validation error message will return
    // If inputs are null no need for validation
    // Checks with the email validator if the email is valid
    if (this.state.email !== '') {
      if (!EmailValidator.validate(this.state.email)) {
        this.setState({ error: 'Must enter valid email' });
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 5000),
        });
        return;
      }
    }
    // Reg Ex to validate first and last name
    const NAME_REGEX = /^[A-Z][A-Za-z]+$/;
    // Check if first name is valid
    if (this.state.firstname !== '') {
      if (!NAME_REGEX.test(this.state.firstname)) {
        this.setState({ error: 'First name must start with capital letter and have no spaces, numbers or symbols' });
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 5000),
        });
        return;
      }
    }
    // Check if last name is valid
    if (this.state.lastname !== '') {
      if (!NAME_REGEX.test(this.state.lastname)) {
        this.setState({ error: 'Last name must start with capital letter and have no spaces, numbers or symbols' });
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 5000),
        });
        return;
      }
    }
    // Reg Ex to validate password
    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    // Check if password is valid
    if (this.state.password !== '') {
      if (!PASSWORD_REGEX.test(this.state.password)) {
        this.setState({ error: "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)" });
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 5000),
        });
        return;
      }
    }
    // If all validation is successful all the updateUser to make a PATCH request to the server
    this.updateUser();
  }

  // Getting the current ID from async storage
  // Setting it to the new state
  // Making sure its an integer
  async setCurrentUserId() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ currentUserId: parseInt(userId, 10) });
    console.log(`Current user ID:${this.state.currentUserId}`);
  }

  async getImage() {
    fetch(`http://localhost:3333/api/1.0.0/user/${this.state.currentUserId}/photo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'media/png',
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        }
        throw new Error('Something went wrong');
      })
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);

        this.setState({
          photo: data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async getData() {
    return fetch(`http://localhost:3333/api/1.0.0/user/${this.state.currentUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error('Something went wrong');
      })
      .then((responseJson) => {
        // Updating each state with their data
        this.setState({
          isLoading: false,
          firstname: responseJson.first_name,
          lastname: responseJson.last_name,
          email: responseJson.email,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Updating user - interacting with the API
  async updateUser() {
    const toSend = {};

    if (this.state.firstname !== '') {
      toSend.first_name = this.state.firstname;
    }

    if (this.state.lastname !== '') {
      toSend.last_name = this.state.lastname;
    }

    if (this.state.email !== '') {
      toSend.email = this.state.email;
    }

    if (this.state.password !== '') {
      toSend.password = this.state.password;
    }

    console.log(JSON.stringify(toSend));
    return fetch(
      `http://localhost:3333/api/1.0.0/user/${this.state.currentUserId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        // Creating JSON with the user data
        body: JSON.stringify(toSend),
      },
    )
    // Handles API response
    // Checks if it is a success or if there is an error
      .then((response) => {
        console.log(response); // log the entire response object
        if (response.status === 200) {
          console.log('User has been updated');
          this.setState({ modalVisible: true });
          // Close modal and navigate to login screen after 4 seconds
          this.setState({
            modalTimer: setTimeout(() => {
              this.setState({ modalTimer: null, modalVisible: false });
            }, 4000),
          });
        } else if (response.status === 400) {
          throw new Error('Please try again');
        } else {
          throw new Error('Something went wrong');
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: 'error' });
        this.setState({ submitted: false });
        // Error message will disappear after 5 seconds
        this.setState({
          errorTimer: setTimeout(() => {
            this.setState({ error: null, errorTimer: null });
          }, 5000),
        });
      });
  }

  render() {
    // If data is still being fetched return a loading spinner
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.pageName}>User Profile</Text>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Camera')} style={styles.imgButton}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: this.state.photo }}
              style={styles.imgStyle}
            />
            <Text style={styles.imgText}>Click to edit</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.form}>
          {/* Update firstname state with value from input */}
          {/* Set default value to the current firstname state */}
          <TextInput style={styles.textInput} placeholder="First name..." onChangeText={(firstname) => this.setState({ firstname })} value={this.state.firstname} />
          {/* Update lastname state with value from input */}
          {/* Set default value to the current lastname state */}
          <TextInput style={styles.textInput} placeholder="Last name..." onChangeText={(lastname) => this.setState({ lastname })} value={this.state.lastname} />
          {/* Update email state with value from input */}
          {/* Set default value to the current email state */}
          <TextInput style={styles.textInput} placeholder="Email..." onChangeText={(email) => this.setState({ email })} value={this.state.email} />
          {/* Update password state with value from input */}
          {/* Set default value to the current password state */}
          {/* Secure text entry to hide password text */}
          <TextInput style={styles.textInput} placeholder="Password..." onChangeText={(password) => this.setState({ password })} value={this.state.password} secureTextEntry />
          {/* Update button */}
          <TouchableOpacity style={styles.updateButton} onPress={this.onPressButton}>
            <Text style={styles.updateText}>Update profile</Text>
          </TouchableOpacity>
          <Text>{' '}</Text>
          {/* Output error if there is an error */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {this.state.error && <Text style={styles.errorMessage}>{this.state.error}</Text>}
          </>
        </View>
        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalStyle}>
              <Text style={styles.modalText}>You have successfully updated your account</Text>
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
    borderWidth: 3,
    margin: 5,
    borderRadius: 15,
    borderColor: '#069139',
    backgroundColor: '#E5E4E2',
  },
  pageName:
  {
    color: '#069139',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 15,
  },
  imgButton:
  {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 100,
    marginBottom: 45,
  },
  imgStyle:
  {
    width: 120,
    height: 120,
  },
  imgText:
  {
    color: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 120,
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
  updateButton:
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
  updateText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  errorMessage:
  {
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle: {
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

export default ProfileUpdate;
