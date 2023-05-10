import React, { Component } from 'react';
import {
  FlatList, View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';

class BlockedUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      blockedData: [],
      currentUserId: null,
      photo: {},
    };
    this.setCurrentUserId();
  }

  componentDidMount() {
    this.getData();
  }

  async setCurrentUserId() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ currentUserId: parseInt(userId, 10) });
    console.log(`Current user ID:${this.state.currentUserId}`);
  }

  async getData() {
    return fetch('http://localhost:3333/api/1.0.0/blocked', {
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
        throw new Error('error');
      })
      .then((responseJson) => {
        // Updating the blockedData state with the retrieved data
        this.setState({
          blockedData: responseJson,
        }, () => {
          // Refresh images
          if (this.state.blockedData && this.state.blockedData.length > 0) {
            for (let i = 0; i < this.state.blockedData.length; i += 1) {
              this.getImage(this.state.blockedData[i].user_id);
            }
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getImage(userId) {
    fetch(`http://localhost:3333/api/1.0.0/user/${userId}/photo`, {
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
        // Updating object state with photo data
        this.setState((prevState) => ({
          // Spreading open the previous photo object and adding the new photo data with the user id
          photo: {
            ...prevState.photo,
            [userId]: data,
          },
          // After the photo render is done moving on to displaying in the flatlist
          isLoading: false,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async unblockContact(blockuserID) {
    return fetch(
      `http://localhost:3333/api/1.0.0/user/${blockuserID}/block`,
      {
        method: 'DELETE',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      },
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('Contact unblocked successfully');
          this.getData();
          // Else if its bad then throw an error
        } else {
          // Output error on screen for other responses
          throw new Error('error');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    // If data is still being fetched return a loading spinner
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <View style={styles.blockedDetails}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactsScreen')}>
              <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
            </TouchableOpacity>
            <Text style={styles.pageName}>Blocked users</Text>
          </View>
          <View style={styles.noBlocked}>
            <Text style={{ fontSize: 18 }}>No blocked users</Text>
          </View>
          {/* eslint-disable-next-line max-len */}
          {/* Flatlist being used to retrive all the photos based on the user id of the contactData */}
          {/* This is happening before anything is actually displayed */}
          <FlatList
            data={this.state.blockedData}
            renderItem={({ item }) => {
              this.getImage(item.user_id);
            }}
            keyExtractor={(item) => item.user_id}
          />
        </View>
      );
    }
    console.log(this.state.blockedData);
    return (
      <View style={styles.container}>
        <View style={styles.blockedDetails}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactsScreen')}>
            <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
          </TouchableOpacity>
          <Text style={styles.pageName}>Blocked users</Text>
        </View>
        <View style={{ height: 710 }}>
          {/* Nested scroll enabled because the flatlist is inside the scrollview */}
          <ScrollView nestedScrollEnabled>
            <FlatList
              data={this.state.blockedData}
              renderItem={({ item }) => (
                <View style={styles.detailsContainer}>
                  <Image
                    source={{ uri: this.state.photo[item.user_id] }}
                    style={styles.image}
                  />
                  <View style={styles.nameStyle}>
                    <Text style={styles.nameText}>{`${item.first_name} ${item.last_name}`}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { this.unblockContact(item.user_id); }}
                    style={styles.block}
                  >
                    <Text style={styles.buttonText}>Unblock</Text>
                  </TouchableOpacity>
                  <Text>{' '}</Text>
                </View>
              )}
              keyExtractor={(item) => item.user_id}
            />
          </ScrollView>
        </View>
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
    marginLeft: 8,
  },
  image:
  {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
    marginLeft: 8,
    marginRight: 8,
  },
  detailsContainer:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    padding: 8,
    borderTopWidth: 1,
    width: '95%',
    alignSelf: 'center',
  },
  nameStyle:
  {
    flex: 1,
  },
  nameText:
  {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  email:
  {
    fontSize: 14,
    marginTop: 5,
  },
  buttonText:
  {
    color: 'white',
    fontWeight: 'bold',
  },
  block:
  {
    width: '20%',
    borderRadius: 5,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ae3127',
    backgroundColor: '#ae3127',
  },
  blockedDetails:
  {
    marginTop: 8,
    marginLeft: 10,
    marginRight: 15,
    flexDirection: 'row',
    width: '98%',
    alignSelf: 'center',
  },
  arrow:
  {
    marginTop: 3,
    marginLeft: 8,
  },
  noBlocked:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BlockedUsers;
