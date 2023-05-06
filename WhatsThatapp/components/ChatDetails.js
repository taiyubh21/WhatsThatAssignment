import React, { Component } from 'react';
import { Text, TextInput, View, TouchableOpacity, Button, ActivityIndicator, ScrollView, FlatList, Image} from 'react-native';


import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatDetails extends Component {
  constructor(props){
    super(props);

    // Initialising state variables
    this.state = {
      isLoading: true,
      chatData: [],
      chatname: "",
      currentChatId: null,
      // Error message for failed validation
      error: "",
      // Checks if submission has happened or not
      submitted: false,
      photo: {}
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
  
  async getData() {
    // Checking if the currentChatID is null before making the API call
    if (!this.state.currentChatId) {
      this.setState({
        //isLoading: false,
        chatData: []
      });
      return;
    }
  
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
          //isLoading: false,
          chatData: responseJson
        }, () => {
          if (this.state.chatData.members && this.state.chatData.members.length > 0) {
              for (let i = 0; i < this.state.chatData.members.length; i++) {
                  this.getImage(this.state.chatData.members[i].user_id);
              }
          }
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
    
    console.log(JSON.stringify(to_send));
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
              this.setState({currentChatId: null})
              this.props.navigation.navigate('ChatList')

            };        
            this.getData(); 
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

  async getImage(userId) {
    fetch("http://localhost:3333/api/1.0.0/user/"+ userId + "/photo", {
        method: "GET",
        headers: {
            'Content-Type': 'media/png',
            "X-Authorization": await AsyncStorage.getItem("whatsthat_session_token")
        }
    })
    .then((response) => {
        if(response.status === 200){
          return response.blob()
        }else{
          throw "Something went wrong"
        }
    })
    .then((resBlob) => {
        let data = URL.createObjectURL(resBlob);
        // Updating object state with photo data
        this.setState((prevState) => ({
          // Spreading open the previous photo object and adding the new photo data with the user id
          photo: {
            ...prevState.photo,
            [userId]: data
          },
          // After the photo render is done moving on to displaying in the flatlist
          isLoading: false
        }));
    })
    .catch((err) => {
        console.log(err)
    })
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
                    {/* Flatlist being used to retrive all the photos based on the user id of the contactData */}
                    {/* This is happening before anything is actually displayed */}
                    <FlatList
                      data={this.state.chatData.members}              
                        renderItem= {({item}) => {
                          this.getImage(item.user_id)
                        }}
                        keyExtractor={(item) => item.user_id}
                      />
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
        {/* Output error if there is an error */}
        <>
          {this.state.error && <Text>{this.state.error}</Text>}
        </>
        <TouchableOpacity onPress={this.onPressButton}><Text>Update chat name</Text></TouchableOpacity>
        <Button
          title="Add contacts to chat"
          onPress={() => this.props.navigation.navigate('AddtoChat')}
        />
        <Text>{"\n\n"}</Text>
        <View style={{ height: 550 }}>
            {/* Nested scroll enabled because the flatlist is inside the scrollview */}
            <Text>Members in {this.state.chatData.name}</Text>
            <ScrollView nestedScrollEnabled={true}>
              <FlatList
                data={this.state.chatData.members}
                renderItem={({item}) => (
                  <View>
                    <Image
                      source={{uri: this.state.photo[item.user_id]}}
                      style={{
                        width: 100,
                        height: 100
                      }}
                    />
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