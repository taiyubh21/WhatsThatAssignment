import React, { Component } from 'react';
import {
  FlatList, View, ActivityIndicator, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Searchbar } from 'react-native-paper';

import Ionicons from 'react-native-vector-icons/Ionicons';

class UserListDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userListData: [],
      currentUserId: null,
      saveQuery: '',
      limit: 16,
      offset: 0,
      newUserListData: [],
      blockedData: [],
      contactData: [],
    };
    this.setCurrentUserId();
  }

  componentDidMount() {
    this.getData();
    this.getNextPage();
    this.getContacts();
    this.getBlocked();
    this.resetData = this.props.navigation.addListener('focus', () => {
      this.setState({
        isLoading: true,
        userListData: [],
        saveQuery: '',
      }, () => {
        this.getData();
        this.getNextPage();
        this.getContacts();
        this.getBlocked();
      });
    });
  }

  componentWillUnmount() {
    this.resetData();
  }

  // Getting the current ID from async storage
  // Setting it to the new state
  // Making sure its an integer
  async setCurrentUserId() {
    const userId = await AsyncStorage.getItem('whatsthat_user_id');
    this.setState({ currentUserId: parseInt(userId, 10) });
  }

  setOffset(newoffset) {
    this.setState({ offset: newoffset }, () => {
      this.getData();
      this.getNextPage();
    });
  }

  async getData() {
    console.log('HTTP Request:', `http://localhost:3333/api/1.0.0/search?q=${this.state.saveQuery}&limit=${this.state.limit}&offset=${this.state.offset}`);
    // Changing the API link to include the search parameter state
    return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.saveQuery}&limit=${this.state.limit}&offset=${this.state.offset}`, {
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
        throw 'error';
      })
      .then((responseJson) => {
        // Updating the userListData state with the retrieved data
        this.setState({
          isLoading: false,
          userListData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getBlocked() {
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
        throw 'error';
      })
      .then((responseJson) => {
        // Updating the contactData state with the retrieved data
        this.setState({
          isLoading: false,
          blockedData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getContacts() {
    return fetch('http://localhost:3333/api/1.0.0/contacts', {
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
        throw 'error';
      })
      .then((responseJson) => {
        // Updating the contactData state with the retrieved data
        this.setState({
          isLoading: false,
          contactData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getNextPage() {
    const offset = parseInt(this.state.offset, 10);
    console.log(offset);
    console.log('HTTP Request:', `http://localhost:3333/api/1.0.0/search?q=${this.state.saveQuery}&limit=${this.state.limit}&offset=${this.state.offset + this.state.limit}`);
    // Changing the API link to include the search parameter state
    return fetch(`http://localhost:3333/api/1.0.0/search?q=${this.state.saveQuery}&limit=${this.state.limit}&offset=${this.state.offset + this.state.limit}`, {
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
        throw 'error';
      })
      .then((responseJson) => {
        // Updating the newUserListData state with the retrieved data
        this.setState({
          isLoading: false,
          newUserListData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async addContacts(contactuserID) {
    return fetch(
      `http://localhost:3333/api/1.0.0/user/${contactuserID}/contact`,
      {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
      },
    )
      .then((response) => {
        // If the response is ok
        if (response.status === 200) {
          console.log('Contact added successfully');
          this.getContacts();
          // Else if its bad then throw an error
        } else {
          throw 'error';
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
        <View>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.userDetails}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactsScreen')}>
            <Ionicons name="arrow-back" size={32} color="black" style={styles.arrow} />
          </TouchableOpacity>
          <Text style={styles.pageName}>All users</Text>
        </View>
        <Searchbar
          style={styles.searchBar}
          placeholder="Search..."
          onChangeText={(saveQuery) => {
            this.setState({ saveQuery }, () => {
              this.getData();
              this.getNextPage();
            });
          }}
          value={this.state.saveQuery}
          inputStyle={{ paddingTop: 0, paddingBottom: 18 }}
        />
        <View style={{ height: 680 }}>
          {/* Nested scroll enabled because the flatlist is inside the scrollview */}
          <ScrollView nestedScrollEnabled>
            <FlatList
              data={this.state.userListData}
              renderItem={({ item }) => {
                // eslint-disable-next-line max-len
                // Console code for checking the IDs of the data and the current ID of the account logged in
                // For debugging
                console.log('item user id:', item.user_id);
                console.log('current user id:', this.state.currentUserId);
                // eslint-disable-next-line max-len
                const matchingContact = this.state.contactData.find((contact) => contact.user_id === item.user_id);
                // eslint-disable-next-line max-len
                const matchingBlocked = this.state.blockedData.find((blocked) => blocked.user_id === item.user_id);
                if (item.user_id === this.state.currentUserId) {
                  return (
                    <View style={styles.nameContainer}>
                      {/* Concatenating first name and last name together */}
                      <Text style={styles.nameText}>{`${item.given_name} ${item.family_name}   (You)`}</Text>
                      <Text>{item.email}</Text>
                    </View>
                  );
                } if (matchingContact) {
                  return (
                    <View style={styles.nameContainer}>
                      {/* Concatenating first name and last name together */}
                      <Text style={styles.nameText}>{`${item.given_name} ${item.family_name}`}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                  );
                } if (matchingBlocked) {
                  return (
                    <View style={styles.nameContainer}>
                      {/* Concatenating first name and last name together */}
                      <Text style={styles.nameText}>{`${item.given_name} ${item.family_name}`}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                  );
                }
                return (
                  <View style={styles.buttonContainer}>
                    <View style={{ flex: '1' }}>
                      {/* Concatenating first name and last name together */}
                      <Text style={styles.nameText}>{`${item.given_name} ${item.family_name}`}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { this.addContacts(item.user_id); }}
                      style={styles.add}
                    >
                      <Ionicons name="person-add" size={26} color="black" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              keyExtractor={(item) => item.user_id}
                      // Buttons once user has scrolled down to the end for previous and next page
              ListFooterComponent={(
                <View>
                  {console.log(this.state.newUserListData)}
                  {console.log(this.state.offset)}
                  <View style={styles.offsetContainer}>
                    {/* eslint-disable-next-line max-len */}
                    {/* If the offset is greater than 0 then the button is unhidden so users can't go back before the data starts  */}
                    {this.state.offset > 0 && (
                    <TouchableOpacity
                      style={styles.previousPage}
                      onPress={() => this.setOffset(this.state.offset - this.state.limit)}
                    >
                      <Ionicons name="arrow-back-circle" size={36} color="black" />
                    </TouchableOpacity>
                    )}
                    {this.state.offset === 0 && <View style={{ flex: 1 }} />}
                    {this.state.newUserListData.length > 0 && (
                    <TouchableOpacity
                      style={styles.nextPage}
                      onPress={() => this.setOffset(this.state.offset + this.state.limit)}
                    >
                      <Ionicons name="arrow-forward-circle" size={36} color="black" />
                    </TouchableOpacity>
                    )}
                  </View>
                </View>
                      )}
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
    marginLeft: 15,
  },
  searchBar:
  {
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    height: 40,
    borderRadius: 10,
  },
  buttonContainer:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    padding: 8,
    borderTopWidth: 1,
    width: '95%',
    alignSelf: 'center',
  },
  nameContainer:
  {
    marginTop: 5,
    padding: 8,
    borderTopWidth: 1,
    width: '95%',
    marginLeft: 10,
  },
  userDetails:
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
  add:
  {
    marginRight: 15,
  },
  offsetContainer:
  {
    padding: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    alignSelf: 'center',
  },
  nextPage:
  {
    marginRight: 15,
  },
  previousPage:
  {
    marginLeft: 15,
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
});

export default UserListDisplay;
