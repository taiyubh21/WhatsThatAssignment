import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class ConversationDisplay extends Component {
  constructor(props){
    super(props);
  
    // Initialising state variables
    this.state = {
      isLoading: true,
      chatData: [],
      currentChatId: null,
      message: ""
    }
    this.setChatId();
  }

  async setChatId() {
    const chatID = await AsyncStorage.getItem("chat_id");
    this.setState({ currentChatId: parseInt(chatID) });
    console.log("Current chat ID:" + this.state.currentChatId);
  }
  
  async getData(){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId, {
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
        this.setState({
            isLoading: false,
            chatData: responseJson
        })
    })
    .catch((error)=> {
        console.log(error);
    });
  }

  async newMessage(){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/message",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      },
      // Creating JSON with the user data
      body: JSON.stringify({
        message: this.state.message,
      })
    })
    // Handles API response
    // Checks if it is a success and user was created or if there is an error
    .then((response) => {
      if(response.status === 200){
        return response.json();
        
      }else{
        throw "Error";
      }
    })   
    .then((rjson) => {
      console.log(rjson);
      // For page refreshing after new chat is created
      this.getData();
    })
    .catch((error) => {
      console.log(error)
    });
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.setChatId()
      .then(() => this.getData())
      .catch((error) => console.log(error));
    })
  }

  componentWillUnmount(){
    this.unsubscribe();
  }

  render(){
    if(this.state.isLoading){
      return(
        <View>
          <ActivityIndicator/>
        </View>
      );
    }else{
      console.log(this.state.chatData)
      return(
        <View>
          <Text>{this.state.chatData.name}</Text>
          <View style={{ height: 600 }}>
            {/* Nested scroll enabled because the flatlist is inside the scrollview */}
            <ScrollView nestedScrollEnabled={true} contentContainerStyle={{justifyContent: 'flex-end'}}>
              <FlatList
                data={this.state.chatData.messages}
                // For latest messages appearing at the bottom and earlier ones at the top
                inverted={true}
                renderItem={({item}) => (
                  <View>
                    <Text>{item.message}</Text>
                  </View>
                )}
                keyExtractor={(item) => item.message_id}
              />
            </ScrollView>
          </View>
          <Text>{' '}</Text>
          <TextInput placeholder = "new message..." onChangeText={message => this.setState({message})} defaultValue={this.state.message}></TextInput>
          <TouchableOpacity onPress={() => {
            if (this.state.message == "") {
              this.setState({error: "Please make sure the textbox isn't empty"})
              return;
            }
            this.newMessage()
            .then(() => this.getData())
            }}>
              <Text>Send</Text>
           </TouchableOpacity>
          </View>
      );
    }
  }
}

export default ConversationDisplay
