import React, { Component } from 'react';
import {
  FlatList, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class Chats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      chatData: [],
      chatname: '',
      error: '',
      errorTimer: null,
    };
    this.onPressButton = this.onPressButton.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getData();
      this.setState({
        chatname: '',
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    if (this.state.errorTimer) {
      clearTimeout(this.state.errorTimer);
    }
  }

  onPressButton() {
    if (this.state.chatname.trim() === '') {
      this.setState({ error: "Please make sure the textbox isn't empty" });
      this.setState({
        errorTimer: setTimeout(() => {
          this.setState({ error: null, errorTimer: null });
        }, 3000),
      });
      return;
    }
    this.newChat();
  }

  async getData() {
    return fetch('http://localhost:3333/api/1.0.0/chat', {
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
        this.setState({
          isLoading: false,
          chatData: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async newChat() {
    return fetch(
      'http://localhost:3333/api/1.0.0/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
        },
        // Creating JSON with the user data
        body: JSON.stringify({
          name: this.state.chatname,
        }),
      },
    )
    // Handles API response
    // Checks if it is a success and user was created or if there is an error
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        }
        throw new Error('error');
      })
      .then((rjson) => {
        console.log(rjson);
        this.setState({ chatname: '' });
        // For page refreshing after new chat is created
        this.getData();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Converting the millisecond timestamp into a readable date
  // eslint-disable-next-line class-methods-use-this
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-gb');
  }

  // Converting the millisecond timestamp into a readable time
  // eslint-disable-next-line class-methods-use-this
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  render() {
    console.log(this.state.chatData);
    return (
      <View style={styles.container}>
        <Text style={styles.pageName}>Chats</Text>
        <View style={styles.form}>
          <TextInput style={styles.textInput} placeholder="New chat name..." onChangeText={(chatname) => this.setState({ chatname })} value={this.state.chatname} />
          {/* Output error if there is an error */}
          {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
          <>
            {this.state.error && <Text style={styles.errorMessage}>{this.state.error}</Text>}
          </>
          <TouchableOpacity
            style={styles.createChatButton}
            onPress={() => {
              this.onPressButton();
            }}
          >
            <Text style={styles.createChatText}>Create new chat</Text>
          </TouchableOpacity>
        </View>
        <Text>{' '}</Text>
        <View style={{ height: 575 }}>
          {/* Nested scroll enabled because the flatlist is inside the scrollview */}
          <ScrollView nestedScrollEnabled>
            <FlatList
              data={this.state.chatData}
              renderItem={({ item }) => {
                if (item.last_message.message == null) {
                  return (
                    <TouchableOpacity onPress={async () => {
                      try {
                        await AsyncStorage.setItem('chat_id', item.chat_id);
                        this.props.navigation.navigate('ConversationDisplay');
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    >
                      <View style={styles.messagesContainer}>
                        <View style={styles.nameDateContainer}>
                          <Text style={styles.nameStyle}>{item.name}</Text>
                        </View>
                        <Text style={styles.messages}>No new messages</Text>
                        <Text>{' '}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
                let text = item.last_message.message;
                // If there are more than 15 characters in the last message only print the first 15
                if (text.length > 30) {
                  text = `${text.substring(0, 30)}...`;
                }
                return (
                  <TouchableOpacity onPress={async () => {
                    try {
                      await AsyncStorage.setItem('chat_id', item.chat_id);
                      this.props.navigation.navigate('ConversationDisplay');
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                  >
                    {/* <Text>{JSON.stringify(item)}</Text> */}
                    <View style={styles.messagesContainer}>
                      <View style={styles.nameDateContainer}>
                        <Text style={styles.nameStyle}>{item.name}</Text>
                        <Text style={styles.dateStyle}>{`${this.formatDate(item.last_message.timestamp)} ${this.formatTime(item.last_message.timestamp)}`}</Text>
                      </View>
                      <Text style={styles.messages}>{`${item.last_message.author.first_name} ${item.last_message.author.last_name}:  ${text}`}</Text>
                      {/* Empty line inbetween chat details */}
                      <Text>{' '}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.chat_id}
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
  form:
    {
      borderWidth: 3,
      margin: 15,
      borderRadius: 15,
      borderColor: '#069139',
      padding: 15,
    },
  textInput:
    {
      width: '60%',
      height: 40,
      padding: 10,
      borderBottomWidth: 1,
    },
  createChatButton:
    {
      width: '40%',
      borderRadius: 5,
      height: 35,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      borderWidth: 3,
      borderColor: '#069139',
      backgroundColor: '#069139',
    },
  createChatText:
    {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  nameStyle:
    {
      fontWeight: 'bold',
      fontSize: 14,
    },
  dateStyle:
    {
      fontWeight: 'bold',
      fontSize: 14,
    },
  nameDateContainer:
    {
      marginTop: 8,
      marginLeft: 10,
      marginRight: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  messagesContainer:
    {
      borderTopWidth: 1,
      width: '95%',
      alignSelf: 'center',
    },
  errorMessage:
    {
      color: 'red',
    },
  messages:
    {
      marginTop: 5,
      marginLeft: 10,
    },
});

export default Chats;
