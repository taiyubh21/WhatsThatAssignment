import React, { Component } from 'react';
import { FlatList, View, ActivityIndicator, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

class Chats extends Component {

    constructor(props){
        super(props);
        // Initialising states
        this.state = {
            // Used for loading icon
            isLoading: true,
            // For array of contact data
            chatData: [],     
            chatname: "",
            error: ""   
        }
        this.onPressButton = this.onPressButton.bind(this)
    }

    async getData(){
        return fetch("http://localhost:3333/api/1.0.0/chat", {
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
                chatData: responseJson,
            })
        })
        .catch((error)=> {
            console.log(error);
        });
    }

    async newChat(){
        return fetch("http://localhost:3333/api/1.0.0/chat",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
          },
          // Creating JSON with the user data
          body: JSON.stringify({
            name: this.state.chatname,
          })
        })
        // Handles API response
        // Checks if it is a success and user was created or if there is an error
        .then((response) => {
          if(response.status === 201){
            return response.json();
            
          }else{
            throw "Error";
          }
        })
        
        .then((rjson) => {
          console.log(rjson);
          this.setState({chatname: ""})
          // For page refreshing after new chat is created
          this.getData();
        })
        .catch((error) => {
          console.log(error)
        });
      }

    // Converting the millisecond timestamp into a readable date  
    formatDate(timestamp){
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-gb');
    }
    
    // Converting the millisecond timestamp into a readable time
    formatTime(timestamp){
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-GB', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onPressButton(){
        if(this.state.chatname == ""){
            this.setState({error: "Please make sure the textbox isn't empty"})
            return;
        }
        this.newChat()
    }

    componentDidMount() {
        this.unsubscribe = this.props.navigation.addListener("focus", () => {
          this.getData()
        })
      }
    
      componentWillUnmount(){
        this.unsubscribe();
      }
    
    render(){
            console.log(this.state.chatData);
            return(
                <View>
                    <Text>Create new chat</Text>
                    <TextInput placeholder = "new chat name..." onChangeText={chatname => this.setState({chatname})} value={this.state.chatname}></TextInput>
                    <TouchableOpacity onPress={() => {
                        this.onPressButton();
                    }}>
                        <Text>Create new chat</Text>
                    </TouchableOpacity>
                    <Text>{' '}</Text>
                    <View style={{ height: 600 }}>
                    {/* Nested scroll enabled because the flatlist is inside the scrollview */}
                    <ScrollView nestedScrollEnabled={true}>
                        <FlatList
                            data={this.state.chatData}              
                            renderItem= {({item}) => {
                                if(item.last_message.message == null){
                                    return(
                                        <TouchableOpacity onPress={async () => {
                                            try {
                                                await AsyncStorage.setItem('chat_id', item.chat_id);
                                                this.props.navigation.navigate('ConversationDisplay');
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }}>
                                            <View>
                                                <Text>{item.name}</Text>
                                                <Text>No new messages</Text>
                                                <Text>{' '}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }else{
                                    return(
                                        <TouchableOpacity onPress={async () => {
                                            try {
                                                await AsyncStorage.setItem('chat_id', item.chat_id);
                                                this.props.navigation.navigate('ConversationDisplay');
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }}>
                                            <View>
                                                {/*<Text>{JSON.stringify(item)}</Text>*/}
                                                <Text>{item.name + '   ' + this.formatDate(item.last_message.timestamp) + ' ' +this.formatTime(item.last_message.timestamp)}</Text> 
                                                <Text>{item.last_message.author.first_name + ' ' + item.last_message.author.last_name + ':  ' + item.last_message.message}</Text>                  
                                                {/*Empty line inbetween chat details*/}
                                                <Text>{' '}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }
                            }}
                            keyExtractor={(item) => item.chat_id}
                        />
                        </ScrollView>
                    </View>
                  </View>
            );
        }
    
    }

export default Chats