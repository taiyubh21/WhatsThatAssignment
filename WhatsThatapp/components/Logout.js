import { Component } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      submitted: false,
    };
  }

  componentDidMount() {
    this.logout();
  }

  async logout() {
    console.log('Logout');
    return fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          await AsyncStorage.removeItem('whatsthat_session_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          this.props.navigation.navigate('Login');
        } else if (response.status === 401) {
          console.log('Unauthorised');
          await AsyncStorage.removeItem('whatsthat_session_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          this.props.navigation.navigate('Login');
        } else {
          throw 'Something went wrong';
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error });
        this.setState({ submitted: false });
      });
  }

  render() {
    return null;
  }
}

export default Logout;
