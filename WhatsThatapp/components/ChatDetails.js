import React, { Component } from 'react';
import { Text, TextInput, View, TouchableOpacity, Button, ActivityIndicator, ScrollView, FlatList} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatDetails extends Component {
  constructor(props){
    super(props);

    // Initialising state variables
    this.state = {
      isLoading: true,
      chatData: [],
      chatname: "",
      currentChatId: null
    }
    // Binding to onPressButton function
    this.onPressButton = this.onPressButton.bind(this)
    this.setCurrentUserId();
    this.setChatId();
  }

  async setCurrentUserId() {
      const userId = await AsyncStorage.getItem("whatsthat_user_id");
      this.setState({ currentUserId: parseInt(userId) });
      console.log("Current user ID:" + this.state.currentUserId);
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

  //Updating user - interacting with the API
  async updateChat(){

    let to_send = {};

    if(this.state.chatname != ""){
        to_send['name'] = this.state.chatname
    }
    
    console.log('Request payload:', JSON.stringify(to_send));
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId,
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
        console.log("Chat name has been updated");
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

  async deleteMember(chatuserID){
    return fetch("http://localhost:3333/api/1.0.0/chat/" + this.state.currentChatId + "/user/" + chatuserID,
    {
      method: 'DELETE',
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
      }
    })
    .then((response) => {
        // If the response is ok  
        if(response.status === 200){
            console.log('Member removed successfully');
            if(this.state.currentUserId == chatuserID){
              this.props.navigation.navigate('ChatList')
            };
            // Filtering the members array by keeping members where the member user_id is not equal to the chatuserID that is being passed in
            const updatedMembers = this.state.chatData.members.filter(member => member.user_id !== chatuserID);
            // Using the spread operator to open up chatData and then updating the members array with updatedMembers
            const updatedChatData = {
              ...this.state.chatData,
              members: updatedMembers
            };
            // Updating the original state
            this.setState({ chatData: updatedChatData });         
        // Else if its bad then throw an error
        }else{
          // Output error on screen for other responses
          throw "error"
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // For input validation
  onPressButton(){
    this.setState({submitted: true})
    this.setState({error: ""})

    // If inputs aren't valid according to the validation error message will return
    // If inputs are null no need for validation
    // Checks with the email validator if the email is valid
    if(this.state.chatname == ""){
        this.setState({error: "Chat must have a name"})
        return;
    }

    this.updateChat()
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
        <Button
            title="Go back to chat"
            onPress={() => this.props.navigation.navigate('ConversationDisplay')}
        />
        <Text>Chat name:</Text>
        <TextInput placeholder = "Chat name..." onChangeText={chatname => this.setState({chatname})} defaultValue={this.state.chatData.name}></TextInput>
        <TouchableOpacity onPress={this.onPressButton}><Text>Update chat name</Text></TouchableOpacity>
        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
        <Text>{"\n\n"}</Text>
        <View style={{ height: 550 }}>
            {/* Nested scroll enabled because the flatlist is inside the scrollview */}
            <Text>Members in {this.state.chatData.name}</Text>
            <ScrollView nestedScrollEnabled={true}>
              <FlatList
                data={this.state.chatData.members}
                renderItem={({item}) => (
                  <View>
                    <Text>{item.first_name + ' ' + item.last_name}</Text>
                    <Button
                      title="Remove member"
                      onPress={() => {this.deleteMember(item.user_id)}}
                    />
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

}

export default ChatDetails